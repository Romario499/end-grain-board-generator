import { validateProject } from './project-validator.js';
import {
  PROJECT_SCHEMA_VERSION_V2,
  createProjectV2,
  validateProjectV2,
} from './project-v2.js';

export class ProjectMigrationError extends Error {
  constructor(code, message, cause) {
    super(message, cause ? { cause } : undefined);
    this.name = 'ProjectMigrationError';
    this.code = code;
  }
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function cloneJson(value) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch (error) {
    throw corruptProject(error);
  }
}

function corruptProject(cause) {
  return new ProjectMigrationError('PROJECT_CORRUPT', 'Проект повреждён.', cause);
}

function migrateV1Project(project) {
  if (!validateProject(project).ok) throw corruptProject();

  const migrated = createProjectV2({ id: project.id, now: project.createdAt });
  const result = {
    ...migrated,
    id: project.id,
    name: project.name,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    board: {
      ...cloneJson(project.board),
      edgeProfile: 'square',
      edgeProfileSizeMm: 0,
    },
    palette: cloneJson(project.palette),
    cells: cloneJson(project.cells),
  };

  if (!validateProjectV2(result).ok) throw corruptProject();
  return result;
}

export function migrateProjectToV2(project) {
  if (!isRecord(project)) throw corruptProject();
  if (!Number.isInteger(project.schemaVersion)) {
    throw new ProjectMigrationError('UNSUPPORTED_SCHEMA', 'Версия проекта не поддерживается.');
  }

  if (project.schemaVersion === 1) return migrateV1Project(project);

  if (project.schemaVersion === PROJECT_SCHEMA_VERSION_V2) {
    if (!validateProjectV2(project).ok) throw corruptProject();
    return cloneJson(project);
  }

  throw new ProjectMigrationError('UNSUPPORTED_SCHEMA', 'Версия проекта не поддерживается.');
}
