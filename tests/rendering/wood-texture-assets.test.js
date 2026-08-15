import test from 'node:test';
import assert from 'node:assert/strict';
import { getWoodTextureImage, getWoodTextureUrl, loadWoodTextureAssets } from '../../src/rendering/wood-texture-assets.js';

test('maps US hardwood texture keys to optimized local assets', () => {
  assert.equal(getWoodTextureUrl('american-hard-maple-end-grain'), './assets/wood/american-hard-maple-end-grain.jpg');
  assert.equal(getWoodTextureUrl('american-black-walnut-end-grain'), './assets/wood/american-black-walnut-end-grain.jpg');
  assert.equal(getWoodTextureUrl('american-black-cherry-end-grain'), './assets/wood/american-black-cherry-end-grain.jpg');
  assert.equal(getWoodTextureUrl('unknown'), null);
});

test('texture loading is safe outside the browser', async () => {
  await loadWoodTextureAssets();
  assert.equal(getWoodTextureImage('american-hard-maple-end-grain'), null);
});
