import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mayIndex, serializeStructuredData } from '../lib/search-policy.ts';
test('private sites and Vercel previews stay out of indexes even after production launch', () => {
  assert.equal(mayIndex(true, 'production'), false);
  assert.equal(mayIndex(true), false);
  assert.equal(mayIndex(false, 'preview'), false);
  assert.equal(mayIndex(false, 'production'), true);
});
test('structured content cannot escape its JSON script element', () => {
  const text = '</script><script>alert(1)</script>\u2028\u2029';
  const result = serializeStructuredData({ description: text });
  assert.equal(result.includes('<'), false);
  assert.equal(result.includes('\u2028'), false);
  assert.equal(JSON.parse(result).description, text);
});
