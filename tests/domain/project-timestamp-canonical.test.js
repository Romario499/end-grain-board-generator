import test from 'node:test';
import assert from 'node:assert/strict';

import { createDefaultProject } from '../../src/domain/project-model.js';
import { validateProject } from '../../src/domain/project-validator.js';

test('validateProject rejects a valid but non-canonical ISO timestamp', () => {
  const project = createDefaultProject({
    id: 'project-1',
    now: '2026-08-11T10:00:00.000Z',
  });
  project.updatedAt = '2026-08-11T10:00:00Z';

  const result = validateProject(project);

  assert.equal(result.ok, false);
  assert.equal(result.errors.some((error) => error.code === 'PROJECT_TIMESTAMP'
    && error.path === 'updatedAt'), true);
});
