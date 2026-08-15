import test from 'node:test';
import assert from 'node:assert/strict';

import {
  CHECKERBOARD_TEMPLATE_ID,
  generateCheckerboardPattern,
} from '../../src/domain/patterns/checkerboard-pattern.js';

const validInput = {
  rows: 2,
  columns: 4,
  materialIds: ['maple', 'walnut'],
  seed: 11,
};

test('checkerboard template exposes the stable reverse-slices identity', () => {
  assert.equal(CHECKERBOARD_TEMPLATE_ID, 'classic-checkerboard-reverse-slices');
});

test('generateCheckerboardPattern creates alternating cells and a reproducible phase', () => {
  const first = generateCheckerboardPattern(validInput);
  const second = generateCheckerboardPattern(validInput);

  assert.deepEqual(first, second);
  assert.deepEqual(first.cells, [
    [
      { materialId: 'walnut', rotation: 0, flipX: false, flipY: false },
      { materialId: 'maple', rotation: 0, flipX: false, flipY: false },
      { materialId: 'walnut', rotation: 0, flipX: false, flipY: false },
      { materialId: 'maple', rotation: 0, flipX: false, flipY: false },
    ],
    [
      { materialId: 'maple', rotation: 0, flipX: false, flipY: false },
      { materialId: 'walnut', rotation: 0, flipX: false, flipY: false },
      { materialId: 'maple', rotation: 0, flipX: false, flipY: false },
      { materialId: 'walnut', rotation: 0, flipX: false, flipY: false },
    ],
  ]);
  assert.deepEqual(first.normalizedParameters, {
    rows: 2,
    columns: 4,
    materialIds: ['maple', 'walnut'],
    seed: 11,
    phase: 1,
  });
  assert.deepEqual(first.diagnostics, []);
});

test('generateCheckerboardPattern describes the recipe source', () => {
  const result = generateCheckerboardPattern(validInput);

  assert.deepEqual(result.recipeSource, {
    templateId: 'classic-checkerboard-reverse-slices',
    templateVersion: 1,
    strategy: 'reverse-alternate-slices',
  });
});

test('generateCheckerboardPattern rejects odd reverse-slice columns with a diagnostic', () => {
  const result = generateCheckerboardPattern({ ...validInput, columns: 3 });

  assert.deepEqual(result.cells, []);
  assert.equal(result.diagnostics[0].code, 'CHECKERBOARD_COLUMNS_MUST_BE_EVEN');
  assert.equal(result.diagnostics[0].path, 'columns');
});

test('generateCheckerboardPattern rejects invalid dimensions and duplicate materials', () => {
  const result = generateCheckerboardPattern({
    rows: 0,
    columns: 2.5,
    materialIds: ['maple', 'maple'],
    seed: 1,
  });

  assert.deepEqual(result.cells, []);
  assert.deepEqual(
    result.diagnostics.map(({ code, path }) => ({ code, path })),
    [
      { code: 'PATTERN_ROWS_INVALID', path: 'rows' },
      { code: 'PATTERN_COLUMNS_INVALID', path: 'columns' },
      { code: 'PATTERN_MATERIALS_INVALID', path: 'materialIds' },
    ],
  );
});
