/* =========================================================
   Lerna Soft · Blog runtime
   - auth (login against /assets/users/<email>.json, SHA-256 + salt)
   - github issue creation (XOR + base64 cipher for PAT, like devil-tv)
   - utilities (slug, sha256, escape, sanitize)
   Loaded by blog/post.html and blog/nuevo.html (NOT by blog.html).
   ========================================================= */

(function () {
  "use strict";

  /* ---------- config ---------- */
  const REPO_OWNER = "lerna-soft";
  const REPO_NAME = "lerna-soft.github.io";
  const ISSUE_LABEL = "article-publish";
  const SESSION_KEY = "lerna.blog.session.v1";
  const SESSION_TTL_HOURS = 12;

  // PAT cipher: filled in by running `node tools/encode-pat.mjs <PAT>` locally.
  // Same XOR + base64 pattern as devil-tv (app.js:62). Empty = issue creation disabled.
  const GITHUB_ISSUE_TOKEN_SEED = "lerna_blog_issue_token_v1";
  const GITHUB_ISSUE_TOKEN_CIPHER = "Cw0dMTAODS4bBQo5Bh4EAm0SLjwfBTglfyAKNykpElZdW1Q9JRUWMw==";

  /* ---------- utils ---------- */
  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function slugify(text) {
    return String(text || "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80);
  }

  async function sha256Hex(input) {
    const enc = new TextEncoder();
    const buf = await crypto.subtle.digest("SHA-256", enc.encode(input));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  function decodeIssueToken(cipherText, seed) {
    const encoded = String(cipherText || "").trim();
    const key = String(seed || "").trim();
    if (!encoded || !key) return "";
    try {
      const bytes = atob(encoded);
      let out = "";
      for (let i = 0; i < bytes.length; i += 1) {
        const ch = bytes.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        out += String.fromCharCode(ch);
      }
      return out.trim();
    } catch (e) {
      console.error("[lernaBlog] token decode failed:", e);
      return "";
    }
  }

  function readingTime(html) {
    const text = String(html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const words = text ? text.split(" ").length : 0;
    return Math.max(1, Math.round(words / 200));
  }

  /* ---------- auth ---------- */
  async function login(email, password) {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    if (!normalizedEmail || !password) {
      return { ok: false, error: "Completá email y contraseña." };
    }
    let userRecord;
    try {
      const res = await fetch(`../assets/users/${encodeURIComponent(normalizedEmail)}.json`, { cache: "no-cache" });
      if (!res.ok) throw new Error("not found");
      userRecord = await res.json();
    } catch (e) {
      return { ok: false, error: "Credenciales incorrectas." };
    }
    const candidate = await sha256Hex(`${userRecord.salt || ""}:${password}`);
    if (candidate !== userRecord.passwordHash) {
      return { ok: false, error: "Credenciales incorrectas." };
    }
    const session = {
      user: {
        email: normalizedEmail,
        name: userRecord.name || normalizedEmail
      },
      expiresAt: Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000
    };
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (e) { /* ignore */ }
    return { ok: true, user: session.user };
  }

  function getSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const session = JSON.parse(raw);
      if (!session || !session.expiresAt || session.expiresAt < Date.now()) {
        localStorage.removeItem(SESSION_KEY);
        return null;
      }
      return session;
    } catch (e) {
      return null;
    }
  }

  function isAuthenticated() {
    return !!getSession();
  }

  function logout() {
    try { localStorage.removeItem(SESSION_KEY); } catch (e) { /* ignore */ }
  }

  /* ---------- github ---------- */
  async function openIssue({ title, body, labels }) {
    const token = decodeIssueToken(GITHUB_ISSUE_TOKEN_CIPHER, GITHUB_ISSUE_TOKEN_SEED);
    if (!token) {
      throw new Error("PAT no configurado. Corré tools/encode-pat.mjs y pegá el cipher en blog/blog.js.");
    }
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        accept: "application/vnd.github+json",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
        "x-github-api-version": "2022-11-28"
      },
      body: JSON.stringify({
        title: String(title || "").slice(0, 250),
        body: String(body || ""),
        labels: Array.isArray(labels) && labels.length ? labels : [ISSUE_LABEL]
      })
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`GitHub issue create failed (${res.status})${text ? `: ${text}` : ""}`);
    }
    return res.json();
  }

  function buildArticleIssueBody(payload) {
    const json = JSON.stringify(payload, null, 2);
    const lines = [
      "<!-- This issue is processed by .github/workflows/resolve-article-publish-issue.yml -->",
      "<!-- DO NOT edit the JSON block manually unless you know what you are doing. -->",
      "",
      "```json",
      json,
      "```"
    ];
    return lines.join("\n");
  }

  /* ---------- image upload (cover) ---------- */
  const COVER_MAX_BYTES = 5 * 1024 * 1024;
  const COVER_EXT_BY_MIME = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif"
  };

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result || "");
        const comma = result.indexOf(",");
        resolve(comma >= 0 ? result.slice(comma + 1) : result);
      };
      reader.onerror = () => reject(new Error("No se pudo leer el archivo."));
      reader.readAsDataURL(file);
    });
  }

  function randomId(bytes) {
    const arr = new Uint8Array(bytes || 8);
    crypto.getRandomValues(arr);
    return [...arr].map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  async function uploadCoverImage(file) {
    if (!file) throw new Error("Sin archivo.");
    const mime = String(file.type || "").toLowerCase();
    const ext = COVER_EXT_BY_MIME[mime];
    if (!ext) {
      throw new Error("Formato no soportado. Usá JPG, PNG, WEBP o GIF.");
    }
    if (file.size > COVER_MAX_BYTES) {
      const mb = (file.size / 1024 / 1024).toFixed(1);
      throw new Error(`La imagen pesa ${mb} MB. Máximo 5 MB.`);
    }
    const token = decodeIssueToken(GITHUB_ISSUE_TOKEN_CIPHER, GITHUB_ISSUE_TOKEN_SEED);
    if (!token) {
      throw new Error("PAT no configurado para subir imágenes.");
    }
    const id = randomId(8);
    const repoPath = `assets/blog/covers/${id}.${ext}`;
    const base64 = await fileToBase64(file);
    const apiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${repoPath}`;
    const res = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        accept: "application/vnd.github+json",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
        "x-github-api-version": "2022-11-28"
      },
      body: JSON.stringify({
        message: `blog: upload cover ${id}.${ext}`,
        content: base64,
        branch: "master"
      })
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Upload falló (${res.status})${text ? `: ${text}` : ""}`);
    }
    return `https://${REPO_OWNER}.github.io/${repoPath}`;
  }

  /* ---------- post fetch ---------- */
  async function fetchPost(slug) {
    if (!slug) return null;
    try {
      const res = await fetch(`posts/${encodeURIComponent(slug)}.json`, { cache: "no-cache" });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      return null;
    }
  }

  /* ---------- sanitize html (basic, defense in depth) ---------- */
  function sanitizeHtml(html) {
    const template = document.createElement("template");
    template.innerHTML = String(html || "");
    template.content.querySelectorAll("script, iframe[src*='javascript:'], object, embed").forEach((node) => node.remove());
    template.content.querySelectorAll("*").forEach((el) => {
      [...el.attributes].forEach((attr) => {
        const name = attr.name.toLowerCase();
        const value = attr.value || "";
        if (name.startsWith("on")) el.removeAttribute(attr.name);
        if ((name === "href" || name === "src") && /^\s*javascript:/i.test(value)) {
          el.removeAttribute(attr.name);
        }
      });
    });
    return template.innerHTML;
  }

  /* ---------- expose ---------- */
  window.lernaBlog = {
    config: { REPO_OWNER, REPO_NAME, ISSUE_LABEL, COVER_MAX_BYTES },
    auth: { login, logout, getSession, isAuthenticated },
    github: { openIssue, buildArticleIssueBody, uploadCoverImage },
    posts: { fetchPost },
    utils: { escapeHtml, slugify, sha256Hex, readingTime, sanitizeHtml }
  };
})();
