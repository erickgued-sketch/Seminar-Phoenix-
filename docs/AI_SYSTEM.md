# AI System — NEXTME Intelligence Engine

Two engines behind one interface (`askCoach` in `src/lib/coach/index.ts`). The app always works with the first; the second is used when a backend is configured and the user is signed in, and any failure falls back to the first.

| | Local coach (shipping, tested) | Cloud coach (code complete, not deployed) |
|---|---|---|
| Retrieval | BM25 over the bundled knowledge base + the user's vault, with a light ES/EN stemmer and query expansion (`retrieval.ts`) | Hybrid: pgvector cosine (gte-small, 384 d) + Postgres full text, fused with RRF (`hybrid_search` SQL, runs under the caller's RLS) |
| Generation | Deterministic composer (`compose.ts`): quotes the retrieved principle, adds the level's own action and question | Claude via the Anthropic SDK with a strict output schema (`supabase/functions/coach`) |
| Works offline | Yes | No |
| Cost | None | Model tokens |

## Knowledge base

`src/lib/coach/kb.ts` builds **129 chunks × 2 languages**: every level (principle + cards) and every seminar practice. Each chunk carries: title, summary, body, **source pages**, chapter, kind, an action, a reflection question and a caveat where the teaching is not established science. All of it is original paraphrase — the transcript is never bundled or served to clients.

## Answer contract (both engines)

1. **Insight** — with a visible source tag: `Seminario Fénix · <principle> · p. X–Y`, `Your vault · <title>`, or `No source`.
2. **Why it matters** — labelled *coach suggestion*.
3. **Your data** — only facts the user recorded (streak, habit check-ins, levels without evidence).
4. **Action under 5 minutes**.
5. **Reflection question**.
6. **Execution modes 2 / 10 / 25 min** → focus timer.

So the user can always tell apart: what the seminar teaches, what the coach suggests, what comes from their own records, and what has no evidence.

## Guardrails

| Risk | Control |
|---|---|
| Invented teachings | Below a retrieval score threshold the coach says it found nothing and asks a clarifying question (tested). |
| Invented citations (cloud) | The model returns only the **index** of the chunk it used; the server attaches title and pages. |
| Invented memories | Personalisation uses only the context object; with consent off, no goal or record is used or sent (tested). |
| Verbatim copying | System prompts forbid quoting; generated levels go through an n-gram copy check against the source. |
| Pseudo-science as fact | Chunk caveats are shown under the insight; system prompt forbids presenting seminar claims as proven. |
| Crisis language | Detected before retrieval; the reply is a human-help card, not coaching (tested). |
| Secrets | `ANTHROPIC_API_KEY` and the service-role key exist only as Edge Function secrets. The app ships only the public anon key. |

## Cloud request shape

`supabase/functions/coach/index.ts`: `messages.parse` with `output_config.format = zodOutputFormat(Reply)`, `effort: "low"`, a static system prompt marked `cache_control: ephemeral`, and all per-request data (language, style, user context, retrieved chunks, message) in the user turn so the prefix stays cacheable. `stop_reason` is checked before reading content; on refusal or truncation the app uses the local coach. Model is set server-side with the `COACH_MODEL` secret (default `claude-opus-5-5`).

Not enabled: server-side refusal fallbacks (`fallbacks`), because they need the beta endpoint and this function could not be exercised against the live API in the build environment. The local-coach fallback covers the same case for the user.

## Content engine (for future chapters)

Levels 1–117 were written by hand in this repository and ship in the bundle. The pipeline below is the path for adding chapters later (for example from a user's own vault).

```
blueprint row (title, principle, pages)          src/content/curriculum.ts
        │  npm run content -- generate <id>
        ▼
generate-level (admin only)                      supabase/functions/generate-level
  ├─ loads the private transcript pages for those page numbers
  ├─ Claude → full bilingual level in the app's schema (streamed, schema-constrained)
  ├─ validateLevel(): 3–5 cards, 4–6 exercises, ≥3 exercise types, answers in range,
  │   both languages complete, action 1–5 min, pages cited, copy check ≤10 shared words
  └─ stores as `validated` or `rejected` (+reasons) — never auto-published
        ▼
human review → status `published` → readable by the app
```

The validator is the same file the unit tests run against the 18 authored levels (`src/lib/validateLevel.ts`).

**Remaining wiring:** the app reads levels from its bundle. Loading `published` rows from the `levels` table into the Journey map is not implemented yet, so *generated* levels would not appear in the app until that fetch (or a bundle export step) is added.

## Ingestion

`supabase/functions/ingest` — `vault` (any user → their own chunks), `kb` (admin → shared paraphrased knowledge base), `source` (admin → private transcript pages in `source_pages`, which no client role can read). Chunking: sentence packing to ~900 characters with one sentence of overlap. CLI: `npm run content -- seed-kb | ingest-source <pdf> | generate <id|next|all>`.

The in-app vault currently stores and searches notes **on the device**; it does not call `ingest` yet.
