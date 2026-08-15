import test from 'node:test';
import assert from 'node:assert/strict';

import { calculateCheckerboardManufacturing } from '../../src/domain/manufacturing/checkerboard-manufacturing.js';

test('calculator reproduces the approved 450 x 300 x 40 checkerboard fixture', () => {
  const result = calculateCheckerboardManufacturing({
    board: { lengthMm: 450, widthMm: 300, thicknessMm: 40, rows: 6, columns: 8 },
    manufacturing: {
      kerfMm: 3.2,
      allowances: {
        endTrimPerSideMm: 5,
        finalTrimXPerSideMm: 5,
        finalTrimYPerSideMm: 5,
        planingPerFaceMm: 1,
        sandingPerFaceMm: 0.5,
        firstPanelThicknessPerFaceMm: 0,
      },
      trimmingConvention: 'two-end-cuts',
      equipment: { minSafePartWidthMm: null },
    },
  });

  assert.equal(result.ok, true);
  assert.equal(result.dimensions.cellLengthMm, 56.25);
  assert.equal(result.dimensions.cellWidthMm, 50);
  assert.equal(result.dimensions.sliceBlankMm, 43);
  assert.equal(result.dimensions.firstPanelLengthMm, 290.4);
  assert.equal(result.dimensions.firstPanelWidthMm, 460);
  assert.equal(result.cuts.crosscutCount, 7);
  assert.equal(result.volumes.netMm3, 5_400_000);
  assert.equal(result.volumes.grossMm3, 6_877_000);
  assert.equal(result.volumes.wasteMm3, 1_477_000);
  assert.equal(result.volumes.wastePercent, 21.48);
});

test('calculator blocks odd columns for the one-panel reverse-slices recipe', () => {
  const result = calculateCheckerboardManufacturing({
    board: { lengthMm: 400, widthMm: 300, thicknessMm: 40, rows: 6, columns: 7 },
    manufacturing: { kerfMm: 3.2, allowances: {}, trimmingConvention: 'two-end-cuts', equipment: {} },
  });

  assert.equal(result.ok, false);
  assert.equal(result.diagnostics[0].code, 'CHECKERBOARD_COLUMNS_MUST_BE_EVEN');
});

test('calculator marks an unsafe sacrificial trim strip', () => {
  const result = calculateCheckerboardManufacturing({
    board: { lengthMm: 400, widthMm: 300, thicknessMm: 40, rows: 6, columns: 8 },
    manufacturing: {
      kerfMm: 3.2,
      allowances: { finalTrimYPerSideMm: 5 },
      trimmingConvention: 'two-end-cuts',
      equipment: { minSafePartWidthMm: 20 },
    },
  });

  assert.equal(result.ok, true);
  assert.equal(result.status, 'warning');
  assert.ok(result.diagnostics.some((item) => item.code === 'SACRIFICIAL_STRIP_UNSAFE'));
});
