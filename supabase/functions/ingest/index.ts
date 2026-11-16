// POST /functions/v1/ingest
//   { mode: 'vault', title, text }                       any signed-in user → their own vault chunks
//   { mode: 'kb', chunks: [{language,title,body,pages,…}] } admin → shared knowledge base (original paraphrases)
//   { mode: 'source', pages: [{page, text}] }            admin → private transcript pages (never exposed to clients)
import { adminClient, cors, embed, isAdmin, json, userClient } from '../_shared/common.ts';

/** Semantic-ish chunking: paragraph/sentence packing to ~900 chars with one sentence of overlap. */
export function chunkText(text: string, size = 900): string[] {
  const sentences = text.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+/).filter(Boolean);
  const out: string[] = [];
  let cur: string[] = [];
  for (const s of sentences) {
    if (cur.join(' ').length + s.length > size && cur.length) {
      out.push(cur.join(' '));
      cur = [cur[cur.length - 1]];
    }
    cur.push(s);
  }
  if (cur.join(' ').trim()) out.push(cur.join(' '));
  return out;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const caller = await userClient(req);
  if (!caller) return json({ error: 'unauthorized' }, 401);
  const body = await req.json();

  if (body.mode === 'vault') {
    if (typeof body.text !== 'string' || body.text.length < 30 || body.text.length > 200_000) return json({ error: 'invalid text' }, 400);
    const { data: doc, error } = await caller.db.from('documents').insert({ user_id: caller.userId, title: String(body.title ?? 'Notes').slice(0, 120), raw_text: body.text }).select('id').single();
    if (error) return json({ error: error.message }, 500);
    const lang = body.language === 'en' ? 'en' : 'es';
    const rows = [];
    for (const part of chunkText(body.text)) rows.push({ owner: caller.userId, document_id: doc.id, source: 'vault', language: lang, title: body.title ?? 'Notes', body: part, kind: 'note', embedding: await embed(part) });
    const ins = await caller.db.from('knowledge_chunks').insert(rows);
    return ins.error ? json({ error: ins.error.message }, 500) : json({ document_id: doc.id, chunks: rows.length });
  }

  if (!(await isAdmin(caller.db, caller.userId))) return json({ error: 'forbidden' }, 403);
  const admin = adminClient();

  if (body.mode === 'kb') {
    const rows = [];
    for (const c of body.chunks ?? []) rows.push({ ...c, owner: null, embedding: await embed(`${c.title}. ${c.body}`) });
    await admin.from('knowledge_chunks').delete().is('owner', null).eq('source', 'seminario-fenix');
    const ins = await admin.from('knowledge_chunks').insert(rows);
    return ins.error ? json({ error: ins.error.message }, 500) : json({ chunks: rows.length });
  }
  if (body.mode === 'source') {
    const rows = (body.pages ?? []).map((p: { page: number; text: string }) => ({ page: p.page, body: p.text }));
    const up = await admin.from('source_pages').upsert(rows);
    return up.error ? json({ error: up.error.message }, 500) : json({ pages: rows.length });
  }
  return json({ error: 'unknown mode' }, 400);
});
