import { getOrientationMatrix } from '../domain/transform-engine.js';

function drawTexture(context, cell) {
  const [a, b, c, d] = getOrientationMatrix(cell.orientation);
  const unit = Math.min(cell.width, cell.height);

  context.save();
  context.beginPath();
  context.rect(cell.x, cell.y, cell.width, cell.height);
  context.clip();
  context.translate(cell.x + cell.width / 2, cell.y + cell.height / 2);
  context.transform(a, c, b, d, 0, 0);
  context.strokeStyle = cell.material.accentColor;
  context.lineWidth = Math.max(1, unit * 0.025);
  context.globalAlpha = 0.65;

  context.beginPath();
  context.ellipse(-unit * 0.16, unit * 0.08, unit * 0.38, unit * 0.23, -0.22, 0, Math.PI * 2);
  context.stroke();
  context.beginPath();
  context.ellipse(-unit * 0.1, unit * 0.12, unit * 0.22, unit * 0.12, -0.22, 0, Math.PI * 2);
  context.stroke();
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
