import test from 'node:test';
import assert from 'node:assert/strict';
import { applyPatternTemplate } from '../../src/application/pattern-commands.js';
import { createProjectV2 } from '../../src/domain/project-v2.js';
import { buildCube18RecipeView } from '../../src/ui/cube18-recipe-view.js';

function pricedCubeProject() {
  const project = createProjectV2({ id: 'cube-cost-ui', now: '2026-08-15T00:00:00.000Z' });
  project.board = { ...project.board, lengthMm: 457.2, widthMm: 304.8, thicknessMm: 50.8, rows: 6, columns: 8 };
  project.manufacturing.pricing = {
    currency: 'USD',
    boardFootPerMaterial: { maple: 12, walnut: 18, cherry: 11 },
    consumables: 8,
  };
  return applyPatternTemplate(project, {
    templateId: 'cube18-tumbling-rhombi',
    seed: 18,
    materialIds: ['maple', 'walnut', 'cherry'],
    manufacturing: project.manufacturing,
  }).project;
}

test('CUBE 18 recipe view shows board feet and an entered-price USD estimate', () => {
  const view = buildCube18RecipeView(pricedCubeProject());
  assert.equal(view.result.costs.complete, true);
  assert.match(view.metrics.panel, /bd ft/);
  assert.match(view.metrics.cost, /^\$/);
  assert.notEqual(view.metrics.cost, '$0.00');
});

test('CUBE 18 recipe view asks for shop rates instead of inventing a market price', () => {
  const project = pricedCubeProject();
  project.manufacturing.pricing = {};
  const view = buildCube18RecipeView(project);
  assert.equal(view.result.costs.complete, false);
  assert.equal(view.metrics.cost, 'Введите $/bd ft');
});
