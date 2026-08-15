import {
  CHECKERBOARD_TEMPLATE_ID,
  CHECKERBOARD_TEMPLATE_VERSION,
  generateCheckerboardPattern,
} from './checkerboard-pattern.js';

const TEMPLATES = Object.freeze([
  Object.freeze({
    id: CHECKERBOARD_TEMPLATE_ID,
    version: CHECKERBOARD_TEMPLATE_VERSION,
    name: 'Классическая шахматная переклейка',
  }),
]);

const GENERATORS = new Map([
  [CHECKERBOARD_TEMPLATE_ID, generateCheckerboardPattern],
]);

export function listPatternTemplates() {
  return TEMPLATES.map((template) => ({ ...template }));
}

export function generatePattern(templateId, parameters) {
  const generator = GENERATORS.get(templateId);

  if (!generator) {
    return {
      cells: [],
      recipeSource: null,
      normalizedParameters: null,
      diagnostics: [
        {
          severity: 'error',
          code: 'PATTERN_TEMPLATE_UNKNOWN',
          path: 'templateId',
          message: `Неизвестный шаблон: ${String(templateId)}`,
        },
      ],
    };
  }

  return generator(parameters);
}
