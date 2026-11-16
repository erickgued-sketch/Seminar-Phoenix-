# Deployment Guide

Legend: ✅ run and verified in this build · ⚠️ standard procedure, **not executed here** (needs your accounts).

## 1. Run locally ✅

```bash
npm install
npm run web                 # http://localhost:8081
npm run typecheck && npm test
npm run e2e                 # builds dist/ and drives it in Chromium
```

Static web build: `npm run export:web` → `dist/` (any static host; serve `index.html` as SPA fallback).

## 2. Phone (development) ⚠️

```bash
npm run ios      # or: npm run android
```

Expo Go covers every module used except custom notification behaviour on some Android versions; for full fidelity create a development build: `npx eas-cli@latest build --profile development --platform ios|android`.

## 3. Backend (optional) ⚠️

1. Create a Supabase project. Enable the `vector` extension.
2. Apply the schema: `supabase db push` (uses `supabase/migrations/0001_init.sql`). ✅ SQL verified locally with `npm run test:db`.
3. Auth → enable Email OTP.
4. Secrets and functions:
   ```bash
   supabase secrets set ANTHROPIC_API_KEY=sk-ant-…      # server only
   supabase secrets set COACH_MODEL=claude-opus-5-5     # optional
   supabase functions deploy coach generate-level ingest
   ```
5. App config — copy `.env.example` to `.env`:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon key>
   ```
   Only the anon key goes in the app. Never put the service-role or Anthropic key in an `EXPO_PUBLIC_*` variable.
6. Make yourself admin (SQL editor): `update profiles set role = 'admin' where user_id = '<your uid>';`
7. Seed knowledge and source (with `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `ADMIN_JWT` exported):
   ```bash
   npm run content -- seed-kb
   npm run content -- ingest-source /path/to/SEMINARIO_FENIX.pdf   # stays private server-side
   npm run content -- generate next                                # draft + validate one level
   ```
8. Review generated rows in `levels` and set `status = 'published'`.

## 4. Store builds ⚠️

`app.json` already sets name, scheme, icons, splash, `ios.bundleIdentifier` and `android.package` (`ai.nextme.app` — change if you own a different id). `eas.json` has development / preview / production profiles.

```bash
npx eas-cli@latest login
npx eas-cli@latest init
npx eas-cli@latest build --profile production --platform ios       # .ipa
npx eas-cli@latest build --profile production --platform android   # .aab
npx eas-cli@latest submit --profile production --platform ios|android
npx eas-cli@latest update --channel production                     # OTA (after adding expo-updates)
```

### Pre-submission checklist
- [ ] Device QA pass on one small iPhone and one mid-range Android (see "Not verified" in the quality report).
- [ ] Rights to distribute lessons derived from the seminar confirmed.
- [ ] Privacy policy URL and support URL. Data collected: none in device-only mode; email + backup snapshot if the account feature is enabled.
- [ ] App Privacy (Apple) and Data Safety (Google) forms matching the above.
- [ ] Notification permission copy; no other sensitive permissions are requested.
- [ ] Age rating; health disclaimer already in-app (not a medical device, no clinical claims).
- [ ] Store screenshots (start from `docs/screenshots/`), description in ES and EN.
- [ ] Reviewer notes: no account needed; all features reachable offline.
- [ ] Decide monetisation before adding RevenueCat (plans table is ready; no paywall is built).
