import test from 'node:test';
import assert from 'node:assert/strict';

import { createAppController } from '../../src/application/app-controller.js';
import { resizeGrid, transformCells } from '../../src/application/project-commands.js';
import { OPERATIONS } from '../../src/domain/transform-engine.js';

function controllerFixture() {
  return createAppController({
    repository: { list: () => [] },
    exporter: async () => ({ filename: 'board.png' }),
    idFactory: () => 'project-1',
    clock: () => '2026-08-11T10:00:00.000Z',
  });
}

test('controller removes out-of-bounds selection after shrinking the grid', () => {
  const controller = controllerFixture();
  controller.setSelection([
    { row: 1, column: 1 },
    { row: 5, column: 7 },
  ]);

  controller.dispatch(resizeGrid(controller.getState().project, {
    rows: 2,
    columns: 2,
    fillMaterialId: 'maple',
    confirmDestructive: true,
  }));

  assert.deepEqual(controller.getState().selection, [{ row: 1, column: 1 }]);

  const transform = transformCells(controller.getState().project, {
    cells: controller.getState().selection,
    operation: OPERATIONS.ROTATE_CW,
  });
  assert.deepEqual(transform.errors, []);
  assert.equal(transform.changed, true);
});
