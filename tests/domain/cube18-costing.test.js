import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateCube18Manufacturing } from '../../src/domain/manufacturing/cube18-manufacturing.js';

const BOARD_FOOT_MM3 = 2_359_737.216;

function fixture(pricing) {
  return {
    board: { lengthMm: 457.2, widthMm: 304.8, thicknessMm: 50.8 },
    cubeRows: 3,
    cubeColumns: 4,
    materialIds: ['maple', 'walnut', 'cherry'],
    manufacturing: {
      kerfMm: 3.2,
      allowances: {
        endTrimPerSideMm: 5,
        finalTrimXPerSideMm: 5,
        finalTrimYPerSideMm: 5,
        planingPerFaceMm: 1,
        sandingPerFaceMm: 0.5,
      },
      pricing,
    },
  };
}

test('CUBE 18 costing converts each prepared strip volume to board feet and USD', () => {
  const result = calculateCube18Manufacturing(fixture({
    currency: 'USD',
    boardFootPerMaterial: { maple: 12, walnut: 18, cherry: 11 },
    consumables: 8,
  }));

  assert.equal(result.costs.complete, true);
  assert.equal(result.costs.currency, 'USD');
  assert.equal(result.costs.byMaterial.length, 3);
  for (const row of result.costs.byMaterial) {
    const stock = result.stock.find((item) => item.materialId === row.materialId);
    const expectedBoardFeet = (
      stock.preparedStripLengthMm * stock.preparedStripWidthMm * stock.preparedStripThicknessMm
    ) / BOARD_FOOT_MM3;
    assert.ok(Math.abs(row.boardFeet - expectedBoardFeet) < 0.001);
    assert.ok(row.materialCost > 0);
  }
  assert.equal(result.costs.estimatedTotal, result.costs.materialSubtotal + 8);
});

test('CUBE 18 costing stays explicitly incomplete until every species has a rate', () => {
  const result = calculateCube18Manufacturing(fixture({
    currency: 'USD',
    boardFootPerMaterial: { maple: 12, walnut: 0 },
    consumables: 0,
  }));

  assert.equal(result.costs.complete, false);
  assert.equal(result.costs.pricedMaterialCount, 1);
  assert.equal(result.costs.missingMaterialIds.includes('cherry'), true);
  assert.equal(result.costs.missingMaterialIds.includes('walnut'), true);
});
