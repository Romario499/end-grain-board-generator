import test from 'node:test';
import assert from 'node:assert/strict';

import { buildWoodTexturePlan } from '../../src/rendering/wood-texture-plan.js';

const cell = (id, row = 2, column = 3) => ({
  row,
  column,
  width: 120,
  height: 90,
  material: { id, baseColor: '#aa7744', accentColor: '#442211' },
});

test('wood texture is deterministic for the same species and cell coordinate', () => {
  assert.deepEqual(buildWoodTexturePlan(cell('maple')), buildWoodTexturePlan(cell('maple')));
});

test('neighbouring cells receive natural but reproducible variation', () => {
  assert.notDeepEqual(buildWoodTexturePlan(cell('maple', 2, 3)), buildWoodTexturePlan(cell('maple', 2, 4)));
});

test('texture contains off-centre irregular rings, pores and medullary rays', () => {
  const texture = buildWoodTexturePlan(cell('walnut'));

  assert.ok(Math.abs(texture.center.x) > 0.03 || Math.abs(texture.center.y) > 0.03);
  assert.ok(texture.rings.length >= 7);
  assert.ok(texture.rings.some((ring) => ring.wobble > 0));
  assert.ok(texture.pores.length >= 18);
  assert.ok(texture.rays.length >= 4);
});

test('maple, walnut and cherry have visibly different anatomical profiles', () => {
  const maple = buildWoodTexturePlan(cell('maple'));
  const walnut = buildWoodTexturePlan(cell('walnut'));
  const cherry = buildWoodTexturePlan(cell('cherry'));

  assert.notEqual(maple.profile.ringColor, walnut.profile.ringColor);
  assert.notEqual(walnut.profile.poreRadius, cherry.profile.poreRadius);
  assert.notEqual(maple.profile.rayAlpha, cherry.profile.rayAlpha);
});

test('texture coordinates are normalized so preview and PNG share identical geometry', () => {
  const texture = buildWoodTexturePlan(cell('cherry'));
  for (const pore of texture.pores) {
    assert.ok(pore.x >= -0.5 && pore.x <= 0.5);
    assert.ok(pore.y >= -0.5 && pore.y <= 0.5);
  }
});
