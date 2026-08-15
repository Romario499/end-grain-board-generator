import { getOrientationMatrix } from '../domain/transform-engine.js';
import { buildWoodTexturePlan } from './wood-texture-plan.js';
import { getWoodTextureImage } from './wood-texture-assets.js';

function drawRings(context, texture, unit) {
  const centerX = texture.center.x * unit;
  const centerY = texture.center.y * unit;
  context.strokeStyle = texture.profile.ringColor;
  context.lineWidth = Math.max(0.65, unit * 0.012);
  context.lineCap = 'round';
  context.globalAlpha = texture.profile.ringAlpha;
  for (const ring of texture.rings) {
    for (let contour = 0; contour < 3; contour += 1) {
      const phase = ring.phase + contour * 2.094;
      const drift = ring.wobble * unit;
      const radiusX = Math.max(1, (ring.radius + ring.wobble * Math.sin(phase * 1.7)) * unit);
      const radiusY = Math.max(1, radiusX * (ring.aspect + ring.wobble * Math.cos(phase * 1.3)));
      context.beginPath();
      context.ellipse(centerX + Math.cos(phase) * drift, centerY + Math.sin(phase) * drift, radiusX, radiusY, ring.rotation, contour * 2.094, (contour + 1) * 2.094 + 0.1);
      context.stroke();
    }
  }
}

function drawPores(context, texture, unit) {
  context.fillStyle = texture.profile.poreColor;
  for (const pore of texture.pores) {
    context.globalAlpha = pore.alpha;
    context.beginPath();
    context.ellipse(pore.x * unit, pore.y * unit, Math.max(0.45, pore.radius * unit), Math.max(0.3, pore.radius * unit * 0.58), pore.x * 1.8, 0, Math.PI * 2);
    context.fill();
  }
}

function drawRays(context, texture, unit) {
  const centerX = texture.center.x * unit;
  const centerY = texture.center.y * unit;
  context.strokeStyle = texture.profile.rayColor;
  context.lineCap = 'round';
  for (const ray of texture.rays) {
    const start = ray.start * unit;
    const end = (ray.start + ray.length) * unit;
    context.globalAlpha = ray.alpha;
    context.lineWidth = Math.max(0.45, ray.width * unit);
    context.beginPath();
    context.moveTo(centerX + Math.cos(ray.angle) * start, centerY + Math.sin(ray.angle) * start);
    context.lineTo(centerX + Math.cos(ray.angle) * end, centerY + Math.sin(ray.angle) * end);
    context.stroke();
  }
}

function drawPhotoTexture(context, cell, texture) {
  const image = getWoodTextureImage(cell.material.textureKey);
  if (!image) return false;
  const naturalWidth = image.naturalWidth || image.width;
  const naturalHeight = image.naturalHeight || image.height;
  const cropSize = Math.max(96, Math.min(naturalWidth, naturalHeight) * 0.34);
  const phase = texture.rings[0]?.phase ?? 0;
  const sourceX = Math.abs(Math.sin(phase)) * Math.max(0, naturalWidth - cropSize);
  const sourceY = Math.abs(Math.cos(phase * 1.37)) * Math.max(0, naturalHeight - cropSize);
  context.drawImage(image, sourceX, sourceY, cropSize, cropSize, -cell.width / 2, -cell.height / 2, cell.width, cell.height);
  return true;
}

function drawTexture(context, cell) {
  const [a, b, c, d] = getOrientationMatrix(cell.orientation);
  const unit = Math.min(cell.width, cell.height);
  const texture = buildWoodTexturePlan(cell);
  context.save();
  context.beginPath();
  context.rect(cell.x, cell.y, cell.width, cell.height);
  context.clip();
  context.translate(cell.x + cell.width / 2, cell.y + cell.height / 2);
  context.transform(a, c, b, d, 0, 0);
  if (!drawPhotoTexture(context, cell, texture)) {
    drawRings(context, texture, unit);
    drawPores(context, texture, unit);
    drawRays(context, texture, unit);
  }
  context.restore();
}

export function drawBoard(context, plan) {
  context.save();
  context.fillStyle = '#171310';
  context.fillRect(0, 0, plan.width, plan.height);
  for (const cell of plan.cells) {
    context.fillStyle = cell.material.baseColor;
    context.fillRect(cell.x, cell.y, cell.width, cell.height);
    drawTexture(context, cell);
    context.strokeStyle = 'rgba(34, 20, 12, 0.32)';
    context.globalAlpha = 1;
    context.lineWidth = Math.max(0.5, Math.min(cell.width, cell.height) * 0.018);
    context.strokeRect(cell.x, cell.y, cell.width, cell.height);
    if (cell.selected) {
      context.save();
      context.strokeStyle = '#f5c66a';
      context.lineWidth = 3;
      context.setLineDash([7, 5]);
      context.strokeRect(cell.x + 2, cell.y + 2, Math.max(0, cell.width - 4), Math.max(0, cell.height - 4));
      context.restore();
    }
  }
  context.restore();
}
