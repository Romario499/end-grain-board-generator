import {
  paintCells,
  resizeGrid,
  setBoardDimensions,
  transformCells,
} from '../application/project-commands.js';
import { OPERATIONS } from '../domain/transform-engine.js';
import { buildBoardRenderPlan } from '../rendering/render-plan.js';
import { drawBoard } from '../rendering/canvas-renderer.js';
import { getCellAtPoint, getRectSelection } from './grid-hit-test.js';

function keyOf(cell) { return `${cell.row}:${cell.column}`; }

export function renderMaterials(container, state) {
  const documentObject = container.ownerDocument;
  const materials = state.project.palette.map((material) => {
    const button = documentObject.createElement('button');
    button.className = `material${material.id === state.activeMaterialId ? ' active' : ''}`;
    button.dataset.material = material.id;

    const swatch = documentObject.createElement('span');
    swatch.className = 'material-swatch';
    swatch.style.background = `repeating-radial-gradient(ellipse at 34% 58%, ${material.accentColor} 0 1px, ${material.baseColor} 2px 7px)`;

    const name = documentObject.createElement('strong');
    name.textContent = material.name;
    button.append(swatch, name, documentObject.createElement('i'));
    return button;
  });
  container.replaceChildren(...materials);
}

export function renderProjectList(container, projects) {
  const documentObject = container.ownerDocument;
  if (projects.length === 0) {
    const empty = documentObject.createElement('p');
    empty.textContent = 'Сохранённых проектов пока нет.';
    container.replaceChildren(empty);
    return;
  }

  const projectButtons = projects.map((project) => {
    const button = documentObject.createElement('button');
    button.value = project.id;
    button.dataset.openId = project.id;

    const name = documentObject.createElement('strong');
    name.textContent = project.name;
    const updatedAt = documentObject.createElement('small');
    updatedAt.textContent = new Date(project.updatedAt).toLocaleString('ru-RU');
    button.append(name, updatedAt);
    return button;
  });
  container.replaceChildren(...projectButtons);
}

export function mountApp(controller) {
  const byId = (id) => document.getElementById(id);
  const canvas = byId('board-canvas');
  const wrap = byId('canvas-wrap');
  const openDialog = byId('open-dialog');
  const unsavedDialog = byId('unsaved-dialog');
  const resizeDialog = byId('resize-dialog');
  let dragAnchor = null;
  let lastPainted = null;
  let pendingResize = null;
  let latestState = controller.getState();

  function canvasSize(project) {
    const maxWidth = Math.max(320, wrap.clientWidth - 70);
    const maxHeight = Math.max(260, wrap.clientHeight - 70);
    const ratio = project.board.lengthMm / project.board.widthMm;
    let width = maxWidth;
    let height = width / ratio;
    if (height > maxHeight) {
      height = maxHeight;
      width = height * ratio;
    }
    return { width: Math.round(width), height: Math.round(height) };
  }

  function renderCanvas(state) {
    const css = canvasSize(state.project);
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.style.width = `${css.width}px`;
    canvas.style.height = `${css.height}px`;
    canvas.width = Math.max(1, Math.round(css.width * pixelRatio));
    canvas.height = Math.max(1, Math.round(css.height * pixelRatio));
    const plan = buildBoardRenderPlan(state.project, {
      width: canvas.width,
      height: canvas.height,
      selectedCells: state.selection,
      showSelection: true,
    });
    drawBoard(canvas.getContext('2d'), plan);
  }

  function setInput(id, value) {
    const input = byId(id);
    if (document.activeElement !== input) input.value = value;
  }

  function render(state) {
    latestState = state;
    if (document.activeElement !== byId('project-name')) byId('project-name').value = state.project.name;
    setInput('length-mm', state.project.board.lengthMm);
    setInput('width-mm', state.project.board.widthMm);
    setInput('thickness-mm', state.project.board.thicknessMm);
    setInput('grid-columns', state.project.board.columns);
    setInput('grid-rows', state.project.board.rows);
    byId('board-summary').textContent = `${state.project.board.lengthMm} × ${state.project.board.widthMm} × ${state.project.board.thicknessMm} мм`;
    byId('selection-count').textContent = state.selection.length;
    byId('save-state').textContent = state.status === 'saving' ? 'Сохраняем…' : state.dirty ? 'Есть изменения' : 'Сохранено';
    byId('error-message').textContent = state.error?.message ?? '';
    byId('tool-paint').classList.toggle('active', state.tool === 'paint');
    byId('tool-select').classList.toggle('active', state.tool === 'select');
    for (const id of ['rotate-cw', 'mirror-lr', 'mirror-tb']) byId(id).disabled = state.selection.length === 0;
    renderMaterials(byId('materials'), state);
    renderCanvas(state);
    if (state.pendingIntent && ['new', 'open'].includes(state.pendingIntent.type) && !unsavedDialog.open) unsavedDialog.showModal();
  }

  function cellFromPointer(event) {
    return getCellAtPoint({
      x: event.clientX,
      y: event.clientY,
      rect: canvas.getBoundingClientRect(),
      rows: latestState.project.board.rows,
      columns: latestState.project.board.columns,
    });
  }

  function paint(cell) {
    if (!cell || keyOf(cell) === lastPainted) return;
    lastPainted = keyOf(cell);
    controller.dispatch(paintCells(controller.getState().project, {
      cells: [cell],
      materialId: controller.getState().activeMaterialId,
    }));
  }

  canvas.addEventListener('pointerdown', (event) => {
    const cell = cellFromPointer(event);
    if (!cell) return;
    canvas.setPointerCapture(event.pointerId);
    if (latestState.tool === 'paint') {
      lastPainted = null;
      paint(cell);
    } else {
      dragAnchor = cell;
      if (event.shiftKey) {
        const selected = new Map(latestState.selection.map((item) => [keyOf(item), item]));
        if (selected.has(keyOf(cell))) selected.delete(keyOf(cell)); else selected.set(keyOf(cell), cell);
        controller.setSelection([...selected.values()]);
      } else {
        controller.setSelection([cell]);
      }
    }
  });

  canvas.addEventListener('pointermove', (event) => {
    if (!canvas.hasPointerCapture(event.pointerId)) return;
    const cell = cellFromPointer(event);
    if (latestState.tool === 'paint') paint(cell);
    else if (cell && dragAnchor) controller.setSelection(getRectSelection(dragAnchor, cell));
  });
  canvas.addEventListener('pointerup', (event) => {
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    dragAnchor = null;
    lastPainted = null;
  });

  byId('materials').addEventListener('click', (event) => {
    const button = event.target.closest('[data-material]');
    if (!button) return;
    controller.setActiveMaterial(button.dataset.material);
    controller.setTool('paint');
  });
  byId('tool-paint').addEventListener('click', () => controller.setTool('paint'));
  byId('tool-select').addEventListener('click', () => controller.setTool('select'));

  const transform = (operation) => controller.dispatch(transformCells(controller.getState().project, {
    cells: controller.getState().selection,
    operation,
  }));
  byId('rotate-cw').addEventListener('click', () => transform(OPERATIONS.ROTATE_CW));
  byId('mirror-lr').addEventListener('click', () => transform(OPERATIONS.MIRROR_LEFT_RIGHT));
  byId('mirror-tb').addEventListener('click', () => transform(OPERATIONS.MIRROR_TOP_BOTTOM));

  for (const [id, field] of [['length-mm', 'lengthMm'], ['width-mm', 'widthMm'], ['thickness-mm', 'thicknessMm']]) {
    byId(id).addEventListener('change', (event) => {
      const board = controller.getState().project.board;
      controller.dispatch(setBoardDimensions(controller.getState().project, {
        lengthMm: field === 'lengthMm' ? Number(event.target.value) : board.lengthMm,
        widthMm: field === 'widthMm' ? Number(event.target.value) : board.widthMm,
        thicknessMm: field === 'thicknessMm' ? Number(event.target.value) : board.thicknessMm,
      }));
    });
  }

  function requestGridResize() {
    pendingResize = {
      rows: Number(byId('grid-rows').value),
      columns: Number(byId('grid-columns').value),
      fillMaterialId: controller.getState().activeMaterialId,
    };
    const result = resizeGrid(controller.getState().project, pendingResize);
    if (result.confirmationRequired) resizeDialog.showModal();
    else { controller.dispatch(result); pendingResize = null; }
  }
  byId('grid-columns').addEventListener('change', requestGridResize);
  byId('grid-rows').addEventListener('change', requestGridResize);
  resizeDialog.addEventListener('close', () => {
    if (resizeDialog.returnValue === 'confirm' && pendingResize) {
      controller.dispatch(resizeGrid(controller.getState().project, { ...pendingResize, confirmDestructive: true }));
    } else {
      render(latestState);
    }
    pendingResize = null;
  });

  byId('project-name').addEventListener('change', (event) => controller.renameProject(event.target.value));
  byId('save-project').addEventListener('click', () => controller.save());
  byId('new-project').addEventListener('click', () => controller.newProject());
  byId('open-project').addEventListener('click', () => {
    controller.refreshProjects();
    const projects = controller.getState().projects;
    renderProjectList(byId('project-list'), projects);
    openDialog.showModal();
  });
  byId('project-list').addEventListener('click', (event) => {
    const button = event.target.closest('[data-open-id]');
    if (!button) return;
    openDialog.close();
    controller.requestOpen(button.dataset.openId);
  });
  unsavedDialog.addEventListener('click', (event) => {
    const decision = event.target.dataset.decision;
    if (!decision) return;
    event.preventDefault();
    const result = controller.resolvePending(decision);
    if (result.ok || decision === 'cancel') unsavedDialog.close();
  });
  byId('export-project').addEventListener('click', () => controller.exportImage());
  window.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
      event.preventDefault();
      controller.save();
    }
  });

  const observer = new ResizeObserver(() => renderCanvas(latestState));
  observer.observe(wrap);
  controller.subscribe(render);
}
