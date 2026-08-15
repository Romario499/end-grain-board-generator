import { normalizeSeed } from '../seeded-random.js';

export const CHECKERBOARD_TEMPLATE_ID = 'classic-checkerboard-reverse-slices';
export const CHECKERBOARD_TEMPLATE_VERSION = 1;

const RECIPE_SOURCE = Object.freeze({
  templateId: CHECKERBOARD_TEMPLATE_ID,
  templateVersion: CHECKERBOARD_TEMPLATE_VERSION,
  strategy: 'reverse-alternate-slices',
});

function diagnostic(code, path, message) {
  return {
    severity: 'error',
    code,
    path,
    message,
  };
}

function validateParameters({ rows, columns, materialIds }) {
  const diagnostics = [];
  const rowsValid = Number.isInteger(rows) && rows >= 1;
  const columnsValid = Number.isInteger(columns) && columns >= 1;
  const materialsValid = Array.isArray(materialIds)
    && materialIds.length >= 2
    && materialIds.every((materialId) => typeof materialId === 'string' && materialId.trim() !== '')
    && new Set(materialIds).size === materialIds.length;

  if (!rowsValid) {
    diagnostics.push(diagnostic('PATTERN_ROWS_INVALID', 'rows', 'Количество строк должно быть целым числом не меньше 1.'));
  }

  if (!columnsValid) {
    diagnostics.push(diagnostic('PATTERN_COLUMNS_INVALID', 'columns', 'Количество столбцов должно быть целым числом не меньше 1.'));
  } else if (columns % 2 !== 0) {
    diagnostics.push(diagnostic(
      'CHECKERBOARD_COLUMNS_MUST_BE_EVEN',
      'columns',
      'Для шахматной переклейки требуется чётное количество столбцов.',
    ));
  }

  if (!materialsValid) {
    diagnostics.push(diagnostic(
      'PATTERN_MATERIALS_INVALID',
      'materialIds',
      'Нужно выбрать минимум два разных материала.',
    ));
  }

  return diagnostics;
}

function createCell(materialId) {
  return {
    materialId,
    rotation: 0,
    flipX: false,
    flipY: false,
  };
}

export function generateCheckerboardPattern(parameters = {}) {
  const {
    rows,
    columns,
    materialIds,
    seed,
  } = parameters;
  const normalizedSeed = normalizeSeed(seed);
  const phase = normalizedSeed % 2;
  const normalizedParameters = {
    rows,
    columns,
    materialIds: Array.isArray(materialIds) ? [...materialIds] : materialIds,
    seed: normalizedSeed,
    phase,
  };
  const diagnostics = validateParameters(parameters);

  if (diagnostics.length > 0) {
    return {
      cells: [],
      recipeSource: { ...RECIPE_SOURCE },
      normalizedParameters,
      diagnostics,
    };
  }

  const [firstMaterialId, secondMaterialId] = materialIds;
  const cells = Array.from({ length: rows }, (_, row) => (
    Array.from({ length: columns }, (_, column) => {
      const materialIndex = (row + column + phase) % 2;
      return createCell(materialIndex === 0 ? firstMaterialId : secondMaterialId);
    })
  ));

  return {
    cells,
    recipeSource: { ...RECIPE_SOURCE },
    normalizedParameters,
    diagnostics: [],
  };
}
