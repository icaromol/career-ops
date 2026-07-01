#!/usr/bin/env node
// scan-google.mjs — Scrapes Google Careers search results for the local-parser provider.
// Usage: node scan-google.mjs <search_url>
// stdout: JSON array of { title, url, company, location }
// stderr: progress / errors

import { chromium } from 'playwright';
import { newLivenessPage } from './liveness-browser.mjs';

const MAX_PAGES = 5;         // 5 × 20 = up to 100 results per scan
const SETTLE_MS = 3_000;     // SPA hydration wait after domcontentloaded
const GOTO_TIMEOUT_MS = 20_000;

function buildPageUrl(base, pageNum) {
  const u = new URL(base);
  u.searchParams.delete('page');
  if (!u.searchParams.has('sort_by')) u.searchParams.set('sort_by', 'date');
  if (pageNum > 1) u.searchParams.set('page', String(pageNum));
  return u.href;
}

// Build a slug from the job title (matches Google's own URL slug format)
function titleToSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function scrapeOnePage(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: GOTO_TIMEOUT_MS });
  await page.waitForTimeout(SETTLE_MS);

  return page.evaluate(() => {
    const results = [];

    // Job cards: <li class="lLd3Je"> with a child <div jsdata="Aiqs8c;{jobId};...">
    const cards = document.querySelectorAll('li.lLd3Je');
    for (const card of cards) {
      const dataEl = card.querySelector('[jsdata]');
      if (!dataEl) continue;

      // jsdata format: "Aiqs8c;{numericJobId};$N"
      const jsdata = dataEl.getAttribute('jsdata') || '';
      const idMatch = jsdata.match(/;(\d{10,20});/);
      if (!idMatch) continue;
      const jobId = idMatch[1];

      const titleEl = card.querySelector('h3.QJPWVe');
      const title = titleEl?.textContent?.trim() || '';
      if (!title) continue;

      // Location: <span class="r0wTof"> inside the place-icon span
      const locationEl = card.querySelector('span.r0wTof');
      const location = locationEl?.textContent?.trim() || '';

      // Minimum qualifications: <div class="Xsxa1e"><h4>Minimum qualifications</h4><ul>...
      // Already rendered inline on the search results card — no extra page load needed.
      const qualsEl = card.querySelector('.Xsxa1e');
      const description = qualsEl?.textContent?.trim() || '';

      results.push({ title, jobId, location, description });
    }

    return results;
  }).then(cards => cards.map(({ title, jobId, location, description }) => ({
    title,
    url: `https://www.google.com/about/careers/applications/jobs/results/${jobId}-${titleToSlug(title)}`,
    company: 'Google',
    location,
    description,
  })));
}

async function main() {
  const baseUrl = process.argv[2];
  if (!baseUrl) {
    process.stderr.write('Usage: node scan-google.mjs <search_url>\n');
    process.exit(1);
  }

  try { new URL(baseUrl); } catch {
    process.stderr.write(`scan-google: invalid URL: ${baseUrl}\n`);
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const allJobs = [];
  const seen = new Set();

  try {
    const page = await newLivenessPage(browser);

    for (let pageNum = 1; pageNum <= MAX_PAGES; pageNum++) {
      const pageUrl = buildPageUrl(baseUrl, pageNum);
      process.stderr.write(`scan-google: page ${pageNum} — ${pageUrl}\n`);

      let jobs;
      try {
        jobs = await scrapeOnePage(page, pageUrl);
      } catch (err) {
        process.stderr.write(`scan-google: page ${pageNum} failed — ${err.message}\n`);
        break;
      }

      if (jobs.length === 0) {
        process.stderr.write(`scan-google: page ${pageNum} returned 0 results — done\n`);
        break;
      }

      for (const job of jobs) {
        if (!seen.has(job.url)) {
          seen.add(job.url);
          allJobs.push(job);
        }
      }

      process.stderr.write(`scan-google: page ${pageNum} — ${jobs.length} jobs (${allJobs.length} total)\n`);
    }
  } finally {
    await browser.close();
  }

  process.stdout.write(JSON.stringify(allJobs) + '\n');
}

main().catch(err => {
  process.stderr.write(`scan-google error: ${err.message}\n`);
  process.exit(1);
});
