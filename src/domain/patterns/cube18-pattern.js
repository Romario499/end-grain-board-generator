import { normalizeSeed } from '../seeded-random.js';

export const CUBE18_TEMPLATE_ID = 'cube18-tumbling-rhombi';
export const CUBE18_TEMPLATE_VERSION = 1;

const RECIPE_SOURCE = Object.freeze({
  templateId: CUBE18_TEMPLATE_ID,
  templateVersion: CUBE18_TEMPLATE_VERSION,
  strategy: 'three-rhombus-tumbling-cube',
});

function diagnostic(code, path, message) {
  return { severity: 'error', code, path, message };
}

function validate({ rows, columns, materialIds }) {
  const diagnostics = [];
  if (!Number.isInteger(rows) || rows < 1) diagnostics.push(diagnostic('PATTERN_ROWS_INVALID', 'rows', 'Количество строк должно быть целым числом не меньше 1.'));
  if (!Number.isInteger(columns) || columns < 1) diagnostics.push(diagnostic('PATTERN_COLUMNS_INVALID', 'columns', 'Количество столбцов должно быть целым числом не меньше 1.'));
  if (!Array.isArray(materialIds) || materialIds.length < 3 || new Set(materialIds.slice(0, 3)).size !== 3) {
    diagnostics.push(diagnostic('CUBE18_THREE_MATERIALS_REQUIRED', 'materialIds', 'Для CUBE 18 нужны три разные породы древесины.'));
  }
  return diagnostics;
}

export function generateCube18Pattern(parameters = {}) {
  const { rows, columns, materialIds, seed } = parameters;
  const normalizedSeed = normalizeSeed(seed);
  const diagnostics = validate(parameters);
  const normalizedParameters = {
    rows,
    columns,
    materialIds: Array.isArray(materialIds) ? materialIds.slice(0, 3) : materialIds,
    seed: normalizedSeed,
    phase: normalizedSeed % 3,
    rhombusAcuteAngleDeg: 60,
  };
  if (diagnostics.length) return { cells: [], recipeSource: { ...RECIPE_SOURCE }, normalizedParameters, diagnostics };
  const materials = materialIds.slice(0, 3);
  const cells = Array.from({ length: rows }, (_, row) => Array.from({ length: columns }, (_, column) => ({
    materialId: materials[(row * columns + column + normalizedParameters.phase) % 3],
    rotation: 0,
    flipX: false,
    flipY: false,
  })));
  return { cells, recipeSource: { ...RECIPE_SOURCE }, normalizedParameters, diagnostics: [] };
}

function rhombusFaces(centerX, centerY, halfWidth, radius, materialIds) {
  const center = { x: centerX, y: centerY };
  const top = { x: centerX, y: centerY - radius };
  const upperRight = { x: centerX + halfWidth, y: centerY - radius / 2 };
  const lowerRight = { x: centerX + halfWidth, y: centerY + radius / 2 };
  const bottom = { x: centerX, y: centerY + radius };
  const lowerLeft = { x: centerX - halfWidth, y: centerY + radius / 2 };
  const upperLeft = { x: centerX - halfWidth, y: centerY - radius / 2 };
  return [
    { face: 'top', materialId: materialIds[0], points: [center, upperLeft, top, upperRight] },
    { face: 'left', materialId: materialIds[1], points: [center, upperLeft, lowerLeft, bottom] },
    { face: 'right', materialId: materialIds[2], points: [center, upperRight, lowerRight, bottom] },
  ];
}

export function buildCube18TilePlan({ width, height, cubeRows, cubeColumns, materialIds }) {
  if (![width, height].every((value) => Number.isFinite(value) && value > 0)) throw new RangeError('Tile plan dimensions must be positive.');
  if (![cubeRows, cubeColumns].every((value) => Number.isInteger(value) && value > 0)) throw new RangeError('Cube grid dimensions must be positive integers.');
  if (!Array.isArray(materialIds) || materialIds.length < 3 || new Set(materialIds.slice(0, 3)).size !== 3) throw new RangeError('CUBE 18 requires three distinct materials.');
  const widthUnits = 2 * cubeColumns + (cubeRows > 1 ? 1 : 0);
  const heightUnits = 1.5 * (cubeRows - 1) + 2;
  const radius = Math.min(height / heightUnits, width / (widthUnits * Math.sqrt(3) / 2));
  const halfWidth = radius * Math.sqrt(3) / 2;
  const patternWidth = widthUnits * halfWidth;
  const patternHeight = heightUnits * radius;
  const offsetX = (width - patternWidth) / 2 + halfWidth;
  const offsetY = (height - patternHeight) / 2 + radius;
  const tiles = [];
  for (let row = 0; row < cubeRows; row += 1) {
    for (let column = 0; column < cubeColumns; column += 1) {
      const centerX = offsetX + column * halfWidth * 2 + (row % 2) * halfWidth;
      const centerY = offsetY + row * radius * 1.5;
      tiles.push(...rhombusFaces(centerX, centerY, halfWidth, radius, materialIds.slice(0, 3)).map((tile) => ({ ...tile, row, column })));
    }
  }
  return { width, height, tiles, geometry: { rhombusAcuteAngleDeg: 60, radius, halfWidth } };
}
