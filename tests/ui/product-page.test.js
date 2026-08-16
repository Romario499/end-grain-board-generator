import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const page = await readFile(new URL('../../product.html', import.meta.url), 'utf8');

test('product page connects DREVOCOD to the working studio', () => {
  assert.match(page, /DREVOCOD/);
  assert.match(page, /END GRAIN STUDIO/);
  assert.match(page, /href="\.\/index\.html"/);
  assert.match(page, /Functional geometry/);
});

test('product page presents CUBE 18 as a digital MVP with an honest physical-validation boundary', () => {
  assert.match(page, /CUBE 18/);
  assert.match(page, /PARAMETRIC DIGITAL MVP/);
  assert.match(page, /Цифровой MVP готов/);
  assert.match(page, /физическая верификация/);
  assert.match(page, /не выдаётся за физически подтверждённое изделие/);
});

test('product page exposes verified competition capabilities', () => {
  for (const capability of ['Pattern lab', 'US hardwoods', 'Workshop math', 'Workshop handoff']) {
    assert.match(page, new RegExp(capability));
  }
});
