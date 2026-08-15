import test from 'node:test';
import assert from 'node:assert/strict';
import { applyPatternTemplate } from '../../src/application/pattern-commands.js';
import { createProjectV2 } from '../../src/domain/project-v2.js';
import { buildCube18RecipeView } from '../../src/ui/cube18-recipe-view.js';

function cubeProject() {
  const project = createProjectV2({ id: 'cube-ui', now: '2026-08-15T00:00:00.000Z' });
  project.board = { ...project.board, lengthMm: 457.2, widthMm: 304.8, thicknessMm: 50.8, rows: 6, columns: 8 };
  return applyPatternTemplate(project, {
    templateId: 'cube18-tumbling-rhombi',
    seed: 18,
    materialIds: ['maple', 'walnut', 'cherry'],
    manufacturing: {
      ...project.manufacturing,
      kerfMm: 3.2,
      allowances: { ...project.manufacturing.allowances, endTrimPerSideMm: 5, finalTrimXPerSideMm: 5, finalTrimYPerSideMm: 5, planingPerFaceMm: 1, sandingPerFaceMm: 0.5 },
    },
  }).project;
}

test('CUBE 18 recipe view exposes rhombus, saw, strip and waste outputs', () => {
  const view = buildCube18RecipeView(cubeProject());
  assert.equal(view.status, 'РАСЧЁТ CUBE 18');
  assert.match(view.patternLabel, /CUBE 18/);
  assert.match(view.metrics.cell, /60°/);
  assert.match(view.metrics.slice, /30°/);
  assert.match(view.metrics.panel, /maple/i);
  assert.match(view.metrics.cuts, /рез/);
  assert.match(view.metrics.gross, /л/);
  assert.match(view.metrics.waste, /%/);
  assert.match(view.steps[0], /полос/i);
});

test('CUBE 18 recipe view ignores non-CUBE projects', () => {
  const project = createProjectV2({ id: 'freeform-ui', now: '2026-08-15T00:00:00.000Z' });
  assert.equal(buildCube18RecipeView(project), null);
});
