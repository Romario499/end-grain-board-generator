import { CUBE18_TEMPLATE_ID } from '../domain/patterns/cube18-pattern.js';
import { calculateCube18Manufacturing } from '../domain/manufacturing/cube18-manufacturing.js';

function liters(valueMm3) {
  return `${(valueMm3 / 1_000_000).toFixed(2)} л`;
}

export function buildCube18RecipeView(project) {
  if (project.design?.templateId !== CUBE18_TEMPLATE_ID) return null;
  const materialIds = project.design.parameters?.materialIds ?? project.palette.slice(0, 3).map((material) => material.id);
  const result = calculateCube18Manufacturing({
    board: project.board,
    cubeRows: Math.max(2, Math.floor(project.board.rows / 2)),
    cubeColumns: Math.max(2, Math.floor(project.board.columns / 2)),
    materialIds,
    manufacturing: project.manufacturing,
  });
  if (!result.ok) {
    return { status: 'БЛОКИРОВКА CUBE 18', diagnostic: result.diagnostics[0]?.message ?? 'Расчёт заблокирован.', patternLabel: 'CUBE 18 · ошибка геометрии', metrics: null, steps: [] };
  }
  const stockSummary = result.stock.map((row) => `${row.materialId} ${row.quantity} шт.`).join(' · ');
  return {
    status: result.status === 'warning' ? 'ВНИМАНИЕ CUBE 18' : 'РАСЧЁТ CUBE 18',
    diagnostic: result.diagnostics[0]?.message ?? 'Расчёт по подготовленным полосам; требуется физическая проверка контрольного образца.',
    patternLabel: `CUBE 18 · ${result.pieces.finishedCubeCount} модулей · seed ${project.design.seed}`,
    metrics: {
      cell: `${result.geometry.rhombusSideMm} мм · 60°/120°`,
      slice: `Пила 30° · kerf ${result.cuts.kerfMm} мм`,
      panel: stockSummary,
      cuts: `${result.cuts.angledCrosscuts} рез.`,
      gross: liters(result.volumes.grossMm3),
      waste: `${result.volumes.wastePercent}%`,
    },
    steps: [
      `Подготовьте три полосы шириной ${result.geometry.stripWidthMm} мм и толщиной ${result.geometry.sliceBlankMm} мм.`,
      `Нарежьте ${result.pieces.total} ромбов параллельными резами 30° с учётом kerf ${result.cuts.kerfMm} мм.`,
      'Соберите по три грани — maple, walnut и cherry — в повторяемые кубические модули.',
      'Склейте мозаику с жертвенным периметром, затем выровняйте и обрежьте до чистового размера.',
    ],
    result,
  };
}

function byId(id) {
  return document.getElementById(id);
}

function renderView(view) {
  if (!view) return;
  byId('pattern-label').textContent = view.patternLabel;
  byId('recipe-status').textContent = view.status;
  byId('recipe-diagnostic').textContent = view.diagnostic;
  const statusBox = byId('recipe-status').parentElement;
  statusBox.classList.toggle('warning', view.status !== 'РАСЧЁТ CUBE 18');
  if (view.metrics) {
    for (const [key, id] of Object.entries({ cell: 'recipe-cell', slice: 'recipe-slice', panel: 'recipe-panel', cuts: 'recipe-cuts', gross: 'recipe-gross', waste: 'recipe-waste' })) byId(id).textContent = view.metrics[key];
  }
  const items = [...document.querySelectorAll('.recipe-steps li')];
  view.steps.forEach((step, index) => { if (items[index]) items[index].textContent = step; });
}

export function mountCube18RecipeView(controller) {
  const update = (state = controller.getState()) => renderView(buildCube18RecipeView(state.project));
  controller.subscribe(update);
  for (const id of ['kerf-mm', 'end-trim-mm', 'trim-x-mm', 'trim-y-mm', 'planing-mm', 'sanding-mm']) {
    byId(id)?.addEventListener('change', () => queueMicrotask(() => update()));
  }
}
