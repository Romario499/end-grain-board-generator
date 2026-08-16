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

test('presentation uses the supplied WebP visuals with explicit loading priorities', () => {
  assert.match(page, /src="\.\/assets\/presentation\/cube18-hero\.webp"/);
  assert.match(page, /class="hero-photo"[^>]*loading="eager"[^>]*fetchpriority="high"/);
  assert.match(page, /src="\.\/assets\/presentation\/cube18-workshop\.webp"/);
  assert.match(page, /class="workshop-photo"[^>]*loading="lazy"/);
  assert.doesNotMatch(page, /cube18-infographic|\.png/i);
});

test('presentation identifies the three verified hardwood species', () => {
  const species = [
    ['American Hard Maple', 'Acer saccharum', 'american-hard-maple-end-grain.jpg'],
    ['American Black Walnut', 'Juglans nigra', 'american-black-walnut-end-grain.jpg'],
    ['American Black Cherry', 'Prunus serotina', 'american-black-cherry-end-grain.jpg'],
  ];

  assert.match(page, /THREE WOODS\.[\s\S]*ONE GEOMETRY\./);
  for (const [commonName, botanicalName, asset] of species) {
    assert.match(page, new RegExp(commonName));
    assert.match(page, new RegExp(botanicalName));
    assert.match(page, new RegExp(`assets/wood/${asset}`));
  }
});

test('native process graphic stays within verified product capabilities', () => {
  assert.match(page, /FROM GEOMETRY[\s\S]*TO WORKBENCH/);
  assert.match(page, /<svg[^>]*class="process-line"/);
  assert.match(page, /18 × 12 × 2 in/);

  for (const label of ['01 DESIGN', '02 SPECIFY', '03 CALCULATE', '04 BUILD', '05 EXPORT']) {
    assert.match(page, new RegExp(label));
  }

  for (const output of ['Kerf', 'Angles', 'Cuts', 'Board Feet', 'Waste', 'Workshop Recipe', 'PNG', 'Print', 'Saved Project']) {
    assert.match(page, new RegExp(output));
  }

  assert.doesNotMatch(page, /PDF export/i);
});
