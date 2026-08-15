import { CUBE18_TEMPLATE_ID } from '../domain/patterns/cube18-pattern.js';
import { calculateCube18Manufacturing } from '../domain/manufacturing/cube18-manufacturing.js';

const PRICE_INPUTS = Object.freeze([
  { materialId: 'maple', id: 'price-maple-bf', label: 'Hard maple, $/bd ft' },
  { materialId: 'walnut', id: 'price-walnut-bf', label: 'Black walnut, $/bd ft' },
  { materialId: 'cherry', id: 'price-cherry-bf', label: 'Black cherry, $/bd ft' },
]);

function liters(valueMm3) {
  return `${(valueMm3 / 1_000_000).toFixed(2)} л`;
}

function money(value, currency) {
  return currency === 'USD' ? `$${value.toFixed(2)}` : `${value.toFixed(2)} ${currency}`;
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
  const stockSummary = result.stock.map((row) => {
    const cost = result.costs.byMaterial.find((item) => item.materialId === row.materialId);
    return `${row.materialId} ${row.quantity} шт. / ${cost.boardFeet} bd ft`;
  }).join(' · ');
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
      cost: result.costs.complete ? money(result.costs.estimatedTotal, result.costs.currency) : 'Введите $/bd ft',
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

function createNumberField({ id, label }) {
  const field = document.createElement('label');
  field.textContent = label;
  const input = document.createElement('input');
  input.id = id;
  input.type = 'number';
  input.min = '0';
  input.step = '0.01';
  input.placeholder = '0.00';
  field.append(input);
  return field;
}

function ensurePricingUi() {
  if (!byId('cube18-pricing')) {
    const pricing = document.createElement('div');
    pricing.id = 'cube18-pricing';
    pricing.className = 'fields two cube18-pricing';
    pricing.setAttribute('aria-label', 'Смета материалов CUBE 18');
    for (const field of PRICE_INPUTS) pricing.append(createNumberField(field));
    pricing.append(createNumberField({ id: 'price-consumables', label: 'Glue + consumables, $' }));
    document.querySelector('.manufacturing-fields')?.insertAdjacentElement('afterend', pricing);
  }
  if (!byId('recipe-cost')) {
    const item = document.createElement('div');
    const label = document.createElement('span');
    label.textContent = 'Себестоимость';
    const value = document.createElement('strong');
    value.id = 'recipe-cost';
    value.textContent = 'Введите $/bd ft';
    item.append(label, value);
    document.querySelector('.metrics')?.append(item);
  }
}

function readPricing(project) {
  const current = project.manufacturing?.pricing ?? {};
  const boardFootPerMaterial = { ...(current.boardFootPerMaterial ?? {}) };
  for (const field of PRICE_INPUTS) boardFootPerMaterial[field.materialId] = Number(byId(field.id)?.value ?? 0);
  return {
    ...current,
    currency: 'USD',
    boardFootPerMaterial,
    consumables: Number(byId('price-consumables')?.value ?? 0),
  };
}

function projectWithUiPricing(project) {
  return {
    ...project,
    manufacturing: {
      ...project.manufacturing,
      pricing: readPricing(project),
    },
  };
}

function syncPricingInputs(project) {
  const pricing = project.manufacturing?.pricing ?? {};
  const rates = pricing.boardFootPerMaterial ?? {};
  for (const field of PRICE_INPUTS) {
    const input = byId(field.id);
    if (document.activeElement !== input) input.value = rates[field.materialId] > 0 ? rates[field.materialId] : '';
  }
  const consumables = byId('price-consumables');
  if (document.activeElement !== consumables) consumables.value = pricing.consumables > 0 ? pricing.consumables : '';
}

function renderView(view) {
  if (!view) return;
  byId('pattern-label').textContent = view.patternLabel;
  byId('recipe-status').textContent = view.status;
  byId('recipe-diagnostic').textContent = view.diagnostic;
  const statusBox = byId('recipe-status').parentElement;
  statusBox.classList.toggle('warning', view.status !== 'РАСЧЁТ CUBE 18');
  if (view.metrics) {
    for (const [key, id] of Object.entries({ cell: 'recipe-cell', slice: 'recipe-slice', panel: 'recipe-panel', cuts: 'recipe-cuts', gross: 'recipe-gross', waste: 'recipe-waste', cost: 'recipe-cost' })) byId(id).textContent = view.metrics[key];
  }
  const items = [...document.querySelectorAll('.recipe-steps li')];
  view.steps.forEach((step, index) => { if (items[index]) items[index].textContent = step; });
}

export function mountCube18RecipeView(controller) {
  ensurePricingUi();
  const update = (state = controller.getState()) => {
    syncPricingInputs(state.project);
    renderView(buildCube18RecipeView(state.project));
  };
  controller.subscribe(update);
  update();
  for (const id of ['kerf-mm', 'end-trim-mm', 'trim-x-mm', 'trim-y-mm', 'planing-mm', 'sanding-mm']) {
    byId(id)?.addEventListener('change', () => queueMicrotask(() => update()));
  }
  for (const id of [...PRICE_INPUTS.map((field) => field.id), 'price-consumables']) {
    byId(id)?.addEventListener('input', () => renderView(buildCube18RecipeView(projectWithUiPricing(controller.getState().project))));
    byId(id)?.addEventListener('change', () => {
      const project = controller.getState().project;
      controller.dispatch({ project: projectWithUiPricing(project), changed: true, errors: [] });
    });
  }
}
