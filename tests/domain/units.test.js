import test from 'node:test';
import assert from 'node:assert/strict';

import {
  BOARD_FOOT_IN_CUBIC_MM,
  INCH_IN_MM,
  cubicMillimetersToBoardFeet,
  formatLength,
  inchesToMillimeters,
  millimetersToInches,
  parseLengthInput,
} from '../../src/domain/units.js';

test('millimetersToInches converts 25.4 mm to exactly one inch', () => {
  assert.equal(INCH_IN_MM, 25.4);
  assert.equal(millimetersToInches(25.4), 1);
});

test('millimetersToInches converts 12.7 mm to one half inch', () => {
  assert.equal(millimetersToInches(12.7), 0.5);
});

test('millimeter and inch conversions retain canonical precision', () => {
  const inches = millimetersToInches(400);

  assert.equal(inches, 15.748031496062993);
  assert.equal(inchesToMillimeters(inches), 400);
});

test('cubicMillimetersToBoardFeet converts one board foot exactly', () => {
  assert.equal(BOARD_FOOT_IN_CUBIC_MM, 2_359_737.216);
  assert.equal(cubicMillimetersToBoardFeet(2_359_737.216), 1);
});

test('formatLength changes display without changing the canonical value', () => {
  const millimeters = 25.4;

  assert.equal(formatLength(millimeters, 'in'), '1');
  assert.equal(millimeters, 25.4);
});

test('parseLengthInput accepts decimal commas and converts inches to millimeters', () => {
  assert.equal(parseLengthInput('1,5', 'in'), 38.099999999999994);
  assert.equal(parseLengthInput('38,1', 'mm'), 38.1);
});

test('unit boundary helpers reject unsupported units and non-finite input', () => {
  assert.throws(() => formatLength(40, 'cm'), RangeError);
  assert.throws(() => parseLengthInput('not-a-number', 'mm'), RangeError);
  assert.throws(() => parseLengthInput('1', 'cm'), RangeError);
});
