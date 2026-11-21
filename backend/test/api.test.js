const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

// Use a throwaway CSV so tests never touch real data
const csvPath = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'tx-')), 'transactions.csv');
process.env.CSV_PATH = csvPath;
const app = require('../server');


let server;
let base;
before(() => new Promise((resolve) => {
  server = app.listen(0, '127.0.0.1', () => {
    base = `http://127.0.0.1:${server.address().port}`;
    resolve();
  });
}));
after(() => {
  server.closeAllConnections?.();
  server.close();
});

// Helper to POST a transaction. If the body is an object, it is JSON-stringified.
const post = (body) =>
  fetch(`${base}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
const valid = { transactionDate: '2025-03-11', accountNumber: '1111-2222-3333', accountHolderName: "Test O'Neil", amount: 42.5 };
const lines = () => fs.readFileSync(csvPath, 'utf8').trim().split('\n');

// Basic sanity check that the server is running and returns JSON
test('GET returns an empty list when the CSV does not exist', async () => {
  const res = await fetch(`${base}/transactions`);
  assert.equal(res.status, 200);
  assert.deepEqual((await res.json()).data, []);
});

test('POST creates the file with a header and a 2-decimal amount', async () => {
  const res = await post(valid);
  assert.equal(res.status, 201);
  assert.equal(lines()[0], 'Transaction Date,Account Number,Account Holder Name,Amount,Status');
  assert.match(lines()[1], /^2025-03-11,1111-2222-3333,Test O'Neil,42\.50,(Pending|Settled|Failed)$/);
});

test('concurrent POSTs all produce intact rows', async () => {
  const before = lines().length;
  const results = await Promise.all(Array.from({ length: 10 }, () => post(valid)));
  assert.ok(results.every((r) => r.status === 201));
  assert.equal(lines().length, before + 10);
});

test('a missing trailing newline does not corrupt the next row', async () => {
  fs.writeFileSync(csvPath, fs.readFileSync(csvPath, 'utf8').trimEnd());
  const before = lines().length;
  await post(valid);
  assert.equal(lines().length, before + 1);
});

const invalid = {
  'impossible date': { ...valid, transactionDate: '2025-02-30' },
  'bad account number': { ...valid, accountNumber: '12345' },
  'empty name': { ...valid, accountHolderName: '  ' },
  'formula in name': { ...valid, accountHolderName: '=SUM(A1)' },
  'negative amount': { ...valid, amount: -5 },
  'zero amount': { ...valid, amount: 0 },
  'sub-cent amount': { ...valid, amount: 0.004 },
  'exponent amount': { ...valid, amount: '1e5' },
  'array amount': { ...valid, amount: [5] },
  'empty body': {},
};
for (const [name, body] of Object.entries(invalid)) {
  test(`rejects ${name}`, async () => {
    const res = await post(body);
    assert.equal(res.status, 400);
    assert.ok((await res.json()).errors.length > 0);
  });
}

test('malformed JSON returns 400', async () => assert.equal((await post('{"a":')).status, 400));
test('oversized body returns 413', async () =>
  assert.equal((await post({ ...valid, accountHolderName: 'a'.repeat(20000) })).status, 413));

test('unknown route returns JSON 404', async () => {
  const res = await fetch(`${base}/nope`);
  assert.equal(res.status, 404);
  assert.equal((await res.json()).success, false);
});

test('client-supplied status is ignored', async () => {
  const body = await (await post({ ...valid, status: 'Hacked' })).json();
  assert.notEqual(body.data.status, 'Hacked');
});

test('rejects non-canonical date strings', async () => {
  for (const d of ['2025-3-1', '2025-03-11T10:00:00Z', 'March 11 2025', '']) {
    assert.equal((await post({ ...valid, transactionDate: d })).status, 400, d);
  }
});