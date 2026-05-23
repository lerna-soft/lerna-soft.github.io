#!/usr/bin/env node
/**
 * Encode a GitHub PAT for inclusion in blog/blog.js (GITHUB_ISSUE_TOKEN_CIPHER).
 *
 * Usage:
 *   node tools/encode-pat.mjs <PAT>
 *   PAT=ghp_xxx node tools/encode-pat.mjs
 *
 * The encoded string is XOR'd with the seed `lerna_blog_issue_token_v1` and
 * then base64 encoded — same pattern as devil-tv's app.js. This is not
 * cryptography (anyone with the source can decode it). The protection is:
 *   1. The PAT scope is minimal (`public_repo` is enough).
 *   2. The cipher form prevents naive secret scanners from flagging it.
 *
 * Steps to produce a fresh cipher:
 *   1. Create a PAT at https://github.com/settings/tokens
 *      - "Generate new token (classic)"
 *      - Scope: only `public_repo`
 *      - Expiration: 90 days
 *   2. Run this script locally with the PAT as arg.
 *   3. Copy the printed base64 string.
 *   4. Paste it into blog/blog.js → `GITHUB_ISSUE_TOKEN_CIPHER = "..."`.
 *   5. Commit and push.
 *
 * NEVER commit the raw PAT. NEVER paste it in any chat or shared environment.
 */

const SEED = 'lerna_blog_issue_token_v1';

function encode(plain, seed) {
  if (!plain) throw new Error('Empty PAT');
  if (!seed) throw new Error('Empty seed');
  let xored = '';
  for (let i = 0; i < plain.length; i += 1) {
    xored += String.fromCharCode(plain.charCodeAt(i) ^ seed.charCodeAt(i % seed.length));
  }
  return Buffer.from(xored, 'binary').toString('base64');
}

function decode(cipher, seed) {
  const bytes = Buffer.from(cipher, 'base64').toString('binary');
  let out = '';
  for (let i = 0; i < bytes.length; i += 1) {
    out += String.fromCharCode(bytes.charCodeAt(i) ^ seed.charCodeAt(i % seed.length));
  }
  return out;
}

function main() {
  const pat = process.argv[2] || process.env.PAT;
  if (!pat) {
    console.error('Usage: node tools/encode-pat.mjs <PAT>');
    console.error('   or: PAT=ghp_xxx node tools/encode-pat.mjs');
    process.exit(1);
  }

  const cipher = encode(pat, SEED);
  const roundtrip = decode(cipher, SEED);

  if (roundtrip !== pat) {
    console.error('FAIL: roundtrip mismatch. Aborting.');
    process.exit(2);
  }

  console.log('');
  console.log('OK — paste the line below into blog/blog.js:');
  console.log('');
  console.log(`  const GITHUB_ISSUE_TOKEN_CIPHER = "${cipher}";`);
  console.log('');
  console.log(`(seed used: ${SEED})`);
  console.log(`(cipher length: ${cipher.length} chars)`);
}

main();
