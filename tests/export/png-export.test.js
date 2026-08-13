import test from 'node:test';
import assert from 'node:assert/strict';

import { createDefaultProject } from '../../src/domain/project-model.js';
import {
  renderProjectPng,
  sanitizePngFilename,
} from '../../src/export/png-export.js';
import { createFakeCanvas } from '../helpers/fake-canvas.js';

function fixture() {
  return createDefaultProject({ id: 'project-1', now: '2026-08-11T10:00:00.000Z' });
}

test('sanitizePngFilename preserves a useful project name and replaces forbidden characters', () => {
  assert.equal(sanitizePngFilename('Моя: доска?'), 'Моя- доска-.png');
  assert.equal(sanitizePngFilename('   '), 'board-project.png');
  assert.equal(sanitizePngFilename('board.png'), 'board.png');
});

test('renderProjectPng creates a proportional 2400 x 1800 PNG through the shared renderer', async () => {
  let fake;
  const result = await renderProjectPng(fixture(), {
    canvasFactory: (width, height) => {
      fake = createFakeCanvas(width, height);
      return fake.canvas;
    },
  });

  assert.equal(result.filename, 'Новая доска.png');
  assert.equal(result.mime, 'image/png');
  assert.equal(result.width, 2400);
  assert.equal(result.height, 1800);
  assert.deepEqual(result.blob, { type: 'image/png', size: 1234 });
  assert.equal(fake.calls.filter(([name]) => name === 'fillRect').length, 49);
  assert.equal(fake.calls.some(([name]) => name === 'setLineDash'), false);
});

test('renderProjectPng reports EXPORT_FAILED when the canvas cannot render', async () => {
  await assert.rejects(
    renderProjectPng(fixture(), {
      canvasFactory: (width, height) => createFakeCanvas(width, height, { failContext: true }).canvas,
    }),
    (error) => error.code === 'EXPORT_FAILED',
  );
});

test('renderProjectPng reports EXPORT_FAILED when PNG encoding returns no blob', async () => {
  await assert.rejects(
    renderProjectPng(fixture(), {
      canvasFactory: (width, height) => createFakeCanvas(width, height, { failBlob: true }).canvas,
    }),
    (error) => error.code === 'EXPORT_FAILED',
  );
});
