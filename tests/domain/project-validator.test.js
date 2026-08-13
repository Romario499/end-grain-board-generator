import test from 'node:test';
import assert from 'node:assert/strict';

import { createDefaultProject } from '../../src/domain/project-model.js';
import { validateProject } from '../../src/domain/project-validator.js';

function validProject() {
  return createDefaultProject({
    id: 'project-1',
    now: '2026-08-11T10:00:00.000Z',
  });
}

test('validateProject accepts a complete default project', () => {
  const result = validateProject(validProject());

  assert.deepEqual(result, { ok: true, errors: [] });
});

test('validateProject rejects a board dimension outside the supported range', () => {
  const project = validProject();
  project.board.lengthMm = 49.9;

  const result = validateProject(project);

  assert.equal(result.ok, false);
  assert.equal(result.errors.some((error) => error.path === 'board.lengthMm'), true);
});

test('validateProject rejects a grid with a missing cell', () => {
  const project = validProject();
  project.cells.pop();

  const result = validateProject(project);

  assert.equal(result.ok, false);
  assert.equal(result.errors.some((error) => error.code === 'CELL_COUNT'), true);
});

test('validateProject rejects a cell that references an absent material', () => {
  const project = validProject();
  project.cells[0].materialId = 'missing-material';

  const result = validateProject(project);

  assert.equal(result.ok, false);
  assert.equal(result.errors.some((error) => error.code === 'MATERIAL_REFERENCE'), true);
});

test('validateProject rejects duplicate cell coordinates', () => {
  const project = validProject();
  project.cells[1] = { ...project.cells[0] };

  const result = validateProject(project);

  assert.equal(result.ok, false);
  assert.equal(result.errors.some((error) => error.code === 'CELL_COORDINATE'), true);
});
