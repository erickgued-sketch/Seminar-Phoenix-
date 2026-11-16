# Higgsfield Asset Library

All art was generated in this build session through the Higgsfield connector, verified (job reached `completed`, file downloaded and visually reviewed), optimised and bundled in the app.

- **Model:** `gpt_image_2_6` (GPT Image 2.6) — chosen for reference-image consistency and native transparent backgrounds.
- **Cost:** 0.25 credits per image or animation × 37 generations = **9.25 credits** (balance 56.5 → 47.25).
- **Consistency:** every Rai image uses the master (`92763f5f…`) as `image_references`.
- **Optimisation:** originals 1024 px PNG (~1.5 MB each) → WebP. Rai 512 px with alpha (~60 KB), chapters 960×537 (~60 KB), hero 880×1168 (~100 KB). Total bundled art ≈ 1.5 MB.

## Rai — mascot

Shared prompt prefix: *"Same tiger character Rai exactly as in the reference image (same proportions, fur colors, stripes, face, 3D cinematic style). State: … Transparent background, no shadow, no text."*

| Asset ID | File | Job ID | State direction | Used in |
|---|---|---|---|---|
| RAI-00 | `assets/rai/master.webp` | `92763f5f-17c4-4701-b6c5-815b1247b74f` | Master reference: full body, hands on hips, cream background | Reference only |
| RAI-01 | `assets/rai/idle.webp` | `8b74c770-4546-4877-a8d7-9379c7655b43` | Standing relaxed | Journey (current level), Profile |
| RAI-02 | `assets/rai/welcome.webp` | `14fb876c-641f-4827-a987-c59877232638` | Waving | Onboarding, splash icon |
| RAI-03 | `assets/rai/happy.webp` | `4221748b-8dc6-448b-82cd-6b0b15c18904` | Joyful, eyes closed | Practice saved, review done, evening |
| RAI-04 | `assets/rai/thinking.webp` | `9770a2d2-6ae6-4209-9465-fd1ad3bc7bec` | Paw on chin | Reflect step, Coach empty state, Goal Architect |
| RAI-05 | `assets/rai/focus.webp` | `f63b607e-a764-4134-927c-4b8dffcaa405` | Arms crossed, determined | Focus timer, weekly priority, building program |
| RAI-06 | `assets/rai/celebrate.webp` | `5510614a-eada-4086-8bd2-bab92e56b872` | Jumping, arms up | Level complete |
| RAI-07 | `assets/rai/levelup.webp` | `43098005-afbe-47ef-932a-4fc0cfb38260` | Holding a gold star | Every 5th level, program complete |
| RAI-08 | `assets/rai/encouraging.webp` | `9b5305f7-9f1c-4490-a025-f1c5fc36d5be` | Thumbs up | "Remember this", onboarding, account |
| RAI-09 | `assets/rai/breathing.webp` | `cb9fa5ba-2f73-41aa-b592-e3a94d6f09ab` | Meditating | Mind Studio, timers, out-of-hearts screen |
| RAI-10 | `assets/rai/comeback.webp` | `a63d2fd1-6b46-49f9-be02-80d5649d4903` | Arms open | Return after 3+ days away |

Master prompt: premium 3D cinematic tiger, stylised but not babyish, orange gradient fur (#FFC97A→#FF9E2C→#EE7A12), brown stripes (#5B3A28), white muzzle, pink nose (#E5566F), amber eyes; intelligent, kind, determined, slightly playful; no clothing, text or logo; flat cream background.

### Rai — looping animations

Generated as native animated GIFs (12 frames, 384×384, transparent) with the master as reference, then converted to animated WebP (~110 KB each, 1.1 MB total). Shown with `expo-image`; the still image of the same state is used when the OS "Reduce Motion" setting is on.

| Asset ID | File | Job ID | Motion | Used in |
|---|---|---|---|---|
| ANI-01 | `assets/rai/anim/idle.webp` | `0f72052f-c993-405d-9d79-4436ca58948b` | Breathing, blink, tail sway | Profile, default state |
| ANI-02 | `assets/rai/anim/wave.webp` | `80dab929-5449-4709-89f4-92009d442673` | Waving hello | Onboarding |
| ANI-03 | `assets/rai/anim/celebrate.webp` | `b96f9443-aff2-467a-9ae5-51cc9bb547c6` | Crouch and victory jump | Level complete |
| ANI-04 | `assets/rai/anim/walk.webp` | `31a242e7-0374-45e6-ad7d-3ce139601d00` | Marching forward | Journey (current level), building the program |
| ANI-05 | `assets/rai/anim/clap.webp` | `5007e6bf-bdbe-4911-a034-69aad5a65470` | Clapping | Correct answer, practice saved |
| ANI-06 | `assets/rai/anim/thinking.webp` | `8dbc323a-66f4-49d2-9a14-948af3a7f98e` | Tapping chin | Reflect step, coach, evidence nudge |
| ANI-07 | `assets/rai/anim/breathing.webp` | `35410085-fbb6-4c0b-983c-6c0b4de89cc1` | Meditating, slow breath | Mind Studio, timers |
| ANI-08 | `assets/rai/anim/levelup.webp` | `f5247c51-c1d3-4527-ab3f-94706846742d` | Raising a gold star | Every 5th level |
| ANI-09 | `assets/rai/anim/cheer.webp` | `fb1db47c-81f1-4a0e-9c82-fd39db11d503` | Beckoning "come on" | Today's nudge when the level is not done |
| RAI-11 | `assets/rai/point.webp` | `9d924009-fbae-466a-8a8c-0532a8c680e8` | Still: pointing ahead | Reduce-motion fallback for ANI-09 |

Generated but not used: a blink frame (`e8464055…`) and a still clapping pose (`432ec0ee…`), superseded by the animations.

States without a frame animation (focus, encouraging, comeback) use their still with a soft code-driven bob (`src/components/Rai.tsx`). No Rive/3D rig exists — a static image cannot be turned into one automatically.

## Chapter environments (16:9)

Shared prefix: *"Stylized 3D cinematic landscape illustration, soft warm palette of cream, peach, apricot orange and sky blue, gentle volumetric light, minimal, calm, premium, no people, no animals, no text."*

| Asset ID | File | Job ID | Metaphor | Chapter |
|---|---|---|---|---|
| CH-01 | `chapters/c01.webp` | `11e99b8b-cc4f-441f-ba39-9f208eb6f25d` | Seven glowing stepping stones on a lake | 1 Seven ingredients |
| CH-02 | `chapters/c02.webp` | `014fae58-796b-4ea5-b5e9-2927220f8663` | Bright path over rolling hills | 2 Mental laws |
| CH-03 | `chapters/c03.webp` | `f8a2f278-5df9-4258-aed6-81384006c35c` | Peak mirrored in a still lake | 3 Self-concept |
| CH-04 | `chapters/c04.webp` | `caa7da19-728a-4000-bb41-33b079341167` | Lighthouse, storm clearing | 4 Responsibility & emotions |
| CH-05 | `chapters/c05.webp` | `c914e4c5-531e-474d-b2a9-8de953664b4a` | Bridge over a misty canyon | 5 Worry, change, habits |
| CH-06 | `chapters/c06.webp` | `1df420ed-7945-49cc-9bb3-95f1739d3654` | Terraced garden with sprouts | 6 Programming the mind |
| CH-07 | `chapters/c07.webp` | `009aaead-5ad1-44e4-bce8-fe1263fd1cb6` | Reading bench under a tree | 7 Learning & relaxing |
| CH-08 | `chapters/c08.webp` | `5c32114d-f2ea-4b68-b62f-d88f442f64e8` | Trail to a summit flag | 8 Goals |
| CH-09 | `chapters/c09.webp` | `e2fbbdf1-a071-406c-ab30-bd24e656f10e` | Lantern-lit stairway | 9 Time & execution |
| CH-10 | `chapters/c10.webp` | `43e31b7a-79e8-44fe-a2b9-f24617075812` | Starlit lake at dawn | 10 Creativity & intuition |
| CH-11 | `chapters/c11.webp` | `459e7e15-8b0b-41fc-aea8-7f2362ecf30c` | Meadow trail and stream | 11 Health, energy, stress |
| CH-12 | `chapters/c12.webp` | `b9c1229d-6d7e-457e-9f90-2693b8fa9ce2` | Hilltop home, open horizon | 12 Relationships & purpose |

Used on the Journey chapter headers and the first card of each level.

## Onboarding and store

| Asset ID | File | Job ID | Description | Used in |
|---|---|---|---|---|
| ONB-01 | `assets/onboarding/hero.webp` | `222aa30d-077b-45b2-9529-9bdc5a9a0611` | Rai on a hilltop facing a sunrise and a winding path (3:4) | Onboarding splash |
| APP-01 | `assets/icon.png` | `a6999e06-86fd-46d5-958c-95a61a46c69e` | Rai's face on an orange gradient | App icon; derived: `favicon.png`, `android-icon-foreground.png` |

## Not generated yet (prompts ready)

| Asset | Why not yet | Direction to use |
|---|---|---|
| Cinematic video clips (welcome, chapter unlock, program complete) | Rai's looping animations cover the in-app motion; full-screen video would add weight and a player dependency. | Image-to-video from ONB-01 / RAI-06 / RAI-07, 3–4 s, slow push-in, loopable, 720p, no text. |
| Onboarding concepts 2–5 (decisions, growth, habits, action) | Onboarding uses Rai's states instead; one hero was enough for a < 2 min flow. | Same 3:4 style as ONB-01 with the master reference. |
| Store screenshots frames, launch cover, social creatives | Depend on final store copy and device frames. | Compose real app screenshots (`docs/screenshots/`) over CH-08 / ONB-01. |
| Splash at full resolution | `splash-icon.png` is a 400 px derivative of RAI-02. | Regenerate RAI-02 at 2k if a larger splash is wanted. |

## Sounds (not Higgsfield)

The 11 interface sounds in `assets/sounds/` are synthesised by `scripts/make-sounds.py` (original tones, no samples; 136 KB total): tap, select, card, correct, wrong, check, xp, complete, levelup, bell, nudge. They share one pentatonic scale so they sound like a family, the "wrong" tone is deliberately soft, and they can be turned off in Profile → Sounds.
