# Compatible dependency refresh (2026-11-12 UTC)

Refreshed registry dependencies within the existing application major-version families and regenerated the npm lockfile. Upgraded Vite 6 to 8, the React SWC plugin to 4, and the PWA plugin to 2 together, respecting their peer ranges. No peer-dependency bypass is needed.

## Deliberate compatibility holds

- Supabase remains pinned to 2.93.3. Testing 2.119.0 exposes the existing `repeat_options` task payload, which is absent from generated database types. Do not erase recurrence data or suppress that validation to force an upgrade; schema/payload reconciliation needs separate work.
- React 18 and matching types, Tailwind 3 and tailwind-merge 2, date-fns 3 / DayPicker 8, Router 6, Recharts 2, Zod 3 / resolvers 3, and other application-library major lines remain on their latest compatible releases. This is not a claim that every dependency is on the registry's latest major.
- TypeScript stays on the supported 5.9 line. The latest registry compiler is 7, while typescript-eslint currently requires <6.1.

## Executed validation

- `npm install --no-audit --no-fund`: passed, lockfile regenerated.
- `npm run build`: passed, including PWA generation.
- `npx tsc -p tsconfig.app.json --noEmit`: passed.
- `npm run lint`: 163 errors and 26 warnings, identical counts to the baseline before updates. This is a pre-existing failure, not a lint pass.
- Local Playwright: blocked before any test page opened by Chromium Unix-socket restrictions. GitHub's existing Playwright workflow is the browser gate; its result must be verified on the PR head before merge.
- No authenticated Supabase, live account, production deployment, or npm audit was performed locally.

The optional BROWSER_EXECUTABLE_PATH test setting permits reuse of an installed browser without changing CI's managed Chromium default.

## Bun lock reconciliation

The first dependency PR left the existing Bun lock stale. Bun 1.4.4 regenerated it directly from the committed npm lock, without changing the manifest or npm resolutions. The repository has only one package manifest and these two lockfiles; no nested package manifests were found. All direct dependency ranges and resolved versions were compared and match. Frozen Bun install, production/PWA build and application typecheck passed. Bun's blocked postinstall was not enabled; the build works without changing its trust policy. CI now validates npm and Bun independently, including build, typecheck and browser navigation tests.
