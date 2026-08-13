import test from 'node:test';
import assert from 'node:assert/strict';

import { createDefaultProject } from '../../src/domain/project-model.js';
import { validateProject } from '../../src/domain/project-validator.js';
import {
  CATALOG_KEY,
  createProjectRepository,
} from '../../src/storage/project-repository.js';
import { FakeStorage } from '../helpers/fake-storage.js';

function fixture(id = 'project-1', name = 'Доска 1') {
  return {
    ...createDefaultProject({ id, now: '2026-08-11T10:00:00.000Z' }),
    name,
  };
}

function repository(storage, now = '2026-08-11T11:00:00.000Z') {
  return createProjectRepository({ storage, validator: validateProject, clock: () => now });
}

test('repository saves and loads a semantically identical complete project', () => {
  const storage = new FakeStorage();
  const project = fixture();
  project.cells[0] = { ...project.cells[0], materialId: 'walnut', orientation: 'M90' };

  const saved = repository(storage).save(project);
  const loaded = repository(storage).load(project.id);

  assert.equal(saved.updatedAt, '2026-08-11T11:00:00.000Z');
  assert.deepEqual(loaded, saved);
  assert.equal(project.updatedAt, '2026-08-11T10:00:00.000Z');
});

test('repository lists projects with the most recently updated first', () => {
  const storage = new FakeStorage();
  repository(storage, '2026-08-11T11:00:00.000Z').save(fixture('old', 'Старая'));
  repository(storage, '2026-08-11T12:00:00.000Z').save(fixture('new', 'Новая'));

  assert.deepEqual(repository(storage).list(), [
    { id: 'new', name: 'Новая', updatedAt: '2026-08-11T12:00:00.000Z' },
    { id: 'old', name: 'Старая', updatedAt: '2026-08-11T11:00:00.000Z' },
  ]);
});

test('repository reports PROJECT_NOT_FOUND without inventing a project', () => {
  const storage = new FakeStorage();

  assert.throws(() => repository(storage).load('missing'), (error) => error.code === 'PROJECT_NOT_FOUND');
});

test('repository rejects corrupted JSON and unsupported project schemas', () => {
  const storage = new FakeStorage();
  storage.setItem(CATALOG_KEY, '{broken');
  assert.throws(() => repository(storage).list(), (error) => error.code === 'PROJECT_CORRUPT');

  const project = fixture();
  project.schemaVersion = 2;
  storage.setItem(CATALOG_KEY, JSON.stringify({ schemaVersion: 1, projects: { [project.id]: project } }));
  assert.throws(() => repository(storage).load(project.id), (error) => error.code === 'UNSUPPORTED_SCHEMA');
});

test('failed quota write preserves the previous successful catalog', () => {
  const storage = new FakeStorage();
  const repo = repository(storage);
  repo.save(fixture('safe', 'Сохранённая'));
  const before = storage.getItem(CATALOG_KEY);
  const quotaError = new Error('quota');
  quotaError.name = 'QuotaExceededError';
  storage.setError = quotaError;

  assert.throws(() => repo.save(fixture('new', 'Не сохранится')), (error) => error.code === 'STORAGE_QUOTA_EXCEEDED');
  storage.setError = null;
  assert.equal(storage.getItem(CATALOG_KEY), before);
  assert.equal(repo.load('safe').name, 'Сохранённая');
});

test('unavailable storage is reported without replacing it with an empty catalog', () => {
  const storage = new FakeStorage();
  storage.getError = new Error('disabled');

  assert.throws(() => repository(storage).list(), (error) => error.code === 'STORAGE_UNAVAILABLE');
});
