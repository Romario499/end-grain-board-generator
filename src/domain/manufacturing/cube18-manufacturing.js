const SIN_60 = Math.sqrt(3) / 2;
const BOARD_FOOT_MM3 = 144 * (25.4 ** 3);

function round(value, digits = 3) {
  const factor = 10 ** digits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function nonNegative(value) {
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function diagnostic(severity, code, message) {
  return { severity, code, message };
}

function invalidInput(input) {
  const { board, cubeRows, cubeColumns, materialIds } = input ?? {};
  if (!board || ![board.lengthMm, board.widthMm, board.thicknessMm].every((value) => Number.isFinite(value) && value > 0)) {
    return diagnostic('error', 'BOARD_DIMENSIONS_INVALID', 'Размеры CUBE 18 должны быть положительными.');
  }
  if (![cubeRows, cubeColumns].every((value) => Number.isInteger(value) && value > 0)) {
    return diagnostic('error', 'CUBE18_GRID_INVALID', 'Количество модулей CUBE 18 должно быть положительным целым числом.');
  }
  if (!Array.isArray(materialIds) || materialIds.length < 3 || new Set(materialIds.slice(0, 3)).size !== 3) {
    return diagnostic('error', 'CUBE18_THREE_MATERIALS_REQUIRED', 'Для CUBE 18 нужны три разные породы древесины.');
  }
  return null;
}

export function calculateCube18Manufacturing(input = {}) {
  const invalid = invalidInput(input);
  if (invalid) return { ok: false, status: 'blocked', diagnostics: [invalid] };

  const { board, cubeRows, cubeColumns, materialIds, manufacturing = {} } = input;
  const allowances = manufacturing.allowances ?? {};
  const endTrim = nonNegative(allowances.endTrimPerSideMm);
  const trimX = nonNegative(allowances.finalTrimXPerSideMm);
  const trimY = nonNegative(allowances.finalTrimYPerSideMm);
  const planing = nonNegative(allowances.planingPerFaceMm);
  const sanding = nonNegative(allowances.sandingPerFaceMm);
  const kerfMm = nonNegative(manufacturing.kerfMm);
  const sliceBlankMm = board.thicknessMm + 2 * planing + 2 * sanding;
  const blankLengthMm = board.lengthMm + 2 * trimX;
  const blankWidthMm = board.widthMm + 2 * trimY;

  // The nominal rhombus fits the requested module density. One sacrificial
  // perimeter row and column are included so the mosaic can be trimmed square.
  const rhombusSideMm = Math.min(
    blankLengthMm / (Math.sqrt(3) * cubeColumns),
    blankWidthMm / (1.5 * cubeRows),
  );
  const rhombusAltitudeMm = rhombusSideMm * SIN_60;
  const preparedCubeCount = (cubeRows + 1) * (cubeColumns + 1);
  const quantityPerMaterial = preparedCubeCount;
  const cutsPerMaterial = quantityPerMaterial + 1;

  const byMaterial = materialIds.slice(0, 3).map((materialId) => {
    const preparedStripLengthMm = quantityPerMaterial * rhombusSideMm
      + cutsPerMaterial * kerfMm
      + 2 * endTrim;
    return {
      materialId,
      quantity: quantityPerMaterial,
      preparedStripLengthMm: round(preparedStripLengthMm),
      preparedStripWidthMm: round(rhombusAltitudeMm),
      preparedStripThicknessMm: round(sliceBlankMm),
      angledCrosscuts: cutsPerMaterial,
    };
  });

  const netMm3 = board.lengthMm * board.widthMm * board.thicknessMm;
  const grossMm3 = byMaterial.reduce((sum, row) => (
    sum + row.preparedStripLengthMm * row.preparedStripWidthMm * row.preparedStripThicknessMm
  ), 0);
  const wasteMm3 = Math.max(0, grossMm3 - netMm3);
  const pricing = manufacturing.pricing ?? {};
  const rates = pricing.boardFootPerMaterial ?? {};
  const costsByMaterial = byMaterial.map((row) => {
    const volumeMm3 = row.preparedStripLengthMm * row.preparedStripWidthMm * row.preparedStripThicknessMm;
    const boardFeet = volumeMm3 / BOARD_FOOT_MM3;
    const ratePerBoardFoot = nonNegative(rates[row.materialId]);
    return {
      materialId: row.materialId,
      boardFeet: round(boardFeet),
      ratePerBoardFoot: round(ratePerBoardFoot, 2),
      materialCost: round(boardFeet * ratePerBoardFoot, 2),
    };
  });
  const pricedMaterialCount = costsByMaterial.filter((row) => row.ratePerBoardFoot > 0).length;
  const materialSubtotal = round(costsByMaterial.reduce((sum, row) => sum + row.materialCost, 0), 2);
  const consumables = round(nonNegative(pricing.consumables), 2);
  const missingMaterialIds = costsByMaterial.filter((row) => row.ratePerBoardFoot <= 0).map((row) => row.materialId);
  const diagnostics = [];
  const maxLength = manufacturing.equipment?.maxLengthMm;
  if (Number.isFinite(maxLength) && byMaterial.some((row) => row.preparedStripLengthMm > maxLength)) {
    diagnostics.push(diagnostic('warning', 'STOCK_LENGTH_EXCEEDS_EQUIPMENT', `Расчётная полоса длиннее ограничения оборудования ${maxLength} мм; разбейте её на несколько заготовок.`));
  }
  const minSafeWidth = manufacturing.equipment?.minSafePartWidthMm;
  if (Number.isFinite(minSafeWidth) && rhombusAltitudeMm < minSafeWidth) {
    diagnostics.push(diagnostic('warning', 'RHOMBUS_STRIP_UNSAFE', `Ширина полосы меньше безопасного минимума ${minSafeWidth} мм.`));
  }

  return {
    ok: true,
    status: diagnostics.length ? 'warning' : 'estimated',
    geometry: {
      rhombusAcuteAngleDeg: 60,
      rhombusObtuseAngleDeg: 120,
      rhombusSideMm: round(rhombusSideMm),
      rhombusAltitudeMm: round(rhombusAltitudeMm),
      stripWidthMm: round(rhombusAltitudeMm),
      sliceBlankMm: round(sliceBlankMm),
      blankLengthMm: round(blankLengthMm),
      blankWidthMm: round(blankWidthMm),
    },
    pieces: {
      finishedCubeCount: cubeRows * cubeColumns,
      preparedCubeCount,
      total: quantityPerMaterial * 3,
      byMaterial,
    },
    stock: byMaterial,
    cuts: {
      miterGaugeDeg: 30,
      includedAngleDeg: 60,
      kerfMm: round(kerfMm),
      angledCrosscuts: cutsPerMaterial * 3,
    },
    volumes: {
      netMm3: round(netMm3),
      grossMm3: round(grossMm3),
      wasteMm3: round(wasteMm3),
      wastePercent: round((wasteMm3 / grossMm3) * 100, 2),
    },
    costs: {
      currency: typeof pricing.currency === 'string' && pricing.currency ? pricing.currency : 'USD',
      complete: missingMaterialIds.length === 0,
      pricedMaterialCount,
      missingMaterialIds,
      byMaterial: costsByMaterial,
      materialSubtotal,
      consumables,
      estimatedTotal: round(materialSubtotal + consumables, 2),
      stockBoundary: 'prepared-strips',
    },
    diagnostics,
    verification: {
      status: 'calculated-not-physically-verified',
      stockBoundary: 'prepared-strips',
    },
  };
}
