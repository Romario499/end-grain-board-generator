const UINT32_RANGE = 0x1_0000_0000;

export function normalizeSeed(seed) {
  if (Number.isFinite(seed)) {
    return Math.trunc(seed) >>> 0;
  }

  const text = String(seed ?? '');
  let hash = 0x811c9dc5;

  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return hash >>> 0;
}

export function createSeededRandom(seed) {
  let state = normalizeSeed(seed);

  return function nextRandom() {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / UINT32_RANGE;
  };
}
