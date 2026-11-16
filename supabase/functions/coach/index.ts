// POST /functions/v1/coach  { message, lang, style, context }
// RAG coach: hybrid retrieval (pgvector + full text, under the caller's RLS) → Claude with a
// strict output schema. The model chooses WHICH retrieved chunk grounds the answer by index;
// the server attaches the title and page numbers, so citations cannot be invented.
import Anthropic from 'npm:@anthropic-ai/sdk';
import { zodOutputFormat } from 'npm:@anthropic-ai/sdk/helpers/zod';
import { z } from 'npm:zod';
import { anthropic, cors, embed, json, MODEL, userClient } from '../_shared/common.ts';

const SAFETY = /suicid|matarme|quitarme la vida|no quiero vivir|hacerme da[nñ]o|autolesi|kill myself|end my life|self.?harm|hurt myself/i;

const Reply = z.object({
  insight: z.string().describe('One clear insight, 1–2 sentences, paraphrased — never quoting the source.'),
  source_index: z.number().int().describe('Index of the retrieved chunk that grounds the insight, or -1 if none of them is relevant.'),
  why: z.string().describe('Why it matters for THIS user, using only the provided user context.'),
  action: z.string().describe('One concrete action that takes under 5 minutes and starts with a verb.'),
  question: z.string().describe('One reflection question.'),
});

// Static and identical on every request → cacheable prefix. Per-request data goes in the user turn.
const SYSTEM = `You are the NEXTME AI coach: a personal-development coach that turns learning into action.

Grounding rules
- Base the insight on the retrieved chunks in <context>. They are original paraphrases of a personal-development seminar, plus the user's own notes (kind="vault").
- Set source_index to the chunk you relied on. If no chunk is relevant, set it to -1 and say plainly that the program does not cover this; do not make up a teaching or attribute anything to the seminar.
- Never quote or reconstruct source wording. Paraphrase.
- Seminar ideas are teachings, not science. Do not present metaphysical, medical, psychological or financial claims as proven facts, and never promise outcomes.
- You are not a therapist, doctor or financial adviser. Do not diagnose or prescribe.

Personalisation rules
- Use only the facts in <user>. Never invent memories, history or data about the user. If <user> is empty, coach without personalising and do not pretend otherwise.

Style
- Reply in the language given in <lang>.
- <style> is one of warm (empathetic, close), direct (clear, practical, no detours) or elite (demanding, strategic). In all three: no blame, no emotional manipulation, no generic motivation.
- Be concise. Challenge excuses kindly. The action must be doable right now in under five minutes.`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const caller = await userClient(req);
  if (!caller) return json({ error: 'unauthorized' }, 401);

  const { message, lang = 'es', style = 'warm', context = {} } = await req.json();
  if (typeof message !== 'string' || !message.trim() || message.length > 2000) return json({ error: 'invalid message' }, 400);
  if (SAFETY.test(message)) return json({ safety: true }, 200); // the app shows its human-help card

  const embedding = await embed(message);
  const { data: hits, error } = await caller.db.rpc('hybrid_search', { query_text: message, query_embedding: embedding, lang, match_count: 6 });
  if (error) return json({ error: 'retrieval failed' }, 500);
  const chunks = hits ?? [];

  const contextBlock = chunks
    .map((c: { title: string; body: string; kind: string; owner: string | null }, i: number) => `<chunk index="${i}" kind="${c.owner ? 'vault' : c.kind}" title="${c.title}">${c.body}</chunk>`)
    .join('\n');

  let response;
  try {
    response = await anthropic().messages.parse({
      model: MODEL,
      max_tokens: 2000,
      output_config: { effort: 'low', format: zodOutputFormat(Reply) },
      system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
      messages: [{
        role: 'user',
        content: `<lang>${lang}</lang>\n<style>${style}</style>\n<user>${JSON.stringify(context)}</user>\n<context>\n${contextBlock}\n</context>\n<message>${message}</message>`,
      }],
    });
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) return json({ error: 'busy' }, 429);
    if (e instanceof Anthropic.APIError) return json({ error: `model error ${e.status}` }, 502);
    throw e;
  }
  // Check stop_reason before trusting content; on refusal or truncation the app falls back to its local coach.
  if (response.stop_reason === 'refusal' || !response.parsed_output) return json({ error: 'no answer' }, 200);

  const out = response.parsed_output;
  const src = out.source_index >= 0 ? chunks[out.source_index] : undefined;
  const reply = {
    insight: out.insight,
    why: out.why,
    action: out.action,
    question: out.question,
    caveat: src?.caveat ?? undefined,
    source: src ? { kind: src.owner ? 'vault' : 'seminar', title: src.title, pages: src.pages ?? [] } : { kind: 'none', title: '', pages: [] },
  };
  await caller.db.from('ai_conversations').insert([
    { user_id: caller.userId, role: 'user', content: { text: message } },
    { user_id: caller.userId, role: 'coach', content: reply, model: response.model },
  ]);
  return json(reply);
});
