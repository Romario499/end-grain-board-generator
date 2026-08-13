import test from 'node:test';
import assert from 'node:assert/strict';

import {
  OPERATIONS,
  applyOrientation,
} from '../../src/domain/transform-engine.js';

test('four clockwise rotations restore every canonical orientation', () => {
  const orientations = ['R0', 'R90', 'R180', 'R270', 'M0', 'M90', 'M180', 'M270'];

  for (const orientation of orientations) {
    let actual = orientation;
    for (let index = 0; index < 4; index += 1) {
      actual = applyOrientation(actual, OPERATIONS.ROTATE_CW);
    }
    assert.equal(actual, orientation);
  }
});

test('two left-right reflections restore the initial orientation', () => {
  assert.equal(
    applyOrientation(
      applyOrientation('R90', OPERATIONS.MIRROR_LEFT_RIGHT),
      OPERATIONS.MIRROR_LEFT_RIGHT,
    ),
    'R90',
  );
});

test('two top-bottom reflections restore the initial orientation', () => {
  assert.equal(
    applyOrientation(
      applyOrientation('M90', OPERATIONS.MIRROR_TOP_BOTTOM),
      OPERATIONS.MIRROR_TOP_BOTTOM,
    ),
    'M90',
  );
});

test('rotation followed by left-right reflection differs from reflection followed by rotation', () => {
  const rotateThenMirror = applyOrientation(
    applyOrientation('R0', OPERATIONS.ROTATE_CW),
    OPERATIONS.MIRROR_LEFT_RIGHT,
  );
  const mirrorThenRotate = applyOrientation(
    applyOrientation('R0', OPERATIONS.MIRROR_LEFT_RIGHT),
    OPERATIONS.ROTATE_CW,
  );

  assert.equal(rotateThenMirror, 'M270');
  assert.equal(mirrorThenRotate, 'M90');
});

test('top-bottom reflection of the base orientation has the canonical M180 value', () => {
  assert.equal(applyOrientation('R0', OPERATIONS.MIRROR_TOP_BOTTOM), 'M180');
});

test('applyOrientation rejects unknown inputs instead of producing an invalid state', () => {
  assert.throws(() => applyOrientation('UNKNOWN', OPERATIONS.ROTATE_CW), /orientation/i);
  assert.throws(() => applyOrientation('R0', 'UNKNOWN'), /operation/i);
});
