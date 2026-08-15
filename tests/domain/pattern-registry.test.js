import test from 'node:test';
import assert from 'node:assert/strict';

import {
  generatePattern,
  listPatternTemplates,
} from '../../src/domain/patterns/pattern-registry.js';

test('listPatternTemplates exposes the checkerboard template as immutable metadata', () => {
  const templates = listPatternTemplates();

  assert.deepEqual(templates, [
    {
      id: 'classic-checkerboard-reverse-slices',
      version: 1,
      name: 'Классическая шахматная переклейка',
    },
  ]);

  templates[0].name = 'changed outside';
  assert.equal(listPatternTemplates()[0].name, 'Классическая шахматная переклейка');
});

test('generatePattern routes a known template to its generator', () => {
  const result = generatePattern('classic-checkerboard-reverse-slices', {
    rows: 1,
    columns: 2,
    materialIds: ['maple', 'walnut'],
    seed: 2,
  });

  assert.equal(result.cells.length, 1);
  assert.equal(result.cells[0].length, 2);
  assert.deepEqual(result.diagnostics, []);
});

test('generatePattern returns a structured diagnostic for an unknown template', () => {
  const result = generatePattern('missing-template', {
    rows: 1,
    columns: 2,
    materialIds: ['maple', 'walnut'],
    seed: 2,
  });

  assert.deepEqual(result, {
    cells: [],
    recipeSource: null,
    normalizedParameters: null,
    diagnostics: [
      {
        severity: 'error',
        code: 'PATTERN_TEMPLATE_UNKNOWN',
        path: 'templateId',
        message: 'Неизвестный шаблон: missing-template',
      },
    ],
  });
});
