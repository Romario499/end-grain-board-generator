import { migrateProjectToV2 } from '../../src/domain/project-migration.js';

export function createV1Project(overrides = {}) {
  const base = {
    schemaVersion: 1,
    id: 'fixture-project',
    name: 'Fixture board',
    createdAt: '2026-08-15T10:00:00.000Z',
    updatedAt: '2026-08-15T10:30:00.000Z',
    board: {
      lengthMm: 400,
      widthMm: 300,
      thicknessMm: 40,
      rows: 2,
      columns: 2,
    },
    palette: [
      { id: 'maple', name: 'Maple', baseColor: '#f0d8ad', accentColor: '#c29a62' },
      { id: 'walnut', name: 'Walnut', baseColor: '#4d2c1d', accentColor: '#8b5a37' },
      { id: 'cherry', name: 'Cherry', baseColor: '#a84e36', accentColor: '#e88962' },
    ],
    cells: [
      { row: 0, column: 0, materialId: 'maple', orientation: 'R0' },
      { row: 0, column: 1, materialId: 'walnut', orientation: 'R90' },
      { row: 1, column: 0, materialId: 'cherry', orientation: 'M0' },
      { row: 1, column: 1, materialId: 'maple', orientation: 'M90' },
    ],
  };

  return structuredClone({ ...base, ...overrides });
}

export function createV2Project(overrides = {}) {
  return {
    ...migrateProjectToV2(createV1Project()),
    ...structuredClone(overrides),
  };
}

export function createTemplateProject(overrides = {}) {
  const base = createV2Project();
  return {
    ...base,
    ...structuredClone(overrides),
    design: {
      mode: 'template',
      templateId: 'classic-checkerboard-reverse-slices',
      templateVersion: 1,
      seed: 42,
      parameters: {
        materialIds: ['maple', 'walnut'],
        startMaterialId: 'maple',
      },
      ...(overrides.design ?? {}),
    },
  };
}
