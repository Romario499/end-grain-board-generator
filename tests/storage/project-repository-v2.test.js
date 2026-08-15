import test from 'node:test';
import assert from 'node:assert/strict';

import { validateProjectV2 } from '../../src/domain/project-v2.js';
import { migrateProjectToV2 } from '../../src/domain/project-migration.js';
import { CATALOG_KEY, createProjectRepository } from '../../src/storage/project-repository.js';
import { FakeStorage } from '../helpers/fake-storage.js';
import { createV1Project, createV2Project } from '../helpers/project-fixtures.js';

function repository(storage) {
  return createProjectRepository({
    storage,
    validator: validateProjectV2,
    migrate: migrateProjectToV2,
    clock: () => '2026-08-15T12:00:00.000Z',
  });
}

test('repository migrates a stored V1 project in memory without rewriting storage', () => {
  const storage = new FakeStorage();
  const legacy = createV1Project();
  const raw = JSON.stringify({ schemaVersion: 1, projects: { [legacy.id]: legacy } });
  storage.setItem(CATALOG_KEY, raw);

  const loaded = repository(storage).load(legacy.id);

  assert.equal(loaded.schemaVersion, 2);
  assert.equal(storage.getItem(CATALOG_KEY), raw);
});

test('repository saves a complete V2 project and lists it', () => {
  const storage = new FakeStorage();
  const saved = repository(storage).save(createV2Project());

  assert.equal(saved.schemaVersion, 2);
  assert.deepEqual(repository(storage).list(), [{ id: saved.id, name: saved.name, updatedAt: saved.updatedAt }]);
});
