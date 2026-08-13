export function createFakeCanvas(width, height, { failContext = false, failBlob = false } = {}) {
  const calls = [];
  const context = new Proxy({ canvas: null }, {
    get(target, property) {
      if (property in target) return target[property];
      return (...args) => calls.push([property, ...args]);
    },
    set(target, property, value) {
      target[property] = value;
      return true;
    },
  });
  const canvas = {
    width,
    height,
    getContext: () => failContext ? null : context,
    toBlob(callback, type) {
      callback(failBlob ? null : { type, size: 1234 });
    },
  };
  context.canvas = canvas;
  return { canvas, context, calls };
}
