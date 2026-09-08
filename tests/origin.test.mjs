import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isAllowedOrigin } from '../lib/request-origin.ts';
test('accepts the configured public origin behind a different internal server address', () => {
  assert.equal(isAllowedOrigin('http://localhost:4173/api/report', 'http://127.0.0.1:4173', 'http://127.0.0.1:4173'), true);
  assert.equal(isAllowedOrigin('http://localhost:3000/api/report', 'https://client.example', 'https://client.example/'), true);
});
test('accepts the exact trusted Vercel preview host and rejects lookalike origins', () => {
  assert.equal(isAllowedOrigin('http://localhost/api/report', 'https://preview.vercel.app', undefined, 'preview.vercel.app'), true);
  assert.equal(isAllowedOrigin('http://localhost/api/report', 'https://preview.vercel.app.attacker.example', undefined, 'preview.vercel.app'), false);
  assert.equal(isAllowedOrigin('http://localhost/api/report', 'https://other.example', 'https://client.example'), false);
  assert.equal(isAllowedOrigin('http://localhost/api/report', 'null', 'invalid'), false);
});
test('ordinary same-origin and non-browser JSON requests remain supported', () => {
  assert.equal(isAllowedOrigin('http://localhost:3000/api/report', 'http://localhost:3000'), true);
  assert.equal(isAllowedOrigin('http://localhost:3000/api/report', null), true);
});
