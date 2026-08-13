import { drawBoard } from '../rendering/canvas-renderer.js';
import {
  buildBoardRenderPlan,
  calculateExportSize,
} from '../rendering/render-plan.js';

export class PngExportError extends Error {
  constructor(message, cause) {
    super(message, cause ? { cause } : undefined);
    this.name = 'PngExportError';
    this.code = 'EXPORT_FAILED';
  }
}

export function sanitizePngFilename(name) {
  const normalized = String(name ?? '')
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-')
    .replace(/[. ]+$/g, '');
  if (!normalized) return 'board-project.png';
  return normalized.toLowerCase().endsWith('.png') ? normalized : `${normalized}.png`;
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new PngExportError('Не удалось закодировать PNG.'));
    }, 'image/png');
  });
}

export async function renderProjectPng(project, {
  canvasFactory,
  longSidePx = 2400,
} = {}) {
  try {
    const { width, height } = calculateExportSize(project.board, longSidePx);
    const canvas = canvasFactory(width, height);
    const context = canvas?.getContext?.('2d');
    if (!context) throw new PngExportError('Браузер не предоставил Canvas 2D.');
    const plan = buildBoardRenderPlan(project, { width, height, showSelection: false });
    drawBoard(context, plan);
    const blob = await canvasToBlob(canvas);
    return {
      filename: sanitizePngFilename(project.name),
      mime: 'image/png',
      width,
      height,
      blob,
    };
  } catch (error) {
    if (error?.code === 'EXPORT_FAILED') throw error;
    throw new PngExportError('Не удалось экспортировать PNG.', error);
  }
}

export function createBrowserPngExporter({ documentObject, urlApi }) {
  return async (project) => {
    const result = await renderProjectPng(project, {
      canvasFactory: (width, height) => {
        const canvas = documentObject.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
      },
    });
    const url = urlApi.createObjectURL(result.blob);
    const anchor = documentObject.createElement('a');
    anchor.href = url;
    anchor.download = result.filename;
    anchor.click();
    urlApi.revokeObjectURL(url);
    return result;
  };
}
