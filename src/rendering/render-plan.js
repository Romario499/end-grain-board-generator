import { CUBE18_TEMPLATE_ID, buildCube18TilePlan } from '../domain/patterns/cube18-pattern.js';

function keyOf(cell) { return `${cell.row}:${cell.column}`; }

export function calculateExportSize(board, longSidePx = 2400) {
  if (board.lengthMm >= board.widthMm) return { width: longSidePx, height: Math.max(1, Math.round(longSidePx * (board.widthMm / board.lengthMm))) };
  return { width: Math.max(1, Math.round(longSidePx * (board.lengthMm / board.widthMm))), height: longSidePx };
}

export function buildBoardRenderPlan(project, { width, height, selectedCells = [], showSelection = false } = {}) {
  if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0) throw new RangeError('Render width and height must be positive numbers.');
  const materials = new Map(project.palette.map((material) => [material.id, material]));
  if (project.design?.templateId === CUBE18_TEMPLATE_ID) {
    const ids = project.design.parameters.materialIds;
    const phase = project.design.parameters.phase ?? 0;
    const ordered = ids.map((_, index) => ids[(index + phase) % ids.length]);
    const cubePlan = buildCube18TilePlan({ width, height, cubeRows: Math.max(2, Math.floor(project.board.rows / 2)), cubeColumns: Math.max(2, Math.floor(project.board.columns / 2)), materialIds: ordered });
    return { width, height, showSelection: false, patternType: 'cube18', cells: [], tiles: cubePlan.tiles.map((tile) => ({ ...tile, material: materials.get(tile.materialId) })) };
  }
  const selected = new Set(selectedCells.map(keyOf));
  const cells = project.cells.map((cell) => {
    const material = materials.get(cell.materialId);
    if (!material) throw new Error(`Material not found: ${cell.materialId}`);
    const left = (cell.column * width) / project.board.columns; const right = ((cell.column + 1) * width) / project.board.columns;
    const top = (cell.row * height) / project.board.rows; const bottom = ((cell.row + 1) * height) / project.board.rows;
    return { row: cell.row, column: cell.column, x: left, y: top, width: right - left, height: bottom - top, material, orientation: cell.orientation, selected: showSelection && selected.has(keyOf(cell)) };
  });
  return { width, height, showSelection, patternType: 'grid', cells, tiles: [] };
}
