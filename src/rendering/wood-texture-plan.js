const PROFILES = Object.freeze({
  maple: Object.freeze({ ringColor: '#9a6a32', ringAlpha: 0.38, ringCount: 11, poreColor: '#6f451f', poreAlpha: 0.25, poreRadius: 0.009, poreCount: 24, rayColor: '#fff0bd', rayAlpha: 0.16, rayCount: 9 }),
  walnut: Object.freeze({ ringColor: '#241008', ringAlpha: 0.48, ringCount: 9, poreColor: '#120806', poreAlpha: 0.48, poreRadius: 0.018, poreCount: 42, rayColor: '#bd8155', rayAlpha: 0.13, rayCount: 6 }),
  cherry: Object.freeze({ ringColor: '#713419', ringAlpha: 0.42, ringCount: 10, poreColor: '#4b2112', poreAlpha: 0.34, poreRadius: 0.012, poreCount: 31, rayColor: '#f0aa79', rayAlpha: 0.22, rayCount: 7 }),
});

function hashText(text) {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createRandom(seed) {
  let state = seed || 0x6d2b79f5;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function profileFor(material) {
  const id = String(material.id ?? '').toLowerCase();
  if (id.includes('walnut') || id.includes('орех')) return PROFILES.walnut;
  if (id.includes('cherry') || id.includes('виш')) return PROFILES.cherry;
  return PROFILES.maple;
}

export function buildWoodTexturePlan(cell) {
  const profile = profileFor(cell.material);
  const random = createRandom(hashText(`${cell.material.id}:${cell.row}:${cell.column}`));
  const center = { x: (random() - 0.5) * 0.3, y: (random() - 0.5) * 0.26 };
  const rotation = (random() - 0.5) * 0.65;
  const rings = Array.from({ length: profile.ringCount }, (_, index) => ({
    radius: 0.075 + index * (0.43 / profile.ringCount) + random() * 0.009,
    aspect: 0.56 + random() * 0.22,
    rotation: rotation + (random() - 0.5) * 0.08,
    wobble: 0.018 + random() * 0.027,
    phase: random() * Math.PI * 2,
  }));
  const pores = Array.from({ length: profile.poreCount }, () => ({
    x: random() - 0.5,
    y: random() - 0.5,
    radius: profile.poreRadius * (0.5 + random()),
    alpha: profile.poreAlpha * (0.55 + random() * 0.45),
  }));
  const rays = Array.from({ length: profile.rayCount }, () => ({
    angle: random() * Math.PI * 2,
    start: 0.06 + random() * 0.08,
    length: 0.25 + random() * 0.24,
    width: 0.003 + random() * 0.006,
    alpha: profile.rayAlpha * (0.55 + random() * 0.45),
  }));

  return { center, rotation, rings, pores, rays, profile };
}
