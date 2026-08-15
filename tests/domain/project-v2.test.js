import test from 'node:test';
import assert from 'node:assert/strict';

import {
  PROJECT_SCHEMA_VERSION_V2,
  createProjectV2,
  validateProjectV2,
} from '../../src/domain/project-v2.js';
import { createTemplateProject, createV2Project } from '../helpers/project-fixtures.js';

test('createProjectV2 preserves the P0 top-level editing contract', () => {
  const project = createProjectV2({
    id: 'new-v2',
    now: '2026-08-15T12:00:00.000Z',
  });

  assert.equal(PROJECT_SCHEMA_VERSION_V2, 2);
  assert.equal(project.schemaVersion, 2);
  assert.equal(Array.isArray(project.palette), true);
  assert.equal(Array.isArray(project.cells), true);
  assert.equal(project.board.rows, 6);
  assert.equal(project.board.columns, 8);
  assert.equal('materials' in project, false);
  assert.equal('grid' in project.design, false);
  assert.equal('cells' in project.design, false);
  assert.equal('status' in project.manufacturing, false);
  assert.equal('edgeProfile' in project.presentation, false);
  assert.deepEqual(validateProjectV2(project), { ok: true, errors: [] });
});

test('validateProjectV2 accepts a migrated freeform project', () => {
  assert.deepEqual(validateProjectV2(createV2Project()), { ok: true, errors: [] });
});

test('validateProjectV2 accepts a complete template reference', () => {
  assert.deepEqual(validateProjectV2(createTemplateProject()), { ok: true, errors: [] });
});

test('validateProjectV2 rejects a non-positive or non-integer template version', () => {
  for (const templateVersion of [false, 0, -1, 1.5]) {
    const project = createTemplateProject({ design: { templateVersion } });
    const result = validateProjectV2(project);

    assert.equal(result.ok, false);
    assert.equal(result.errors.some((error) => error.path === 'design.templateVersion'), true);
  }
});

test('validateProjectV2 rejects a design cell with an unknown material reference', () => {
  const project = createV2Project();
  project.cells[0].materialId = 'missing-material';

  const result = validateProjectV2(project);

  assert.equal(result.ok, false);
  assert.equal(result.errors.some((error) => error.code === 'MATERIAL_REFERENCE'), true);
});

test('validateProjectV2 rejects an unsupported display unit', () => {
  const project = createV2Project({ displayUnits: 'cm' });

  const result = validateProjectV2(project);

  assert.equal(result.ok, false);
  assert.equal(result.errors.some((error) => error.path === 'displayUnits'), true);
});

test('validateProjectV2 rejects a freeform design that retains a template reference', () => {
  const project = createV2Project();
  project.design.templateId = 'classic-checkerboard-reverse-slices';
  project.design.templateVersion = 1;

  const result = validateProjectV2(project);

  assert.equal(result.ok, false);
  assert.equal(result.errors.some((error) => error.code === 'FREEFORM_TEMPLATE'), true);
});

test('validateProjectV2 rejects non-serializable project data', () => {
  const project = createV2Project();
  project.design.parameters = { calculate: () => 42 };

  const result = validateProjectV2(project);

  assert.equal(result.ok, false);
  assert.equal(result.errors.some((error) => error.code === 'PROJECT_SERIALIZATION'), true);
});

test('validateProjectV2 accepts an explicitly selected end-grain flattening method', () => {
  const project = createV2Project();
  project.manufacturing.equipment.flatteningMethod = 'router-sled';

  assert.deepEqual(validateProjectV2(project), { ok: true, errors: [] });
});
