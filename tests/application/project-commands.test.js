import test from 'node:test';
import assert from 'node:assert/strict';

import { createDefaultProject } from '../../src/domain/project-model.js';
import { OPERATIONS } from '../../src/domain/transform-engine.js';
import {
  paintCells,
  resizeGrid,
  setBoardDimensions,
  transformCells,
} from '../../src/application/project-commands.js';

function projectFixture() {
  return createDefaultProject({ id: 'project-1', now: '2026-08-11T10:00:00.000Z' });
}

test('setBoardDimensions returns an updated project without mutating the input', () => {
  const original = projectFixture();
  const result = setBoardDimensions(original, {
    lengthMm: 500,
    widthMm: 320,
    thicknessMm: 45,
  });

  assert.equal(result.changed, true);
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.project.board, { ...original.board, lengthMm: 500, widthMm: 320, thicknessMm: 45 });
  assert.equal(original.board.lengthMm, 400);
});

test('setBoardDimensions rejects an out-of-range value and preserves the project', () => {
  const original = projectFixture();
  const result = setBoardDimensions(original, {
    lengthMm: 49,
    widthMm: 320,
    thicknessMm: 45,
  });

  assert.equal(result.changed, false);
  assert.equal(result.project, original);
  assert.equal(result.errors[0].path, 'board.lengthMm');
});

test('paintCells changes only the requested cells and keeps their orientations', () => {
  const original = projectFixture();
  original.cells[0].orientation = 'R90';
  const result = paintCells(original, {
    cells: [{ row: 0, column: 0 }, { row: 1, column: 1 }],
    materialId: 'walnut',
  });

  assert.equal(result.changed, true);
  assert.equal(result.project.cells[0].materialId, 'walnut');
  assert.equal(result.project.cells[0].orientation, 'R90');
  assert.equal(result.project.cells[9].materialId, 'walnut');
  assert.equal(result.project.cells[1].materialId, 'maple');
  assert.equal(original.cells[0].materialId, 'maple');
});

test('paintCells reports no change when the material is already assigned', () => {
  const original = projectFixture();
  const result = paintCells(original, {
    cells: [{ row: 0, column: 0 }],
    materialId: 'maple',
  });

  assert.equal(result.changed, false);
  assert.equal(result.project, original);
});

test('transformCells applies the operation only to selected coordinates', () => {
  const original = projectFixture();
  const result = transformCells(original, {
    cells: [{ row: 0, column: 0 }, { row: 5, column: 7 }],
    operation: OPERATIONS.ROTATE_CW,
  });

  assert.equal(result.project.cells[0].orientation, 'R90');
  assert.equal(result.project.cells[47].orientation, 'R90');
  assert.equal(result.project.cells[1].orientation, 'R0');
  assert.equal(original.cells[0].orientation, 'R0');
});

test('resizeGrid adds cells on the right and bottom using the active material', () => {
  const original = projectFixture();
  const result = resizeGrid(original, {
    rows: 7,
    columns: 9,
    fillMaterialId: 'cherry',
  });

  assert.equal(result.changed, true);
  assert.equal(result.project.cells.length, 63);
  const addedRight = result.project.cells.find((cell) => cell.row === 0 && cell.column === 8);
  const addedBottom = result.project.cells.find((cell) => cell.row === 6 && cell.column === 0);
  assert.deepEqual(addedRight, { row: 0, column: 8, materialId: 'cherry', orientation: 'R0' });
  assert.deepEqual(addedBottom, { row: 6, column: 0, materialId: 'cherry', orientation: 'R0' });
});

test('resizeGrid requires confirmation before discarding cells', () => {
  const original = projectFixture();
  const blocked = resizeGrid(original, {
    rows: 5,
    columns: 7,
    fillMaterialId: 'maple',
  });

  assert.equal(blocked.changed, false);
  assert.equal(blocked.confirmationRequired, true);
  assert.equal(blocked.project, original);

  const confirmed = resizeGrid(original, {
    rows: 5,
    columns: 7,
    fillMaterialId: 'maple',
    confirmDestructive: true,
  });

  assert.equal(confirmed.changed, true);
  assert.equal(confirmed.project.cells.length, 35);
  assert.equal(confirmed.confirmationRequired, false);
});
