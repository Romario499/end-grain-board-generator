export const CATALOG_KEY = 'torets:catalog:v1';

export class ProjectRepositoryError extends Error {
  constructor(code, message, cause) {
    super(message, cause ? { cause } : undefined);
    this.name = 'ProjectRepositoryError';
    this.code = code;
  }
}

function storageError(error) {
  if (error?.name === 'QuotaExceededError') {
    return new ProjectRepositoryError('STORAGE_QUOTA_EXCEEDED', 'В локальном хранилище нет места.', error);
  }
  return new ProjectRepositoryError('STORAGE_UNAVAILABLE', 'Локальное хранилище недоступно.', error);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function createProjectRepository({ storage, validator, clock }) {
  function validate(project) {
    const result = validator(project);
    if (result.ok) return;
    const unsupported = result.errors.some((error) => error.code === 'UNSUPPORTED_SCHEMA');
    throw new ProjectRepositoryError(
      unsupported ? 'UNSUPPORTED_SCHEMA' : 'PROJECT_CORRUPT',
      unsupported ? 'Версия проекта не поддерживается.' : 'Проект повреждён.',
    );
  }

  function readCatalog() {
    let raw;
    try {
      raw = storage.getItem(CATALOG_KEY);
    } catch (error) {
      throw storageError(error);
    }
    if (raw === null) return { schemaVersion: 1, projects: {} };

    let catalog;
    try {
      catalog = JSON.parse(raw);
    } catch (error) {
      throw new ProjectRepositoryError('PROJECT_CORRUPT', 'Каталог проектов повреждён.', error);
    }
    if (catalog?.schemaVersion !== 1 || catalog.projects === null || typeof catalog.projects !== 'object' || Array.isArray(catalog.projects)) {
      throw new ProjectRepositoryError('PROJECT_CORRUPT', 'Формат каталога неверен.');
    }
    return catalog;
  }

  function save(project) {
    const saved = clone({ ...project, updatedAt: clock() });
    validate(saved);
    const catalog = readCatalog();
    const nextCatalog = {
      schemaVersion: 1,
      projects: { ...catalog.projects, [saved.id]: saved },
    };
    try {
      storage.setItem(CATALOG_KEY, JSON.stringify(nextCatalog));
    } catch (error) {
      throw storageError(error);
    }
    return clone(saved);
  }

  function load(id) {
    const project = readCatalog().projects[id];
    if (!project) {
      throw new ProjectRepositoryError('PROJECT_NOT_FOUND', 'Проект не найден.');
    }
    validate(project);
    return clone(project);
  }

  function list() {
    const projects = Object.values(readCatalog().projects);
    projects.forEach(validate);
    return projects
      .map(({ id, name, updatedAt }) => ({ id, name, updatedAt }))
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  }

  function remove(id) {
    const catalog = readCatalog();
    if (!(id in catalog.projects)) return false;
    const projects = { ...catalog.projects };
    delete projects[id];
    try {
      storage.setItem(CATALOG_KEY, JSON.stringify({ schemaVersion: 1, projects }));
    } catch (error) {
      throw storageError(error);
    }
    return true;
  }

  return { save, load, list, remove };
}
