# Higgsfield Asset Library

All art was generated in this build session through the Higgsfield connector, verified (job reached `completed`, file downloaded and visually reviewed), optimised and bundled in the app.

- **Model:** `gpt_image_2_6` (GPT Image 2.6) — chosen for reference-image consistency and native transparent backgrounds.
- **Cost:** 0.25 credits per image or animation × 41 generations = **10.25 credits** (balance 56.5 → 46.25).
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
| APP-01 | (replaced) | `a6999e06-86fd-46d5-958c-95a61a46c69e` | First icon: Rai's face on an orange gradient | Superseded by APP-02 |

### App icon and logo (second pass)

| Asset ID | File | Job ID | Description | Used in |
|---|---|---|---|---|
| APP-02 | `assets/icon.png`, `assets/brand/ios-icon-1024.png` | `0f610957-1f91-410e-90ab-3ab68e18ef66` | Rai's head, front view, sunrise glow on an orange gradient. 1024×1024, opaque, square (iOS applies its own mask) | iOS icon, default icon; derived: `favicon.png`, `brand/android-play-store-512.png` |
| APP-03 | `assets/android-icon-foreground.png` | `7860546e-c319-4b2c-98f2-dca763deafd8` | Rai's head on transparency, rescaled so all artwork sits inside Android's 66/108 safe circle | Android adaptive icon foreground; derived: `android-icon-monochrome.png` (themed icons), `splash-icon.png` |
| APP-04 | `assets/android-icon-background.png` | — (drawn in code) | Orange gradient with a soft glow | Android adaptive icon background |
| APP-05 | `assets/brand/icon-alt-1024.png` | `9c78f7de-1029-498d-9020-e4ffe6c6c6c5` | Alternate: Rai in three-quarter view looking up, rising sun | Not wired in; candidate for store art or an alternate icon |
| APP-06 | `assets/brand/logo-lockup.png` | `814b0fee-0815-4bdb-b5bd-8f7b28ccd3cf` | Icon + "NEXTME AI" wordmark + tagline on cream | Store listing, splash, documents |

`assets/brand/icon-preview.jpg` shows the icon under the iOS mask and the Android circle, squircle and themed treatments, down to 29 px.

### 3D icon set (Design 2.0)

26 illustrations that replace emoji in the interface (practices, tools, rewards, empty states). Model `gpt_image_2_6`, 1:1, 1K, `background: transparent`. Every icon after the first passed the anchor (ICO-01) as `image_references`, so they share one material, light and palette. Prompt template:

> Same icon family and exact rendering style as the reference image (soft glossy clay-like 3D, rounded friendly shapes, warm orange, peach and cream palette with a small teal accent, gentle top-left studio light). A single object: **&lt;object&gt;**. Centered, filling about 80% of the canvas. Transparent background, no ground shadow, no text, no frame, no extra objects.

Each one was checked on cream and on the dark ground before use. `scripts/make-icons.py` trims and centres the renders and writes them as 256 px WebP (340 KB in total). **Cost: 26 × 0.25 = 6.5 credits** (balance 46.25 → 39.75).

| Asset ID | File | Job ID | Object |
|---|---|---|---|
| ICO-01 | `assets/icons/meditation.webp` | `b2714d9f-2419-47ff-a12b-c9be4cfc73be` | Lotus with teal leaves; **style anchor** for the whole set |
| ICO-02 | `assets/icons/gratitude.webp` | `23c64397-f218-49e7-8084-055af07c2c0a` | Plump heart with a golden sparkle |
| ICO-03 | `assets/icons/breathing.webp` | `8dbf07a1-ea0c-49b5-b7d8-a188e37d5dc4` | Breeze swirl in cream and teal |
| ICO-04 | `assets/icons/silence.webp` | `3c087204-b8e4-48c9-974a-9a0e019dc0ac` | Stacked zen stones with a leaf |
| ICO-05 | `assets/icons/affirmations.webp` | `5015cbdb-7278-49cf-8ebb-eff3b3135894` | Speech bubble with a sparkle star |
| ICO-06 | `assets/icons/visualization.webp` | `54b58483-be25-43d4-96aa-8c9dbc40e6c1` | Eye with a star highlight |
| ICO-07 | `assets/icons/worry.webp` | `73b72b35-c859-4fb0-b101-ea3e1d572fc5` | Cloud with the sun rising behind it |
| ICO-08 | `assets/icons/beliefs.webp` | `135a80e5-61f0-4ea3-9b73-b4f9c57eb6cb` | Magnifying glass |
| ICO-09 | `assets/icons/seven.webp` | `3b58a796-7bad-4b8e-977a-ee20384ba70d` | Puffy question mark |
| ICO-10 | `assets/icons/mindstorm.webp` | `eadcc4ef-eb2f-4c4c-9987-5ea15f30e82b` | Glowing light bulb |
| ICO-11 | `assets/icons/forgive.webp` | `a33bb071-8dcb-472f-9b25-18828f2843d1` | Dove with a leaf twig |
| ICO-12 | `assets/icons/responsible.webp` | `3fdc0ee5-f7c8-4738-998d-54286f452d27` | Pocket compass |
| ICO-13 | `assets/icons/written-goals.webp` | `c1e375e8-cf4c-48ba-84d6-1fdd0b274461` | Notebook with a pencil |
| ICO-14 | `assets/icons/mental-diet.webp` | `3e835e7b-d9cc-4e13-93d4-8589e9920b28` | Bowl with an orange and leaves |
| ICO-15 | `assets/icons/goal.webp` | `456cedc3-ab96-418f-87be-4dbc708d073e` | Target with an arrow in the bullseye |
| ICO-16 | `assets/icons/habits.webp` | `78438291-6d65-4e22-870e-3dd794da83b3` | Sprout in a pot |
| ICO-17 | `assets/icons/review.webp` | `2b849a7c-1342-49bf-a2a2-390ffbf6b712` | Rising bar chart with an arrow |
| ICO-18 | `assets/icons/future.webp` | `67bc7087-e73a-401f-b7b3-8fe141553670` | Telescope with a star |
| ICO-19 | `assets/icons/vault.webp` | `12c5523b-5cc1-45c4-adfd-a25254409a1d` | Stack of three books |
| ICO-20 | `assets/icons/evening.webp` | `e3067ebf-8b29-48c6-82cf-5db366b947b5` | Crescent moon with stars |
| ICO-21 | `assets/icons/flame.webp` | `7c69dd3b-121c-411a-bdf2-fe08bd362531` | Layered flame (streak) |
| ICO-22 | `assets/icons/gem.webp` | `133e789f-8d2b-4514-96cd-c39a491da379` | Teal gem (XP) |
| ICO-23 | `assets/icons/trophy.webp` | `96745f98-0895-4406-81cb-d4df0ef3309f` | Golden trophy (levels, all done) |
| ICO-24 | `assets/icons/star.webp` | `1a8ddc1e-7afb-4198-89ee-4a8e760a6f4e` | Puffy gold star (takeaway) |
| ICO-25 | `assets/icons/shield.webp` | `11ab1a94-c8ae-4bd1-b78b-676e3fe5661d` | Teal shield with a check (evidence, account) |
| ICO-26 | `assets/icons/focus.webp` | `d76605c4-c70a-472e-aa30-47b5a5cd4060` | Hourglass (correct answers stat) |

## Not generated yet (prompts ready)

| Asset | Why not yet | Direction to use |
|---|---|---|
| Cinematic video clips (welcome, chapter unlock, program complete) | Rai's looping animations cover the in-app motion; full-screen video would add weight and a player dependency. | Image-to-video from ONB-01 / RAI-06 / RAI-07, 3–4 s, slow push-in, loopable, 720p, no text. |
| Onboarding concepts 2–5 (decisions, growth, habits, action) | Onboarding uses Rai's states instead; one hero was enough for a < 2 min flow. | Same 3:4 style as ONB-01 with the master reference. |
| Store screenshots frames, launch cover, social creatives | Depend on final store copy and device frames. | Compose real app screenshots (`docs/screenshots/`) over CH-08 / ONB-01. |
| Splash at full resolution | `splash-icon.png` is a 400 px derivative of RAI-02. | Regenerate RAI-02 at 2k if a larger splash is wanted. |

## Sounds (not Higgsfield)

The 11 interface sounds in `assets/sounds/` are synthesised by `scripts/make-sounds.py` (original tones, no samples; 136 KB total): tap, select, card, correct, wrong, check, xp, complete, levelup, bell, nudge. They share one pentatonic scale so they sound like a family, the "wrong" tone is deliberately soft, and they can be turned off in Profile → Sounds.
