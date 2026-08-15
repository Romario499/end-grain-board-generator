import test from 'node:test';
import assert from 'node:assert/strict';

import { createSeededRandom, normalizeSeed } from '../../src/domain/seeded-random.js';

test('normalizeSeed maps equal textual seeds to the same unsigned integer', () => {
  assert.equal(normalizeSeed('workshop-42'), normalizeSeed('workshop-42'));
  assert.equal(Number.isInteger(normalizeSeed('workshop-42')), true);
  assert.equal(normalizeSeed('workshop-42') >= 0, true);
});

test('normalizeSeed preserves an unsigned integer seed', () => {
  assert.equal(normalizeSeed(42), 42);
});

test('createSeededRandom repeats the sequence for the same seed', () => {
  const first = createSeededRandom('oak-maple');
  const second = createSeededRandom('oak-maple');

  assert.deepEqual(
    [first(), first(), first(), first()],
    [second(), second(), second(), second()],
  );
});

test('createSeededRandom returns values in the half-open unit interval', () => {
  const random = createSeededRandom(7);
  const values = [random(), random(), random(), random(), random()];

  assert.equal(values.every((value) => value >= 0 && value < 1), true);
});
