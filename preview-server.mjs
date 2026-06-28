#!/usr/bin/env node
/**
 * preview-server.mjs — serve a CV HTML file on localhost for live preview
 *
 * Usage:
 *   node preview-server.mjs <path-to-html> [port]
 *
 * Examples:
 *   node preview-server.mjs output/cv-icaro-molinari-vtex.html
 *   node preview-server.mjs output/cv-icaro-molinari-vtex.html 3030
 *
 * The server resolves font paths relative to the project root so Space Grotesk
 * and DM Sans render correctly in the browser (same as in the PDF).
 *
 * Press Ctrl+C to stop.
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const [,, htmlArg, portArg] = process.argv;

if (!htmlArg) {
  console.error('Usage: node preview-server.mjs <path-to-html> [port]');
  process.exit(1);
}

const htmlPath = path.resolve(htmlArg);
if (!fs.existsSync(htmlPath)) {
  console.error(`File not found: ${htmlPath}`);
  process.exit(1);
}

const PORT = parseInt(portArg ?? '3131', 10);
const PROJECT_ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
};

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);

  // Root → serve the CV HTML
  if (urlPath === '/' || urlPath === '/index.html') {
    const html = fs.readFileSync(htmlPath, 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
    return;
  }

  // Absolute paths embedded in HTML (e.g. /home/user/.../fonts/x.woff2)
  // Map them to project-relative paths or serve directly if the file exists.
  let filePath;
  if (urlPath.startsWith('/home/') || urlPath.startsWith('/tmp/')) {
    filePath = urlPath; // absolute path on the FS
  } else {
    filePath = path.join(PROJECT_ROOT, urlPath);
  }

  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME[ext] ?? 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': mime });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, '127.0.0.1', () => {
  const rel = path.relative(process.cwd(), htmlPath);
  console.log(`\nCV Preview Server running`);
  console.log(`  File : ${rel}`);
  console.log(`  URL  : http://localhost:${PORT}`);
  console.log(`\nOpen the URL above in your browser.`);
  console.log(`Press Ctrl+C to stop.\n`);
});
