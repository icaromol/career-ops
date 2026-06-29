#!/usr/bin/env node
// fetch-jd.mjs — Fetch a single job description from a supported ATS platform.
// Usage: node fetch-jd.mjs <url>
// stdout: JSON { title, company, location, description, source, url }
// stderr: errors only

import { pathToFileURL } from 'url';

const TIMEOUT_MS = 15_000;
const ASHBY_TIMEOUT_MS = 30_000;
const ASHBY_RETRIES = 2;
const UA = 'Mozilla/5.0 (compatible; career-ops/1.3)';

async function httpGet(url, { timeoutMs = TIMEOUT_MS } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: { 'user-agent': UA, 'accept': 'application/json' },
      signal: ctrl.signal,
    });
    if (!res.ok) {
      const err = new Error(`HTTP ${res.status}`);
      err.status = res.status;
      throw err;
    }
    return res.json();
  } finally {
    clearTimeout(t);
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function httpGetWithRetry(url, { timeoutMs = TIMEOUT_MS, retries = 0 } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) {
      const backoff = 1000 * 2 ** (attempt - 1) + Math.floor(Math.random() * 500);
      await sleep(backoff);
    }
    try {
      return await httpGet(url, { timeoutMs });
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    // Decode numeric entities (e.g. &#8212; = em-dash, &#233; = é) before stripping tags
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));
}

function stripHtml(html) {
  if (!html || typeof html !== 'string') return '';
  // Greenhouse double-encodes HTML: decode entities first so tags become real tags, then strip
  const decoded = decodeEntities(html);
  return decoded
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<li>/gi, '\n• ')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Slug-to-display-name overrides for boards whose slug differs from the company's real name.
// The Greenhouse single-job API does not expose a top-level company display name.
const GREENHOUSE_COMPANY_NAMES = {
  sonyinteractiveentertainmentglobal: 'PlayStation (SIE)',
  anthropic: 'Anthropic',
  life360: 'Life360',
  reddit: 'Reddit',
};

function detectPlatform(rawUrl) {
  let u;
  try { u = new URL(rawUrl); } catch { return { type: 'unsupported', url: rawUrl }; }

  const host = u.hostname;
  const parts = u.pathname.split('/').filter(Boolean);

  // Greenhouse: job-boards.greenhouse.io/{slug}/jobs/{id}
  //          or boards.greenhouse.io/{slug}/jobs/{id}
  //          or job-boards.eu.greenhouse.io/{slug}/jobs/{id}
  if (
    (host === 'job-boards.greenhouse.io' || host === 'boards.greenhouse.io' || host === 'job-boards.eu.greenhouse.io') &&
    parts[1] === 'jobs' && parts[2]
  ) {
    return { type: 'greenhouse', slug: parts[0], jobId: parts[2], url: rawUrl };
  }

  // Ashby: jobs.ashbyhq.com/{company}/{uuid}
  if (host === 'jobs.ashbyhq.com' && parts[0] && parts[1]) {
    // Pass slug here to avoid re-parsing the URL inside fetchAshby
    return { type: 'ashby', slug: parts[0], jobPostingId: parts[1], url: rawUrl };
  }

  // remotepmjobs.com aggregator: try to resolve to Reddit's Greenhouse board
  if (host === 'remotepmjobs.com') {
    const idMatch = u.pathname.match(/\/(\d{8,12})(?:\/|$)/);
    if (idMatch) return { type: 'greenhouse', slug: 'reddit', jobId: idMatch[1], url: rawUrl };
    return { type: 'unsupported', url: rawUrl, hint: 'remotepmjobs URL: could not extract Reddit job ID' };
  }

  return { type: 'unsupported', url: rawUrl };
}

async function fetchGreenhouse({ slug, jobId, url }) {
  const apiUrl = `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(slug)}/jobs/${encodeURIComponent(jobId)}`;
  const job = await httpGet(apiUrl);
  if (!job || typeof job !== 'object' || Array.isArray(job)) {
    const err = new Error('greenhouse: unexpected API response shape');
    err.status = 502;
    throw err;
  }
  return {
    title: job.title || '',
    company: GREENHOUSE_COMPANY_NAMES[slug] || slug,
    location: job.location?.name || '',
    description: stripHtml(job.content || ''),
    source: 'greenhouse-api',
    url,
  };
}

async function fetchAshby({ slug, jobPostingId, url }) {
  const apiUrl = `https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(slug)}?includeCompensation=true`;
  const data = await httpGetWithRetry(apiUrl, { timeoutMs: ASHBY_TIMEOUT_MS, retries: ASHBY_RETRIES });
  if (!data || typeof data !== 'object') {
    const err = new Error('ashby: unexpected API response shape');
    err.status = 502;
    throw err;
  }
  const jobs = Array.isArray(data.jobs) ? data.jobs : [];
  const job = jobs.find(j => {
    if (j.id === jobPostingId) return true;
    // Fallback: check if the job URL ends with the posting ID (more precise than .includes)
    try { return new URL(j.jobUrl || '').pathname.endsWith(jobPostingId); } catch { return false; }
  });

  if (!job) {
    const err = new Error('ashby: job not found in board listing');
    err.status = 404;
    throw err;
  }

  return {
    title: job.title || '',
    company: job.teamName || slug,
    location: job.location || '',
    description: stripHtml(job.descriptionHtml || job.description || ''),
    source: 'ashby-api',
    url,
  };
}

async function main() {
  const url = process.argv[2];
  if (!url) {
    process.stderr.write('Usage: node fetch-jd.mjs <url>\n');
    process.exit(1);
  }

  const platform = detectPlatform(url);
  let result;

  if (platform.type === 'greenhouse') {
    result = await fetchGreenhouse(platform);
  } else if (platform.type === 'ashby') {
    result = await fetchAshby(platform);
  } else {
    result = {
      error: 'unsupported-platform',
      suggestion: 'Use Playwright: browser_navigate + browser_snapshot',
      ...(platform.hint ? { hint: platform.hint } : {}),
      url,
    };
  }

  if (result.description !== undefined && result.description.trim() === '') {
    result = { error: 'empty-description', url };
  }

  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
}

// Guard: only run main() when executed directly, not when imported as a module.
// process.argv[1] may be undefined in REPL/eval contexts; use import.meta.url as fallback.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(err => {
    if (err.status === 404 || err.status === 410) {
      process.stdout.write(JSON.stringify({ error: 'job-not-found', url: process.argv[2] }) + '\n');
    } else if (err.name === 'AbortError' || err.name === 'TimeoutError') {
      process.stdout.write(JSON.stringify({ error: 'timeout', url: process.argv[2] }) + '\n');
    } else {
      process.stderr.write(`fetch-jd error: ${err.message}\n`);
      process.exit(1);
    }
  });
}
