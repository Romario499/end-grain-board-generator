import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { applyPatternTemplate } from '../../src/application/pattern-commands.js';
import { createProjectV2 } from '../../src/domain/project-v2.js';
import { generatePattern, listPatternTemplates } from '../../src/domain/patterns/pattern-registry.js';
import { buildBoardRenderPlan } from '../../src/rendering/render-plan.js';

const CUBE_ID = 'cube18-tumbling-rhombi';

test('studio registry exposes and routes the CUBE 18 template', () => {
  assert.ok(listPatternTemplates().some((template) => template.id === CUBE_ID));
  const generated = generatePattern(CUBE_ID, { rows: 6, columns: 8, materialIds: ['maple', 'walnut', 'cherry'], seed: 18 });
  assert.deepEqual(generated.diagnostics, []);
  assert.equal(generated.recipeSource.strategy, 'three-rhombus-tumbling-cube');
});

test('app command stores CUBE 18 and render plan exposes rhombus tiles', () => {
  const project = createProjectV2({ id: 'cube-project', now: '2026-08-15T00:00:00.000Z' });
  const applied = applyPatternTemplate(project, { templateId: CUBE_ID, seed: 18, materialIds: ['maple', 'walnut', 'cherry'], manufacturing: project.manufacturing });
  assert.equal(applied.changed, true);
  assert.equal(applied.project.design.templateId, CUBE_ID);
  const plan = buildBoardRenderPlan(applied.project, { width: 900, height: 600 });
  assert.equal(plan.patternType, 'cube18');
  assert.ok(plan.tiles.length > 0);
  assert.ok(plan.tiles.every((tile) => tile.points.length === 4 && tile.material.textureKey));
});

test('studio HTML offers CUBE 18 as a selectable template', async () => {
  const html = await readFile(new URL('../../index.html', import.meta.url), 'utf8');
  assert.match(html, /value="cube18-tumbling-rhombi"/);
  assert.match(html, /CUBE 18/);
});
