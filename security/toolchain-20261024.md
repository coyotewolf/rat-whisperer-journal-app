# Security toolchain update — 2026-10-24

Base: 28f5952acf0265eec750a4c70fda4dbb160a5317, the existing PR #10 security branch.

Vite 5.4.10 -> 6.4.5; @vitejs/plugin-react-swc 3.7.1 -> 3.11.0; lovable-tagger 1.1.7 -> 1.1.13. Applied semver-compatible audit repairs and updated typescript-eslint within v8 to fix compatibility with updated ESLint. No audit --force or major overrides.

The existing CI uses npm ci. package-lock.json is authoritative; obsolete bun.lockb is retired to prevent installation of the old vulnerable graph. Use npm ci and npm run build/test.

Windows Node 24.16.0 validation:
- Four existing mocked security regression tests pass. These do not validate live SQL RPC authorization or deployment.
- Two real Chromium browser smoke tests pass: unauthenticated home/navigation and 404 return-home. External backend requests are blocked; authenticated user/data workflows are not covered.
- Production build including generated PWA service worker passes.
- Lint now executes, but reports source errors; it is not a passing check.

No SQL grants, Edge Function, PWA deployment, secret change, or production release was performed. PR #10's account deletion RPC/Edge/PWA deployment remains separately pending confirmation and live validation.

Official Vite advisories: GHSA-rq7h-c2jc-7f22, GHSA-9jrq-w75r-8gcw, GHSA-8g5g-mxqh-grgj. Version matching is not evidence of compromise.
## Completed second pass

Removed unused Zod and @hookform/resolvers after checking tracked source imports. Migrated React Router DOM 6.x to 7.18.4; React 18 is retained. The applications use simple wildcard fallback routes and do not use the affected multi-segment relative splat patterns.

All production builds and real Chromium 404-to-home navigation smoke checks passed with external requests blocked. This does not verify authenticated backend workflows. Existing source lint failures remain outside this dependency update.

Full npm audit: 0 critical / 0 high / 5 moderate / 0 low. Production npm audit: 0 critical / 0 high / 3 moderate / 0 low. The remaining findings are the PostCSS selector-parser/Tailwind 3 toolchain (GHSA-rj75-hqrm-r3gf). Resolving them requires a separately validated CSS-toolchain migration; no major parser override, audit suppression, or audit --force was used. Production audit includes build tooling brought in by the current dependency classification; it is not proof of runtime exploitability.

i18next-http-backend 3.x -> 4.0.5 removes the remaining low advisory. Native fetch is required (supported by modern browsers and Node 22). The application uses the default local locale path. Four mocked security tests and the real browser smoke suite pass; these are not live SQL authorization tests.

No merge or production deployment was performed in either pass.
