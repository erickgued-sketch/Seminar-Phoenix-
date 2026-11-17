# Quality Report — build of 2026-11-16

## Summary

| Suite | Result | How to run |
|---|---|---|
| TypeScript strict | 0 errors | `npm run typecheck` |
| ESLint (`expo lint`, React Compiler rules) | 0 problems | `npx expo lint` |
| Unit + content tests | **158 / 158 pass** | `npm test` |
| End-to-end in Chromium (exported web build, 390×844) | **19 / 19 steps pass**, 0 console errors | `npm run e2e` |
| Database migration + Row Level Security | **18 / 18 checks pass** on PostgreSQL 16 | `npm run test:db` |
| Web export | builds; 6.3 MB total (2.1 MB JS including all 117 lessons, 2.7 MB art and animation, 0.14 MB sound) | `npm run export:web` |

## What the end-to-end run proves

It drives the real app, not mocks: onboarding (4 questions) → Level 1 cards → a deliberately wrong answer (heart lost, explanation shown) → fill, order and scenario games → reflection → personalised action → first-win screen **with no sign-up** → Today → evidence logged → Morning Prime → Goal Architect (define, edit week 1, approve) → habit auto-created from the goal + a second habit → Journey (locked level and "in preparation" level explain themselves) → gratitude journal → breathing timer → "I am responsible" steps → coach answer with seminar page citation → an off-topic question correctly gets "no source" → 2-minute focus mode → Evening Reflection (adjustment mentions the priority left undone) → Weekly CEO Review → Future Self → score → vault note cited by the coach → switch to English with progress intact → reload keeps everything → Level 2 playable in English → no horizontal overflow at 320×568 on six screens → delete all data.

Time from first screen to first win in the automated run: ~11 s (a person reading the cards takes roughly two to three minutes).

## Content QA

| Check | Result |
|---|---|
| Levels pass the validator (structure, bilingual, 3+ exercise types, action ≤ 5 min, pages cited) | 117 / 117 |
| No repeated titles or principles | ✓ |
| Program map: sequential, unique ids, chapters in order | 117 levels, 12 chapters |
| Transcript coverage by levels | 205 / 211 pages (97 %) |
| Lessons short enough for a 3-minute level; caveats present on metaphysical, historical and health lessons | ✓ (unit tests) |
| Practices sourced or labelled as complements | 14 / 14 |
| Copy check detects verbatim source text | ✓ (unit test) |

**How the lessons were grounded.** The full 211-page transcript was extracted and indexed by page. For every level, the key passage on its pages was located by search and read before writing (roughly 600 characters around each principle), and the lesson was then written as original text. This is targeted reading, not a line-by-line review of all 211 pages: named lists, steps and figures were checked against the passage, but a secondary detail in a card may come from the wider seminar tradition rather than that exact page. A human read-through of each chapter against the source is still advisable before commercial release.

## Problems found and fixed during QA

| Found by | Problem | Fix |
|---|---|---|
| e2e | Mind Studio and practice screens crashed with an infinite render loop (store selectors returning a new array each read). | Selectors now return stable references. |
| unit test | Coach missed "preocupado" for the worry lessons (stem mismatch). | Bilingual light stemmer. |
| RLS test | In Supabase a column-level `REVOKE` is ineffective under default table grants: a user could have set `role = 'admin'` on their own profile. | Table-level revoke + column-level grants; tests for update **and** insert paths. |
| visual review | Rai covered the level title on the map; coach showed only a title as the insight for some principles. | Repositioned; chunks carry an explicit summary. |
| contrast check | White on brand orange ≈ 2.2:1. | Dark-brown text on orange (≈ 8:1). |
| user report | Coach: after an answer the message box was pushed off-screen and the thread could not scroll, so a second question was impossible. Cause: the non-scrolling screen scaffold was not height-bounded. | Scaffold fixed (`flex: 1; minHeight: 0`), thread auto-scrolls to the newest message; e2e now asserts the composer stays on screen and the thread scrolls both ways (the check fails on the old build). |
| lint | 22 errors: animated values read from refs during render; a component defined inside another's render. | `useState`-held animated values; component hoisted. |

## Not verified — be aware

| Item | Status |
|---|---|
| **iOS / Android devices** | Not run. No simulator or device in the build environment. Verified on web only (React Native Web). Haptics, safe areas, keyboard behaviour and notifications need a device pass. |
| Edge Functions (`coach`, `generate-level`, `ingest`) | Written, not deployed or executed: no Supabase project, no Anthropic key and no Deno runtime here. Not type-checked. |
| pgvector path | The migration was tested with the vector column stubbed (pgvector not installed locally); full-text retrieval and all RLS were exercised, vector ranking was not. |
| Account, backup, cloud coach in the app | Code paths exist but need a live project to test. |
| Local daily reminder | Typed against expo-notifications 58; not run on a device. |
| EAS builds (`.ipa` / `.aab`) | Not produced (needs Expo and store accounts). |
| Screen reader pass (VoiceOver/TalkBack) | Roles, labels and states are set; not audited with a real screen reader. |
| 60 fps / memory profiling | Not measured on hardware. |
| `expo-doctor` | Not run. Package versions were pinned from the SDK's own `bundledNativeModules.json` instead. |

## Known gaps in scope

- Levels generated later through the cloud pipeline are not yet fetched from the database (the 117 bundled levels need no server).
- Vault accepts pasted text only (no PDF upload) and is on-device.
- No paywall/purchases, share cards, server push, analytics or crash reporting.
- Rai's animations are 12-frame loops at 384 px (GIF-derived, 1-bit transparency edges); no video clips or rigged character.
- Sounds were verified to load and trigger without errors in the browser run, but nobody has listened to them on a device: volume and character need a human ear.
- Per-level personalisation of the action is a template using the user's goal, not an LLM rewrite.
