// Serves the exported web build with SPA fallback:  npm run export:web && node scripts/serve.mjs [port]
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const dist = join(import.meta.dirname, '..', 'dist');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.ico': 'image/x-icon', '.ttf': 'font/ttf', '.mp3': 'audio/mpeg', '.mp4': 'video/mp4' };
const port = Number(process.argv[2] ?? 4173);
createServer(async (req, res) => {
  const p = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
  // Read before writing headers: a directory or missing file must fall through to the SPA shell.
  const file = await readFile(join(dist, p)).catch(() => null);
  if (file) res.writeHead(200, { 'content-type': types[extname(p)] ?? 'application/octet-stream' }).end(file);
  else res.writeHead(200, { 'content-type': 'text/html' }).end(await readFile(join(dist, 'index.html')));
}).listen(port, () => console.log(`NEXTME AI → http://localhost:${port}`));
