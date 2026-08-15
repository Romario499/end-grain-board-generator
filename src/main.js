import { createAppController } from './application/app-controller.js';
import { migrateProjectToV2 } from './domain/project-migration.js';
import { createProjectV2, validateProjectV2 } from './domain/project-v2.js';
import { createBrowserPngExporter } from './export/png-export.js';
import { loadWoodTextureAssets } from './rendering/wood-texture-assets.js';
import { createProjectRepository } from './storage/project-repository.js';
import { mountApp } from './ui/dom-view.js';

const repository = createProjectRepository({
  storage: window.localStorage,
  validator: validateProjectV2,
  migrate: migrateProjectToV2,
  clock: () => new Date().toISOString(),
});

const controller = createAppController({
  repository,
  exporter: createBrowserPngExporter({ documentObject: document, urlApi: URL }),
  idFactory: () => globalThis.crypto?.randomUUID?.() ?? `project-${Date.now()}`,
  clock: () => new Date().toISOString(),
  projectFactory: createProjectV2,
});

await loadWoodTextureAssets();
mountApp(controller);
