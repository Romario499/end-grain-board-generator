# Checkerboard Manufacturing Vertical Slice Plan — Self-Review Amendments

> **For agentic workers:** This file is a mandatory part of `2026-08-15-checkerboard-manufacturing-vertical-slice.md`. If wording conflicts, this reviewed amendment wins. Use superpowers:subagent-driven-development or superpowers:executing-plans and read both files before Task 1.

**Goal:** Устранить найденные self-review неоднозначности implementation plan без изменения утверждённого design-spec.

**Spec:** `docs/superpowers/specs/2026-08-15-checkerboard-manufacturing-vertical-slice-design.md`

## Self-Review Result

- Spec coverage: все разделы spec покрыты Tasks 1–13.
- Placeholder scan: `TBD`, `TODO`, `FIXME`, «implement later», «similar to» отсутствуют.
- Type consistency: calculation status и manufacturing trust status разделены ниже.
- Fixture consistency: все ранее кратко названные test helpers получают точные файлы и exports ниже.
- Scope: один вертикальный срез; каждый Task заканчивается самостоятельным проверяемым коммитом.

## Amendment 1: Общие test fixtures

Task 1 дополнительно создаёт `tests/helpers/project-fixtures.js` и добавляет его в собственный commit.

```js
import { migrateProjectToV2 } from '../../src/domain/project-migration.js';

export function createV1Project(overrides = {}) {
  const base = {
    schemaVersion: 1,
    id: 'fixture-project',
    name: 'Fixture board',
    createdAt: '2026-08-15T10:00:00.000Z',
    updatedAt: '2026-08-15T10:00:00.000Z',
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
      { row: 0, column: 1, materialId: 'walnut', orientation: 'R0' },
      { row: 1, column: 0, materialId: 'walnut', orientation: 'R0' },
      { row: 1, column: 1, materialId: 'maple', orientation: 'R0' },
    ],
  };
  return structuredClone({ ...base, ...overrides });
}

export function createV2Project(overrides = {}) {
  const base = migrateProjectToV2(createV1Project());
  return structuredClone({ ...base, ...overrides });
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
```

Task 1 file list and commit command include `tests/helpers/project-fixtures.js`. Existing local `createV1Project` copies in V2 tests are replaced with imports.

## Amendment 2: Канонический manufacturing fixture создаётся в Task 5

Task 5 создаёт `tests/fixtures/checkerboard-450x300x40.js`. Task 13 modifies, а не creates этот файл.

```js
import { createTemplateProject } from '../helpers/project-fixtures.js';

const project = createTemplateProject();
project.board = {
  ...project.board,
  lengthMm: 450,
  widthMm: 300,
  thicknessMm: 40,
  rows: 6,
  columns: 8,
};
project.manufacturing = {
  ...project.manufacturing,
  kerfMm: 3.2,
  allowances: {
    endTrimPerSideMm: 5,
    finalTrimXPerSideMm: 5,
    finalTrimYPerSideMm: 0,
    planingPerFaceMm: 1,
    sandingPerFaceMm: 0.5,
    firstPanelThicknessPerFaceMm: 0,
  },
  trimmingConvention: 'two-end-cuts',
  stockBoundary: 'prepared-blanks',
};

export const CHECKERBOARD_450_300_40 = Object.freeze({
  project,
  recipeSource: {
    recipeId: 'checkerboard-reverse-slices',
    recipeVersion: 1,
    rows: 6,
    columns: 8,
    materialIds: ['maple', 'walnut'],
    startMaterialId: 'maple',
  },
  expected: {
    cellXmm: 56.25,
    cellYmm: 50,
    crosscutSliceMm: 43,
    firstPanelLengthMm: 290.4,
    grossPreparedVolumeMm3: 6_679_200,
    netVolumeMm3: 5_400_000,
  },
});

export function createCompilerInput() {
  return {
    project: structuredClone(CHECKERBOARD_450_300_40.project),
    recipeSource: structuredClone(CHECKERBOARD_450_300_40.recipeSource),
    compilerVersion: 1,
    projectRevision: 1,
    compiledAt: '2026-08-15T12:00:00.000Z',
  };
}
```

В Task 5 `createCompilerInput(...)` заменяется на `createCompilerInput()` с явным изменением возвращённого объекта при variant tests. В Tasks 6–12:

```js
const plan = compileCheckerboardRecipe(createCompilerInput());
const ledger = calculatePreparedBlankUsage(plan);
const validation = validateManufacturingPlan({
  project: CHECKERBOARD_450_300_40.project,
  plan,
  ledger,
});
```

`plan450x300x40`, `validateFixture`, `fixtureState` и `fixtureInput` не являются production APIs и не используются как неописанные globals.

## Amendment 3: Unsupported template result

Task 4 определяет helper до `generatePattern`:

```js
function unsupportedTemplateResult(templateId, templateVersion) {
  return {
    cells: [],
    recipeSource: null,
    normalizedParameters: {},
    diagnostics: [{
      severity: 'error',
      code: 'PATTERN_TEMPLATE_UNSUPPORTED',
      path: 'design.templateId',
      stageId: null,
      partIds: [],
      messageKey: 'PATTERN_TEMPLATE_UNSUPPORTED',
      params: { templateId, templateVersion },
    }],
  };
}
```

## Amendment 4: Feasibility test без неописанного diagnostic helper

Task 7 status test использует прямые asserts:

```js
const project = structuredClone(CHECKERBOARD_450_300_40.project);
project.manufacturing.stock = [];
const result = validateManufacturingPlan({ project, plan, ledger });

assert.equal(result.geometryStatus, 'verified');
assert.equal(result.stockStatus, 'unverified');
assert.equal(result.overallStatus, 'experimental');
assert.equal(
  result.diagnostics.some((item) => item.code === 'STOCK_NOT_PROVIDED'),
  true,
);
```

`diagnosticWithCode` не вводится.

## Amendment 5: Calculation status и trust status не смешиваются

Application state:

```text
manufacturing.status = idle | compiling | ready | stale | failed
manufacturing.validation.overallStatus = verified | experimental | concept | blocked
```

Print API имеет точную сигнатуру:

```js
export function canPrintManufacturing({ calculationStatus, overallStatus }) {
  return calculationStatus === 'ready'
    && (overallStatus === 'verified' || overallStatus === 'experimental');
}
```

Task 12 RED tests:

```js
assert.equal(canPrintManufacturing({ calculationStatus: 'stale', overallStatus: 'verified' }), false);
assert.equal(canPrintManufacturing({ calculationStatus: 'ready', overallStatus: 'blocked' }), false);
assert.equal(canPrintManufacturing({ calculationStatus: 'ready', overallStatus: 'concept' }), false);
assert.equal(canPrintManufacturing({ calculationStatus: 'ready', overallStatus: 'experimental' }), true);
assert.equal(canPrintManufacturing({ calculationStatus: 'ready', overallStatus: 'verified' }), true);
```

`buildPrintReport` test input:

```js
const input = {
  project: CHECKERBOARD_450_300_40.project,
  plan,
  validation,
  ledger,
};
const report = buildPrintReport(input);

assert.doesNotThrow(() => JSON.stringify(report));
assert.equal(report.project.revision, plan.projectRevision);
assert.equal(report.assumptions.some((item) => item.code === 'STOCK_NOT_PROVIDED'), true);
assert.equal(report.parts.length, plan.parts.length);
```

## Amendment 6: UI fixture state

Task 10 creates the state inline after compiling the shared fixture:

```js
const state = {
  status: 'ready',
  plan,
  validation,
  ledger,
  diagnostics: validation.diagnostics,
};
const handlers = {
  onSelectPart() {},
  onSelectDiagnostic() {},
};

renderManufacturingView(container, state, handlers);
assert.equal(container.querySelectorAll('[data-part-id]').length, plan.parts.length);
```

## Amendment 7: Repository private helpers

Task 2 не вводит неописанные public APIs. Private helpers имеют точное поведение:

```js
function mapMigrationError(error) {
  if (error?.code === 'UNSUPPORTED_SCHEMA') {
    return new ProjectRepositoryError('UNSUPPORTED_SCHEMA', 'Версия проекта не поддерживается.', error);
  }
  return new ProjectRepositoryError('PROJECT_CORRUPT', 'Проект повреждён.', error);
}

function validateOrThrow(project) {
  const result = validator(project);
  if (result.ok) return;
  const unsupported = result.errors.some((item) => item.code === 'UNSUPPORTED_SCHEMA');
  throw new ProjectRepositoryError(
    unsupported ? 'UNSUPPORTED_SCHEMA' : 'PROJECT_CORRUPT',
    unsupported ? 'Версия проекта не поддерживается.' : 'Проект повреждён.',
  );
}
```

`writeCatalogProject` означает существующий атомарный `nextCatalog → storage.setItem` блок из repository; его не экспортировать и не менять storage error mapping.

## Execution Rule

Перед началом каждого Task исполнитель читает соответствующий раздел основного plan и этот amendment. Файлы добавляются в commits только точными path lists; незакоммиченные параллельные файлы вне Task не включаются.
