// @ts-check
/** @typedef {import('./_types.js').Provider} Provider */

// Eightfold AI provider — hits the public apply.eightfold.ai job-search JSON
// endpoint that the careers site itself calls client-side. Confirmed working
// against explore.jobs.netflix.net (2026-07); the same `/api/apply/v2/jobs`
// path pattern is shared by other Eightfold-hosted career sites (e.g.
// `<company>.eightfold.ai`, `explore.jobs.<company>.net`).
//
// Auto-detects from careers_url on an Eightfold-hosted host. A
// tracked_companies entry can set `provider: eightfold` explicitly and
// `eightfold_domain:` to override the `domain=` query param when it differs
// from the careers_url host's registrable domain (Netflix's site lives at
// explore.jobs.netflix.net but the API's `domain` param is `netflix.com`).

const ALLOWED_EIGHTFOLD_HOST_SUFFIXES = ['.eightfold.ai'];
// Hosts that don't end in .eightfold.ai but are known Eightfold-hosted career
// sites (white-labeled). Add entries here as new companies are confirmed.
const KNOWN_WHITELABEL_HOSTS = new Set(['explore.jobs.netflix.net']);

function isEightfoldHost(hostname) {
  if (KNOWN_WHITELABEL_HOSTS.has(hostname)) return true;
  return ALLOWED_EIGHTFOLD_HOST_SUFFIXES.some(suffix => hostname.endsWith(suffix));
}

function resolveConfig(entry) {
  const raw = typeof entry.careers_url === 'string' ? entry.careers_url : '';
  if (!raw) return null;
  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    return null;
  }
  if (parsed.protocol !== 'https:') return null;
  if (!isEightfoldHost(parsed.hostname)) return null;
  const domain = typeof entry.eightfold_domain === 'string' && entry.eightfold_domain
    ? entry.eightfold_domain
    : parsed.hostname;
  return { host: parsed.hostname, domain };
}

function buildSearchUrl({ host, domain }, query) {
  const url = new URL(`https://${host}/api/apply/v2/jobs`);
  url.searchParams.set('domain', domain);
  url.searchParams.set('query', query);
  url.searchParams.set('start', '0');
  url.searchParams.set('num', '50');
  return url.href;
}

/** @type {Provider} */
export default {
  id: 'eightfold',

  detect(entry) {
    const cfg = resolveConfig(entry);
    return cfg ? { url: `https://${cfg.host}/` } : null;
  },

  async fetch(entry, ctx) {
    const cfg = resolveConfig(entry);
    if (!cfg) throw new Error(`eightfold: cannot derive API config for ${entry.name}`);
    // Eightfold's search is title-query driven, not a full board dump —
    // query for "Product" to cover PM/Product Manager/Head of Product/etc.
    // title_filter in portals.yml still does the final precise matching.
    const query = typeof entry.eightfold_query === 'string' ? entry.eightfold_query : 'Product Manager';
    const searchUrl = buildSearchUrl(cfg, query);
    const data = await ctx.fetchJson(searchUrl, { redirect: 'error' });
    return parseEightfoldPositions(data, entry.name, cfg.host);
  },
};

/**
 * @param {any} data — parsed JSON from /api/apply/v2/jobs
 * @param {string} companyName
 * @param {string} host
 * @returns {Array<{title: string, url: string, company: string, location: string}>}
 */
export function parseEightfoldPositions(data, companyName, host) {
  const positions = Array.isArray(data?.positions) ? data.positions : [];
  const jobs = [];
  for (const p of positions) {
    const title = typeof p?.name === 'string' ? p.name.trim() : '';
    const id = p?.id;
    if (!title || !id) continue;
    const url = `https://${host}/careers/job/${id}`;
    const location = typeof p?.location === 'string' ? p.location : '';
    jobs.push({ title, url, location, company: companyName });
  }
  return jobs;
}
