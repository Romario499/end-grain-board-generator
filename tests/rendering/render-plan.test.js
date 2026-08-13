import test from 'node:test';
import assert from 'node:assert/strict';

import { createDefaultProject } from '../../src/domain/project-model.js';
import {
  buildBoardRenderPlan,
  calculateExportSize,
} from '../../src/rendering/render-plan.js';
import { drawBoard } from '../../src/rendering/canvas-renderer.js';

function projectFixture() {
  return createDefaultProject({ id: 'project-1', now: '2026-08-11T10:00:00.000Z' });
}

test('buildBoardRenderPlan maps the 8 x 6 grid to exact pixel bounds', () => {
  const plan = buildBoardRenderPlan(projectFixture(), { width: 800, height: 600 });

  assert.equal(plan.cells.length, 48);
  assert.deepEqual(
    { x: plan.cells[0].x, y: plan.cells[0].y, width: plan.cells[0].width, height: plan.cells[0].height },
    { x: 0, y: 0, width: 100, height: 100 },
  );
  assert.deepEqual(
    { x: plan.cells[47].x, y: plan.cells[47].y, width: plan.cells[47].width, height: plan.cells[47].height },
    { x: 700, y: 500, width: 100, height: 100 },
  );
  assert.equal(plan.cells[47].x + plan.cells[47].width, 800);
  assert.equal(plan.cells[47].y + plan.cells[47].height, 600);
});

test('buildBoardRenderPlan includes material, orientation and optional selection state', () => {
  const project = projectFixture();
  project.cells[0].materialId = 'walnut';
  project.cells[0].orientation = 'M90';

  const plan = buildBoardRenderPlan(project, {
    width: 800,
    height: 600,
    selectedCells: [{ row: 0, column: 0 }],
    showSelection: true,
  });

  assert.equal(plan.cells[0].material.id, 'walnut');
  assert.equal(plan.cells[0].orientation, 'M90');
  assert.equal(plan.cells[0].selected, true);
  assert.equal(plan.cells[1].selected, false);
});

test('buildBoardRenderPlan rejects a broken material reference', () => {
  const project = projectFixture();
  project.cells[0].materialId = 'missing';

  assert.throws(
    () => buildBoardRenderPlan(project, { width: 800, height: 600 }),
    /material/i,
  );
});

test('calculateExportSize keeps board proportions with a 2400 px long side', () => {
  assert.deepEqual(calculateExportSize({ lengthMm: 400, widthMm: 300 }, 2400), {
    width: 2400,
    height: 1800,
  });
  assert.deepEqual(calculateExportSize({ lengthMm: 50, widthMm: 3000 }, 2400), {
    width: 40,
    height: 2400,
  });
});

test('drawBoard paints every real cell and omits selection when overlays are disabled', () => {
  const calls = [];
  const context = new Proxy({
    canvas: { width: 800, height: 600 },
  }, {
    get(target, property) {
      if (property in target) return target[property];
      return (...args) => calls.push([property, ...args]);
    },
    set(target, property, value) {
      target[property] = value;
      return true;
    },
  });
  const plan = buildBoardRenderPlan(projectFixture(), { width: 800, height: 600 });

  drawBoard(context, plan);

  assert.equal(calls.filter(([name]) => name === 'fillRect').length, 49);
  assert.equal(calls.some(([name]) => name === 'setLineDash'), false);
});
