// POST /functions/v1/generate-level  { id, chapter, position, title:{es,en}, principle:{es,en}, pages:[…] }
// Admin only. Turns one curriculum blueprint row into a full lesson, grounded on the private
// transcript pages, then runs the SAME validator the app's tests use (structure, bilingual
// completeness, and a copy check against the source). Nothing is published automatically:
// a passing level is stored as 'validated' for human review; a failing one as 'rejected' with reasons.
import Anthropic from 'npm:@anthropic-ai/sdk';
import { zodOutputFormat } from 'npm:@anthropic-ai/sdk/helpers/zod';
import { z } from 'npm:zod';
import { validateLevel } from '../../../src/lib/validateLevel.ts';
import { adminClient, anthropic, cors, isAdmin, json, MODEL, userClient } from '../_shared/common.ts';

const L = z.object({ es: z.string(), en: z.string() });
const Choice = z.object({ type: z.enum(['mc', 'scenario', 'fill']), q: L, options: z.array(L), answer: z.number().int(), why: L });
const Order = z.object({ type: z.literal('order'), q: L, tokens: z.object({ es: z.array(z.string()), en: z.array(z.string()) }), why: L });
const Match = z.object({ type: z.literal('match'), q: L, pairs: z.array(z.object({ a: L, b: L })), why: L });
const LevelOut = z.object({
  title: L,
  principle: L,
  caveat: L.nullable().describe('Required when the teaching is metaphysical, historical or a health/financial claim; otherwise null.'),
  cards: z.array(z.object({ title: L, body: L, example: L })),
  exercises: z.array(z.union([Choice, Order, Match])),
  reflect: L,
  apply: L,
  applyMinutes: z.number().int(),
  prove: L,
});

const SYSTEM = `You write lessons for NEXTME AI, a teach-then-reinforce personal-development app (Spanish first, English second).

You receive one principle from a curriculum and the transcript pages it comes from. Produce ONE level.

Fidelity
- Teach only what the pages actually say about this principle. Do not add teachings the source does not contain.
- Write ORIGINAL text. Never copy source wording: no run of more than a few consecutive source words.
- When the source states a metaphysical idea, a historical statistic, or a health, psychological or financial claim, attribute it ("the seminar teaches…") and fill "caveat" with a short, neutral modern note. Never promise results.

Shape
- cards: 3 to 5. One idea per card, body under 300 characters, with a concrete everyday example.
- exercises: 4 to 6, using at least three different types among mc, fill, order, match, scenario.
  - mc / scenario / fill: 2–4 short options, "answer" is the 0-based index, vary its position; "fill" questions contain ___ in both languages.
  - order: "tokens" is the sentence split into words IN THE CORRECT ORDER (3–9 words per language).
  - match: 2–4 pairs.
  - every exercise has "why": a one-sentence explanation shown after answering.
- reflect: one question that ties the principle to the learner's own life.
- apply: one concrete action doable right now; applyMinutes between 1 and 5.
- prove: a question asking what the learner actually did (no private or invasive evidence).
- Both languages must be complete and natural; adapt examples, do not translate word for word.`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const caller = await userClient(req);
  if (!caller || !(await isAdmin(caller.db, caller.userId))) return json({ error: 'forbidden' }, 403);

  const bp = await req.json();
  if (!bp?.id || !Array.isArray(bp.pages) || !bp.pages.length) return json({ error: 'blueprint needs id and pages' }, 400);

  const admin = adminClient();
  const { data: pages } = await admin.from('source_pages').select('page, body').in('page', bp.pages).order('page');
  if (!pages?.length) return json({ error: 'source pages not ingested' }, 409);
  const sourceText = pages.map((p) => p.body).join('\n');

  let response;
  try {
    // Streaming: a full bilingual lesson is a long output.
    response = await anthropic().messages.stream({
      model: MODEL,
      max_tokens: 32000,
      output_config: { effort: 'high', format: zodOutputFormat(LevelOut) },
      system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
      messages: [{
        role: 'user',
        content: `<principle>\n${JSON.stringify({ title: bp.title, principle: bp.principle, chapter: bp.chapter })}\n</principle>\n<source_pages numbers="${bp.pages.join(',')}">\n${sourceText}\n</source_pages>`,
      }],
    }).finalMessage();
  } catch (e) {
    if (e instanceof Anthropic.APIError) return json({ error: `model error ${e.status}` }, 502);
    throw e;
  }
  if (response.stop_reason !== 'end_turn') return json({ error: `generation stopped: ${response.stop_reason}` }, 502);
  const text = response.content.find((b) => b.type === 'text');
  const parsed = LevelOut.safeParse(text ? JSON.parse(text.text) : null);
  if (!parsed.success) return json({ error: 'schema mismatch', issues: parsed.error.issues.slice(0, 5) }, 502);

  const { caveat, ...rest } = parsed.data;
  const level = { id: bp.id, chapter: bp.chapter, pages: bp.pages, ...rest, ...(caveat ? { caveat } : {}) };
  const errors = validateLevel(level, { sourceText, maxSharedWords: 10 });

  const { error } = await admin.from('levels').upsert({
    id: bp.id, program_id: 'fenix', chapter: bp.chapter, position: bp.position, source_pages: bp.pages,
    content: level, status: errors.length ? 'rejected' : 'validated', validation_errors: errors, generated_by: response.model,
  });
  if (error) return json({ error: error.message }, 500);
  return json({ id: bp.id, status: errors.length ? 'rejected' : 'validated', errors });
});
