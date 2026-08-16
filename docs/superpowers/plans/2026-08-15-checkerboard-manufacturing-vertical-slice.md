# Checkerboard Manufacturing Vertical Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Превратить существующий P0-редактор в первый сквозной производственный инструмент: детерминированная шахматная переклейка, точный рецепт, баланс материала, проверка реализуемости, Canvas 2.5D и печатная мастер-инструкция.

**Architecture:** Project V2 остаётся добавочно совместимым с P0: `board`, `palette` и `cells` сохраняются на верхнем уровне, а `design`, `manufacturing` и `presentation` добавляют намерение пользователя. Чистые доменные модули генерируют узор, компилируют ManufacturingPlan, проверяют реализуемость и считают ledger; application-слой управляет инвалидированием, UI только отображает состояние.

**Tech Stack:** Browser ES modules, Node.js built-in test runner, HTML, CSS, Canvas 2D, localStorage; без runtime- и dev-зависимостей.

**Spec:** `docs/superpowers/specs/2026-08-15-checkerboard-manufacturing-vertical-slice-design.md`

## Global Constraints

- Канонические расчётные и сохранённые единицы — миллиметры; `1 in = 25.4 mm`.
- `board`, `palette` и `cells` остаются верхнеуровневыми полями Project V2.
- V1 мигрируется в памяти и не перезаписывается до явного сохранения.
- Неизвестная будущая schema version отклоняется.
- Ручное изменение клетки переводит шаблон в `freeform/concept` и инвалидирует производственный план.
- Производственные функции чистые и не обращаются к DOM, Canvas или localStorage.
- Для первого checkerboard-рецепта `columns` должно быть чётным.
- Первый verified geometry-рецепт использует `finalTrimYPerSideMm = 0`.
- Обычный thickness planer не является допустимым методом выравнивания готовой торцевой сборки.
- Без фактического stock геометрия может быть `verified`, но общий статус остаётся `experimental`.
- Печать запрещена для `concept`, `blocked` и `stale`.
- Пользовательские строки выводятся через DOM API и `textContent`.
- Новые зависимости не устанавливаются.
- Каждый task завершается focused tests, полным `npm test`, `npm run check` и отдельным коммитом.

## Current Baseline

- Последний документальный коммит: `d7b5f31`.
- В рабочем дереве уже есть незакоммиченный RED-цикл: `project-v2.js`, `project-migration.js`, `units.js` и три test-файла.
- Текущая база: 71 тест, 66 проходят, 5 падают.
- Эти файлы не удаляются. Task 1 приводит их к утверждённой additive-схеме и завершает RED → GREEN.

## File Map

```text
src/domain/project-v2.js                      Project V2 factory и validator
src/domain/project-migration.js               немутирующая V1 → V2 миграция
src/domain/units.js                           точные единицы и форматирование границы UI
src/domain/seeded-random.js                   детерминированный PRNG
src/domain/patterns/pattern-registry.js       реестр версионированных шаблонов
src/domain/patterns/checkerboard-pattern.js   генератор первого шаблона
src/domain/manufacturing/fingerprint.js       стабильный input fingerprint
src/domain/manufacturing/checkerboard-compiler.js  геометрия и граф операций
src/domain/manufacturing/material-ledger.js   баланс объёма и отходов
src/domain/manufacturing/feasibility.js       статусы и диагностика
src/domain/manufacturing/print-report.js      сериализуемая модель печати
src/application/project-commands.js           immutable-команды Project V2
src/application/app-controller.js             orchestration и stale-инвариант
src/storage/project-repository.js             V1 load/migrate и V2 save
src/rendering/volume-render-plan.js            чистый 2.5D render plan
src/rendering/canvas-renderer.js               отрисовка top/volume plan
src/ui/dom-view.js                             wiring UI без доменной логики
src/ui/manufacturing-view.js                   безопасный DOM производственных таблиц
src/ui/print-view.js                           безопасный DOM печатного отчёта
index.html                                     вкладки и формы
src/styles/app.css                             layout, статусы и print CSS
tests/...                                      focused domain/application/UI regression
```

---

### Task 1: Завершить Project V2, миграцию и units RED-цикл

**Files:**
- Modify: `src/domain/project-v2.js`
- Modify: `src/domain/project-migration.js`
- Modify: `src/domain/units.js`
- Modify: `tests/domain/project-v2.test.js`
- Modify: `tests/domain/project-migration.test.js`
- Modify: `tests/domain/units.test.js`

**Interfaces:**
- Consumes: `BOARD_LIMITS`, `ORIENTATIONS`, V1 `validateProject(project)`.
- Produces: `PROJECT_SCHEMA_VERSION_V2`, `createProjectV2({ id, now })`, `validateProjectV2(project)`, `migrateProjectToV2(project)`, `ProjectMigrationError`, `millimetersToInches`, `inchesToMillimeters`, `formatLength`, `parseLengthInput`.

- [ ] **Step 1: Переписать RED-fixtures на additive Project V2**

Зафиксировать, что P0-поля не перемещаются внутрь `design`:

```js
test('migrateProjectToV2 preserves the P0 top-level editing contract', () => {
  const legacy = createV1Project();
  const migrated = migrateProjectToV2(legacy);

  assert.deepEqual(migrated.board, legacy.board);
  assert.deepEqual(migrated.palette, legacy.palette);
  assert.deepEqual(migrated.cells, legacy.cells);
  assert.equal('materials' in migrated, false);
  assert.equal('grid' in migrated.design, false);
  assert.equal('cells' in migrated.design, false);
});
```

Удалить ожидание persisted `manufacturing.status`; статусы являются производными. Добавить проверки точной структуры:

```js
assert.deepEqual(migrated.design, {
  mode: 'freeform',
  templateId: null,
  templateVersion: null,
  seed: null,
  parameters: {},
});
assert.equal(migrated.manufacturing.stockBoundary, 'prepared-blanks');
assert.equal(migrated.manufacturing.allowances.finalTrimYPerSideMm, null);
```

- [ ] **Step 2: Запустить focused tests и подтвердить RED**

Run: `node --test tests/domain/project-v2.test.js tests/domain/project-migration.test.js tests/domain/units.test.js`

Expected: FAIL на moved `materials/design.cells`, persisted status, неверном коде schema error и неполной serializability validation.

- [ ] **Step 3: Реализовать каноническую V2 factory и validator**

Использовать единую структуру:

```js
export function createProjectV2({ id, now }) {
  const legacy = createDefaultProject({ id, now });
  return {
    ...legacy,
    schemaVersion: 2,
    displayUnits: 'mm',
    board: {
      ...legacy.board,
      edgeProfile: 'square',
      edgeProfileSizeMm: 0,
    },
    design: {
      mode: 'freeform',
      templateId: null,
      templateVersion: null,
      seed: null,
      parameters: {},
    },
    manufacturing: {
      kerfMm: 3.2,
      allowances: {
        endTrimPerSideMm: null,
        finalTrimXPerSideMm: null,
        finalTrimYPerSideMm: null,
        planingPerFaceMm: null,
        sandingPerFaceMm: null,
        firstPanelThicknessPerFaceMm: null,
      },
      trimmingConvention: null,
      stockBoundary: 'prepared-blanks',
      equipment: {
        flatteningMethod: null,
        maxWidthMm: null,
        maxLengthMm: null,
        minSafePartWidthMm: null,
        minSafePartLengthMm: null,
      },
      stock: [],
      pricing: {},
    },
    presentation: {
      activeWorkspace: 'pattern',
      cameraPreset: 'isometric',
    },
  };
}
```

`validateProjectV2` должен валидировать JSON-serializable `design.parameters`, целый положительный templateVersion в template-mode и синхронность `board.edgeProfile` только с собственным полем, без дублирования в presentation.

- [ ] **Step 4: Исправить миграционные error codes**

```js
export function migrateProjectToV2(project) {
  if (!isRecord(project)) throw corruptProject();
  if (!Number.isInteger(project.schemaVersion)) {
    throw new ProjectMigrationError('UNSUPPORTED_SCHEMA', 'Версия проекта не поддерживается.');
  }
  if (project.schemaVersion === 1) return migrateV1Project(project);
  if (project.schemaVersion === 2) return cloneSerializableValidatedV2(project);
  throw new ProjectMigrationError('UNSUPPORTED_SCHEMA', 'Версия проекта не поддерживается.');
}
```

Клонирование V2 сначала проверяет сериализуемость рекурсивным validator, затем `structuredClone` или JSON round-trip. Функции, symbol, bigint и циклические ссылки дают `PROJECT_CORRUPT`.

- [ ] **Step 5: Дополнить units на границе UI**

```js
export function formatLength(millimeters, units) {
  const value = units === 'in' ? millimetersToInches(millimeters) : millimeters;
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: units === 'in' ? 4 : 2 }).format(value);
}

export function parseLengthInput(value, units) {
  const normalized = String(value).trim().replace(',', '.');
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) throw new RangeError('Length must be finite.');
  return units === 'in' ? inchesToMillimeters(parsed) : parsed;
}
```

- [ ] **Step 6: Проверить GREEN и полную регрессию**

Run: `node --test tests/domain/project-v2.test.js tests/domain/project-migration.test.js tests/domain/units.test.js`

Expected: PASS.

Run: `npm test`

Expected: все tests PASS.

Run: `npm run check`

Expected: tests и `node --check` PASS.

- [ ] **Step 7: Commit**

```bash
git add src/domain/project-v2.js src/domain/project-migration.js src/domain/units.js tests/domain/project-v2.test.js tests/domain/project-migration.test.js tests/domain/units.test.js
git commit -m "feat: add additive project v2 foundation"
```

---

### Task 2: Подключить V2 к repository и запуску приложения

**Files:**
- Modify: `src/storage/project-repository.js`
- Modify: `src/application/app-controller.js`
- Modify: `src/main.js`
- Modify: `tests/storage/project-repository.test.js`
- Modify: `tests/application/app-controller.test.js`

**Interfaces:**
- Consumes: `createProjectV2`, `migrateProjectToV2`, `validateProjectV2`.
- Produces: repository, который загружает V1 как V2 в памяти и сохраняет только валидный V2; controller всегда держит Project V2.

- [ ] **Step 1: Написать RED repository tests**

```js
test('repository loads V1 as V2 without rewriting storage', () => {
  storage.setItem(CATALOG_KEY, JSON.stringify({
    schemaVersion: 1,
    projects: { legacy: createV1Project() },
  }));
  const before = storage.getItem(CATALOG_KEY);

  const loaded = repository.load('legacy');

  assert.equal(loaded.schemaVersion, 2);
  assert.equal(storage.getItem(CATALOG_KEY), before);
});

test('explicit save persists the migrated project as V2', () => {
  const loaded = repository.load('legacy');
  repository.save(loaded);
  assert.equal(readStoredProject('legacy').schemaVersion, 2);
});
```

- [ ] **Step 2: Запустить focused tests и подтвердить RED**

Run: `node --test tests/storage/project-repository.test.js tests/application/app-controller.test.js`

Expected: FAIL, потому что repository вызывает только V1 validator, а controller создаёт V1.

- [ ] **Step 3: Расширить repository явными migrate/validator dependencies**

```js
export function createProjectRepository({ storage, validator, migrate, clock }) {
  function load(id) {
    const stored = readCatalog().projects[id];
    if (!stored) throw new ProjectRepositoryError('PROJECT_NOT_FOUND', 'Проект не найден.');
    try {
      return clone(migrate(stored));
    } catch (error) {
      throw mapMigrationError(error);
    }
  }

  function save(project) {
    const saved = clone({ ...project, updatedAt: clock() });
    validateOrThrow(saved);
    writeCatalogProject(saved);
    return clone(saved);
  }
}
```

Catalog container и `CATALOG_KEY` остаются v1: его версия описывает контейнер, а не schemaVersion вложенных проектов.

- [ ] **Step 4: Перевести controller и main на V2**

```js
const repository = createProjectRepository({
  storage: window.localStorage,
  validator: validateProjectV2,
  migrate: migrateProjectToV2,
  clock: () => new Date().toISOString(),
});
```

В `createAppController` заменить обе точки `createDefaultProject` на `createProjectV2`. P0 продолжает работать, потому что V2 сохранил `board.rows`, `palette` и `cells`.

- [ ] **Step 5: Проверить focused и full GREEN**

Run: `node --test tests/storage/project-repository.test.js tests/application/app-controller.test.js`

Expected: PASS.

Run: `npm test`

Expected: PASS.

Run: `npm run check`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/storage/project-repository.js src/application/app-controller.js src/main.js tests/storage/project-repository.test.js tests/application/app-controller.test.js
git commit -m "feat: load legacy projects into project v2"
```

---

### Task 3: Units-команды, manufacturing inputs и demotion в freeform

**Files:**
- Modify: `src/application/project-commands.js`
- Create: `tests/application/project-v2-commands.test.js`
- Modify: `tests/application/app-controller.test.js`

**Interfaces:**
- Consumes: additive Project V2.
- Produces: `setDisplayUnits`, `setManufacturingInputs`, `setTemplateDesign`, `demoteToFreeform`; изменённые `paintCells`, `transformCells`, `resizeGrid`.

- [ ] **Step 1: Написать RED tests для invariant ручного редактирования**

```js
test('paintCells demotes a template project without discarding provenance', () => {
  const project = createTemplateProject();
  const result = paintCells(project, {
    cells: [{ row: 0, column: 0 }],
    materialId: 'walnut',
  });

  assert.equal(result.project.design.mode, 'freeform');
  assert.equal(result.project.design.templateId, null);
  assert.equal(result.project.design.templateVersion, null);
  assert.equal(result.project.design.parameters.sourceTemplateId, 'classic-checkerboard-reverse-slices');
});
```

Также проверить, что no-op paint не демотирует проект, а изменение orientation или grid демотирует.

- [ ] **Step 2: Написать RED tests для units и manufacturing inputs**

```js
assert.equal(setDisplayUnits(project, 'in').project.displayUnits, 'in');
assert.deepEqual(setDisplayUnits(project, 'in').project.board, project.board);

const result = setManufacturingInputs(project, {
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
});
assert.equal(result.changed, true);
```

- [ ] **Step 3: Запустить tests и подтвердить RED**

Run: `node --test tests/application/project-v2-commands.test.js`

Expected: FAIL с отсутствующими exports.

- [ ] **Step 4: Реализовать immutable-команды**

```js
function demoteToFreeform(project) {
  if (project.design.mode !== 'template') return project;
  return {
    ...project,
    design: {
      mode: 'freeform',
      templateId: null,
      templateVersion: null,
      seed: null,
      parameters: {
        sourceTemplateId: project.design.templateId,
        sourceTemplateVersion: project.design.templateVersion,
        sourceSeed: project.design.seed,
      },
    },
  };
}
```

`paintCells`, `transformCells`, `resizeGrid` вызывают demotion только при `changed === true`.

- [ ] **Step 5: Проверить GREEN и regression**

Run: `node --test tests/application/project-v2-commands.test.js tests/application/project-commands.test.js`

Expected: PASS.

Run: `npm test`

Expected: PASS.

Run: `npm run check`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/application/project-commands.js tests/application/project-v2-commands.test.js tests/application/app-controller.test.js
git commit -m "feat: add project v2 editing commands"
```

---

### Task 4: Детерминированный seed и checkerboard template registry

**Files:**
- Create: `src/domain/seeded-random.js`
- Create: `src/domain/patterns/checkerboard-pattern.js`
- Create: `src/domain/patterns/pattern-registry.js`
- Create: `tests/domain/seeded-random.test.js`
- Create: `tests/domain/checkerboard-pattern.test.js`
- Create: `tests/domain/pattern-registry.test.js`

**Interfaces:**
- Consumes: Project V2 board/palette and integer seed.
- Produces: `createSeededRandom(seed)`, `generateCheckerboardPattern(input)`, `generatePattern(input)`, `listPatternTemplates()`.

- [ ] **Step 1: Написать RED deterministic PRNG tests**

```js
test('same seed produces the same sequence', () => {
  const left = createSeededRandom(123456);
  const right = createSeededRandom(123456);
  assert.deepEqual(
    [left(), left(), left(), left()],
    [right(), right(), right(), right()],
  );
});
```

Зафиксировать golden sequence для seed `123456`, чтобы алгоритм не менялся незаметно после сохранения проектов.

- [ ] **Step 2: Написать RED checkerboard contract tests**

```js
const result = generateCheckerboardPattern({
  rows: 6,
  columns: 8,
  materialIds: ['maple', 'walnut'],
  seed: 42,
});

assert.equal(result.cells.length, 48);
assert.equal(result.cells[0].materialId, result.normalizedParameters.startMaterialId);
assert.equal(result.cells[1].materialId === result.cells[0].materialId, false);
assert.deepEqual(result.diagnostics, []);
assert.equal(result.recipeSource.recipeId, 'checkerboard-reverse-slices');
```

Нечётные columns возвращают error diagnostic `CHECKERBOARD_COLUMNS_MUST_BE_EVEN`; одинаковые материалы — `CHECKERBOARD_MATERIALS_MUST_DIFFER`. Входы не мутируются.

- [ ] **Step 3: Запустить tests и подтвердить RED**

Run: `node --test tests/domain/seeded-random.test.js tests/domain/checkerboard-pattern.test.js tests/domain/pattern-registry.test.js`

Expected: FAIL с `ERR_MODULE_NOT_FOUND`.

- [ ] **Step 4: Реализовать PRNG и generator**

Использовать фиксированный 32-bit алгоритм mulberry32:

```js
export function createSeededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6D2B79F5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
```

Генератор создаёт row-major cells с orientation `R0`; seed детерминированно выбирает только стартовый материал.

- [ ] **Step 5: Реализовать versioned registry**

```js
const templates = new Map([
  ['classic-checkerboard-reverse-slices@1', {
    id: 'classic-checkerboard-reverse-slices',
    version: 1,
    name: 'Классическая шахматная переклейка',
    generate: generateCheckerboardPattern,
  }],
]);

export function generatePattern({ templateId, templateVersion, ...input }) {
  const template = templates.get(`${templateId}@${templateVersion}`);
  if (!template) return unsupportedTemplateResult(templateId, templateVersion);
  return template.generate(input);
}
```

- [ ] **Step 6: Проверить GREEN, performance и full regression**

Run: `node --test tests/domain/seeded-random.test.js tests/domain/checkerboard-pattern.test.js tests/domain/pattern-registry.test.js`

Expected: PASS; generation fixture выполняется быстрее 100 ms.

Run: `npm test`

Expected: PASS.

Run: `npm run check`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/domain/seeded-random.js src/domain/patterns/checkerboard-pattern.js src/domain/patterns/pattern-registry.js tests/domain/seeded-random.test.js tests/domain/checkerboard-pattern.test.js tests/domain/pattern-registry.test.js
git commit -m "feat: add deterministic checkerboard template"
```

---

### Task 5: Скомпилировать checkerboard ManufacturingPlan

**Files:**
- Create: `src/domain/manufacturing/fingerprint.js`
- Create: `src/domain/manufacturing/checkerboard-compiler.js`
- Create: `tests/domain/manufacturing-fingerprint.test.js`
- Create: `tests/domain/checkerboard-compiler.test.js`

**Interfaces:**
- Consumes: `{ project, recipeSource, compilerVersion, projectRevision, compiledAt }`.
- Produces: `createInputFingerprint(value)`, `compileCheckerboardRecipe(input)` returning serializable `{ compilerVersion, projectRevision, inputFingerprint, compiledAt, parts, operations, diagnostics, finalPartId }`.

- [ ] **Step 1: Написать RED fingerprint tests**

```js
assert.equal(
  createInputFingerprint({ b: 2, a: 1 }),
  createInputFingerprint({ a: 1, b: 2 }),
);
assert.notEqual(
  createInputFingerprint({ a: 1 }),
  createInputFingerprint({ a: 2 }),
);
```

Fingerprint использует canonical JSON с сортировкой object keys и FNV-1a 32-bit. Он является cache identity, не подписью безопасности.

- [ ] **Step 2: Написать RED fixture test 450 × 300 × 40**

```js
const plan = compileCheckerboardRecipe(createCompilerInput({
  lengthMm: 450,
  widthMm: 300,
  thicknessMm: 40,
  rows: 6,
  columns: 8,
  kerfMm: 3.2,
  endTrimPerSideMm: 5,
  finalTrimXPerSideMm: 5,
  finalTrimYPerSideMm: 0,
  planingPerFaceMm: 1,
  sandingPerFaceMm: 0.5,
}));

assert.equal(plan.geometry.cellXmm, 56.25);
assert.equal(plan.geometry.cellYmm, 50);
assert.equal(plan.geometry.crosscutSliceMm, 43);
assert.equal(plan.geometry.firstPanelLengthMm, 290.4);
assert.equal(plan.parts.find((part) => part.partId === 'panel-01').grainAxis, 'Y');
assert.equal(plan.parts.find((part) => part.partId === plan.finalPartId).grainAxis, 'Z');
```

- [ ] **Step 3: Написать RED topology и ID tests**

Проверить 11 stage IDs, шесть crosscut slices, восемь rail roles, reverse операций для нечётных row-index, `sourcePartIds` и полную детерминированность `deepEqual` при фиксированном `compiledAt`.

- [ ] **Step 4: Запустить tests и подтвердить RED**

Run: `node --test tests/domain/manufacturing-fingerprint.test.js tests/domain/checkerboard-compiler.test.js`

Expected: FAIL с `ERR_MODULE_NOT_FOUND`.

- [ ] **Step 5: Реализовать формулы и axis contract**

```js
const cellXmm = board.lengthMm / board.columns;
const cellYmm = board.widthMm / board.rows;
const crosscutSliceMm = board.thicknessMm
  + (2 * allowances.planingPerFaceMm)
  + (2 * allowances.sandingPerFaceMm);
const crosscutCount = board.rows + 1;
const firstPanelLengthMm = (board.rows * crosscutSliceMm)
  + (crosscutCount * manufacturing.kerfMm)
  + (2 * allowances.endTrimPerSideMm);
```

Крайние rail widths получают внешний X-припуск только с внешней стороны: `[cellX + trimX, cellX × (C - 2), cellX + trimX]`.

- [ ] **Step 6: Реализовать parts/operations graph**

Каждый Part содержит:

```js
{
  partId: 'rail-01',
  stageId: 'prepare-rails',
  role: 'outer-rail',
  materialId: 'maple',
  quantity: 1,
  dimensions: { xMm: 61.25, yMm: 290.4, zMm: 50 },
  grainAxis: 'Y',
  sourcePartIds: [],
}
```

После flip размер `{ xMm: panelWidth, yMm: cellYmm, zMm: crosscutSliceMm }`, grain axis `Z`.

- [ ] **Step 7: Проверить GREEN, performance и regression**

Run: `node --test tests/domain/manufacturing-fingerprint.test.js tests/domain/checkerboard-compiler.test.js`

Expected: PASS; compile fixture быстрее 300 ms.

Run: `npm test`

Expected: PASS.

Run: `npm run check`

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/domain/manufacturing/fingerprint.js src/domain/manufacturing/checkerboard-compiler.js tests/domain/manufacturing-fingerprint.test.js tests/domain/checkerboard-compiler.test.js
git commit -m "feat: compile checkerboard manufacturing plan"
```

---

### Task 6: Material ledger и контроль сохранения объёма

**Files:**
- Create: `src/domain/manufacturing/material-ledger.js`
- Create: `tests/domain/material-ledger.test.js`

**Interfaces:**
- Consumes: ManufacturingPlan Task 5.
- Produces: `calculatePreparedBlankUsage(plan)` and `assertVolumeBalance(ledger)`.

- [ ] **Step 1: Написать RED exact volume fixture**

```js
const ledger = calculatePreparedBlankUsage(plan450x300x40);

assert.equal(ledger.totals.grossPreparedVolumeMm3, 6_679_200);
assert.equal(ledger.totals.netVolumeMm3, 5_400_000);
assert.equal(ledger.totals.crosscutKerfMm3, 515_200);
assert.equal(ledger.totals.firstPanelEndTrimMm3, 230_000);
assert.equal(ledger.totals.finalTrimMm3, 129_000);
assert.equal(ledger.totals.planingMm3, 270_000);
assert.equal(ledger.totals.sandingMm3, 135_000);
assert.equal(ledger.totals.nonReusableWasteMm3, 1_279_200);
assert.equal(ledger.stockStatus, 'unverified');
```

Проверить по `3_339_600` gross и `2_700_000` net на каждый материал.

- [ ] **Step 2: Написать RED disjoint category и balance tests**

```js
const accounted = ledger.totals.netVolumeMm3
  + ledger.totals.nonReusableWasteMm3
  + ledger.totals.reusableOffcutsMm3;
assert.equal(accounted, ledger.totals.grossPreparedVolumeMm3);
assert.equal(assertVolumeBalance(ledger).ok, true);
```

`rawStockUsage` и `rawStockOffcut` равны `null`, а не нулю, пока stock не задан.

- [ ] **Step 3: Запустить test и подтвердить RED**

Run: `node --test tests/domain/material-ledger.test.js`

Expected: FAIL с `ERR_MODULE_NOT_FOUND`.

- [ ] **Step 4: Реализовать ledger из операций, не из визуальных стадий**

```js
export function assertVolumeBalance(ledger) {
  const input = ledger.totals.grossPreparedVolumeMm3;
  const accounted = ledger.totals.netVolumeMm3
    + ledger.totals.nonReusableWasteMm3
    + ledger.totals.reusableOffcutsMm3;
  const tolerance = Math.max(1e-6, input * 1e-9);
  return { ok: Math.abs(input - accounted) <= tolerance, deltaMm3: input - accounted };
}
```

`wastePercentage = nonReusableWasteMm3 / grossPreparedVolumeMm3 × 100`; reusable offcuts не входят в процент отходов.

- [ ] **Step 5: Проверить GREEN и regression**

Run: `node --test tests/domain/material-ledger.test.js tests/domain/checkerboard-compiler.test.js`

Expected: PASS.

Run: `npm test`

Expected: PASS.

Run: `npm run check`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/domain/manufacturing/material-ledger.js tests/domain/material-ledger.test.js
git commit -m "feat: calculate prepared blank material ledger"
```

---

### Task 7: Feasibility, diagnostics и итоговый статус

**Files:**
- Create: `src/domain/manufacturing/feasibility.js`
- Create: `tests/domain/manufacturing-feasibility.test.js`

**Interfaces:**
- Consumes: Project V2 manufacturing inputs, ManufacturingPlan, MaterialLedger.
- Produces: `validateManufacturingPlan({ project, plan, ledger })` returning `{ geometryStatus, stockStatus, overallStatus, diagnostics }`.

- [ ] **Step 1: Написать RED status matrix tests**

```js
assert.deepEqual(validateFixture({ stock: [] }), {
  geometryStatus: 'verified',
  stockStatus: 'unverified',
  overallStatus: 'experimental',
  diagnostics: [diagnosticWithCode('STOCK_NOT_PROVIDED')],
});
```

Проверить: geometry error → `blocked`; freeform → `concept`; geometry + stock verified → `verified`.

- [ ] **Step 2: Написать RED safety tests**

Проверить коды:

```js
[
  'CHECKERBOARD_COLUMNS_MUST_BE_EVEN',
  'PART_DIMENSION_NON_POSITIVE',
  'GRAIN_AXIS_INVALID',
  'MIN_SAFE_PART_VIOLATION',
  'STOCK_TOO_SMALL',
  'MATERIAL_BALANCE_MISMATCH',
  'EQUIPMENT_METHOD_NOT_CONFIRMED',
  'UNSAFE_END_GRAIN_PLANING_METHOD',
]
```

`thickness-planer` всегда создаёт blocking diagnostic для финальной end-grain операции.

- [ ] **Step 3: Запустить test и подтвердить RED**

Run: `node --test tests/domain/manufacturing-feasibility.test.js`

Expected: FAIL с `ERR_MODULE_NOT_FOUND`.

- [ ] **Step 4: Реализовать typed diagnostics и aggregation**

```js
function diagnostic(severity, code, path, params = {}, context = {}) {
  return {
    severity,
    code,
    path,
    stageId: context.stageId ?? null,
    partIds: context.partIds ?? [],
    messageKey: code,
    params,
  };
}
```

Ни одна проверка не формирует HTML или локализованный UI-текст.

- [ ] **Step 5: Проверить GREEN и regression**

Run: `node --test tests/domain/manufacturing-feasibility.test.js tests/domain/material-ledger.test.js`

Expected: PASS.

Run: `npm test`

Expected: PASS.

Run: `npm run check`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/domain/manufacturing/feasibility.js tests/domain/manufacturing-feasibility.test.js
git commit -m "feat: validate manufacturing feasibility"
```

---

### Task 8: Application orchestration и stale-инвариант

**Files:**
- Create: `src/application/manufacturing-service.js`
- Modify: `src/application/app-controller.js`
- Create: `tests/application/manufacturing-service.test.js`
- Create: `tests/application/app-controller-manufacturing.test.js`

**Interfaces:**
- Consumes: registry generator, compiler, ledger, feasibility validator, clock.
- Produces: `createManufacturingService(dependencies).calculate(project, revision)`; controller methods `applyTemplate`, `surpriseMe`, `recalculateManufacturing`, `setWorkspace`.

- [ ] **Step 1: Написать RED service composition test**

```js
const result = service.calculate(project, 7);
assert.equal(result.status, 'ready');
assert.equal(result.plan.projectRevision, 7);
assert.equal(result.validation.geometryStatus, 'verified');
assert.equal(result.ledger.totals.netVolumeMm3, 5_400_000);
```

Compiler exception возвращает `{ status: 'failed', plan: null, diagnostics }` и не мутирует project.

- [ ] **Step 2: Написать RED controller stale tests**

```js
controller.applyTemplate(checkerboardRequest);
controller.recalculateManufacturing();
assert.equal(controller.getState().manufacturing.status, 'ready');

controller.dispatch(setBoardDimensions(controller.getState().project, changedDimensions));
assert.equal(controller.getState().manufacturing.status, 'stale');
assert.equal(controller.getState().manufacturing.plan, null);
```

No-op command не инвалидирует ready-plan. Save/open не выдают stale plan за актуальный.

- [ ] **Step 3: Запустить tests и подтвердить RED**

Run: `node --test tests/application/manufacturing-service.test.js tests/application/app-controller-manufacturing.test.js`

Expected: FAIL с отсутствующими service/controller methods.

- [ ] **Step 4: Реализовать service и controller state**

```js
manufacturing: {
  status: 'idle',
  revision: 0,
  plan: null,
  validation: null,
  ledger: null,
  diagnostics: [],
}
```

Каждое реальное изменение project увеличивает revision и заменяет manufacturing на `stale` с `plan: null`. `recalculateManufacturing` атомарно публикует только результат для текущей revision.

- [ ] **Step 5: Реализовать template application**

`applyTemplate` вызывает `generatePattern`, записывает cells и:

```js
design: {
  mode: 'template',
  templateId: 'classic-checkerboard-reverse-slices',
  templateVersion: 1,
  seed,
  parameters: normalizedParameters,
}
```

`surpriseMe` принимает seed от UI/id factory; скрытая глобальная случайность в домене запрещена.

- [ ] **Step 6: Проверить GREEN и regression**

Run: `node --test tests/application/manufacturing-service.test.js tests/application/app-controller-manufacturing.test.js`

Expected: PASS.

Run: `npm test`

Expected: PASS.

Run: `npm run check`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/application/manufacturing-service.js src/application/app-controller.js tests/application/manufacturing-service.test.js tests/application/app-controller-manufacturing.test.js
git commit -m "feat: orchestrate manufacturing calculations"
```

---

### Task 9: UI shell, units и шаблонный пользовательский путь

**Files:**
- Modify: `index.html`
- Modify: `src/styles/app.css`
- Modify: `src/ui/dom-view.js`
- Modify: `tests/ui/dom-view.test.js`
- Modify: `tests/helpers/fake-dom.js`

**Interfaces:**
- Consumes: controller state/methods from Task 8 and units functions Task 1.
- Produces: workspaces `pattern`, `dimensions`, `manufacturing`, `volume`, `print`; unit-aware inputs and checkerboard controls.

- [ ] **Step 1: Расширить fake DOM и написать RED rendering tests**

```js
test('render workspace status without HTML injection', () => {
  renderWorkspaceStatus(container, {
    overallStatus: 'experimental',
    label: '<img src=x onerror=alert(1)>',
  });
  assert.equal(container.querySelector('img'), null);
  assert.equal(container.textContent.includes('<img'), true);
});
```

Проверить label единиц, активную вкладку, seed, disabled print и предупреждение demotion.

- [ ] **Step 2: Запустить focused test и подтвердить RED**

Run: `node --test tests/ui/dom-view.test.js`

Expected: FAIL с отсутствующими exports/DOM nodes.

- [ ] **Step 3: Добавить semantic workspace markup**

В `index.html` добавить навигацию:

```html
<nav class="workspace-tabs" aria-label="Рабочее пространство">
  <button data-workspace="pattern">Узор</button>
  <button data-workspace="dimensions">Размеры</button>
  <button data-workspace="manufacturing">Производство</button>
  <button data-workspace="volume">Объём</button>
  <button data-workspace="print">Печать</button>
</nav>
```

Существующий editor Canvas остаётся в pattern workspace; его IDs не переименовывать без необходимости.

- [ ] **Step 4: Подключить units и checkerboard controls**

Добавить `display-units`, `template-id`, `material-a`, `material-b`, `pattern-seed`, `surprise-me`, `apply-template`. В change handlers преобразовывать только пользовательский ввод через `parseLengthInput`; state.board остаётся mm.

- [ ] **Step 5: Добавить manufacturing inputs**

Поля явно маркируют per-side/per-face semantics: kerf, end trim/side, final X trim/side, final Y trim/side, planing/face, sanding/face, flattening method и equipment envelope.

- [ ] **Step 6: Проверить focused tests и ручной browser smoke**

Run: `node --test tests/ui/dom-view.test.js tests/application/app-controller-manufacturing.test.js`

Expected: PASS.

Run: `npm run serve`

Manual expected: P0 paint/select/rotate/save/open/PNG работают; tabs переключаются; inch toggle не меняет сохранённые mm; Apply Template строит шахмату.

- [ ] **Step 7: Проверить regression и commit**

Run: `npm test`

Expected: PASS.

Run: `npm run check`

Expected: PASS.

```bash
git add index.html src/styles/app.css src/ui/dom-view.js tests/ui/dom-view.test.js tests/helpers/fake-dom.js
git commit -m "feat: add checkerboard production workspace"
```

---

### Task 10: Производственные таблицы и связанные diagnostics

**Files:**
- Create: `src/ui/manufacturing-view.js`
- Modify: `src/ui/dom-view.js`
- Modify: `index.html`
- Modify: `src/styles/app.css`
- Create: `tests/ui/manufacturing-view.test.js`

**Interfaces:**
- Consumes: `{ plan, validation, ledger, diagnostics }`.
- Produces: `renderManufacturingView(container, manufacturingState, { onSelectPart, onSelectDiagnostic })`.

- [ ] **Step 1: Написать RED safe DOM tests**

```js
renderManufacturingView(container, fixtureState, handlers);
assert.equal(container.querySelectorAll('[data-part-id]').length, fixtureState.plan.parts.length);
assert.equal(container.querySelector('[data-part-id="rail-01"]').textContent.includes('rail-01'), true);
assert.equal(container.querySelectorAll('script').length, 0);
```

Проверить stage/part linkage, status badge и diagnostic codes.

- [ ] **Step 2: Запустить test и подтвердить RED**

Run: `node --test tests/ui/manufacturing-view.test.js`

Expected: FAIL с `ERR_MODULE_NOT_FOUND`.

- [ ] **Step 3: Реализовать view только через DOM API**

Создавать stage cards, parts table, operations table, ledger cards и diagnostics list через `createElement`, `textContent`, `dataset` и `replaceChildren`.

Формат размера:

```js
function formatPartDimensions(part, units) {
  return ['xMm', 'yMm', 'zMm']
    .map((field) => formatLength(part.dimensions[field], units))
    .join(' × ');
}
```

- [ ] **Step 4: Связать part/diagnostic selection**

Клик по diagnostic активирует соответствующий stage и подсвечивает `partIds`; клик по Part сохраняет selectedPartId только в UI state, не в Project V2.

- [ ] **Step 5: Проверить GREEN и regression**

Run: `node --test tests/ui/manufacturing-view.test.js tests/ui/dom-view.test.js`

Expected: PASS.

Run: `npm test`

Expected: PASS.

Run: `npm run check`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/ui/manufacturing-view.js src/ui/dom-view.js index.html src/styles/app.css tests/ui/manufacturing-view.test.js
git commit -m "feat: render manufacturing plan and diagnostics"
```

---

### Task 11: Canvas 2.5D volume view

**Files:**
- Create: `src/rendering/volume-render-plan.js`
- Modify: `src/rendering/canvas-renderer.js`
- Modify: `src/ui/dom-view.js`
- Modify: `index.html`
- Create: `tests/rendering/volume-render-plan.test.js`
- Modify: `tests/helpers/fake-canvas.js`

**Interfaces:**
- Consumes: Project V2 and selected Part/ManufacturingPlan.
- Produces: `buildVolumeRenderPlan(project, options)`, `drawVolumeBoard(context, plan)`.

- [ ] **Step 1: Написать RED pure render-plan tests**

```js
const plan = buildVolumeRenderPlan(project, { width: 900, height: 600, depthPx: 70 });
assert.equal(plan.topFaces.length, 48);
assert.equal(plan.sideFaces.length > 0, true);
assert.equal(plan.grainMarkers.every((marker) => marker.axis === 'Z'), true);
assert.deepEqual(project, before);
```

Проверить bounds и material references.

- [ ] **Step 2: Запустить test и подтвердить RED**

Run: `node --test tests/rendering/volume-render-plan.test.js`

Expected: FAIL с `ERR_MODULE_NOT_FOUND`.

- [ ] **Step 3: Реализовать чистую изометрическую проекцию**

```js
const offset = {
  x: Math.round(depthPx * 0.72),
  y: Math.round(depthPx * 0.42),
};
```

Top faces используют текущую сетку; front/right side faces затемняют baseColor без изменения проекта. Grain markers указывают Z.

- [ ] **Step 4: Реализовать Canvas drawing и UI wiring**

`drawVolumeBoard` принимает только готовый plan. DOM view пересчитывает размеры при ResizeObserver и не смешивает 2.5D с PNG top-view exporter.

- [ ] **Step 5: Проверить GREEN, regression и manual smoke**

Run: `node --test tests/rendering/volume-render-plan.test.js tests/rendering/render-plan.test.js`

Expected: PASS.

Run: `npm test`

Expected: PASS.

Run: `npm run check`

Expected: PASS.

Manual expected: volume canvas показывает верх, толщину, материалы и Z-grain markers; resize не искажает пропорции.

- [ ] **Step 6: Commit**

```bash
git add src/rendering/volume-render-plan.js src/rendering/canvas-renderer.js src/ui/dom-view.js index.html tests/rendering/volume-render-plan.test.js tests/helpers/fake-canvas.js
git commit -m "feat: add canvas volume preview"
```

---

### Task 12: PrintReport и browser print

**Files:**
- Create: `src/domain/manufacturing/print-report.js`
- Create: `src/ui/print-view.js`
- Modify: `src/ui/dom-view.js`
- Modify: `index.html`
- Modify: `src/styles/app.css`
- Create: `tests/domain/print-report.test.js`
- Create: `tests/ui/print-view.test.js`

**Interfaces:**
- Consumes: current Project V2, ready plan, validation and ledger.
- Produces: `buildPrintReport(input)`, `canPrintManufacturing(state)`, `renderPrintReport(container, report)`.

- [ ] **Step 1: Написать RED print gate tests**

```js
assert.equal(canPrintManufacturing({ status: 'stale' }), false);
assert.equal(canPrintManufacturing({ status: 'blocked' }), false);
assert.equal(canPrintManufacturing({ status: 'concept' }), false);
assert.equal(canPrintManufacturing({ status: 'experimental' }), true);
assert.equal(canPrintManufacturing({ status: 'verified' }), true);
```

- [ ] **Step 2: Написать RED report serialization tests**

```js
const report = buildPrintReport(fixtureInput);
assert.doesNotThrow(() => JSON.stringify(report));
assert.equal(report.project.revision, fixtureInput.plan.projectRevision);
assert.equal(report.assumptions.some((item) => item.code === 'STOCK_NOT_PROVIDED'), true);
assert.equal(report.parts.length, fixtureInput.plan.parts.length);
```

Stale fingerprint даёт `PRINT_PLAN_STALE` и не возвращает printable report.

- [ ] **Step 3: Запустить tests и подтвердить RED**

Run: `node --test tests/domain/print-report.test.js tests/ui/print-view.test.js`

Expected: FAIL с `ERR_MODULE_NOT_FOUND`.

- [ ] **Step 4: Реализовать pure report model**

Report содержит project identity, dimensions, units, pattern image reference/data URL, statuses, assumptions, materials, parts, stages, QC checklist, ledger и safety diagnostics. Никакого DOM внутри `buildPrintReport`.

- [ ] **Step 5: Реализовать safe print DOM и CSS**

`renderPrintReport` использует DOM API и `textContent`. В `@media print` скрыть editor chrome, показать report, повторять experimental banner через fixed print header. Кнопка вызывает `window.print()` только после успешного `canPrintManufacturing`.

- [ ] **Step 6: Проверить GREEN, regression и print preview**

Run: `node --test tests/domain/print-report.test.js tests/ui/print-view.test.js`

Expected: PASS.

Run: `npm test`

Expected: PASS.

Run: `npm run check`

Expected: PASS.

Manual expected: verified/experimental report печатается; experimental явно показывает assumptions на каждой странице; stale/blocked кнопка disabled.

- [ ] **Step 7: Commit**

```bash
git add src/domain/manufacturing/print-report.js src/ui/print-view.js src/ui/dom-view.js index.html src/styles/app.css tests/domain/print-report.test.js tests/ui/print-view.test.js
git commit -m "feat: add printable workshop report"
```

---

### Task 13: Полный acceptance, документация и release gate

**Files:**
- Modify: `tests/browser-smoke.html`
- Create: `tests/fixtures/checkerboard-450x300x40.js`
- Modify: `README.md`
- Modify: `docs/P0_ACCEPTANCE.md`
- Create: `docs/V1_VERTICAL_SLICE_ACCEPTANCE.md`

**Interfaces:**
- Consumes: все deliverables Tasks 1–12.
- Produces: воспроизводимый acceptance fixture, browser checklist и честная документация фактического релиза.

- [ ] **Step 1: Вынести единый fixture**

```js
export const CHECKERBOARD_450_300_40 = Object.freeze({
  board: { lengthMm: 450, widthMm: 300, thicknessMm: 40, rows: 6, columns: 8 },
  kerfMm: 3.2,
  allowances: {
    endTrimPerSideMm: 5,
    finalTrimXPerSideMm: 5,
    finalTrimYPerSideMm: 0,
    planingPerFaceMm: 1,
    sandingPerFaceMm: 0.5,
    firstPanelThicknessPerFaceMm: 0,
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
```

Перевести compiler/ledger/application acceptance tests на этот fixture без удаления focused unit fixtures.

- [ ] **Step 2: Расширить browser smoke полным сценарием**

Проверить последовательно:

1. V1 load → V2 in-memory;
2. template/materials/seed;
3. exact 450 × 300 × 40 inputs;
4. deterministic regenerate;
5. manufacturing stages и IDs;
6. geometry verified + stock unverified → experimental;
7. volume view;
8. print enabled с assumptions;
9. manual paint → freeform/concept;
10. print disabled;
11. save/open сохраняет V2;
12. PNG P0 export остаётся рабочим.

- [ ] **Step 3: Запустить полную автоматическую проверку**

Run: `npm test`

Expected: все tests PASS, `fail 0`.

Run: `npm run check`

Expected: tests PASS и каждый JS-файл проходит `node --check`.

Run: `node --experimental-test-coverage --test tests/**/*.test.js`

Expected: новые domain/application-модули исполняются тестами; uncovered UI-only branches перечислены в acceptance doc.

- [ ] **Step 4: Выполнить manual browser acceptance**

Run: `npm run serve`

Expected: сценарий `tests/browser-smoke.html` пройден в поддерживаемом desktop browser; console errors отсутствуют; print preview читабелен.

- [ ] **Step 5: Обновить документацию фактическим состоянием**

`README.md` описывает запуск, Project V2, checkerboard flow, manufacturing statuses и ограничения prepared blanks. `P0_ACCEPTANCE.md` остаётся историей P0. Новый `V1_VERTICAL_SLICE_ACCEPTANCE.md` содержит дату, команды, число тестов, browser result, известные ограничения и не заявляет raw-stock optimization/physical verification.

- [ ] **Step 6: Проверить рабочее дерево и diff**

Run: `git status --short`

Expected: только файлы Task 13; независимый CUBE 18 spec может оставаться untracked и не включается.

Run: `git diff --check`

Expected: no output.

- [ ] **Step 7: Commit**

```bash
git add tests/browser-smoke.html tests/fixtures/checkerboard-450x300x40.js README.md docs/P0_ACCEPTANCE.md docs/V1_VERTICAL_SLICE_ACCEPTANCE.md
git commit -m "docs: verify checkerboard manufacturing slice"
```

## Final Release Verification

- [ ] Run: `npm test` — Expected: all PASS.
- [ ] Run: `npm run check` — Expected: all PASS.
- [ ] Run: `node --experimental-test-coverage --test tests/**/*.test.js` — Expected: no test failures.
- [ ] Run: `git status --short --branch` — Expected: branch state understood; unrelated user/parallel files preserved.
- [ ] Review `git log --oneline --decorate -15` — Expected: one focused commit per Task.
- [ ] Confirm no dependency changes in `package.json`.
- [ ] Confirm no secrets, `.env`, tokens or user data entered the diff.
- [ ] Confirm `rawStockUsage` remains unverified without stock and no screen labels the recipe physically verified before a real build.
