const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

test('PWA excludes authenticated API runtime caching', () => {
  const source = fs.readFileSync(path.join(__dirname, '../vite.config.ts'), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  let options;
  const context = { exports: {}, __dirname,
    require: name => name === 'vite' ? { defineConfig: x => x }
      : name === 'path' ? { default: path }
      : name === 'vite-plugin-pwa' ? { VitePWA: x => { options = x; return {}; } }
      : name === 'lovable-tagger' ? { componentTagger: () => ({}) }
      : { default: () => ({}) } };
  vm.runInNewContext(code, context);
  context.exports.default({ mode: 'production' });
  assert.equal(options.workbox.runtimeCaching.length, 0);
  assert.equal(options.workbox.importScripts[0], 'sw-private-cache-cleanup.js');
});
test('updated service worker removes the previous API cache on activation', async () => {
  let activate, pending, deleted;
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../public/sw-private-cache-cleanup.js'), 'utf8'), {
    self: { addEventListener: (name, fn) => { assert.equal(name, 'activate'); activate = fn; } },
    caches: { delete: async name => { deleted = name; return true; } }
  });
  activate({ waitUntil: promise => { pending = promise; } });
  await pending;
  assert.equal(deleted, 'api-cache');
});
