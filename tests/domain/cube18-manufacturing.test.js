import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateCube18Manufacturing } from '../../src/domain/manufacturing/cube18-manufacturing.js';

const fixture = {
  board: { lengthMm: 457.2, widthMm: 304.8, thicknessMm: 50.8 },
  cubeRows: 3,
  cubeColumns: 4,
  materialIds: ['maple', 'walnut', 'cherry'],
  manufacturing: { kerfMm: 3.2, allowances: { endTrimPerSideMm: 5, finalTrimXPerSideMm: 5, finalTrimYPerSideMm: 5, planingPerFaceMm: 1, sandingPerFaceMm: 0.5 }, equipment: { maxLengthMm: 3000, minSafePartWidthMm: 20 } },
};

test('CUBE 18 kernel derives a 60-degree rhombus and balanced three-species piece ledger', () => {
  const result = calculateCube18Manufacturing(fixture);
  assert.equal(result.ok, true); assert.equal(result.geometry.rhombusAcuteAngleDeg, 60); assert.equal(result.cuts.miterGaugeDeg, 30); assert.ok(result.geometry.rhombusSideMm > 0); assert.equal(result.geometry.stripWidthMm, result.geometry.rhombusAltitudeMm);
  assert.equal(result.pieces.total, result.pieces.byMaterial.reduce((sum, row) => sum + row.quantity, 0));
  assert.ok(Math.max(...result.pieces.byMaterial.map((row) => row.quantity)) - Math.min(...result.pieces.byMaterial.map((row) => row.quantity)) <= 1);
});

test('CUBE 18 kernel accounts for kerf, finishing allowance and a positive waste ledger', () => {
  const result = calculateCube18Manufacturing(fixture);
  assert.equal(result.geometry.sliceBlankMm, 53.8); assert.equal(result.cuts.kerfMm, 3.2); assert.ok(result.volumes.grossMm3 >= result.volumes.netMm3);
  assert.ok(Math.abs(result.volumes.wasteMm3 - (result.volumes.grossMm3 - result.volumes.netMm3)) < 0.001);
  assert.ok(result.volumes.wastePercent > 0 && result.volumes.wastePercent < 100);
  assert.ok(result.stock.every((row) => row.preparedStripLengthMm > row.quantity * result.geometry.rhombusSideMm));
});

test('CUBE 18 kernel blocks invalid materials and flags equipment envelope overflow', () => {
  const invalid = calculateCube18Manufacturing({ ...fixture, materialIds: ['maple', 'walnut'] });
  assert.equal(invalid.ok, false); assert.equal(invalid.diagnostics[0].code, 'CUBE18_THREE_MATERIALS_REQUIRED');
  const limited = calculateCube18Manufacturing({ ...fixture, manufacturing: { ...fixture.manufacturing, equipment: { ...fixture.manufacturing.equipment, maxLengthMm: 500 } } });
  assert.equal(limited.ok, true); assert.equal(limited.status, 'warning'); assert.ok(limited.diagnostics.some((item) => item.code === 'STOCK_LENGTH_EXCEEDS_EQUIPMENT'));
});
