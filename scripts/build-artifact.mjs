// Packages the exported web build (dist/) as a self-contained, relocatable page:
// every URL is relative, so it can be served from any folder or embedded host.
//   npm run export:web && node scripts/build-artifact.mjs <outDir>
// Writes <outDir>/index.html (body content only), js/*, a/* and files.json (published path → source).
import { copyFileSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';

const root = join(import.meta.dirname, '..');
const dist = join(root, 'dist');
const out = process.argv[2];
if (!out) throw new Error('usage: build-artifact.mjs <outDir>');
rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, 'js'), { recursive: true });
mkdirSync(join(out, 'a'), { recursive: true });

const jsDir = join(dist, '_expo/static/js/web');
const chunks = readdirSync(jsDir).filter((f) => f.endsWith('.js'));
const jsName = new Map(chunks.map((f, i) => [f, `c${i}.js`]));
const assetName = new Map();
const files = {};

for (const f of chunks) {
  let src = readFileSync(join(jsDir, f), 'utf8');
  for (const [from, to] of jsName) src = src.split(`/_expo/static/js/web/${from}`).join(`js/${to}`);
  src = src.replace(/"\/assets\/([^"]+)"/g, (_m, p) => {
    if (!assetName.has(p)) assetName.set(p, `a/f${assetName.size}${extname(p)}`);
    return `"${assetName.get(p)}"`;
  });
  writeFileSync(join(out, 'js', jsName.get(f)), src);
  files[`js/${jsName.get(f)}`] = join(out, 'js', jsName.get(f));
}
const fonts = [];
for (const [p, name] of assetName) {
  try {
    copyFileSync(join(dist, 'assets', p), join(out, name));
    files[name] = join(out, name);
    if (p.endsWith('.ttf')) fonts.push([p.split('/').pop().split('.')[0], join(dist, 'assets', p)]);
  } catch { /* scale variants and unused framework icons that the export did not emit */ }
}

const html = readFileSync(join(dist, 'index.html'), 'utf8');
const order = [...html.matchAll(/src="\/_expo\/static\/js\/web\/([^"]+)"/g)].map((m) => jsName.get(m[1]));
// Fonts are also inlined so text renders even where a host blocks font files.
const fontCss = fonts.map(([family, file]) => `@font-face{font-family:"${family}";src:url(data:font/ttf;base64,${readFileSync(file).toString('base64')}) format("truetype");font-display:swap}`).join('\n');

writeFileSync(join(out, 'index.html'), `<title>NEXTME AI</title>
<style>
:root { --bg: #FFF8EE; --fg: #202124; color-scheme: light; }
html, body { height: 100%; }
body { overflow: hidden; background: var(--bg); color: var(--fg); font-family: "Nunito_600SemiBold", system-ui, sans-serif; }
#root { display: flex; height: 100%; flex: 1; }
#boot { position: fixed; inset: 0; display: grid; place-items: center; font-size: 16px; color: #6B6257; }
${fontCss}
</style>
<div id="root"><div id="boot">NEXTME AI…</div></div>
<script>
// Relocatable boot: remember where the files live, then give the router a clean "/" to start from.
(function () {
  var base = document.createElement('base');
  base.href = location.href.replace(/[?#].*$/, '').replace(/[^/]*$/, '');
  document.head.appendChild(base);
  try { history.replaceState(null, '', '/'); } catch (e) {}
  // Lazy route chunks are requested from the site root by the bundler runtime; point them at the package folder.
  var d = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src');
  Object.defineProperty(HTMLScriptElement.prototype, 'src', {
    configurable: true,
    get: d.get,
    set: function (v) {
      var m = String(v).match(new RegExp('(?:^|[/])(js[/]c[0-9]+[.]js)(?:[?].*)?$'));
      d.set.call(this, m ? base.href + m[1] : v);
    },
  });
})();
</script>
${order.map((f) => `<script src="js/${f}" defer></script>`).join('\n')}
`);
files['index.html'] = undefined;
delete files['index.html'];
writeFileSync(join(out, 'files.json'), JSON.stringify(files, null, 1));
console.log(`artifact: ${chunks.length} scripts, ${Object.keys(files).length - chunks.length} assets, ${fonts.length} fonts inlined → ${out}`);
