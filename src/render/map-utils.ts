/**
 * AEGIS TRANSIT — Tactical Map Drawing Utilities
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * Canvas 2D drawing routines, coordinate projections, and telemetry formatters.
 */

import { AU_KM, degToRad } from '@sim/constants';

/**
 * Transforms world coordinates (in AU, +X right, +Y up) to screen canvas coordinates (in pixels, +X right, +Y down).
 *
 * @param worldX World X coordinate in AU
 * @param worldY World Y coordinate in AU
 * @param centerX Center of view in AU
 * @param centerY Center of view in AU
 * @param scale Pixels per AU
 * @param canvasW Canvas display width in pixels
 * @param canvasH Canvas display height in pixels
 * @returns [screenX, screenY] in pixels
 */
export function worldToScreen(
  worldX: number,
  worldY: number,
  centerX: number,
  centerY: number,
  scale: number,
  canvasW: number,
  canvasH: number
): [number, number] {
  const sx = canvasW / 2 + (worldX - centerX) * scale;
  const sy = canvasH / 2 - (worldY - centerY) * scale;
  return [sx, sy];
}

/**
 * Transforms screen canvas coordinates (in pixels) to world coordinates (in AU).
 *
 * @param screenX Screen X coordinate in pixels
 * @param screenY Screen Y coordinate in pixels
 * @param centerX Center of view in AU
 * @param centerY Center of view in AU
 * @param scale Pixels per AU
 * @param canvasW Canvas display width in pixels
 * @param canvasH Canvas display height in pixels
 * @returns [worldX, worldY] in AU
 */
export function screenToWorld(
  screenX: number,
  screenY: number,
  centerX: number,
  centerY: number,
  scale: number,
  canvasW: number,
  canvasH: number
): [number, number] {
  const wx = centerX + (screenX - canvasW / 2) / scale;
  const wy = centerY - (screenY - canvasH / 2) / scale;
  return [wx, wy];
}

/**
 * Draws a Keplerian orbit ellipse in the ecliptic plane.
 *
 * @param ctx Canvas 2D rendering context
 * @param a Semi-major axis in AU
 * @param e Orbital eccentricity (0 <= e < 1)
 * @param wbar Longitude of perihelion in degrees (or radians if isDegrees=false)
 * @param color Stroke style string
 * @param dash Optional stroke dash pattern, e.g. [4, 4]
 * @param toScreen Optional coordinate transform function from world AU to screen pixels
 * @param isDegrees Whether wbar is in degrees (default true, matching OrbitalElements)
 * @param steps Number of sample points along the orbit (default 180)
 */
export function drawOrbitEllipse(
  ctx: CanvasRenderingContext2D,
  a: number,
  e: number,
  wbar: number,
  color: string,
  dash: number[] = [4, 4],
  toScreen: (wx: number, wy: number) => [number, number] = (x, y) => [x, y],
  isDegrees: boolean = true,
  steps: number = 180
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.setLineDash(dash);

  const wbarRad = isDegrees ? degToRad(wbar) : wbar;
  const safeE = Math.max(0, Math.min(0.999, e));
  const p = a * (1 - safeE * safeE);

  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const nu = (i / steps) * 2 * Math.PI;
    const r = p / (1 + safeE * Math.cos(nu));
    const lambda = wbarRad + nu;
    const wx = r * Math.cos(lambda);
    const wy = r * Math.sin(lambda);
    const [sx, sy] = toScreen(wx, wy);

    if (i === 0) {
      ctx.moveTo(sx, sy);
    } else {
      ctx.lineTo(sx, sy);
    }
  }

  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

/**
 * Draws sci-fi corner bracket decorations around a rectangular region.
 *
 * @param ctx Canvas 2D rendering context
 * @param x Left coordinate
 * @param y Top coordinate
 * @param w Width of bounded area
 * @param h Height of bounded area
 * @param color Stroke color
 * @param bracketLen Length of corner brackets in pixels (default 6)
 */
export function drawCornerBrackets(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  bracketLen: number = 6
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();

  const bl = Math.min(bracketLen, w / 2, h / 2);

  // Top-left
  ctx.moveTo(x, y + bl);
  ctx.lineTo(x, y);
  ctx.lineTo(x + bl, y);

  // Top-right
  ctx.moveTo(x + w - bl, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + bl);

  // Bottom-left
  ctx.moveTo(x, y + h - bl);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x + bl, y + h);

  // Bottom-right
  ctx.moveTo(x + w - bl, y + h);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x + w, y + h - bl);

  ctx.stroke();
  ctx.restore();
}

/**
 * Draws a celestial body or vehicle marker with optional radial glow and HUD label.
 *
 * @param ctx Canvas 2D rendering context
 * @param x Screen X coordinate
 * @param y Screen Y coordinate
 * @param radius Marker radius in screen pixels
 * @param color Fill / theme color string
 * @param label Optional text label
 * @param glow Whether to draw an ambient radial glow
 */
export function drawBody(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  label?: string,
  glow: boolean = false
): void {
  ctx.save();

  if (glow) {
    const glowRadius = Math.max(radius * 3.5, 14);
    const grad = ctx.createRadialGradient(x, y, radius * 0.4, x, y, glowRadius);
    grad.addColorStop(0, color);
    grad.addColorStop(0.35, color);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.save();
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, glowRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  }

  // Draw main body circle
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.fill();

  // Subtle bright core highlight
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x, y, Math.max(1, radius * 0.35), 0, 2 * Math.PI);
  ctx.fill();

  // Label
  if (label) {
    ctx.font = '10px "Courier New", Consolas, monospace';
    ctx.fillStyle = '#e0e6ed';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';

    const textX = x + radius + 7;
    const textY = y - radius - 2;
    const metrics = ctx.measureText(label);
    const pad = 3;
    const badgeW = metrics.width + pad * 2;
    const badgeH = 13;

    // Small dark badge backing
    ctx.fillStyle = 'rgba(10, 14, 20, 0.8)';
    ctx.fillRect(textX - pad, textY - badgeH / 2, badgeW, badgeH);

    // Subtle corner brackets for the badge
    drawCornerBrackets(ctx, textX - pad, textY - badgeH / 2, badgeW, badgeH, color, 3);

    // Text
    ctx.fillStyle = '#e0e6ed';
    ctx.fillText(label, textX, textY);
  }

  ctx.restore();
}

/**
 * Draws a directional arrow on the canvas.
 *
 * @param ctx Canvas 2D rendering context
 * @param x1 Start screen X
 * @param y1 Start screen Y
 * @param x2 End screen X (arrowhead tip)
 * @param y2 End screen Y (arrowhead tip)
 * @param color Stroke and fill color
 * @param headLength Length of arrowhead wings in pixels (default 8)
 */
export function drawArrow(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  headLength: number = 8
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1;

  // Main shaft
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  // Arrowhead
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const arrowAngle = Math.PI / 6; // 30 degrees

  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(
    x2 - headLength * Math.cos(angle - arrowAngle),
    y2 - headLength * Math.sin(angle - arrowAngle)
  );
  ctx.lineTo(
    x2 - headLength * Math.cos(angle + arrowAngle),
    y2 - headLength * Math.sin(angle + arrowAngle)
  );
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/**
 * Draws a diamond marker (standard spacecraft tactical icon).
 *
 * @param ctx Canvas 2D rendering context
 * @param x Screen center X
 * @param y Screen center Y
 * @param size Half-width/height of diamond in pixels
 * @param color Stroke and fill color
 * @param fill Whether to fill interior
 */
export function drawDiamond(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  fill: boolean = true
): void {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.lineTo(x + size, y);
  ctx.lineTo(x, y + size);
  ctx.lineTo(x - size, y);
  ctx.closePath();

  if (fill) {
    ctx.fill();
  }
  ctx.stroke();
  ctx.restore();
}

/**
 * Formats a distance in AU into a human-readable sci-fi string.
 * Uses 'X.XXX AU' for values >= 0.01 AU, or scientific / km notation for small values.
 *
 * @param au Distance in Astronomical Units
 * @returns Formatted distance string (e.g. '1.524 AU' or '1.23e6 km')
 */
export function formatDistance(au: number): string {
  const absVal = Math.abs(au);
  if (absVal >= 0.01) {
    return `${au.toFixed(3)} AU`;
  }
  const km = au * AU_KM;
  return `${km.toExponential(2).replace('e+', 'e')} km`;
}

/**
 * Formats a time duration in seconds into light-time format 'Xm Ys' (or 'Xh Ym Zs' if >= 3600s).
 *
 * @param seconds Light time duration in seconds
 * @returns Formatted light-time string
 */
export function formatLightTime(seconds: number): string {
  const safeSec = Math.max(0, Math.round(seconds));
  const h = Math.floor(safeSec / 3600);
  const m = Math.floor((safeSec % 3600) / 60);
  const s = safeSec % 60;

  if (h > 0) {
    return `${h}h ${m}m ${s}s`;
  }
  return `${m}m ${s}s`;
}
