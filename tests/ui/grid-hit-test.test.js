import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getCellAtPoint,
  getRectSelection,
} from '../../src/ui/grid-hit-test.js';

const rect = { left: 10, top: 20, width: 800, height: 600 };

test('getCellAtPoint maps canvas corners to the first and last cells', () => {
  assert.deepEqual(getCellAtPoint({ x: 10, y: 20, rect, rows: 6, columns: 8 }), { row: 0, column: 0 });
  assert.deepEqual(getCellAtPoint({ x: 809.9, y: 619.9, rect, rows: 6, columns: 8 }), { row: 5, column: 7 });
});

test('getCellAtPoint rejects the exclusive right and bottom borders and points outside', () => {
  assert.equal(getCellAtPoint({ x: 810, y: 300, rect, rows: 6, columns: 8 }), null);
  assert.equal(getCellAtPoint({ x: 300, y: 620, rect, rows: 6, columns: 8 }), null);
  assert.equal(getCellAtPoint({ x: 9.9, y: 20, rect, rows: 6, columns: 8 }), null);
});

test('getRectSelection returns row-major cells regardless of drag direction', () => {
  const forward = getRectSelection({ row: 1, column: 2 }, { row: 2, column: 4 });
  const backward = getRectSelection({ row: 2, column: 4 }, { row: 1, column: 2 });
  const expected = [
    { row: 1, column: 2 }, { row: 1, column: 3 }, { row: 1, column: 4 },
    { row: 2, column: 2 }, { row: 2, column: 3 }, { row: 2, column: 4 },
  ];

  assert.deepEqual(forward, expected);
  assert.deepEqual(backward, expected);
});
