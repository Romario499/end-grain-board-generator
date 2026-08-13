import {
  BOARD_LIMITS,
  ORIENTATIONS,
  PROJECT_SCHEMA_VERSION,
} from './project-model.js';

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

function issue(code, path, message) {
  return { code, path, message };
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isBoundedNumber(value, limits) {
  return Number.isFinite(value) && value >= limits.min && value <= limits.max;
}

function isBoundedInteger(value, limits) {
  return Number.isInteger(value) && value >= limits.min && value <= limits.max;
}

function isCanonicalIsoTimestamp(value) {
  if (typeof value !== 'string') return false;
  const timestamp = new Date(value);
  return Number.isFinite(timestamp.getTime()) && timestamp.toISOString() === value;
}

export function validateProject(project) {
  const errors = [];

  if (!isRecord(project)) {
    return {
      ok: false,
      errors: [issue('PROJECT_TYPE', '', 'Проект должен быть объектом.')],
    };
  }

  if (project.schemaVersion !== PROJECT_SCHEMA_VERSION) {
    errors.push(issue('UNSUPPORTED_SCHEMA', 'schemaVersion', 'Версия проекта не поддерживается.'));
  }
  if (typeof project.id !== 'string' || project.id.trim() === '') {
    errors.push(issue('PROJECT_ID', 'id', 'Нужен идентификатор проекта.'));
  }
  if (typeof project.name !== 'string' || project.name.trim().length < 1 || project.name.trim().length > 80) {
    errors.push(issue('PROJECT_NAME', 'name', 'Название должно содержать от 1 до 80 символов.'));
  }
  for (const field of ['createdAt', 'updatedAt']) {
    if (!isCanonicalIsoTimestamp(project[field])) {
      errors.push(issue('PROJECT_TIMESTAMP', field, 'Дата проекта должна быть в каноническом ISO-формате.'));
    }
  }

  const board = project.board;
  if (!isRecord(board)) {
    errors.push(issue('BOARD_TYPE', 'board', 'Нет параметров доски.'));
  } else {
    for (const field of ['lengthMm', 'widthMm', 'thicknessMm']) {
      if (!isBoundedNumber(board[field], BOARD_LIMITS[field])) {
        errors.push(issue('BOARD_DIMENSION', `board.${field}`, 'Размер вне допустимого диапазона.'));
      }
    }
    for (const field of ['rows', 'columns']) {
      if (!isBoundedInteger(board[field], BOARD_LIMITS[field])) {
        errors.push(issue('GRID_SIZE', `board.${field}`, 'Размер сетки вне допустимого диапазона.'));
      }
    }
  }

  const palette = Array.isArray(project.palette) ? project.palette : [];
  if (palette.length < 3) {
    errors.push(issue('PALETTE_SIZE', 'palette', 'Нужно не менее трёх материалов.'));
  }
  const materialIds = new Set();
  palette.forEach((material, index) => {
    const path = `palette.${index}`;
    if (!isRecord(material) || typeof material.id !== 'string' || material.id.trim() === '' || materialIds.has(material.id)) {
      errors.push(issue('MATERIAL_ID', `${path}.id`, 'Идентификатор материала должен быть уникальным.'));
      return;
    }
    materialIds.add(material.id);
    if (typeof material.name !== 'string' || material.name.trim() === '') {
      errors.push(issue('MATERIAL_NAME', `${path}.name`, 'Нужно название материала.'));
    }
    for (const colorField of ['baseColor', 'accentColor']) {
      if (typeof material[colorField] !== 'string' || !HEX_COLOR.test(material[colorField])) {
        errors.push(issue('MATERIAL_COLOR', `${path}.${colorField}`, 'Цвет должен быть в формате #RRGGBB.'));
      }
    }
  });

  const cells = Array.isArray(project.cells) ? project.cells : [];
  const expectedCellCount = isRecord(board) && Number.isInteger(board.rows) && Number.isInteger(board.columns)
    ? board.rows * board.columns
    : 0;
  if (cells.length !== expectedCellCount) {
    errors.push(issue('CELL_COUNT', 'cells', 'Количество ячеек не совпадает с сеткой.'));
  }

  const coordinates = new Set();
  cells.forEach((cell, index) => {
    const path = `cells.${index}`;
    if (!isRecord(cell)) {
      errors.push(issue('CELL_TYPE', path, 'Ячейка должна быть объектом.'));
      return;
    }
    const coordinate = `${cell.row}:${cell.column}`;
    const inBounds = Number.isInteger(cell.row)
      && Number.isInteger(cell.column)
      && cell.row >= 0
      && cell.column >= 0
      && isRecord(board)
      && cell.row < board.rows
      && cell.column < board.columns;
    if (!inBounds || coordinates.has(coordinate)) {
      errors.push(issue('CELL_COORDINATE', path, 'Координаты ячейки неверны или дублируются.'));
    }
    coordinates.add(coordinate);
    if (!materialIds.has(cell.materialId)) {
      errors.push(issue('MATERIAL_REFERENCE', `${path}.materialId`, 'Материал ячейки не найден.'));
    }
    if (!ORIENTATIONS.includes(cell.orientation)) {
      errors.push(issue('CELL_ORIENTATION', `${path}.orientation`, 'Ориентация ячейки не поддерживается.'));
    }
  });

  return { ok: errors.length === 0, errors };
}
