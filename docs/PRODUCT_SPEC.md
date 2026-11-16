# Product Specification — NEXTME AI

## One sentence
NEXTME AI turns personal-development principles into daily action: learn one idea in three minutes, apply it the same day, record what happened, and let the system adjust.

## The engine
`LEARN → UNDERSTAND → PRACTICE → EXECUTE → REFLECT → IMPROVE`

| Step | Where it lives |
|---|---|
| Learn | 3–5 swipe cards per level |
| Understand | 4–6 mini-games with an explanation after every answer |
| Practice | Reflection question + Mind Studio practices |
| Execute | "Apply" action with a commitment; Today's top-3; habits; focus timer |
| Reflect | Evidence log (PROVE), Evening Reflection |
| Improve | Spaced review (1-3-7-14-30 d), Weekly CEO Review, coach |

Learning without applying is not full progress: *Application* is the largest component of the score (25/100), and a level stays in "pending action" on Today until evidence is logged.

## Decisions (and the contradictions they resolve)

| # | Question | Decision | Why |
|---|---|---|---|
| 1 | RISEPRO vs NEXTME | One brand: **NEXTME AI**, tiger mascot **Rai**. RISEPRO contributes strategy only (goal architecture, daily loop, CEO review, score). | The brief asks for a single identity. |
| 2 | "Not a course app" (RISEPRO) vs 100-level program (NEXTME) | The program is the spine, but every level ends in a real-life action and the home screen is *Today's Mission*, not the map. | Keeps the daily game without becoming a PDF-turned-course. |
| 3 | Dark premium (RISEPRO tone) vs bright cream (NEXTME) | Bright cream + orange. | Explicit palette in the master prompt. |
| 4 | "100+ levels" vs "no placeholder levels" | 117 levels are **mapped** to source pages; 18 are fully authored. The other 99 show as "in preparation" and become playable only after generation **and** validation. | Honest scope; no fake lessons. |
| 5 | Chapter structure | 12 chapters instead of the suggested 10, following the transcript's real order (time management, creativity and health each needed their own chapter). | The PDF is the authority on content. |
| 6 | Sign-up | None required. Local-first; optional account only for backup. | First win in < 3 min, privacy by default. |
| 7 | AI coach without a server | On-device retrieval + grounded composer ships now; the cloud coach (RAG + Claude) is a drop-in upgrade behind the same interface. | The app must be useful with zero credentials and offline. |
| 8 | Gratitude journal | Included in Mind Studio, **labelled as a complement**: the seminar teaches appreciation and saying "thank you" (p. 190) but not a gratitude journal. | No invented attributions. |
| 9 | Seminar claims | Laws of attraction/correspondence, expectation studies, brain-wave learning and health advice carry an in-app note separating *what the seminar teaches* from *what is established*. | Phase 12 of the brief. |
| 10 | Hearts | 5 per level. At zero: a supportive "breathe" screen and a card review — no lock-out, no paywall. | No anxiety mechanics. |
| 11 | Streak | Two freezes bridge a missed day automatically; coming back after a gap gets a welcome, not a penalty. | Same. |
| 12 | Future Self | Plain arithmetic on the user's real 4-week average, with assumptions printed. | Never a guaranteed prediction. |

## Screens

Onboarding · Today · Journey · Level Player · Coach · Mind Studio (+14 practices) · Goal Architect · Habits · Evening Reflection · Weekly CEO Review · Future Self · Knowledge Vault · Focus timer · Profile & Progress · Account & backup.

## NEXTME Score (0–100, last 7 days)

| Component | Max | Measured as |
|---|---|---|
| Goal clarity | 15 | Active goal has title, why, metric, deadline, daily action |
| Learning | 15 | Levels completed (5 = max) |
| Application | 25 | Share of completed levels with evidence |
| Habits | 20 | Check-ins vs weekly targets |
| Reflection | 15 | Days with evening reflection or a practice (5 = max) |
| Consistency | 10 | Current streak (7 = max) |

Shown with its formula in the app. It is an activity index — not a measure of worth, intelligence or mental health.

## Commercial model (architecture ready, not wired)

`plans` table holds Free / Premium / Elite with configurable prices and feature limits; `subscriptions` can only be written by the server. The first learning experience is never paywalled. RevenueCat and a paywall screen are **not implemented yet**.

## Not in this version

Paywall and purchases · push from a server (only a local daily reminder) · share cards · leagues/friends · voice · PDF upload in the vault (paste text only) · video/Rive animation · analytics and crash reporting SDKs · levels 19–117 as playable content.
