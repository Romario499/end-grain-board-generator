export const INCH_IN_MM = 25.4;
export const BOARD_FOOT_IN_CUBIC_MM = 2_359_737.216;

const DISPLAY_UNITS = Object.freeze(['mm', 'in']);

function assertUnits(units) {
  if (!DISPLAY_UNITS.includes(units)) {
    throw new RangeError(`Unsupported display units: ${units}`);
  }
}

export function millimetersToInches(millimeters) {
  return millimeters / INCH_IN_MM;
}

export function inchesToMillimeters(inches) {
  return inches * INCH_IN_MM;
}

export function cubicMillimetersToBoardFeet(cubicMillimeters) {
  return cubicMillimeters / BOARD_FOOT_IN_CUBIC_MM;
}

export function formatLength(millimeters, units) {
  assertUnits(units);
  if (!Number.isFinite(millimeters)) throw new RangeError('Length must be finite.');

  const value = units === 'in' ? millimetersToInches(millimeters) : millimeters;
  return new Intl.NumberFormat('ru-RU', {
    useGrouping: false,
    maximumFractionDigits: units === 'in' ? 4 : 2,
  }).format(value);
}

export function parseLengthInput(value, units) {
  assertUnits(units);
  const normalized = String(value).trim().replace(',', '.');
  if (normalized === '') throw new RangeError('Length must be finite.');

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) throw new RangeError('Length must be finite.');
  return units === 'in' ? inchesToMillimeters(parsed) : parsed;
}
