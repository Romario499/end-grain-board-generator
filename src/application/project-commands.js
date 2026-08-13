import { BOARD_LIMITS } from '../domain/project-model.js';
import { applyOrientation } from '../domain/transform-engine.js';

function success(project, changed, extra = {}) {
  return { project, changed, errors: [], confirmationRequired: false, ...extra };
}

function failure(project, code, path, message) {
  return {
    project,
    changed: false,
    errors: [{ code, path, message }],
    confirmationRequired: false,
  };
}

function inRange(value, limits, integer = false) {
  return (integer ? Number.isInteger(value) : Number.isFinite(value))
    && value >= limits.min
    && value <= limits.max;
}

function coordinateKey(cell) {
  return `${cell.row}:${cell.column}`;
}

function validateCellSelection(project, cells) {
  if (!Array.isArray(cells)) {
    return false;
  }
  return cells.every((cell) => Number.isInteger(cell.row)
    && Number.isInteger(cell.column)
    && cell.row >= 0
    && cell.column >= 0
    && cell.row < project.board.rows
    && cell.column < project.board.columns);
}

export function setBoardDimensions(project, dimensions) {
  for (const field of ['lengthMm', 'widthMm', 'thicknessMm']) {
    if (!inRange(dimensions[field], BOARD_LIMITS[field])) {
      return failure(project, 'VALIDATION_ERROR', `board.${field}`, 'Размер вне допустимого диапазона.');
    }
  }

  const changed = ['lengthMm', 'widthMm', 'thicknessMm']
    .some((field) => project.board[field] !== dimensions[field]);
  if (!changed) {
    return success(project, false);
  }

  return success({
    ...project,
    board: { ...project.board, ...dimensions },
  }, true);
}

export function paintCells(project, { cells, materialId }) {
  if (!project.palette.some((material) => material.id === materialId)) {
    return failure(project, 'VALIDATION_ERROR', 'materialId', 'Материал не найден.');
  }
  if (!validateCellSelection(project, cells)) {
    return failure(project, 'VALIDATION_ERROR', 'cells', 'Выбор ячеек неверен.');
  }

  const selected = new Set(cells.map(coordinateKey));
  let changed = false;
  const nextCells = project.cells.map((cell) => {
    if (!selected.has(coordinateKey(cell)) || cell.materialId === materialId) {
      return cell;
    }
    changed = true;
    return { ...cell, materialId };
  });

  return changed ? success({ ...project, cells: nextCells }, true) : success(project, false);
}

export function transformCells(project, { cells, operation }) {
  if (!validateCellSelection(project, cells)) {
    return failure(project, 'VALIDATION_ERROR', 'cells', 'Выбор ячеек неверен.');
  }
  if (cells.length === 0) {
    return success(project, false);
  }

  const selected = new Set(cells.map(coordinateKey));
  try {
    const nextCells = project.cells.map((cell) => selected.has(coordinateKey(cell))
      ? { ...cell, orientation: applyOrientation(cell.orientation, operation) }
      : cell);
    return success({ ...project, cells: nextCells }, true);
  } catch (error) {
    return failure(project, 'VALIDATION_ERROR', 'operation', error.message);
  }
}

export function resizeGrid(project, {
  rows,
  columns,
  fillMaterialId,
  confirmDestructive = false,
}) {
  for (const [field, value] of [['rows', rows], ['columns', columns]]) {
    if (!inRange(value, BOARD_LIMITS[field], true)) {
      return failure(project, 'VALIDATION_ERROR', `board.${field}`, 'Размер сетки вне допустимого диапазона.');
    }
  }
  if (!project.palette.some((material) => material.id === fillMaterialId)) {
    return failure(project, 'VALIDATION_ERROR', 'fillMaterialId', 'Материал заполнения не найден.');
  }
  if (rows === project.board.rows && columns === project.board.columns) {
    return success(project, false);
  }

  const destructive = rows < project.board.rows || columns < project.board.columns;
  if (destructive && !confirmDestructive) {
    return success(project, false, { confirmationRequired: true });
  }

  const current = new Map(project.cells.map((cell) => [coordinateKey(cell), cell]));
  const nextCells = [];
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const existing = current.get(`${row}:${column}`);
      nextCells.push(existing ?? { row, column, materialId: fillMaterialId, orientation: 'R0' });
    }
  }

  return success({
    ...project,
    board: { ...project.board, rows, columns },
    cells: nextCells,
  }, true);
}
