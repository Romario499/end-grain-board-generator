function keyOf(cell) {
  return `${cell.row}:${cell.column}`;
}

export function calculateExportSize(board, longSidePx = 2400) {
  if (board.lengthMm >= board.widthMm) {
    return {
      width: longSidePx,
      height: Math.max(1, Math.round(longSidePx * (board.widthMm / board.lengthMm))),
    };
  }
  return {
    width: Math.max(1, Math.round(longSidePx * (board.lengthMm / board.widthMm))),
    height: longSidePx,
  };
}

export function buildBoardRenderPlan(project, {
  width,
  height,
  selectedCells = [],
  showSelection = false,
} = {}) {
  if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0) {
    throw new RangeError('Render width and height must be positive numbers.');
  }

  const materials = new Map(project.palette.map((material) => [material.id, material]));
  const selected = new Set(selectedCells.map(keyOf));
  const cells = project.cells.map((cell) => {
    const material = materials.get(cell.materialId);
    if (!material) {
      throw new Error(`Material not found: ${cell.materialId}`);
    }
    const left = (cell.column * width) / project.board.columns;
    const right = ((cell.column + 1) * width) / project.board.columns;
    const top = (cell.row * height) / project.board.rows;
    const bottom = ((cell.row + 1) * height) / project.board.rows;
    return {
      row: cell.row,
      column: cell.column,
      x: left,
      y: top,
      width: right - left,
      height: bottom - top,
      material,
      orientation: cell.orientation,
      selected: showSelection && selected.has(keyOf(cell)),
    };
  });

  return { width, height, showSelection, cells };
}
