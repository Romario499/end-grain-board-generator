import { generatePattern } from '../domain/patterns/pattern-registry.js';
import { CUBE18_TEMPLATE_ID } from '../domain/patterns/cube18-pattern.js';

function mergeManufacturing(current, update = {}) {
  return { ...current, ...update, allowances: { ...current.allowances, ...(update.allowances ?? {}) }, equipment: { ...current.equipment, ...(update.equipment ?? {}) }, pricing: { ...current.pricing, ...(update.pricing ?? {}) }, stock: update.stock ? structuredClone(update.stock) : current.stock };
}

export function applyPatternTemplate(project, { templateId, seed, materialIds, manufacturing }) {
  const effectiveMaterialIds = templateId === CUBE18_TEMPLATE_ID
    ? [...new Set([...materialIds, ...project.palette.map((material) => material.id)])].slice(0, 3)
    : materialIds;
  const generated = generatePattern(templateId, { rows: project.board.rows, columns: project.board.columns, materialIds: effectiveMaterialIds, seed });
  const errors = generated.diagnostics.filter((item) => item.severity === 'error');
  if (errors.length) return { project, changed: false, errors };
  const cells = generated.cells.flatMap((rowCells, row) => rowCells.map((cell, column) => ({ row, column, materialId: cell.materialId, orientation: 'R0' })));
  const normalized = generated.normalizedParameters;
  return {
    project: {
      ...project,
      cells,
      design: { mode: 'template', templateId: generated.recipeSource.templateId, templateVersion: generated.recipeSource.templateVersion, seed: normalized.seed, parameters: { materialIds: [...normalized.materialIds], phase: normalized.phase, rhombusAcuteAngleDeg: normalized.rhombusAcuteAngleDeg } },
      manufacturing: mergeManufacturing(project.manufacturing, manufacturing),
    },
    changed: true,
    errors: [],
  };
}
