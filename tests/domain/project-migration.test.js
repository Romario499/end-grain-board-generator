import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ProjectMigrationError,
  migrateProjectToV2,
} from '../../src/domain/project-migration.js';
import { createV1Project } from '../helpers/project-fixtures.js';

test('migrateProjectToV2 preserves V1 identity, timestamps and top-level editing data', () => {
  const legacy = createV1Project();

  const migrated = migrateProjectToV2(legacy);

  assert.equal(migrated.schemaVersion, 2);
  assert.equal(migrated.id, legacy.id);
  assert.equal(migrated.name, legacy.name);
  assert.equal(migrated.createdAt, legacy.createdAt);
  assert.equal(migrated.updatedAt, legacy.updatedAt);
  assert.deepEqual(
    {
      lengthMm: migrated.board.lengthMm,
      widthMm: migrated.board.widthMm,
      thicknessMm: migrated.board.thicknessMm,
      rows: migrated.board.rows,
      columns: migrated.board.columns,
    },
    legacy.board,
  );
  assert.deepEqual(migrated.palette, legacy.palette);
  assert.deepEqual(migrated.cells, legacy.cells);
  assert.equal('materials' in migrated, false);
  assert.equal('grid' in migrated.design, false);
  assert.equal('cells' in migrated.design, false);
});

test('migrateProjectToV2 marks V1 projects as millimeter freeform projects with explicit inputs', () => {
  const migrated = migrateProjectToV2(createV1Project());

  assert.equal(migrated.displayUnits, 'mm');
  assert.deepEqual(migrated.design, {
    mode: 'freeform',
    templateId: null,
    templateVersion: null,
    seed: null,
    parameters: {},
  });
  assert.equal('status' in migrated.manufacturing, false);
  assert.equal(migrated.manufacturing.kerfMm, 3.2);
  assert.deepEqual(migrated.manufacturing.allowances, {
    endTrimPerSideMm: null,
    finalTrimXPerSideMm: null,
    finalTrimYPerSideMm: null,
    planingPerFaceMm: null,
    sandingPerFaceMm: null,
    firstPanelThicknessPerFaceMm: null,
  });
  assert.equal(migrated.manufacturing.trimmingConvention, null);
  assert.equal(migrated.manufacturing.stockBoundary, 'prepared-blanks');
  assert.deepEqual(migrated.manufacturing.stock, []);
  assert.deepEqual(migrated.manufacturing.pricing, {});
  assert.deepEqual(migrated.presentation, {
    activeWorkspace: 'pattern',
    cameraPreset: 'isometric',
  });
});

test('migrateProjectToV2 does not mutate the V1 input', () => {
  const legacy = createV1Project();
  const before = structuredClone(legacy);

  migrateProjectToV2(legacy);

  assert.deepEqual(legacy, before);
});

test('migrateProjectToV2 returns a separate deep-equal copy for an existing V2 project', () => {
  const v2 = migrateProjectToV2(createV1Project());

  const repeated = migrateProjectToV2(v2);

  assert.deepEqual(repeated, v2);
  assert.notEqual(repeated, v2);
  assert.notEqual(repeated.board, v2.board);
  assert.notEqual(repeated.cells, v2.cells);
  assert.notEqual(repeated.design, v2.design);
});

test('migrateProjectToV2 rejects unknown and non-integer schema versions as unsupported', () => {
  for (const schemaVersion of [99, 2.1, '2']) {
    assert.throws(
      () => migrateProjectToV2({ ...createV1Project(), schemaVersion }),
      (error) => error instanceof ProjectMigrationError && error.code === 'UNSUPPORTED_SCHEMA',
    );
  }
});

test('migrateProjectToV2 rejects a damaged V1 project as corrupt', () => {
  const damaged = createV1Project();
  damaged.cells.pop();

  assert.throws(
    () => migrateProjectToV2(damaged),
    (error) => error instanceof ProjectMigrationError && error.code === 'PROJECT_CORRUPT',
  );
});

test('migrateProjectToV2 rejects non-serializable V2 data as corrupt', () => {
  const project = migrateProjectToV2(createV1Project());
  project.design.parameters = { calculate: () => 42 };

  assert.throws(
    () => migrateProjectToV2(project),
    (error) => error instanceof ProjectMigrationError && error.code === 'PROJECT_CORRUPT',
  );
});

test('migrateProjectToV2 rejects cyclic V2 data as corrupt', () => {
  const project = migrateProjectToV2(createV1Project());
  project.design.parameters.self = project.design.parameters;

  assert.throws(
    () => migrateProjectToV2(project),
    (error) => error instanceof ProjectMigrationError && error.code === 'PROJECT_CORRUPT',
  );
});
