import test from 'node:test';
import assert from 'node:assert/strict';

import { createAppController } from '../../src/application/app-controller.js';
import { resizeGrid, transformCells } from '../../src/application/project-commands.js';
import { OPERATIONS } from '../../src/domain/transform-engine.js';

test('controller keeps only integer in-bounds selection after a project change', () => {
  const controller = createAppController({
    repository: { list: () => [] },
    exporter: async () => ({}),
    idFactory: () => 'project-1',
    clock: () => '2026-08-11T10:00:00.000Z',
  });
  controller.setSelection([
    { row: -1, column: 0 },
    { row: 0.5, column: 1 },
    { row: 1, column: 1 },
  ]);

  controller.dispatch(resizeGrid(controller.getState().project, {
    rows: 2,
    columns: 2,
    fillMaterialId: 'maple',
    confirmDestructive: true,
  }));

  assert.deepEqual(controller.getState().selection, [{ row: 1, column: 1 }]);

  const result = controller.dispatch(transformCells(controller.getState().project, {
    cells: controller.getState().selection,
    operation: OPERATIONS.ROTATE_CW,
  }));
  const transformedCell = controller.getState().project.cells
    .find((cell) => cell.row === 1 && cell.column === 1);

  assert.equal(result.ok, true);
  assert.equal(transformedCell.orientation, 'R90');
});
