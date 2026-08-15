import test from 'node:test';
import assert from 'node:assert/strict';

import { applyPatternTemplate } from '../../src/application/pattern-commands.js';
import { createV2Project } from '../helpers/project-fixtures.js';

test('applyPatternTemplate stores a reproducible checkerboard and manufacturing inputs', () => {
  const project = createV2Project();
  project.board = { ...project.board, rows: 2, columns: 4 };
  project.cells = project.cells.slice(0, 8).map((cell, index) => ({ ...cell, row: Math.floor(index / 4), column: index % 4 }));

  const result = applyPatternTemplate(project, {
    templateId: 'classic-checkerboard-reverse-slices',
    seed: 'workshop-42',
    materialIds: ['maple', 'walnut'],
    manufacturing: { kerfMm: 3.2, allowances: { planingPerFaceMm: 1 } },
  });

  assert.equal(result.changed, true);
  assert.equal(result.project.design.mode, 'template');
  assert.equal(result.project.cells.length, 8);
  assert.notEqual(result.project.cells[0].materialId, result.project.cells[1].materialId);
  assert.equal(result.project.manufacturing.allowances.planingPerFaceMm, 1);
  assert.equal(project.design.mode, 'freeform');
});

test('applyPatternTemplate surfaces generator diagnostics without changing the project', () => {
  const project = createV2Project();
  project.board = { ...project.board, columns: 7 };

  const result = applyPatternTemplate(project, {
    templateId: 'classic-checkerboard-reverse-slices',
    seed: 1,
    materialIds: ['maple', 'walnut'],
  });

  assert.equal(result.changed, false);
  assert.equal(result.project, project);
  assert.equal(result.errors[0].code, 'CHECKERBOARD_COLUMNS_MUST_BE_EVEN');
});
