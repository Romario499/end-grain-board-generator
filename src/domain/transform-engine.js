import { ORIENTATIONS } from './project-model.js';

export const OPERATIONS = Object.freeze({
  ROTATE_CW: 'ROTATE_CW',
  MIRROR_LEFT_RIGHT: 'MIRROR_LEFT_RIGHT',
  MIRROR_TOP_BOTTOM: 'MIRROR_TOP_BOTTOM',
});

const ORIENTATION_MATRICES = Object.freeze({
  R0: Object.freeze([1, 0, 0, 1]),
  R90: Object.freeze([0, -1, 1, 0]),
  R180: Object.freeze([-1, 0, 0, -1]),
  R270: Object.freeze([0, 1, -1, 0]),
  M0: Object.freeze([-1, 0, 0, 1]),
  M90: Object.freeze([0, -1, -1, 0]),
  M180: Object.freeze([1, 0, 0, -1]),
  M270: Object.freeze([0, 1, 1, 0]),
});

const OPERATION_MATRICES = Object.freeze({
  [OPERATIONS.ROTATE_CW]: ORIENTATION_MATRICES.R90,
  [OPERATIONS.MIRROR_LEFT_RIGHT]: ORIENTATION_MATRICES.M0,
  [OPERATIONS.MIRROR_TOP_BOTTOM]: ORIENTATION_MATRICES.M180,
});

function multiply(left, right) {
  const [a, b, c, d] = left;
  const [e, f, g, h] = right;
  return [
    a * e + b * g,
    a * f + b * h,
    c * e + d * g,
    c * f + d * h,
  ];
}

function matrixKey(matrix) {
  return matrix.join(',');
}

const MATRIX_TO_ORIENTATION = new Map(
  ORIENTATIONS.map((orientation) => [matrixKey(ORIENTATION_MATRICES[orientation]), orientation]),
);

export function getOrientationMatrix(orientation) {
  const matrix = ORIENTATION_MATRICES[orientation];
  if (!matrix) {
    throw new RangeError(`Unknown orientation: ${orientation}`);
  }
  return [...matrix];
}

export function applyOrientation(orientation, operation) {
  const current = ORIENTATION_MATRICES[orientation];
  if (!current) {
    throw new RangeError(`Unknown orientation: ${orientation}`);
  }
  const action = OPERATION_MATRICES[operation];
  if (!action) {
    throw new RangeError(`Unknown operation: ${operation}`);
  }

  return MATRIX_TO_ORIENTATION.get(matrixKey(multiply(action, current)));
}
