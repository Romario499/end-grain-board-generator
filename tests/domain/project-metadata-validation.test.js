import test from 'node:test';
import assert from 'node:assert/strict';

import { createDefaultProject } from '../../src/domain/project-model.js';
import { validateProject } from '../../src/domain/project-validator.js';
import {
  CATALOG_KEY,
  createProjectRepository,
} from '../../src/storage/project-repository.js';
import { FakeStorage } from '../helpers/fake-storage.js';

function fixture() {
  return createDefaultProject({
    id: 'project-1',
    now: '2026-08-11T10:00:00.000Z',
  });
}

test('validateProject rejects missing and invalid project timestamps', () => {
  const missingCreatedAt = fixture();
  delete missingCreatedAt.createdAt;
  const invalidUpdatedAt = fixture();
  invalidUpdatedAt.updatedAt = '2026-99-99T99:99:99.999Z';

  const missingResult = validateProject(missingCreatedAt);
  const invalidResult = validateProject(invalidUpdatedAt);

  assert.equal(missingResult.ok, false);
  assert.equal(missingResult.errors.some((error) => error.code === 'PROJECT_TIMESTAMP' && error.path === 'createdAt'), true);
  assert.equal(invalidResult.ok, false);
  assert.equal(invalidResult.errors.some((error) => error.code === 'PROJECT_TIMESTAMP' && error.path === 'updatedAt'), true);
});

test('repository reports a stored project without updatedAt as PROJECT_CORRUPT', () => {
  const project = fixture();
  delete project.updatedAt;
  const storage = new FakeStorage();
  storage.setItem(CATALOG_KEY, JSON.stringify({
    schemaVersion: 1,
    projects: { [project.id]: project },
  }));
  const repository = createProjectRepository({
    storage,
    validator: validateProject,
    clock: () => '2026-08-11T11:00:00.000Z',
  });

  assert.throws(
    () => repository.list(),
    (error) => error.code === 'PROJECT_CORRUPT' && error.message === 'Проект повреждён.',
  );
});
