import { createAppController } from './application/app-controller.js';
import { validateProject } from './domain/project-validator.js';
import { createBrowserPngExporter } from './export/png-export.js';
import { createProjectRepository } from './storage/project-repository.js';
import { mountApp } from './ui/dom-view.js';

const repository = createProjectRepository({
  storage: window.localStorage,
  validator: validateProject,
  clock: () => new Date().toISOString(),
});

const controller = createAppController({
  repository,
  exporter: createBrowserPngExporter({ documentObject: document, urlApi: URL }),
  idFactory: () => globalThis.crypto?.randomUUID?.() ?? `project-${Date.now()}`,
  clock: () => new Date().toISOString(),
});

mountApp(controller);
