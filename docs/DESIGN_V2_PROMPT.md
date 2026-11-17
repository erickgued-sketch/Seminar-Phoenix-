# NEXTME AI — Design 2.0 Master Prompt

**Claude Code × Higgsfield · make the product look and feel twice as good**

Paste everything below the line into a Claude Code session opened on this repository
(`erickgued-sketch/Seminar-Phoenix-`, branch `claude/epic-albattani-yiq6gh`) with the Higgsfield
connector attached.

---

## 0. Your mission

You are the design lead, motion director and senior React Native engineer of **NEXTME AI**.
The app already works end to end. Your only job in this pass is **design quality**: make every
screen, every transition and every moment with Rai feel like a product from a top studio.

The target is a 200% improvement in perceived quality: a person who opens the current build and
then the new one should say "this is a different league" within ten seconds, before reading a
word.

Reference bar, by quality not by imitation:

- **Apple** — typography, spacing, restraint, depth, haptics.
- **Duolingo** — a character that reacts to everything you do; momentum.
- **Headspace** — calm colour, soft illustration, breathing room.
- **Apple Fitness** — progress you understand at a glance.

Do not copy any of them. Do not redesign the product, rename things or touch lesson content.
You are raising craft, not changing scope.

Do not answer with a plan or a moodboard. Ship it in this repository, verified.

## 1. What exists today (read before changing anything)

| Area | Where | State |
|---|---|---|
| Design tokens | `src/theme/tokens.ts` | Cream `#FFF8EE`, orange `#FF9E2C`/`#EE7A12`, dark-brown text on orange, Baloo 2 + Nunito, 8-pt grid |
| UI primitives | `src/components/ui.tsx` | `Screen`, `Button` (3D press), `Card`, `Chip`, `Bar`, `Field`, `Header`, `Enter` |
| Motion | `src/components/fx.tsx` | `Confetti`, `Feedback` (shake/pop), `CountUp`, `Slide`, `Pulse` — all built on RN `Animated` |
| Rai | `src/components/Rai.tsx`, `assets/rai/` | 12 stills + 9 looping animations (12 frames, 384 px, animated WebP via `expo-image`) |
| Sound | `src/lib/sound.ts`, `assets/sounds/` | 11 synthesised tones through `expo-audio`; toggle in Profile |
| Art | `assets/chapters/`, `assets/onboarding/`, `assets/brand/` | 12 chapter environments, 1 hero, icon set, logo lockup |
| Screens | `src/app/` | onboarding, today, journey, level player, coach, mind + 14 practices, goal, habits, evening, review, future, vault, focus, profile |
| Content | `src/content/` | 117 authored levels in 12 chapters, ES + EN — **do not edit** |
| Docs | `docs/DESIGN_SYSTEM.md`, `docs/ASSET_LIBRARY.md`, `docs/QUALITY_REPORT.md` | Current rules, every asset with its Higgsfield job id, known limits |

Start by reading those three docs and `AGENTS.md`, then run the app and **capture every screen**
(`npm run e2e` writes screenshots to `.e2e-shots/`). Look at them. Write down, per screen, the
three weakest things you see. That list is your backlog — fix what you actually observe, not
what this prompt guesses.

### Known weaknesses to verify and fix

- Emoji stand in for icons in Mind Studio, Profile links and several cards. They look cheap and
  render differently on every platform.
- Rai's animations are small (384 px), short (12 frames) and have hard 1-bit transparency edges
  because they came from GIF.
- Cards are nearly identical everywhere: same radius, same shadow, same white. No depth
  hierarchy; nothing tells the eye what matters most.
- The Journey map is flat circles on cream. The chapter art sits in a box above the path instead
  of being the world the path runs through.
- Today is a long stack of similar cards. The single most important action does not dominate.
- Screen changes are a default slide; nothing carries over between screens.
- The tab bar, headers and inputs are functional defaults with no character.
- There is no dark appearance.
- Sounds are synthetic sine tones: consistent, but thin.
- Loading, empty and error states are plain text.

## 2. Rules you may not break

1. **Nothing regresses.** `npm run typecheck`, `npx expo lint`, `npm test` (158 tests) and
   `npm run e2e` (19 steps, 0 console errors) pass before and after. Keep every `testID`.
2. **Software, not pictures.** Higgsfield makes art, animation, sound and video. You build the
   interface, layout, states and behaviour in code. Never replace a screen with an image of one.
3. **Accessibility is part of the design.** Text contrast ≥ 4.5:1 (white on brand orange fails —
   keep dark text on orange). Touch targets ≥ 44 pt. Every control keeps its role, label and
   state. Colour is never the only signal.
4. **Reduce Motion is honoured everywhere.** Every loop, entrance, parallax and frame animation
   has a still resting state (`useReduceMotion` in `ui.tsx`).
5. **Performance budget.** Animations run on the native driver or Reanimated worklets; no layout
   thrash; target 60 fps on a mid-range Android. Bundled art + animation + sound ≤ 12 MB.
   The core loop must work offline with no video download.
6. **One character, one world.** Every Rai asset uses the master reference (job
   `92763f5f-17c4-4701-b6c5-815b1247b74f`). Every environment keeps the same light, palette and
   rendering style as `assets/chapters/`.
7. **Spanish first, English complete.** Any new string goes through `useT()` in both languages.
8. **Honesty.** No fake statistics, testimonials, ratings or "as seen in". Assets you did not
   generate and verify do not go in the asset library.

## 3. Higgsfield: use the whole toolbox, with a budget

Discover first, then generate. Call `models_explore` (types image, video, audio, 3d) and
`get_presets`; do not assume a model, parameter or preset exists because this prompt names it.
Names below were verified on this account on 2026-11-17 and may change.

| Need | Higgsfield resource | Use it for |
|---|---|---|
| Stills, icons, illustration | `generate_image` · `gpt_image_2_6` (references, transparent background, native **SVG** and **GIF**) | Icon set as SVG, spot illustrations, badges, share-card backdrops, state art |
| Character consistency | reference images on every call; `manage_reference_elements` to save Rai as a reusable element; the `character-sheet` workflow (`get_workflow_instructions`) for a turnaround sheet | One Rai everywhere |
| Character motion | `generate_video` from a start image — Kling 4.0, Seedance 2.5, MiniMax H3, Cinema Studio 4.0, FLUX 3 Video — plus start/end-frame models for clean loops | Rai v2 loops and reactions |
| Clean transparency | `video_background_remover`, `remove_background` | Soft 8-bit alpha on animations instead of GIF edges |
| Sharpness | `upscale_image`, `upscale_video`, `video_deflicker` | 2×/3× assets for high-density screens |
| Composition | `outpaint_image`, `reframe` | Tall parallax layers and alternate aspect ratios from existing art |
| Motion presets | `get_presets` (motion, viral, genjutsu) — browse only; `execute_preset` needs a costed decision | Camera moves for cinematic moments |
| 3D | `generate_3d`, `scene_builder_3d_*` | A Rai model for turntable renders and consistent new poses |
| Sound effects | `generate_audio` — text-to-audio SFX models | A real, warm UI sound set |
| Music | `generate_audio` — ElevenLabs Music | Short stings (level complete, chapter unlock) and a calm loop for Mind Studio |
| Voice | `list_voices`, `create_voice`, TTS models (Eleven v4, Text to Speech V2) | Rai's voice in ES and EN for onboarding and guided practices |
| Lip-sync | Sync Lipsync | Rai speaking in the welcome moment, only if it looks right |
| Store and launch | `marketing_studio_image`, `show_marketing_studio_v2`, Cinema Studio video | Store screenshots, feature graphic, 15–30 s app preview |
| Organisation | `create_project`, `create_folder` | One project, folders per asset family |

### Budget and approval

- Check `balance` first. As of this prompt: **46.25 credits**. A standard 1K image costs 0.25;
  high-quality 2K costs 2.75; video costs much more.
- **Preflight every new model and setting with `get_cost: true`.** Write the estimate down before
  spending.
- Free to spend without asking: up to **12 credits** on images, SVG, GIF and sound.
- **Ask before** any video batch, 3D job, voice clone, preset execution or anything that would
  take the running total past 12 credits. Present: what, how many, cost, what it unlocks.
- Submissions are rate-limited to about four at a time: batch in fours, `jobs_wait`, then the
  next four.
- Downloads come from `d8j0ntlcm91z4.cloudfront.net`, already allowed in the `seminar-phoenix`
  cloud environment.
- After each generation: confirm it completed, download it, **look at it**, reject and redo
  anything off-model, then record id, prompt, cost and where it is used in
  `docs/ASSET_LIBRARY.md`.

## 4. The work

### 4.1 Design system 2.0 (`src/theme/`, `src/components/`)

- **Depth.** Define three elevation levels with distinct shadow, border and background, and use
  them by role: resting surface, raised action, floating overlay. Most content should sit flat on
  the page; cards are for things you can act on.
- **Type.** Tighten the scale. Larger, more confident display sizes for the one headline per
  screen; quieter secondary text. Optical adjustments: tracking on caps labels, tabular numerals
  for scores, timers and counts. Re-evaluate the font pairing and keep it only if it wins a
  side-by-side comparison you actually render.
- **Colour.** Keep the brand orange and cream. Add a deliberate neutral ramp (warm greys), tinted
  surface variants per chapter derived from each chapter's art, and semantic colours kept apart
  from the accent. Build a **dark appearance** with the same care: not an inversion — a warm
  night palette where Rai and the orange still glow. Follow the system setting, with an override
  in Profile.
- **Icons.** Replace every emoji with one custom icon family (generate as SVG for a consistent
  stroke and corner radius, clean the paths, ship through `react-native-svg`): tabs, the 14
  practices, tools, exercise types, states.
- **Components.** Redesign `Button`, `Card`, `Chip`, `Field`, `Header`, tab bar, progress bar,
  score ring, checklist row, chat bubble, sheet/modal, toast. Each one gets default, pressed,
  focused, disabled, loading and success states.
- **States.** Skeleton loaders shaped like the content, illustrated empty states with Rai and a
  next step, inline errors that say what to do.

### 4.2 Rai 2.0

- **Quality.** Regenerate the animation set at higher resolution with more frames and soft
  transparency. Evaluate two pipelines and keep the better one:
  (a) larger native GIF with more frames; (b) image-to-video from the still on a flat
  background → background removal → frames → animated WebP with real alpha.
  Loops must be seamless: first and last frame match, character centred, constant size.
- **Range.** Add the missing states: listening (coach), reading (level cards), pointing at the
  next action, sleepy (evening), proud nod, gentle "almost" for a wrong answer, streak fire,
  waving goodbye, peeking in from the screen edge.
- **Reactions.** Rai responds to what the user does in the moment: looks toward the tapped
  option, reacts within 150 ms of an answer, celebrates with a different animation at
  milestones (5, 10, 25, 50, 117 levels and 7/30-day streaks), notices a return after absence.
- **Transitions between states.** No hard cuts: cross-fade or a shared neutral frame.
- **Evolution.** A visible progression across the twelve chapters (an accessory, a scarf, a
  medal — subtle, never childish), so the character reflects the user's own progress.
- **Voice (optional, costed).** A warm voice for Rai in Spanish and English for the welcome line
  and the guided practices, off by default if it is not clearly good.

### 4.3 Motion system (`src/components/fx.tsx` → a real motion layer)

Move to `react-native-reanimated` and `react-native-gesture-handler` (versions from
`node_modules/expo/bundledNativeModules.json`). Define motion tokens — durations, spring
presets, easing — and use only those.

- **Navigation.** Shared-element transitions: the level node grows into the level screen; the
  goal card expands into the Goal Architect; chapter art carries from the map into the first
  card.
- **Level player.** Cards follow the finger with rotation and a peek of the next card; a real
  physical stack. Options stagger in. The correct option fills with a wipe and a checkmark that
  draws itself; a wrong one settles back with a soft shake. The progress bar gains a moving
  highlight and a small burst when a segment completes. Hearts break and refill with weight.
- **Completion.** A choreographed sequence instead of one screen: star flies to the counter, XP
  counts up, streak flame grows, next node unlocks on the map behind a blur, then the call to
  action. Under two seconds, skippable with a tap.
- **Journey.** A scrolling world: chapter environments as parallax layers behind the path, the
  path itself drawn as a curve that fills as you progress, Rai walking along it to the current
  level when the screen opens, locked chapters in soft mist.
- **Today.** One hero action with real presence; secondary items collapse into a compact
  checklist that expands. Pull to refresh with Rai. Checking an item is a satisfying, physical
  moment.
- **Micro-interactions.** Every tappable thing responds in under 100 ms with scale, colour and a
  matching haptic pattern. Numbers roll. Toggles have weight. Lists reorder with layout
  animation. Keyboard and sheets move with springs, never jump.
- **Mind Studio.** The breathing practice becomes a full-screen experience: an expanding and
  contracting shape, Rai breathing in sync, colour that shifts with the phase, optional ambient
  sound.

### 4.4 Screen-by-screen redesign

Redesign each screen in `src/app/` against the backlog you wrote in section 1, in this order:
level player → completion → journey → today → onboarding → coach → mind studio and practices →
goal architect → habits → review → profile → the rest. For every screen: a clear single focus,
purposeful use of Rai, the new components, light and dark, small phone (320 pt wide) and large.

Coach specifically: message bubbles with proper grouping and timestamps, a typing indicator
with Rai listening, answers that reveal section by section, source chips that open the related
level, a composer that grows with the text and stays above the keyboard, a scroll-to-latest
button when the user has scrolled up.

### 4.5 Sound 2.0

Replace the synthetic tones with a designed set of the same eleven events plus the new ones
(card flick, unlock, streak, star, sheet open/close, Rai reactions). Soft, warm, short, one
musical family, mastered to the same loudness, never harsh on a wrong answer. Add two or three
musical stings and one calm loop. Keep the toggle, respect the device's silent switch, never
play before the first interaction.

### 4.6 Cinematic moments (ask first — this is the expensive part)

Short, optional, downloadable-on-Wi-Fi clips: welcome, chapter unlock (one per chapter, built
from that chapter's environment), programme complete. 3–5 seconds, loopable where it makes
sense, a still frame as fallback. Propose the list with costs before generating.

### 4.7 Brand and store

The icon set, adaptive Android layers and logo lockup are in `assets/brand/`
(preview: `assets/brand/icon-preview.jpg`). Build on them: an animated splash that hands off to
the first screen, store screenshots composed from real app captures in the new design, a
feature graphic, and a 15–30 s preview video. Never mock up screens that do not exist.

## 5. How to work

1. **Audit** — capture, critique, backlog. Share the before sheet.
2. **System** — tokens, components, icons, dark appearance. Rebuild two screens with it and show
   before/after side by side. Stop and ask for a reaction here; this sets the direction for
   everything else.
3. **Rai and motion** — new animation pipeline, motion layer, level player and completion.
4. **Screens** — the rest, in the order above.
5. **Sound, then cinematic and store** — with cost approval.
6. **Verify and document.**

Commit after each numbered step. Look at your own screenshots after every screen; if it does not
look clearly better than the before, it is not done.

## 6. Definition of done

- Before/after sheets for every screen, light and dark, in `docs/screenshots/`.
- All four checks green; e2e extended to cover dark appearance, the completion sequence and
  Reduce Motion (animations replaced by stills).
- No emoji used as interface icons. No hard-coded colours outside the tokens.
- Every animation has a Reduce Motion path and runs without dropped frames in the web build's
  performance trace; note honestly that device profiling still needs a real phone.
- Bundle within budget, sizes reported.
- `docs/DESIGN_SYSTEM.md`, `docs/ASSET_LIBRARY.md` (every asset: id, prompt, model, cost, where
  used) and `docs/QUALITY_REPORT.md` updated, including what you could not verify.
- The web build republished to the existing preview link.
- A short closing note: what changed, what it cost in credits, what is still weak, and what you
  would do next.

Make it beautiful. Make it feel alive. Keep it honest and fast.
