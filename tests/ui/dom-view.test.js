import test from 'node:test';
import assert from 'node:assert/strict';

import { renderMaterials, renderProjectList } from '../../src/ui/dom-view.js';
import { createFakeContainer } from '../helpers/fake-dom.js';

test('renderMaterials keeps material fields as DOM data instead of HTML markup', () => {
  const container = createFakeContainer();
  const maliciousName = '<img src=x onerror="globalThis.xss=true">';
  const maliciousId = 'maple\" onclick=\"globalThis.xss=true';

  renderMaterials(container, {
    activeMaterialId: maliciousId,
    project: {
      palette: [{
        id: maliciousId,
        name: maliciousName,
        baseColor: '#f0d8ad',
        accentColor: '#c29a62',
      }],
    },
  });

  const [button] = container.children;
  assert.equal(button.dataset.material, maliciousId);
  assert.equal(button.children[1].textContent, maliciousName);
  assert.equal(button.children.some((child) => child.tagName === 'IMG'), false);
});

test('renderProjectList keeps stored project fields as DOM data instead of HTML markup', () => {
  const container = createFakeContainer();
  const maliciousName = '<img src=x onerror="globalThis.xss=true">';
  const maliciousId = 'project\" onclick=\"globalThis.xss=true';

  renderProjectList(container, [{
    id: maliciousId,
    name: maliciousName,
    updatedAt: '2026-08-11T12:00:00.000Z',
  }]);

  const [button] = container.children;
  assert.equal(button.value, maliciousId);
  assert.equal(button.dataset.openId, maliciousId);
  assert.equal(button.children[0].textContent, maliciousName);
  assert.equal(button.children.some((child) => child.tagName === 'IMG'), false);
});
