export function getCellAtPoint({ x, y, rect, rows, columns }) {
  const localX = x - rect.left;
  const localY = y - rect.top;
  if (localX < 0 || localY < 0 || localX >= rect.width || localY >= rect.height) {
    return null;
  }
  return {
    row: Math.min(rows - 1, Math.floor((localY / rect.height) * rows)),
    column: Math.min(columns - 1, Math.floor((localX / rect.width) * columns)),
  };
}

export function getRectSelection(anchor, current) {
  const startRow = Math.min(anchor.row, current.row);
  const endRow = Math.max(anchor.row, current.row);
  const startColumn = Math.min(anchor.column, current.column);
  const endColumn = Math.max(anchor.column, current.column);
  const cells = [];
  for (let row = startRow; row <= endRow; row += 1) {
    for (let column = startColumn; column <= endColumn; column += 1) {
      cells.push({ row, column });
    }
  }
  return cells;
}
