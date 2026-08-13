# P1 Stability Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Устранить три подтверждённых P1-дефекта текущего P0: небезопасный DOM-вывод, неполную валидацию метаданных и невалидное выделение после уменьшения сетки.

**Architecture:** Существующие слои и публичные контракты сохраняются. Безопасный вывод остаётся в DOM-view, проверка метаданных — в доменном валидаторе, а инвариант выделения — в application-controller.

**Tech Stack:** Нативные ES-модули JavaScript, Node.js test runner, browser DOM API; без новых зависимостей.

## Global Constraints

- Работать через RED, GREEN, REFACTOR.
- Не добавлять зависимости.
- Не менять архитектуру и не затрагивать `.env`, ключи или соседний `../kalkulyator`.
- Перед завершением запустить `npm test` и `npm run check`.

---

### Task 1: Safe DOM rendering

**Files:**
- Modify: `src/ui/dom-view.js`
- Create: `tests/ui/dom-view.test.js`
- Create: `tests/helpers/fake-dom.js`

**Interfaces:**
- Produces: `renderMaterials(container, state)` and `renderProjectList(container, projects)`; user-controlled values are assigned through DOM properties and `textContent`, never parsed as markup.

- [ ] Write tests with literal HTML payloads in project/material names and IDs.
- [ ] Run `node --test tests/ui/dom-view.test.js` and verify RED.
- [ ] Replace template-string `innerHTML` rendering with DOM element creation and `replaceChildren`.
- [ ] Re-run the focused test and full `npm test` for GREEN.

### Task 2: Metadata validation

**Files:**
- Modify: `src/domain/project-validator.js`
- Modify: `tests/domain/project-validator.test.js`
- Modify: `tests/storage/project-repository.test.js`

**Interfaces:**
- Produces: `validateProject(project)` rejects missing, invalid, or non-canonical `createdAt`/`updatedAt` values with `PROJECT_TIMESTAMP`; repository surfaces malformed stored projects as `PROJECT_CORRUPT`.

- [ ] Add domain and repository regression tests.
- [ ] Run the focused tests and verify RED.
- [ ] Add minimal canonical ISO timestamp validation.
- [ ] Re-run focused tests and full `npm test` for GREEN.

### Task 3: Selection invariant after resize

**Files:**
- Modify: `src/application/app-controller.js`
- Modify: `tests/application/app-controller.test.js`

**Interfaces:**
- Produces: after any successful project-changing dispatch, every coordinate in `state.selection` remains inside `result.project.board`.

- [ ] Add a controller regression test for `6×8 → 2×2` with mixed in/out-of-bounds selection.
- [ ] Run the focused test and verify RED.
- [ ] Filter selection against the resulting board in the controller dispatch path.
- [ ] Re-run focused tests and full `npm test` for GREEN.

### Task 4: Acceptance verification

**Files:**
- Modify only if results require a documented correction: `docs/P0_ACCEPTANCE.md`

- [ ] Run `npm test`.
- [ ] Run `npm run check`.
- [ ] Run a browser smoke for safe names, catalog opening, resize, and transform.
- [ ] Review the final diff and report residual risks; do not commit while the project remains untracked inside the dirty parent repository.
