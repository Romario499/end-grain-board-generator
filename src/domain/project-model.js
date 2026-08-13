import { BUILT_IN_MATERIALS } from '../materials/catalog.js';

export const PROJECT_SCHEMA_VERSION = 1;
export const ORIENTATIONS = Object.freeze([
  'R0',
  'R90',
  'R180',
  'R270',
  'M0',
  'M90',
  'M180',
  'M270',
]);

export const BOARD_LIMITS = Object.freeze({
  lengthMm: Object.freeze({ min: 50, max: 3000 }),
  widthMm: Object.freeze({ min: 50, max: 3000 }),
  thicknessMm: Object.freeze({ min: 5, max: 300 }),
  rows: Object.freeze({ min: 1, max: 64 }),
  columns: Object.freeze({ min: 1, max: 64 }),
});

export function createDefaultProject({ id, now }) {
  const board = {
    lengthMm: 400,
    widthMm: 300,
    thicknessMm: 40,
    columns: 8,
    rows: 6,
  };
  const palette = BUILT_IN_MATERIALS.map((material) => ({ ...material }));
  const cells = [];

  for (let row = 0; row < board.rows; row += 1) {
    for (let column = 0; column < board.columns; column += 1) {
      cells.push({
        row,
        column,
        materialId: palette[0].id,
        orientation: 'R0',
      });
    }
  }

  return {
    schemaVersion: PROJECT_SCHEMA_VERSION,
    id,
    name: 'Новая доска',
    createdAt: now,
    updatedAt: now,
    board,
    palette,
    cells,
  };
}
