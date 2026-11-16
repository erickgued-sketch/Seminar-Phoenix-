# Design System

Source of truth: [`src/theme/tokens.ts`](../src/theme/tokens.ts). Components: [`src/components/ui.tsx`](../src/components/ui.tsx).

## Principles
1. **One obvious next action per screen** — a single primary button, pinned to the bottom.
2. **Calm surface, lively moments** — cream and white at rest; colour and motion only for progress and feedback.
3. **Honest UI** — sources, assumptions and caveats are visible, not hidden in settings.

## Colour

| Token | Hex | Use |
|---|---|---|
| `bg` | `#FFF8EE` | App background (with a soft peach bloom at the top) |
| `surface` | `#FFFFFF` | Cards, inputs |
| `surfaceAlt` | `#FFF1DC` | Example boxes, assumptions |
| `primary` / `primaryDeep` / `primaryEdge` | `#FF9E2C` / `#EE7A12` / `#C9640A` | Primary button face / accents / button edge |
| `onPrimary` | `#3B2409` | Text on orange |
| `text` / `text2` / `text3` | `#202124` / `#6B6257` / `#9A8F82` | Body / secondary / hints |
| `success` / `successDeep` | `#58CC02` / `#3F9B00` | Correct, done, evidence |
| `info` / `infoDeep` | `#1CB0F6` / `#0B7FB8` | Selection, sources, links |
| `danger` / `dangerDeep` | `#FF4B4B` / `#C92A2A` | Hearts, destructive |
| `gold` | `#FFC83D` | Completed level |
| `night` | `#2B2540` | Evening reflection prompt |

**Refinement to the brief's palette:** white text on `#FF9E2C` is only ~2.2:1, so buttons use dark brown `onPrimary` (≈8:1). Orange is never used for body text; `primaryDeep` is reserved for labels ≥12 pt bold.

## Type
- Display: **Baloo 2** 700/800 — headings, numbers.
- Text: **Nunito** 600/700/800 — body, labels.
- Scale: hero 34 · h1 28 · h2 22 · h3 17 · body 16/23 · small 14 · label 12 (caps, +0.8 tracking).

## Space, shape, elevation
8-pt grid (`4 8 16 24 32 48`). Radii: 12 (tiles) · 18 (buttons, inputs) · 28 (cards) · pill. One soft warm shadow for cards. Max content width 560 px, centred on tablets/web.

## Components
`Screen` (safe areas, sticky footer, keyboard avoidance) · `Button` (primary/success/info/ghost/danger; depresses 4 px in 120 ms + haptic) · `Card` · `Chip` · `Bar` · `Field` · `Header` · `Label` · `Enter` (fade-rise 320 ms) · `Empty` · `ScoreRing` · `Rai` / `RaiSays` · `ExerciseView` (choice, fill, order, match).

## States
Every screen handles: loading (root spinner until fonts + storage hydrate), empty (`Empty`, or Rai with a next step), error (inline message; coach falls back to local), success (Rai + XP).

## Motion
Press 120 ms · card and exercise slide-in (spring) · wrong answer shakes, right answer pops · progress bars spring to value · confetti burst and XP count-up on level complete · pulsing primary button and walking Rai on the current level · Rai frame loops ~1 s. Cards also respond to swipe. All loops, entrances and frame animations are replaced by their resting state when the OS "Reduce Motion" setting is on.

## Sound
Eleven short tones (tap, select, card, correct, wrong, check, xp, complete, levelup, bell, nudge) confirm actions; never used as the only signal, and switchable in Profile.

## Accessibility
Touch targets ≥ 44 pt · roles and labels on every control (`button`, `radio`, `checkbox`, `progressbar`, `header`) · selected/checked/disabled states announced · feedback panel is a live region · colour is never the only signal (✓, ★, 🔒, text) · text contrast ≥ 4.5:1 for body.

## Rai
One character, ten states: idle, welcome, happy, thinking, focus, celebrate, levelup, encouraging, breathing, comeback. Warm, capable, slightly playful; never childish or aggressive. Appears where there is something to say — never as decoration on every screen.
