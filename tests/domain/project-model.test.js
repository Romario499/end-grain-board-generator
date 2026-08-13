import test from 'node:test';
import assert from 'node:assert/strict';

import { createDefaultProject } from '../../src/domain/project-model.js';

test('createDefaultProject builds the specified 400 x 300 x 40 mm board', () => {
  const project = createDefaultProject({
    id: 'project-1',
    now: '2026-08-11T10:00:00.000Z',
  });

  assert.deepEqual(project.board, {
    lengthMm: 400,
    widthMm: 300,
    thicknessMm: 40,
    columns: 8,
    rows: 6,
  });
});

test('createDefaultProject fills all 48 cells with the first material in the base orientation', () => {
  const project = createDefaultProject({
    id: 'project-1',
    now: '2026-08-11T10:00:00.000Z',
  });

  assert.equal(project.palette.length >= 3, true);
  assert.equal(project.cells.length, 48);
  assert.deepEqual(project.cells[0], {
    row: 0,
    column: 0,
    materialId: project.palette[0].id,
    orientation: 'R0',
  });
  assert.deepEqual(project.cells[47], {
    row: 5,
    column: 7,
    materialId: project.palette[0].id,
    orientation: 'R0',
  });
});

test('createDefaultProject keeps stable metadata supplied by the caller', () => {
  const project = createDefaultProject({
    id: 'project-1',
    now: '2026-08-11T10:00:00.000Z',
  });

  assert.equal(project.schemaVersion, 1);
  assert.equal(project.id, 'project-1');
  assert.equal(project.name, 'Новая доска');
  assert.equal(project.createdAt, '2026-08-11T10:00:00.000Z');
  assert.equal(project.updatedAt, '2026-08-11T10:00:00.000Z');
});
