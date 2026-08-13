import { createDefaultProject } from '../domain/project-model.js';

function publicError(error) {
  return {
    code: error?.code ?? 'UNKNOWN_ERROR',
    message: error?.message ?? 'Неизвестная ошибка.',
  };
}

export function createAppController({ repository, exporter, idFactory, clock }) {
  const listeners = new Set();
  let state = {
    project: createDefaultProject({ id: idFactory(), now: clock() }),
    dirty: true,
    status: 'ready',
    error: null,
    pendingIntent: null,
    projects: [],
    tool: 'paint',
    activeMaterialId: 'maple',
    selection: [],
  };

  function notify() {
    for (const listener of listeners) listener(state);
  }

  function update(patch) {
    state = { ...state, ...patch };
    notify();
  }

  function getState() {
    return state;
  }

  function subscribe(listener) {
    listeners.add(listener);
    listener(state);
    return () => listeners.delete(listener);
  }

  function refreshProjects() {
    try {
      const projects = repository.list();
      update({ projects, error: null });
      return { ok: true, value: projects };
    } catch (error) {
      const normalized = publicError(error);
      update({ status: 'error', error: normalized });
      return { ok: false, error: normalized };
    }
  }

  function dispatch(result) {
    if (result.errors?.length) {
      const error = { code: result.errors[0].code, message: result.errors[0].message, details: result.errors };
      update({ status: 'error', error });
      return { ok: false, error };
    }
    if (!result.changed) {
      if (result.confirmationRequired) {
        update({ pendingIntent: { type: 'resize', result }, error: null });
      }
      return { ok: true, changed: false, confirmationRequired: Boolean(result.confirmationRequired) };
    }
    const selection = state.selection.filter((cell) => Number.isInteger(cell.row)
      && Number.isInteger(cell.column)
      && cell.row >= 0
      && cell.column >= 0
      && cell.row < result.project.board.rows
      && cell.column < result.project.board.columns);
    update({ project: result.project, selection, dirty: true, status: 'ready', error: null });
    return { ok: true, changed: true };
  }

  function save() {
    update({ status: 'saving', error: null });
    try {
      const project = repository.save(state.project);
      state = { ...state, project, dirty: false, status: 'saved', error: null };
      try {
        state.projects = repository.list();
      } catch {
        // The successful save remains valid even if the list refresh fails.
      }
      notify();
      return { ok: true, value: project };
    } catch (error) {
      const normalized = publicError(error);
      update({ status: 'error', error: normalized, dirty: true });
      return { ok: false, error: normalized };
    }
  }

  function performIntent(intent) {
    if (intent.type === 'new') {
      update({
        project: createDefaultProject({ id: idFactory(), now: clock() }),
        dirty: true,
        status: 'ready',
        error: null,
        pendingIntent: null,
        selection: [],
        activeMaterialId: 'maple',
      });
      return { ok: true };
    }
    if (intent.type === 'open') {
      try {
        const project = repository.load(intent.id);
        update({
          project,
          dirty: false,
          status: 'ready',
          error: null,
          pendingIntent: null,
          selection: [],
          activeMaterialId: project.palette[0].id,
        });
        return { ok: true, value: project };
      } catch (error) {
        const normalized = publicError(error);
        update({ status: 'error', error: normalized, pendingIntent: null });
        return { ok: false, error: normalized };
      }
    }
    return { ok: false, error: { code: 'UNKNOWN_INTENT', message: 'Неизвестное действие.' } };
  }

  function request(intent) {
    if (state.dirty) {
      update({ pendingIntent: intent, error: null });
      return { ok: true, pending: true };
    }
    return performIntent(intent);
  }

  function newProject() {
    return request({ type: 'new' });
  }

  function requestOpen(id) {
    return request({ type: 'open', id });
  }

  function resolvePending(decision) {
    const intent = state.pendingIntent;
    if (!intent) return { ok: true };
    if (decision === 'cancel') {
      update({ pendingIntent: null });
      return { ok: true };
    }
    if (decision === 'save') {
      const saved = save();
      if (!saved.ok) return saved;
    } else if (decision !== 'discard') {
      return { ok: false, error: { code: 'UNKNOWN_DECISION', message: 'Неизвестное решение.' } };
    }
    return performIntent(intent);
  }

  async function exportImage() {
    const dirty = state.dirty;
    update({ status: 'exporting', error: null });
    try {
      const value = await exporter(state.project);
      update({ status: 'ready', dirty, error: null });
      return { ok: true, value };
    } catch (error) {
      const normalized = publicError(error);
      update({ status: 'error', dirty, error: normalized });
      return { ok: false, error: normalized };
    }
  }

  function setSelection(selection) {
    update({ selection: [...selection] });
  }

  function setTool(tool) {
    update({ tool });
  }

  function setActiveMaterial(materialId) {
    update({ activeMaterialId: materialId });
  }

  function renameProject(name) {
    const trimmed = name.trim();
    if (trimmed.length < 1 || trimmed.length > 80) {
      const error = { code: 'VALIDATION_ERROR', message: 'Название должно содержать от 1 до 80 символов.' };
      update({ status: 'error', error });
      return { ok: false, error };
    }
    if (trimmed === state.project.name) return { ok: true, changed: false };
    update({ project: { ...state.project, name: trimmed }, dirty: true, status: 'ready', error: null });
    return { ok: true, changed: true };
  }

  return {
    getState,
    subscribe,
    refreshProjects,
    dispatch,
    save,
    newProject,
    requestOpen,
    resolvePending,
    exportImage,
    setSelection,
    setTool,
    setActiveMaterial,
    renameProject,
  };
}
