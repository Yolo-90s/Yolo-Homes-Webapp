# Yolo-Home's — Web

The web version of the Yolo-Home's apartment app, sharing the **same Firebase project
(`yolohome-c2ce4`) and data** as the Android app. Built with React 19 + React Router + Tailwind
+ the Firebase Web SDK.

## Run

```bash
npm install      # if needed
npm start        # dev server at http://localhost:3000
npm run build    # production build -> ./build
```

Sign in with Google (popup). `localhost` is an authorized domain by default; to deploy elsewhere,
add the domain under Firebase Console -> Authentication -> Settings -> Authorized domains.

## What's inside (mirrors the Android app)

- **Boot animation** - the same AI "decryption" splash (`YOLO HOMES` scrambles into place on black).
- **Auth** - Google sign-in; role + own-flat resolved by matching your email against `masterFlats`,
  mirrored to `users/{uid}.role` so Firestore rules enforce writes.
- **Home** - two tabs, **Maintenance** and **Water**, each showing only its content. The + add
  button shows only for Admin/Developer.
- **Maintenance** - month summary, trend chart, receipts list, add, history, receipt (print -> PDF).
- **Water** - consumption/revenue stats, trend, top consumers, add reading with **live 200 L
  baseline calc**, history, **flat-wise consumption with month filter**, bill (print -> PDF).
- **Reports** - 12-month charts + totals (print -> PDF).
- **Settings** - water rate / exclude-limit etc. (admin-editable).
- **Manage Residents** - admin screen to link each flat's email + role (writes `masterFlats`).
- **Roles** - Developer / Admin (full) · Owner / Tenant (read-only, scoped to their own flat).

## Shared backend notes

- Tolerant Firestore mappers (`src/lib/firestore.js`) handle the live DB's loose types
  (Long/Timestamp/String dates, numeric phones, etc.) - same approach as Android.
- `maintenanceReceipts.flatId` / `readings.flatId` reference the operational **`flats`** collection
  (auto-ids), resolved via `flatLookup`.

## Activating admin (one-time)

Same as Android: add an `email` field (your Google sign-in email) to your flat in `masterFlats`
(doc `502` = Developer) via the Firebase console once. After that, use **Settings -> Manage
Residents** in either app to link everyone else.
