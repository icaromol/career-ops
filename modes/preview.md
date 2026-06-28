# Mode: preview — Live Browser Preview of CV HTML

Serve a tailored CV HTML file on localhost so you can review it in the browser before generating the PDF.

## Usage

```
/career-ops preview {slug}
/career-ops preview {slug} {port}
/career-ops preview           ← lists available HTMLs
```

Where `{slug}` is the company slug used when the HTML was generated (e.g. `vtex`, `ifood`, `pm-pleno`).
`{port}` is optional (default: 3131).

## Execution steps

### Step 1 — Resolve the HTML file

Look for a matching HTML file in this order:

1. `output/cv-icaro-molinari-{slug}.html` (exact match)
2. `output/cv-*-{slug}*.html` (glob, take the most recent by filename)
3. `/tmp/cv-*-{slug}*.html` (fallback for files written to /tmp)

If no match:
- List all `.html` files found in `output/` and `/tmp/cv-*.html`
- Ask the user which one to preview

### Step 2 — Start the preview server

```bash
node preview-server.mjs {resolved-html-path} {port} &
```

Run in background. The server prints the URL to stdout.

Wait 1 second then confirm it's up:

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:{port}/
```

If HTTP 200: report success.
If not: show the error and stop.

### Step 3 — Open in browser (VSCode / WSL)

Try in order until one works:

```bash
# WSL / Linux with xdg-open
xdg-open http://localhost:{port}/ 2>/dev/null ||
# VS Code built-in browser (simple-browser)
code --open-url http://localhost:{port}/ 2>/dev/null ||
# macOS
open http://localhost:{port}/ 2>/dev/null ||
true
```

### Step 4 — Report to user

Tell the user:
- The URL: `http://localhost:{port}/`
- The file being served
- How to stop: `kill $(lsof -ti tcp:{port})` or Ctrl+C in the terminal where the server runs

### Step 5 — Wait for next action

Ask: "Looks good? Say `pdf vtex` (or the slug) to generate the PDF, or `stop preview` to kill the server."

When the user says `stop preview` or `kill preview`:
```bash
kill $(lsof -ti tcp:{port}) 2>/dev/null || true
```

## Notes

- The server resolves absolute font paths embedded in the HTML (e.g. `/home/user/.../fonts/x.woff2`) so fonts render correctly.
- Multiple previews on different ports are allowed — just use a different port number.
- The server is stateless: it serves the HTML file as-is. If you edit the HTML, refresh the browser.
- Default port is 3131 to avoid conflicts with common dev servers (3000, 3030, 8080).
