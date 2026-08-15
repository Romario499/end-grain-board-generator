import test from 'node:test';
import assert from 'node:assert/strict';

import { createAppController } from '../../src/application/app-controller.js';
import { createProjectV2 } from '../../src/domain/project-v2.js';

function controller() {
  return createAppController({
    repository: { list: () => [], save: (project) => project },
    exporter: async () => ({}),
    idFactory: () => 'v2-project',
    clock: () => '2026-08-15T10:00:00.000Z',
    projectFactory: createProjectV2,
  });
}

test('controller starts new work as a schema V2 project when configured by the application', () => {
  const project = controller().getState().project;
  assert.equal(project.schemaVersion, 2);
  assert.equal(project.design.mode, 'freeform');
  assert.equal(project.manufacturing.kerfMm, 3.2);
});

test('controller can replace the current project through a successful domain command', () => {
  const app = controller();
  const current = app.getState().project;
  const changed = { ...current, design: { ...current.design, mode: 'template', templateId: 'classic-checkerboard-reverse-slices', templateVersion: 1, seed: 42, parameters: {} } };
  const result = app.dispatch({ project: changed, changed: true, errors: [] });
  assert.equal(result.ok, true);
  assert.equal(app.getState().project.design.mode, 'template');
  assert.equal(app.getState().dirty, true);
});
