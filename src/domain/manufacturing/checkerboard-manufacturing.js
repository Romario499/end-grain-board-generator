function round(value, digits = 3) {
  const factor = 10 ** digits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function allowance(manufacturing, name) {
  const value = manufacturing?.allowances?.[name];
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function error(code, message) {
  return { severity: 'error', code, message };
}

function warning(code, message) {
  return { severity: 'warning', code, message };
}

export function calculateCheckerboardManufacturing({ board, manufacturing = {} } = {}) {
  const diagnostics = [];
  if (!board || ![board.lengthMm, board.widthMm, board.thicknessMm].every((value) => Number.isFinite(value) && value > 0)
    || !Number.isInteger(board.rows) || board.rows < 1
    || !Number.isInteger(board.columns) || board.columns < 1) {
    return { ok: false, status: 'blocked', diagnostics: [error('BOARD_DIMENSIONS_INVALID', 'Размеры доски и сетки должны быть положительными.')] };
  }
  if (board.columns % 2 !== 0) {
    return { ok: false, status: 'blocked', diagnostics: [error('CHECKERBOARD_COLUMNS_MUST_BE_EVEN', 'Для одной чередующейся панели нужны чётные столбцы.')] };
  }

  const kerfMm = Number.isFinite(manufacturing.kerfMm) && manufacturing.kerfMm >= 0 ? manufacturing.kerfMm : 0;
  const endTrim = allowance(manufacturing, 'endTrimPerSideMm');
  const finalTrimX = allowance(manufacturing, 'finalTrimXPerSideMm');
  const finalTrimY = allowance(manufacturing, 'finalTrimYPerSideMm');
  const planing = allowance(manufacturing, 'planingPerFaceMm');
  const sanding = allowance(manufacturing, 'sandingPerFaceMm');
  const twoEndCuts = manufacturing.trimmingConvention === 'two-end-cuts';

  const cellLengthMm = board.lengthMm / board.columns;
  const cellWidthMm = board.widthMm / board.rows;
  const sliceBlankMm = board.thicknessMm + (2 * planing) + (2 * sanding);
  const crosscutCount = twoEndCuts ? board.rows + 1 : Math.max(0, board.rows - 1);
  const firstPanelLengthMm = (board.rows * sliceBlankMm) + (crosscutCount * kerfMm) + (twoEndCuts ? 2 * endTrim : 0);
  const firstPanelWidthMm = board.lengthMm + (2 * finalTrimX);
  const blankWidthMm = board.widthMm + (2 * finalTrimY);

  const netMm3 = board.lengthMm * board.widthMm * board.thicknessMm;
  const railsGrossMm3 = firstPanelWidthMm * cellWidthMm * firstPanelLengthMm;
  const sacrificialBorderMm3 = firstPanelWidthMm * (2 * finalTrimY) * sliceBlankMm;
  const grossMm3 = railsGrossMm3 + sacrificialBorderMm3;
  const wasteMm3 = grossMm3 - netMm3;

  const minSafePartWidth = manufacturing?.equipment?.minSafePartWidthMm;
  if (finalTrimY > 0 && Number.isFinite(minSafePartWidth) && finalTrimY < minSafePartWidth) {
    diagnostics.push(warning('SACRIFICIAL_STRIP_UNSAFE', `Полоса ${finalTrimY} мм меньше безопасного минимума ${minSafePartWidth} мм.`));
  }

  return {
    ok: true,
    status: diagnostics.length ? 'warning' : 'estimated',
    dimensions: {
      cellLengthMm: round(cellLengthMm),
      cellWidthMm: round(cellWidthMm),
      sliceBlankMm: round(sliceBlankMm),
      firstPanelLengthMm: round(firstPanelLengthMm),
      firstPanelWidthMm: round(firstPanelWidthMm),
      firstPanelThicknessMm: round(cellWidthMm),
      blankWidthMm: round(blankWidthMm),
    },
    cuts: { crosscutCount, kerfMm: round(kerfMm) },
    volumes: {
      netMm3: round(netMm3),
      grossMm3: round(grossMm3),
      wasteMm3: round(wasteMm3),
      wastePercent: round((wasteMm3 / grossMm3) * 100, 2),
    },
    diagnostics,
  };
}
