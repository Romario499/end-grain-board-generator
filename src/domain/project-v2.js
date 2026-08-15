import {
  BOARD_LIMITS,
  ORIENTATIONS,
  createDefaultProject,
} from './project-model.js';
import { validateProject } from './project-validator.js';

export const PROJECT_SCHEMA_VERSION_V2 = 2;

const DISPLAY_UNITS = Object.freeze(['mm', 'in']);
const DESIGN_MODES = Object.freeze(['freeform', 'template']);
const WORKSPACES = Object.freeze(['pattern', 'dimensions', 'manufacturing', 'volume', 'print']);
const CAMERA_PRESETS = Object.freeze(['top', 'isometric']);
const TRIMMING_CONVENTIONS = Object.freeze([null, 'two-end-cuts']);
const STOCK_BOUNDARIES = Object.freeze(['prepared-blanks', 'raw-stock']);
const FLATTENING_METHODS = Object.freeze([
  null,
  'drum-sander',
  'router-sled',
  'cnc',
  'manual',
  'other',
  'thickness-planer',
]);
const UINT32_MAX = 0xffff_ffff;

function issue(code, path, message) {
  return { code, path, message };
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim() !== '';
}

function isNullableNonNegativeNumber(value) {
  return value === null || (Number.isFinite(value) && value >= 0);
}

function isJsonSerializable(value, ancestors = new WeakSet()) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return true;
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value !== 'object') return false;

  const prototype = Object.getPrototypeOf(value);
  if (!Array.isArray(value) && prototype !== Object.prototype && prototype !== null) return false;
  if (ancestors.has(value)) return false;

  ancestors.add(value);
  try {
    if (Reflect.ownKeys(value).some((key) => typeof key === 'symbol')) return false;
    return Object.keys(value).every((key) => isJsonSerializable(value[key], ancestors));
  } finally {
    ancestors.delete(value);
  }
}

function validateDesign(design, errors) {
  if (!isRecord(design)) {
    errors.push(issue('DESIGN_TYPE', 'design', 'Нет параметров узора.'));
    return;
  }

  if (!DESIGN_MODES.includes(design.mode)) {
    errors.push(issue('DESIGN_MODE', 'design.mode', 'Режим узора не поддерживается.'));
  }
  if (!isRecord(design.parameters)) {
    errors.push(issue('DESIGN_PARAMETERS', 'design.parameters', 'Параметры узора должны быть объектом.'));
  }

  if (design.mode === 'freeform') {
    if (design.templateId !== null || design.templateVersion !== null) {
      errors.push(issue('FREEFORM_TEMPLATE', 'design.templateId', 'Свободный узор не должен ссылаться на шаблон.'));
    }
    if (design.seed !== null) {
      errors.push(issue('FREEFORM_SEED', 'design.seed', 'Свободный узор не должен хранить активный seed.'));
    }
    return;
  }

  if (!isNonEmptyString(design.templateId)) {
    errors.push(issue('TEMPLATE_REFERENCE', 'design.templateId', 'Нужен идентификатор шаблона.'));
  }
  if (!Number.isInteger(design.templateVersion) || design.templateVersion < 1) {
    errors.push(issue('TEMPLATE_REFERENCE', 'design.templateVersion', 'Версия шаблона должна быть положительным целым числом.'));
  }
  if (!Number.isInteger(design.seed) || design.seed < 0 || design.seed > UINT32_MAX) {
    errors.push(issue('TEMPLATE_SEED', 'design.seed', 'Seed должен быть 32-битным целым числом.'));
  }
}

function validateManufacturing(manufacturing, errors) {
  if (!isRecord(manufacturing)) {
    errors.push(issue('MANUFACTURING_TYPE', 'manufacturing', 'Нет производственных настроек.'));
    return;
  }

  if (!Number.isFinite(manufacturing.kerfMm) || manufacturing.kerfMm < 0) {
    errors.push(issue('KERF', 'manufacturing.kerfMm', 'Толщина пропила должна быть неотрицательной.'));
  }

  if (!isRecord(manufacturing.allowances)) {
    errors.push(issue('ALLOWANCES_TYPE', 'manufacturing.allowances', 'Припуски должны быть объектом.'));
  } else {
    for (const field of [
      'endTrimPerSideMm',
      'finalTrimXPerSideMm',
      'finalTrimYPerSideMm',
      'planingPerFaceMm',
      'sandingPerFaceMm',
      'firstPanelThicknessPerFaceMm',
    ]) {
      if (!isNullableNonNegativeNumber(manufacturing.allowances[field])) {
        errors.push(issue('ALLOWANCE_VALUE', `manufacturing.allowances.${field}`, 'Припуск должен быть неотрицательным или null.'));
      }
    }
  }

  if (!TRIMMING_CONVENTIONS.includes(manufacturing.trimmingConvention)) {
    errors.push(issue('TRIMMING_CONVENTION', 'manufacturing.trimmingConvention', 'Конвенция торцевания не поддерживается.'));
  }
  if (!STOCK_BOUNDARIES.includes(manufacturing.stockBoundary)) {
    errors.push(issue('STOCK_BOUNDARY', 'manufacturing.stockBoundary', 'Граница учёта материала не поддерживается.'));
  }
  if (!Array.isArray(manufacturing.stock)) {
    errors.push(issue('STOCK_TYPE', 'manufacturing.stock', 'Складские заготовки должны быть массивом.'));
  }
  if (!isRecord(manufacturing.pricing)) {
    errors.push(issue('PRICING_TYPE', 'manufacturing.pricing', 'Цены должны быть объектом.'));
  }

  const equipment = manufacturing.equipment;
  if (!isRecord(equipment)) {
    errors.push(issue('EQUIPMENT_TYPE', 'manufacturing.equipment', 'Ограничения оборудования должны быть объектом.'));
    return;
  }
  if (!FLATTENING_METHODS.includes(equipment.flatteningMethod)) {
    errors.push(issue('FLATTENING_METHOD', 'manufacturing.equipment.flatteningMethod', 'Метод выравнивания не поддерживается.'));
  }
  for (const field of ['maxWidthMm', 'maxLengthMm', 'minSafePartWidthMm', 'minSafePartLengthMm']) {
    if (!isNullableNonNegativeNumber(equipment[field])) {
      errors.push(issue('EQUIPMENT_VALUE', `manufacturing.equipment.${field}`, 'Ограничение оборудования должно быть неотрицательным или null.'));
    }
  }
}

function validatePresentation(presentation, errors) {
  if (!isRecord(presentation)) {
    errors.push(issue('PRESENTATION_TYPE', 'presentation', 'Нет параметров представления.'));
    return;
  }
  if (!WORKSPACES.includes(presentation.activeWorkspace)) {
    errors.push(issue('WORKSPACE', 'presentation.activeWorkspace', 'Рабочее пространство не поддерживается.'));
  }
  if (!CAMERA_PRESETS.includes(presentation.cameraPreset)) {
    errors.push(issue('CAMERA_PRESET', 'presentation.cameraPreset', 'Положение камеры не поддерживается.'));
  }
}

export function createProjectV2({ id, now }) {
  const base = createDefaultProject({ id, now });
  return {
    ...base,
    schemaVersion: PROJECT_SCHEMA_VERSION_V2,
    displayUnits: 'mm',
    board: {
      ...base.board,
      edgeProfile: 'square',
      edgeProfileSizeMm: 0,
    },
    design: {
      mode: 'freeform',
      templateId: null,
      templateVersion: null,
      seed: null,
      parameters: {},
    },
    manufacturing: {
      kerfMm: 3.2,
      allowances: {
        endTrimPerSideMm: null,
        finalTrimXPerSideMm: null,
        finalTrimYPerSideMm: null,
        planingPerFaceMm: null,
        sandingPerFaceMm: null,
        firstPanelThicknessPerFaceMm: null,
      },
      trimmingConvention: null,
      stockBoundary: 'prepared-blanks',
      equipment: {
        flatteningMethod: null,
        maxWidthMm: null,
        maxLengthMm: null,
        minSafePartWidthMm: null,
        minSafePartLengthMm: null,
      },
      stock: [],
      pricing: {},
    },
    presentation: {
      activeWorkspace: 'pattern',
      cameraPreset: 'isometric',
    },
  };
}

export function validateProjectV2(project) {
  if (!isRecord(project)) {
    return { ok: false, errors: [issue('PROJECT_TYPE', '', 'Проект должен быть объектом.')] };
  }
  if (!isJsonSerializable(project)) {
    return {
      ok: false,
      errors: [issue('PROJECT_SERIALIZATION', '', 'Проект должен содержать только сериализуемые JSON-данные.')],
    };
  }

  const errors = [];
  if (project.schemaVersion !== PROJECT_SCHEMA_VERSION_V2) {
    errors.push(issue('UNSUPPORTED_SCHEMA', 'schemaVersion', 'Версия проекта не поддерживается.'));
  }

  const baseValidation = validateProject({ ...project, schemaVersion: 1 });
  errors.push(...baseValidation.errors);

  if (!DISPLAY_UNITS.includes(project.displayUnits)) {
    errors.push(issue('DISPLAY_UNITS', 'displayUnits', 'Единица отображения не поддерживается.'));
  }
  if (!isNonEmptyString(project.board?.edgeProfile)) {
    errors.push(issue('EDGE_PROFILE', 'board.edgeProfile', 'Нужен профиль кромки.'));
  }
  if (!Number.isFinite(project.board?.edgeProfileSizeMm) || project.board.edgeProfileSizeMm < 0) {
    errors.push(issue('EDGE_PROFILE_SIZE', 'board.edgeProfileSizeMm', 'Размер профиля кромки должен быть неотрицательным.'));
  }

  validateDesign(project.design, errors);
  validateManufacturing(project.manufacturing, errors);
  validatePresentation(project.presentation, errors);

  return { ok: errors.length === 0, errors };
}

export { BOARD_LIMITS, ORIENTATIONS };
