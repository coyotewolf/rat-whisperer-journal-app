const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const source = fs.readFileSync(path.join(__dirname, '../supabase/functions/delete_user_by_id/index.ts'), 'utf8')
  .replace(/^import .*;\s*$/gm, '');
const code = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
const self = '11111111-1111-4111-8111-111111111111';
const other = '22222222-2222-4222-8222-222222222222';
function setup(valid = true) {
  let handler, deleted = [];
  const context = { Request, Response, console, serve: fn => { handler = fn; },
    Deno: { env: { get: name => name === 'SUPABASE_URL' ? 'https://test.example' : 'test-server-key' } },
    createClient: () => ({ auth: {
      getUser: async token => valid && token === 'verified-token'
        ? { data: { user: { id: self } }, error: null }
        : { data: { user: null }, error: new Error('invalid token') },
      admin: { deleteUser: async id => { deleted.push(id); return { error: null }; } }
    } })
  };
  vm.runInNewContext(code, context);
  return { call: (id, token) => handler(new Request('https://test.example/delete', { method: 'POST',
    headers: token ? { authorization: `Bearer ${token}`, 'content-type': 'application/json' } : { 'content-type': 'application/json' },
    body: JSON.stringify({ user_id_to_delete: id }) })), deleted };
}
test('anonymous, invalid, and cross-account requests never delete a user', async () => {
  const h = setup();
  assert.equal((await h.call(other)).status, 401);
  assert.equal((await h.call(other, 'forged-token')).status, 401);
  assert.equal((await h.call(other, 'verified-token')).status, 403);
  assert.deepEqual(h.deleted, []);
});
test('a verified owner can delete only their own account', async () => {
  const h = setup();
  assert.equal((await h.call(self, 'verified-token')).status, 200);
  assert.deepEqual(h.deleted, [self]);
});
