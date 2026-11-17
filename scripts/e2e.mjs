// End-to-end smoke test of the exported web build (npm run export:web && node scripts/e2e.mjs).
// Walks the real first-run flow: onboarding → level 1 (teach + 4 games + reflect + apply) → Today →
// evidence → goal → habit → practice → coach → evening → review → language switch → persistence.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
// Resolved through require so a globally installed Playwright (CI images, cloud sandboxes) also works.
const { chromium } = createRequire(import.meta.url)('playwright');

const DIST = join(import.meta.dirname, '..', 'dist');
const SHOTS = process.env.SHOTS_DIR ?? join(import.meta.dirname, '..', '.e2e-shots');
const SCALE = Number(process.env.SCALE ?? 1);
// COLOR_SCHEME=dark runs the whole flow with the OS in dark mode (the app follows the system by default).
const SCHEME = process.env.COLOR_SCHEME === 'dark' ? 'dark' : 'light';
mkdirSync(SHOTS, { recursive: true });
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.ico': 'image/x-icon', '.ttf': 'font/ttf' };
const server = createServer(async (req, res) => {
  const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  try {
    const buf = await readFile(join(DIST, p));
    res.writeHead(200, { 'content-type': types[extname(p)] ?? 'application/octet-stream' }).end(buf);
  } catch {
    res.writeHead(200, { 'content-type': 'text/html' }).end(await readFile(join(DIST, 'index.html'))); // SPA fallback
  }
}).listen(0);
const base = `http://localhost:${server.address().port}`;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: SCALE, locale: 'es-ES', hasTouch: true, colorScheme: SCHEME });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

const results = [];
const step = async (name, fn) => {
  const t0 = Date.now();
  try { await fn(); results.push(['PASS', name, Date.now() - t0]); }
  catch (e) { results.push(['FAIL', name, String(e).split('\n')[0]]); await page.screenshot({ path: join(SHOTS, `FAIL-${results.length}.png`) }); }
};
const tid = (id) => page.getByTestId(id).last();
const tap = (id) => tid(id).click();
const shot = (n) => page.screenshot({ path: join(SHOTS, `${n}.png`) });
const see = (text) => page.getByText(text, { exact: false }).last().waitFor({ timeout: 8000 });

/** Solve whatever exercise is on screen using the level data shipped in the bundle-independent way: read the DOM. */
async function solveExercise(answers) {
  const a = answers.shift();
  if (a.type === 'choice') { await tap(`opt-${a.i}`); await tap('check'); }
  else if (a.type === 'order') { for (const i of a.order) await tap(`tile-${i}`); await tap('check'); }
  else if (a.type === 'match') { for (let i = 0; i < a.n; i++) { await tap(`ma-${i}`); await tap(`mb-${i}`); } }
  await tap('continue');
}

const t0 = Date.now();
await step('onboarding: splash → 4 questions', async () => {
  await page.goto(base);
  await see('Conviértete en tu próxima versión');
  await page.waitForTimeout(600);
  await shot('01-splash');
  await tap('start');
  await tap('area-discipline'); await tap('area-work');
  await shot('02-areas');
  await tap('ob-next');
  await tid('goal-input').fill('Mejorar mi inglés y ser mejor líder');
  await tid('why-input').fill('Quiero crecer en mi carrera');
  await tap('ob-next');
  await tap('min-10'); await tap('ob-next');
  await tap('style-direct'); await tap('ob-next');
  await see('Preparando tu programa');
});

await step('level 1: teach cards', async () => {
  await see('No es cuestión de suerte');
  await page.waitForTimeout(500);
  await shot('03-card');
  await tap('next-card'); await tap('next-card');
  await see('RECUERDA ESTO');
  await tap('next-card');
});

await step('level 1: four reinforce games + explanations', async () => {
  await see('Según el seminario');
  await tap('opt-0'); await tap('check'); // deliberately wrong → heart lost + explanation
  await see('Casi. Mira por qué');
  await page.waitForTimeout(450); await shot('04-wrong'); // let the feedback sheet finish rising
  await tap('continue');
  await tap('opt-0'); await tap('check'); await see('¡Correcto!'); await tap('continue'); // fill
  await see('Ordena la idea central');
  for (const i of [0, 1, 2, 3, 4, 5, 6]) await tap(`tile-${i}`);
  await shot('05-order');
  await tap('check'); await see('¡Correcto!'); await tap('continue');
  await tap('opt-1'); await tap('check'); await tap('continue'); // scenario
});

await step('level 1: reflect → apply → first win, no sign-up wall', async () => {
  await tid('reflect-input').fill('En mi inglés: lo decidí pero no tengo método.');
  await tap('reflect-next');
  await see('PARA TU META');
  await page.waitForTimeout(450); await shot('06-apply');
  await tid('commit-input').fill('Hoy a las 19:00');
  await tap('commit');
  await see('Cumpliste tu primera promesa');
  await page.waitForTimeout(1400); // the completion screen reveals in stages (≈1.2 s)
  await shot('07-first-win');
  results.push(['INFO', 'time to first win (automated run)', `${Math.round((Date.now() - t0) / 1000)} s`]);
  await tap('done');
});

await step('today: mission, evidence (PROVE), morning prime', async () => {
  await see('Tu misión de hoy');
  await page.waitForTimeout(500);
  await shot('08-today');
  await tid('evidence-input').fill('Me inscribí en una clase de conversación.');
  await tap('save-evidence');
  await tid('prio-input-0').fill('Practicar 15 min de inglés');
  await tid('prio-input-1').fill('Preparar la reunión del equipo');
  await tap('save-prime');
  await tap('prio-0');
});

await step('goal architect: define → edit plan → approve', async () => {
  await tap('goal-card');
  await see('Arquitecto de metas');
  await tid('g-metric').fill('3 conversaciones de 30 min sin traductor');
  await tid('g-action').fill('Practicar 15 min de conversación');
  await tid('g-obstacle').fill('Llegar cansado del trabajo');
  await tap('goal-build');
  await see('Tu plan de 90 días');
  await tid('plan-week-1').fill('Fundamento · Reservar 5 clases de conversación');
  await shot('09-plan');
  await tap('goal-approve');
  await see('ESTA SEMANA');
  await tap('week-1');
  await shot('10-goal');
});

await step('habits: habit from goal exists, check today', async () => {
  await page.goto(`${base}/habits`);
  await see('Practicar 15 min de conversación');
  await tid('habit-name').fill('Leer 15 minutos');
  await tap('pw-3'); await tap('habit-add');
  await page.goto(`${base}/today`);
  await tap('habit-Leer 15 minutos');
});

await step('journey map: 117 playable levels, sequential unlock', async () => {
  await page.goto(`${base}/journey`);
  await see('Nivel 2 de tu ascenso');
  await page.waitForTimeout(600);
  await shot('11-journey');
  await tap('node-3'); await see('Completa el nivel anterior'); await page.getByText('Entendido').click();
  await tap('node-117'); await see('Amar y aceptar'); await see('Completa el nivel anterior'); await page.getByText('Entendido').click();
});

await step('mind studio: gratitude journal', async () => {
  await page.goto(`${base}/mind`);
  await see('Diario de gratitud');
  await page.waitForTimeout(400);
  await shot('12-mind');
  await tap('practice-gratitude');
  await tid('p-input-0').fill('La llamada con mi hermana');
  await tid('p-input-1').fill('Terminar el informe a tiempo');
  await tid('p-input-2').fill('El café de esta mañana');
  await tap('practice-save'); await see('Práctica registrada'); await tap('practice-close');
  await see('Estudio mental'); // let the back navigation settle before the next page.goto
});

await step('mind studio: timer practice + steps practice', async () => {
  await page.goto(`${base}/practice/breathing`);
  await tap('timer-toggle'); await page.waitForTimeout(2600); await see('02:0');
  await shot('13-breathing');
  await tap('practice-save'); await see('Práctica registrada');
  await page.goto(`${base}/practice/responsible`);
  await tap('step-0'); await tap('step-1'); await tap('practice-save'); await see('Práctica registrada');
});

await step('coach: grounded answer with page citation + modes', async () => {
  await page.goto(`${base}/coach`);
  await tap('starter-0');
  await tid('coach-reply').waitFor();
  await see('Seminario Fénix ·');
  await see('ACCIÓN · MENOS DE 5 MIN');
  await page.waitForTimeout(400);
  await shot('14-coach');
  await tid('coach-input').fill('¿Cuál es la capital de Mongolia?');
  await tap('coach-send');
  await see('prefiero no inventarlo');
  // Regression: after long answers the composer stays visible and the thread scrolls (it used to be pushed off-screen).
  await tid('coach-input').fill('Tengo miedo al rechazo'); await tap('coach-send'); await page.waitForTimeout(700);
  const box = await tid('coach-input').boundingBox();
  if (!box || box.y + box.height > 844 || box.y < 0) throw new Error(`composer off-screen: ${JSON.stringify(box)}`);
  const sc = await tid('coach-scroll').evaluate((el) => ({ h: el.clientHeight, sh: el.scrollHeight, top: el.scrollTop }));
  if (!(sc.sh > sc.h + 50)) throw new Error(`thread is not scrollable: ${JSON.stringify(sc)}`);
  if (sc.top + sc.h < sc.sh - 40) throw new Error(`did not auto-scroll to the newest answer: ${JSON.stringify(sc)}`);
  await tid('coach-scroll').evaluate((el) => { el.scrollTop = 0; });
  if ((await tid('coach-scroll').evaluate((el) => el.scrollTop)) !== 0) throw new Error('cannot scroll back up');
  await tid('coach-scroll').evaluate((el) => { el.scrollTop = el.scrollHeight; });
  await shot('14b-coach-scrolled');
  await tap('mode-2'); await see('Modo 2 min'); await tap('focus-start'); await page.waitForTimeout(1200); await tap('focus-done');
  await tid('coach-input').waitFor();
});

await step('evening reflection → adjustment', async () => {
  await page.goto(`${base}/evening`);
  await tid('ev-won').fill('Completé mi primer nivel');
  await tid('ev-learned').fill('Que decidir no basta: hay que aprender el cómo');
  await tid('ev-tomorrow').fill('Empezar por la práctica de inglés');
  await tap('evening-save');
  await see('AJUSTE PARA MAÑANA'); await see('Preparar la reunión del equipo');
  await tap('evening-close');
  await page.waitForTimeout(400);
});

await step('weekly CEO review + future self + profile score', async () => {
  await page.goto(`${base}/review`);
  await see('Completé mi primer nivel'); await see('PRIORIDAD PARA LA PRÓXIMA SEMANA');
  await page.waitForTimeout(300); await shot('15-review');
  await page.goto(`${base}/future`); await see('repeticiones en un año'); await see('Supuestos');
  await page.goto(`${base}/me`); await see('NEXTME Score'); await page.waitForTimeout(400); await shot('16-me');
});

await step('vault: add note → coach cites it', async () => {
  await page.goto(`${base}/vault`);
  await tid('vault-title').fill('Notas de liderazgo');
  await tid('vault-text').fill('Un buen líder delega resultados y no tareas. Las reuniones individuales semanales con cada persona del equipo aumentan la confianza.');
  await tap('vault-add'); await see('Notas de liderazgo');
  await page.goto(`${base}/coach`);
  await tid('coach-input').fill('reuniones individuales semanales equipo delega');
  await tap('coach-send'); await see('Tu bóveda · Notas de liderazgo');
});

await step('appearance switch repaints, persists and returns to the system setting', async () => {
  const ground = () => page.evaluate(() => [...document.querySelectorAll('div')].map((d) => getComputedStyle(d).backgroundColor).find((c) => c === 'rgb(22, 17, 13)' || c === 'rgb(255, 248, 238)'));
  const sys = SCHEME === 'dark' ? 'rgb(22, 17, 13)' : 'rgb(255, 248, 238)';
  await page.goto(`${base}/me`); await see('NEXTME Score');
  if ((await ground()) !== sys) throw new Error('does not follow the system appearance');
  const other = SCHEME === 'dark' ? 'light' : 'dark';
  await tap(`theme-${other}`); await page.waitForTimeout(250);
  if ((await ground()) === sys) throw new Error('appearance did not change');
  await page.reload(); await see('NEXTME Score');
  if ((await ground()) === sys) throw new Error('appearance not persisted');
  await tap('theme-system'); await page.waitForTimeout(250);
  if ((await ground()) !== sys) throw new Error('did not return to the system appearance');
});

await step('language switch keeps progress', async () => {
  await page.goto(`${base}/me`);
  await tap('set-en'); await see('Your data');
  await page.goto(`${base}/journey`); await see('Level 2 of your rise');
  await page.goto(`${base}/today`); await see('Today’s mission'); await see('Mejorar mi inglés y ser mejor líder');
  await page.waitForTimeout(300); await shot('17-today-en');
});

await step('persistence across reload + level 2 playable in English', async () => {
  await page.reload(); await see('Today’s mission');
  await tap('start-level'); await see('Peace of mind');
});

await step('late levels load with their chapter art and lesson (l45, l80, l117)', async () => {
  for (const [id, text] of [['l45', '21-day mental diet'], ['l80', 'Steps 10 to 12'], ['l117', 'Love and accept']]) {
    await page.goto(`${base}/level/${id}`); await see(text); await tap('next-card');
  }
});

await step('small screen (320×568) has no horizontal overflow', async () => {
  await page.setViewportSize({ width: 320, height: 568 });
  for (const r of ['today', 'journey', 'mind', 'me', 'goal', 'level/l05']) {
    await page.goto(`${base}/${r}`); await page.waitForTimeout(500);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (over > 1) throw new Error(`${r} overflows by ${over}px`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
});

await step('delete all data returns to onboarding', async () => {
  await page.goto(`${base}/me`);
  await tap('delete'); await tap('delete-confirm');
  await see('Become your next self');
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('nextme-v1') ?? '{}'));
  if (Object.keys(stored.state?.progress ?? {}).length) throw new Error('progress not erased');
});

await browser.close();
server.close();
for (const r of results) console.log(r.join(' | '));
const real = errors.filter((e) => !/favicon|Download the React DevTools|shadow\*|pointerEvents|useNativeDriver/.test(e));
console.log(`console errors: ${real.length}`); real.slice(0, 8).forEach((e) => console.log('  ', e.slice(0, 300)));
const failed = results.filter((r) => r[0] === 'FAIL').length;
console.log(failed ? `${failed} FAILED` : 'ALL PASSED');
process.exit(failed ? 1 : 0);
