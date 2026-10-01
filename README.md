# StudySync AI

A student workspace for tasks, study planning, notes, flashcards, quizzes, focus sessions and progress analytics.

## Architecture

- React 19, Vite and Tailwind CSS: responsive interface with dark, light and system themes.
- Firebase Authentication: email/password sessions.
- Cloud Firestore Standard: private documents under `users/{uid}`. The collections are `tasks`, `notes`, `planner`, `sessions`, `pomodoroSettings` and `aiUsage`.
- Vercel `/api/ai`: verifies Firebase ID tokens, reserves a durable per-user quota, calls Gemini and validates the response. The Gemini key stays on the server.
- Gemini: generates a summary, three multiple-choice questions and five flashcards from each note; explains concepts and builds task-based study plans.

AI errors are shown honestly. There are no fabricated fallback quiz answers. AI output can be inaccurate; check study materials against your course sources.

## Run locally

Use Node.js 22 or newer.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Fill the public `VITE_FIREBASE_*` values from your Firebase web-app configuration. Add `GEMINI_API_KEY` only to `.env.local`, plus the matching `FIREBASE_PROJECT_ID`. The Vite development server includes the same `/api/ai` handler. Never prefix the Gemini key with `VITE_`, commit real keys, or put credentials in a client bundle.

`GEMINI_MODEL` defaults to `gemini-3.5-flash-lite`; configure a supported model for your Google project. Model availability, provider quotas and billing are managed by Google. Each account may make 20 AI requests per UTC day, at least 10 seconds apart. Attempts reserve quota before calling the provider, including failed generations, to limit abuse.

## Deploy

Import the repository in Vercel. Use `npm run build` and the `dist` output. `vercel.json` supplies frontend route rewrites and the server function settings.

Set public Firebase configuration variables, `GEMINI_API_KEY` (a server secret) and `FIREBASE_PROJECT_ID` in the deployment environment. Optionally set `GEMINI_MODEL`. Redeploy after environment changes. Do not enable a production key for untrusted preview branches.

Enable Firebase email/password authentication and configure authorized domains for your deployment. Publish `firestore.rules` to the intended Standard database before using the app:

```sh
npx firebase login
npx firebase deploy --only firestore:rules --project YOUR_FIREBASE_PROJECT_ID
```

Review the rules before broadly sharing the app. They restrict reads/writes to the signed-in owner, validate document fields on creates and updates, and enforce monotonic AI usage. They do not grant administrator access or public access. Existing data is preserved, but invalid legacy records must be corrected before updating them.

## Verify

```sh
npm run lint
npm test
npm run build
npm audit
npm run test:rules
```

The rules suite uses only the isolated `demo-studysync` emulator, requires Java 21+, and tests anonymous access, cross-account access, schema validation and quota tampering. The other tests cover API input/output validation, provider failures, quotas and timer pause/resume/completion.

## Privacy and reliability

Notes and tasks sync to Firestore. Content submitted to the AI tools is sent through the server to Google Gemini. Theme preferences alone are stored locally. Profile/settings includes a JSON data export. No analytics tracking or browser notification permissions are required.

Saving and cloud errors are visible, with timeouts and retry guidance. Realtime Firestore listeners reflect confirmed writes and rollback rejected writes. Pomodoro timing uses a wall-clock deadline and records a completed focus session once. Browser suspension and offline connectivity can delay cloud saves; review the sync status before closing the app.
