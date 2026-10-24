# Security toolchain update — 2026-10-24

Base: 28f5952acf0265eec750a4c70fda4dbb160a5317, the existing PR #10 security branch.

Vite 5.4.10 -> 6.4.5; @vitejs/plugin-react-swc 3.7.1 -> 3.11.0; lovable-tagger 1.1.7 -> 1.1.13. Applied semver-compatible audit repairs and updated typescript-eslint within v8 to fix compatibility with updated ESLint. No audit --force or major overrides.

The existing CI uses npm ci. package-lock.json is authoritative; obsolete bun.lockb is retired to prevent installation of the old vulnerable graph. Use npm ci and npm run build/test.

Windows Node 24.16.0 validation:
- Four existing mocked security regression tests pass. These do not validate live SQL RPC authorization or deployment.
- Two real Chromium browser smoke tests pass: unauthenticated home/navigation and 404 return-home. External backend requests are blocked; authenticated user/data workflows are not covered.
- Production build including generated PWA service worker passes.
- Lint now executes, but reports source errors; it is not a passing check.
- Final full audit: 1 high / 7 moderate / 1 low. Production audit: 1 high / 5 moderate / 1 low. Remaining findings include Zod, React Router, CSS selector tooling and i18next-http-backend. These need separately tested major migrations.

No SQL grants, Edge Function, PWA deployment, secret change, or production release was performed. PR #10's account deletion RPC/Edge/PWA deployment remains separately pending confirmation and live validation.

Official Vite advisories: GHSA-rq7h-c2jc-7f22, GHSA-9jrq-w75r-8gcw, GHSA-8g5g-mxqh-grgj. Version matching is not evidence of compromise.