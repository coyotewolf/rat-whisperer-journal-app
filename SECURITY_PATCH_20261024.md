# Security patch — 2026-10-24

This patch addresses authorization/exposure defects found during a source review. It is not evidence that an attack occurred.

- Edge account deletion validates the bearer token with Auth and permits only self-deletion.
- `security/harden-account-deletion.sql` fixes the SQL NULL authorization bypass in the actual RPC used by the frontend, removes anonymous EXECUTE, and preserves authenticated self-deletion.
- Authenticated Supabase responses are no longer runtime-cached; activating the updated service worker removes the old api-cache.
- Vite binds to loopback by default. Do not expose the development server to the internet.

Run `node --test security/delete-account.test.cjs` with the existing TypeScript dev dependency. Provider responses are mocked; no account is deleted by tests.

The SQL is a deployment script, not an applied migration. Apply it to the active Rat Care database, deploy the Edge Function, and verify grants before considering production fixed. The original database reported inaccessible during the audit. The app's frontend still calls the RPC, so deploying only the Edge Function is insufficient.
