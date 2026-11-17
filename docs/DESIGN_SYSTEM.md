# Design System 2.0

Source of truth: [`src/theme/tokens.ts`](../src/theme/tokens.ts). Components: [`src/components/ui.tsx`](../src/components/ui.tsx), glyphs [`Icon.tsx`](../src/components/Icon.tsx), illustrations [`Art.tsx`](../src/components/Art.tsx), motion [`fx.tsx`](../src/components/fx.tsx).

Before / after: [`screenshots/v2/before-after.jpg`](screenshots/v2/before-after.jpg) · full light run [`light.jpg`](screenshots/v2/light.jpg) · dark run [`dark.jpg`](screenshots/v2/dark.jpg).

## Principles
1. **One obvious next action per screen.** Today has one hero card. Every flow has a single primary button pinned to the bottom.
2. **Calm surface, lively moments.** Warm neutrals at rest. Colour, depth and motion are kept for progress, feedback and celebration.
3. **Software, not pictures.** Pictures come from one 3D illustration family, controls come from one stroke-glyph family, and the interface uses no emoji.
4. **Honest UI.** Sources, caveats, assumptions and privacy notes stay visible, marked with the info glyph (`Note`).

## Colour: light and dark
`colors` is a live palette. The root layout resolves the appearance (Profile → Appearance: System / Light / Dark; default System) and calls `applyScheme()` before anything renders. Every screen subscribes through `useT()`, so a switch repaints the whole app at once. Styles are built per scheme with `themed(() => ({…}))`, which caches one style object per appearance.

| Role | Light | Dark | Use |
|---|---|---|---|
| `bg` / `bgBloom` | `#FFF8EE` / `#FFE4C2` | `#16110D` / `#3A2412` | Ground and the warm bloom at the top of each screen |
| `surface` / `surfaceAlt` / `sunken` | `#FFFFFF` / `#FFF1DC` / `#F7EBD9` | `#231B15` / `#2E231A` / `#1C1510` | Cards · example boxes · segmented-control track |
| `primary` / `primaryDeep` / `primaryEdge` / `primarySoft` | `#FF9E2C` / `#EE7A12` / `#C9640A` / `#FFE9CF` | `#FFA53A` / `#FFB65C` / `#B85C0A` / `#3D2A17` | Button face · accents and labels · 3D button edge · selected tint |
| `onPrimary` | `#3B2409` | `#2A1806` | Text on orange (≈8:1) |
| `text` / `text2` / `text3` | `#201A14` / `#6B6257` / `#9A8F82` | `#F8EFE4` / `#C4B6A5` / `#8F8273` | Body · secondary · hints |
| `success` (+ `Soft`, `Deep`, `Edge`, `on`) | `#58CC02` | `#6BD61A` | Correct, done, evidence |
| `info` (+ …) | `#1CB0F6` | `#3DBDFA` | Selection, sources, links |
| `danger` (+ …) | `#FF4B4B` | `#FF6B6B` | Hearts, wrong, destructive |
| `gold` / `goldEdge` | `#FFC83D` / `#D9A21B` | `#FFC83D` / `#B8860B` | Completed level |
| `night` / `onNight` | `#2B2540` / `#FFFFFF` | `#3A3260` / `#FFFFFF` | Evening card after 18:00 |
| `scrim`, `glass`, `gloss`, `knob` | | | Sheet backdrop · label over art · button highlight · switch thumb |

The dark palette is a warm night, not an inversion: brown-black grounds, so the orange and Rai still glow. The two places where text sits on art that is light in both appearances (the onboarding hero, the level-card label) use the light palette's ink on purpose. `chapterTint[12]` holds one accent per chapter, sampled from its environment art and used as a 4 px strip under chapter and lesson art.

## Type
Baloo 2 (700/800) for display, Nunito (600/700/800) for text. Scale: hero 38/42 · h1 30/35 · h2 22/27 · h3 17/22 · body 16/24 · small 14/20 · label 11.5/16 caps, +1.1 tracking. Each screen has one confident headline.

## Space, shape, depth
8-pt grid (`4 8 16 24 32 48`). Radii 12 · 18 · 28 · 36 · pill. Depth is assigned by role with `elevation(level)`:
- **0, flat:** lists inside cards, tinted info cards (`tone="success" | "info" | "alt" | "night"`).
- **1, actionable:** default cards, rows, stats, the Rai speech bubble.
- **2, floating:** the lesson card, the Today hero, the tab bar, sheets, the completion takeaway.

Cards keep a 1 px `line` border, so they still read in dark mode where shadows nearly vanish.

## Glyphs and illustrations
- **`Icon`**: 40 stroke glyphs on a 24 px grid, stroke 2.1, round caps (navigation, check, close, chevrons, heart, lock, star, send, refresh, repeat, info, sound/mute, moon, bell, download, trash, clock, bolt, shield, sparkle, play/pause, target and more). They replaced every ✓ ✕ ‹ › ★ ♥ ➤ ⓘ and emoji in the interface.
- **`Art`**: 26 glossy clay-style 3D illustrations (orange/peach/cream with a teal accent), one per practice and tool plus rewards (flame, gem, trophy, star, shield, hourglass). They were generated from one style anchor so they read as a single family (see [ASSET_LIBRARY](ASSET_LIBRARY.md)). They are decorative by default: hidden from screen readers unless given a `label`. 256 px WebP, 340 KB for the set.

Practice content still has its emoji `icon` field (the lesson data was not edited). The UI ignores it and maps the practice id to `Art`.

## Components
`Screen` (safe areas, bloom, sticky footer that can take a tint, keyboard avoidance) · `Button` (primary/success/info/danger/ghost, optional leading/trailing glyph, depresses 5 px over a coloured edge, top gloss) · `IconButton` · `Card` (`level`, `tone`, spring press) · `ListRow` (3D tile + title + detail + meta + chevron, optional done badge) · `Tile` · `Chip` · `Segment` (segmented control) · `Toggle` (switch row) · `Check` (animated checkbox) · `Pill` (stat) · `Note` (info line) · `Bar` · `Field` (focus ring) · `Header` · `Label` · `Enter` (fade-rise with `i` stagger) · `Empty` (with art) · `ScoreRing` · `Rai` / `RaiSays` (bubble with a tail) · `ExerciseView` (lettered options that turn into ✓/✕ badges, 3D tiles) · floating pill **tab bar** with an animated selection lozenge.

## Motion
Tokens: press 110 ms · quick 180 · enter 320 · slow 520 · celebrate 1400 · springs soft/snappy/bouncy. In use:
- **Feedback:** wrong answers shake, right answers pop. The answer sheet rises from the bottom tinted green or red, with Rai's reaction.
- **Progress:** bars spring to value, checkboxes pop when ticked, the tab lozenge springs between tabs.
- **Lists:** Today and Mind Studio enter with a 55 ms stagger.
- **Completion** is a staged reveal: a sunburst grows and turns slowly behind Rai, then confetti, the headline pops, the two stats pop in 200 ms apart with an XP count-up, and the takeaway card rises at ~0.9 s. Every fifth level is a milestone, with an orange burst, more confetti and a warmer bloom.
- **Ambient:** the next action pulses, Rai loops, the reward star floats.

When the OS "Reduce Motion" setting is on, every loop, entrance, sunburst and frame animation is replaced by its resting state. All motion uses React Native `Animated` on the native driver (bar width is the one exception). Reanimated is installed but was not adopted: the existing system already meets the budget, and mixing two animation systems adds risk.

## Sound
Fourteen sounds in three tiers (details and sources in [ASSET_LIBRARY](ASSET_LIBRARY.md#sounds-sound-20)):
- **Micro** (tap, select, card, check): synthesised, ≤ 0.36 s, start in < 1 ms (card's swoosh swells in over ~20 ms), quiet (−27 to −23 dBFS RMS).
- **Feedback** (correct, wrong, xp, nudge): 0.45–0.65 s. `wrong` is a soft knock, never a buzzer.
- **Moments** (complete, levelup, unlock, streak, celebrate, bell): 1.3–3 s, the loudest tier.

One sound per beat. On the completion screen the moment plays first (complete, levelup, unlock or celebrate), then `streak` at 1.1 s if this was the day's first completion. Sound is never the only signal and can be turned off in Profile → Sounds.

## Cinematic moments
Three silent 4-second clips play through `Clip` (`expo-video`): the welcome loop behind the onboarding headline, **Chapter N unlocked** at the end of chapters 1–11, and the **program finale** at level 117. They are framed as a 236 pt rounded tile and pop in. They never take sound focus from the user's music, and show a still under Reduce Motion. `milestoneOf(levelId)` in `src/lib/progress.ts` decides which moment a completion earns.

## States
Loading (root spinner until fonts and storage hydrate) · empty (`Empty` with art and a next step) · error (inline message; the coach falls back to local) · success (Rai, XP, staged reveal) · disabled (42 % opacity, announced) · focus (orange input ring).

## Accessibility
Touch targets ≥ 44 pt · roles and labels on every control (`button`, `tab`, `tablist`, `switch`, `radio`, `checkbox`, `progressbar`, `header`) · selected, checked and disabled states announced · the answer sheet is a live region · colour is never the only signal (glyph + text) · body text contrast ≥ 4.5:1 in both appearances · decorative art hidden from screen readers.

## Rai
One character, twelve states (idle, welcome, happy, thinking, focus, celebrate, levelup, encouraging, breathing, comeback, cheer, walk). Warm, capable, slightly playful; never childish or aggressive. Rai appears where there is something to say, not as decoration on every screen.
