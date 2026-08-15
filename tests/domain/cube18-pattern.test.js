import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CUBE18_TEMPLATE_ID,
  buildCube18TilePlan,
  generateCube18Pattern,
} from '../../src/domain/patterns/cube18-pattern.js';

test('CUBE 18 generator requires three distinct hardwoods and stores a reproducible recipe', () => {
  const result = generateCube18Pattern({ rows: 4, columns: 6, materialIds: ['maple', 'walnut', 'cherry'], seed: 'cube-18' });
  assert.deepEqual(result.diagnostics, []);
  assert.equal(result.cells.length, 4);
  assert.equal(result.cells[0].length, 6);
  assert.equal(result.recipeSource.templateId, CUBE18_TEMPLATE_ID);
  assert.equal(result.recipeSource.strategy, 'three-rhombus-tumbling-cube');
  assert.deepEqual(new Set(result.cells.flat().map((cell) => cell.materialId)), new Set(['maple', 'walnut', 'cherry']));
  assert.equal(result.normalizedParameters.rhombusAcuteAngleDeg, 60);
});

test('CUBE 18 tile plan creates three 60-degree rhombus faces per cube', () => {
  const plan = buildCube18TilePlan({ width: 900, height: 600, cubeRows: 3, cubeColumns: 4, materialIds: ['maple', 'walnut', 'cherry'] });
  assert.equal(plan.tiles.length, 36);
  assert.deepEqual(plan.tiles.slice(0, 3).map((tile) => tile.face), ['top', 'left', 'right']);
  assert.deepEqual(plan.tiles.slice(0, 3).map((tile) => tile.materialId), ['maple', 'walnut', 'cherry']);
  assert.ok(plan.tiles.every((tile) => tile.points.length === 4));
  assert.equal(plan.geometry.rhombusAcuteAngleDeg, 60);
});

test('CUBE 18 generator rejects fewer than three distinct materials', () => {
  const result = generateCube18Pattern({ rows: 4, columns: 6, materialIds: ['maple', 'walnut'], seed: 18 });
  assert.equal(result.cells.length, 0);
  assert.equal(result.diagnostics[0].code, 'CUBE18_THREE_MATERIALS_REQUIRED');
});
