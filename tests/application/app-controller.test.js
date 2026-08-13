import test from 'node:test';
import assert from 'node:assert/strict';

import { createAppController } from '../../src/application/app-controller.js';
import { paintCells, setBoardDimensions } from '../../src/application/project-commands.js';
import { createProjectRepository } from '../../src/storage/project-repository.js';
import { validateProject } from '../../src/domain/project-validator.js';
import { FakeStorage } from '../helpers/fake-storage.js';

function setup({ exporter = async () => ({ filename: 'board.png' }) } = {}) {
  const storage = new FakeStorage();
  let serial = 0;
  const repository = createProjectRepository({
    storage,
    validator: validateProject,
    clock: () => '2026-08-11T11:00:00.000Z',
  });
  const controller = createAppController({
    repository,
    exporter,
    idFactory: () => `project-${++serial}`,
    clock: () => '2026-08-11T10:00:00.000Z',
  });
  return { controller, repository, storage };
}

test('controller moves from a new dirty project to saved and back to dirty after a real edit', () => {
  const { controller } = setup();
  assert.equal(controller.getState().dirty, true);

  controller.save();
  assert.equal(controller.getState().dirty, false);
  assert.equal(controller.getState().status, 'saved');

  const unchanged = paintCells(controller.getState().project, {
    cells: [{ row: 0, column: 0 }],
    materialId: 'maple',
  });
  controller.dispatch(unchanged);
  assert.equal(controller.getState().dirty, false);

  const changed = paintCells(controller.getState().project, {
    cells: [{ row: 0, column: 0 }],
    materialId: 'walnut',
  });
  controller.dispatch(changed);
  assert.equal(controller.getState().dirty, true);
});

test('failed save preserves the dirty project and exposes the repository error', () => {
  const { controller, storage } = setup();
  const quota = new Error('quota');
  quota.name = 'QuotaExceededError';
  storage.setError = quota;

  const result = controller.save();

  assert.equal(result.ok, false);
  assert.equal(controller.getState().dirty, true);
  assert.equal(controller.getState().status, 'error');
  assert.equal(controller.getState().error.code, 'STORAGE_QUOTA_EXCEEDED');
});

test('requestOpen protects dirty work until the user chooses discard', () => {
  const { controller, repository } = setup();
  const firstId = controller.getState().project.id;
  controller.save();
  controller.newProject();
  const second = controller.getState().project;
  controller.save();
  controller.newProject();

  controller.requestOpen(second.id);
  assert.deepEqual(controller.getState().pendingIntent, { type: 'open', id: second.id });
  assert.notEqual(controller.getState().project.id, second.id);

  controller.resolvePending('discard');
  assert.equal(controller.getState().project.id, second.id);
  assert.equal(controller.getState().dirty, false);
  assert.equal(repository.load(firstId).id, firstId);
});

test('cancel keeps the current dirty project and clears the pending intent', () => {
  const { controller } = setup();
  const currentId = controller.getState().project.id;

  controller.newProject();
  controller.resolvePending('cancel');

  assert.equal(controller.getState().project.id, currentId);
  assert.equal(controller.getState().dirty, true);
  assert.equal(controller.getState().pendingIntent, null);
});

test('failed open leaves the current project untouched', () => {
  const { controller } = setup();
  const currentId = controller.getState().project.id;
  controller.save();

  const result = controller.requestOpen('missing');

  assert.equal(result.ok, false);
  assert.equal(controller.getState().project.id, currentId);
  assert.equal(controller.getState().error.code, 'PROJECT_NOT_FOUND');
});

test('exporting does not change the project dirty state', async () => {
  const { controller } = setup();

  const result = await controller.exportImage();

  assert.deepEqual(result, { ok: true, value: { filename: 'board.png' } });
  assert.equal(controller.getState().dirty, true);
  assert.equal(controller.getState().status, 'ready');
});

test('name and dimensions committed by the UI survive save, open, and export', async () => {
  let exportedProject;
  const { controller, repository } = setup({
    exporter: async (project) => {
      exportedProject = project;
      return { filename: 'p0-demo.png' };
    },
  });

  controller.renameProject('P0 demo');
  controller.dispatch(setBoardDimensions(controller.getState().project, {
    lengthMm: 420,
    widthMm: 310,
    thicknessMm: 45,
  }));
  const projectId = controller.getState().project.id;

  controller.save();
  const reopened = repository.load(projectId);
  await controller.exportImage();

  assert.equal(reopened.name, 'P0 demo');
  assert.deepEqual(reopened.board, {
    lengthMm: 420,
    widthMm: 310,
    thicknessMm: 45,
    rows: 6,
    columns: 8,
  });
  assert.equal(exportedProject.name, 'P0 demo');
  assert.equal(exportedProject.board.lengthMm, 420);
});
