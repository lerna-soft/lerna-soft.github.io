#!/usr/bin/env node
/**
 * Sync blog articles from GitHub issues into blog/posts/.
 *
 * Reads issues labeled `article-publish` (state=open). Each issue body
 * must contain a fenced ```json block with a payload:
 *
 *   { "action": "publish" | "delete", "slug": "<kebab>", "title": "...",
 *     "excerpt": "...", "tags": ["..."], "cover": "...", "lang": "es"|"en",
 *     "date": "ISO-8601", "author": "<email>", "readTime": <int>, "html": "..." }
 *
 * - "publish" writes blog/posts/<slug>.json and adds/updates index entry.
 * - "delete"  removes the file and the index entry.
 *
 * After processing, the issue is closed with a confirmation comment.
 * The script never fails on a single bad issue; it skips and continues.
 */

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const POSTS_DIR = path.join(PROJECT_ROOT, 'blog', 'posts');
const INDEX_PATH = path.join(POSTS_DIR, 'index.json');
const OWNER_REPO = String(process.env.GITHUB_REPOSITORY || '').trim();
const TOKEN = String(process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '').trim();
const LABEL = 'article-publish';
const REPORT_PATH = path.join(process.env.RUNNER_TEMP || os.tmpdir(), 'lerna-blog-sync-report.json');

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,79})$/;
const LANGS = new Set(['es', 'en']);

async function main() {
  if (!OWNER_REPO) {
    console.log('[blog-sync] skip: missing GITHUB_REPOSITORY');
    return;
  }
  if (!TOKEN) {
    console.log('[blog-sync] skip: missing GITHUB_TOKEN/GH_TOKEN');
    return;
  }

  await fs.mkdir(POSTS_DIR, { recursive: true });
  const index = await loadIndex();
  const issues = await fetchAllIssues();
  const processed = [];

  for (const issue of issues) {
    try {
      const payload = parseIssue(issue);
      if (!payload) {
        processed.push({ number: issue.number, action: 'skip', reason: 'invalid-payload' });
        continue;
      }

      if (payload.action === 'delete') {
        await deletePost(payload.slug, index);
        processed.push({ number: issue.number, action: 'delete', slug: payload.slug });
        await closeIssue(issue.number, `Deleted \`${payload.slug}\`.`);
      } else {
        await writePost(payload);
        upsertIndexEntry(index, payload);
        processed.push({ number: issue.number, action: 'publish', slug: payload.slug });
        await closeIssue(issue.number, `Published \`${payload.slug}\`.`);
      }
    } catch (err) {
      console.error(`[blog-sync] issue #${issue.number} failed:`, err.message);
      processed.push({ number: issue.number, action: 'error', error: err.message });
    }
  }

  await writeIndex(index);
  await writeReport(processed);
  console.log(`[blog-sync] processed ${processed.length} issue(s)`);
}

async function loadIndex() {
  const raw = await fs.readFile(INDEX_PATH, 'utf8').catch(() => '');
  if (!raw.trim()) return { posts: [] };
  try {
    const parsed = JSON.parse(raw);
    return { posts: Array.isArray(parsed?.posts) ? parsed.posts : [] };
  } catch (e) {
    console.warn('[blog-sync] index.json was invalid; starting empty');
    return { posts: [] };
  }
}

function parseIssue(issue) {
  const body = String(issue?.body || '');
  const fenced = body.match(/```json\s*([\s\S]*?)```/i);
  if (!fenced) return null;

  let raw;
  try {
    raw = JSON.parse(fenced[1]);
  } catch {
    return null;
  }

  const action = String(raw.action || 'publish').trim().toLowerCase();
  const slug = String(raw.slug || '').trim().toLowerCase();
  if (!SLUG_RE.test(slug)) return null;

  if (action === 'delete') {
    return { action: 'delete', slug };
  }

  // publish / update — sanitize and normalize
  const title = String(raw.title || '').trim().slice(0, 200);
  if (!title) return null;
  const html = String(raw.html || '');
  if (!html.trim()) return null;

  const lang = LANGS.has(String(raw.lang || '').trim()) ? String(raw.lang).trim() : 'es';
  const date = sanitizeIsoDate(raw.date);
  const tags = Array.isArray(raw.tags)
    ? raw.tags.map((t) => String(t || '').trim()).filter(Boolean).slice(0, 8)
    : [];
  const cover = String(raw.cover || '').trim();
  const excerpt = String(raw.excerpt || '').trim().slice(0, 280);
  const readTime = Number.isFinite(raw.readTime) ? Math.max(1, Math.round(raw.readTime)) : computeReadTime(html);
  const author = String(raw.author || '').trim().slice(0, 120);

  return {
    action: 'publish',
    slug,
    title,
    excerpt,
    tags,
    cover,
    lang,
    date,
    author,
    readTime,
    html
  };
}

function sanitizeIsoDate(value) {
  const str = String(value || '').trim();
  if (!str) return new Date().toISOString();
  const d = new Date(str);
  if (Number.isNaN(d.getTime())) return new Date().toISOString();
  return d.toISOString();
}

function computeReadTime(html) {
  const text = String(html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = text ? text.split(' ').length : 0;
  return Math.max(1, Math.round(words / 200));
}

async function writePost(payload) {
  const filePath = path.join(POSTS_DIR, `${payload.slug}.json`);
  const prev = await readPostFile(filePath);
  if (prev && prev.cover && prev.cover !== payload.cover) {
    await deleteLocalCover(prev.cover);
  }
  const json = {
    slug: payload.slug,
    title: payload.title,
    excerpt: payload.excerpt,
    tags: payload.tags,
    cover: payload.cover,
    lang: payload.lang,
    date: payload.date,
    author: payload.author,
    readTime: payload.readTime,
    html: payload.html
  };
  await fs.writeFile(filePath, `${JSON.stringify(json, null, 2)}\n`, 'utf8');
  console.log(`[blog-sync] wrote ${filePath}`);
}

async function deletePost(slug, index) {
  const filePath = path.join(POSTS_DIR, `${slug}.json`);
  const prev = await readPostFile(filePath);
  if (prev && prev.cover) {
    await deleteLocalCover(prev.cover);
  }
  await fs.rm(filePath, { force: true });
  const idx = index.posts.findIndex((p) => p.slug === slug);
  if (idx >= 0) index.posts.splice(idx, 1);
  console.log(`[blog-sync] removed ${filePath}`);
}

async function readPostFile(filePath) {
  const raw = await fs.readFile(filePath, 'utf8').catch(() => '');
  if (!raw.trim()) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * If `coverUrl` points to an asset under our own assets/blog/covers/ tree,
 * resolve it to a path inside the repo and delete it. External URLs are
 * left alone. Path traversal is rejected.
 */
async function deleteLocalCover(coverUrl) {
  const rel = coverUrlToRepoPath(coverUrl);
  if (!rel) return;
  const absolute = path.resolve(PROJECT_ROOT, rel);
  const safeRoot = path.resolve(PROJECT_ROOT, 'assets', 'blog', 'covers');
  if (!absolute.startsWith(safeRoot + path.sep)) {
    console.warn(`[blog-sync] refused to delete cover outside covers/: ${rel}`);
    return;
  }
  await fs.rm(absolute, { force: true }).catch(() => null);
  console.log(`[blog-sync] removed orphan cover ${rel}`);
}

function coverUrlToRepoPath(coverUrl) {
  const raw = String(coverUrl || '').trim();
  if (!raw) return null;
  const owner = (OWNER_REPO.split('/')[0] || 'lerna-soft').toLowerCase();
  const liveOrigins = [
    `https://${owner}.github.io/`,
    `http://${owner}.github.io/`
  ];
  for (const origin of liveOrigins) {
    if (raw.startsWith(origin)) {
      const candidate = raw.slice(origin.length);
      if (candidate.startsWith('assets/blog/covers/')) return candidate;
      return null;
    }
  }
  if (raw.startsWith('/assets/blog/covers/')) return raw.slice(1);
  if (raw.startsWith('assets/blog/covers/')) return raw;
  return null;
}

function upsertIndexEntry(index, payload) {
  const entry = {
    slug: payload.slug,
    title: payload.title,
    excerpt: payload.excerpt,
    tags: payload.tags,
    cover: payload.cover,
    lang: payload.lang,
    date: payload.date,
    author: payload.author,
    readTime: payload.readTime
  };
  const idx = index.posts.findIndex((p) => p.slug === payload.slug);
  if (idx >= 0) index.posts[idx] = entry;
  else index.posts.push(entry);
}

async function writeIndex(index) {
  const sorted = [...index.posts].sort((a, b) => {
    const da = new Date(a.date || 0).getTime();
    const db = new Date(b.date || 0).getTime();
    return db - da;
  });
  await fs.writeFile(INDEX_PATH, `${JSON.stringify({ posts: sorted }, null, 2)}\n`, 'utf8');
  console.log(`[blog-sync] wrote ${INDEX_PATH} (${sorted.length} post(s))`);
}

async function fetchAllIssues() {
  const out = [];
  let page = 1;
  while (page <= 10) {
    const url = new URL(`https://api.github.com/repos/${OWNER_REPO}/issues`);
    url.searchParams.set('state', 'open');
    url.searchParams.set('labels', LABEL);
    url.searchParams.set('per_page', '100');
    url.searchParams.set('page', String(page));

    const res = await fetch(url, {
      headers: {
        accept: 'application/vnd.github+json',
        authorization: `Bearer ${TOKEN}`,
        'x-github-api-version': '2022-11-28',
        'user-agent': 'lerna-soft-blog-sync'
      }
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`GitHub issues API ${res.status} ${res.statusText}\n${text}`.trim());
    }
    const items = await res.json();
    const pageItems = (Array.isArray(items) ? items : []).filter((i) => !i.pull_request);
    out.push(...pageItems);
    if (!Array.isArray(items) || items.length < 100) break;
    page += 1;
  }
  return out;
}

async function closeIssue(number, comment) {
  // Best-effort comment, then close.
  if (comment) {
    await fetch(`https://api.github.com/repos/${OWNER_REPO}/issues/${number}/comments`, {
      method: 'POST',
      headers: ghHeaders(),
      body: JSON.stringify({ body: `🤖 ${comment}` })
    }).catch(() => null);
  }
  const res = await fetch(`https://api.github.com/repos/${OWNER_REPO}/issues/${number}`, {
    method: 'PATCH',
    headers: ghHeaders(),
    body: JSON.stringify({ state: 'closed' })
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.warn(`[blog-sync] failed to close #${number}: ${res.status} ${text}`);
  } else {
    console.log(`[blog-sync] closed #${number}`);
  }
}

function ghHeaders() {
  return {
    accept: 'application/vnd.github+json',
    authorization: `Bearer ${TOKEN}`,
    'content-type': 'application/json',
    'x-github-api-version': '2022-11-28',
    'user-agent': 'lerna-soft-blog-sync'
  };
}

async function writeReport(processed) {
  const payload = {
    generatedAt: new Date().toISOString(),
    repository: OWNER_REPO,
    label: LABEL,
    processed
  };
  await fs.writeFile(REPORT_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8').catch(() => null);
  console.log(`[blog-sync] report: ${REPORT_PATH}`);
}

await main();
