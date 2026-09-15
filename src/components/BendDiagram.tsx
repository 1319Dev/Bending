import type { BendResults } from '../utils/calculations';

interface Props {
  results: BendResults;
  angleDeg: number;
  tangentIn: number;
  tangentOut: number;
}

/**
 * Simple schematic of a planar circular bend with optional tangents.
 * Coordinates are normalized to fit a viewBox; labels are illustrative.
 */
export function BendDiagram({ results, angleDeg, tangentIn, tangentOut }: Props) {
  const R = 80;
  const cx = 120;
  const cy = 140;
  // Draw bend starting at angle 0 (along +X from center? Standard: pipe along +X into bend center at origin.
  // Start point at (cx - R? Let's do: center of curvature at (cx, cy).
  // Inlet comes horizontally from left to start of arc at angle π (left), then sweeps clockwise or CCW by θ.
  // Common diagram: horizontal inlet from left, bend upward (CCW) by θ.
  // Start at angle = π (point left of center), sweep CCW by θ → end at π + θ? Wait CCW from π goes toward down.
  // Better: start at angle = 0 (right of center? No.
  // Classic LR elbow diagram: center at origin, start at (0,-R) coming from -Y? 
  // Simplest: center at (cx, cy), start at angle = Math.PI (west), sweep clockwise by θ so it ends going "up" for 90°.
  // Clockwise from west: for 90° ends at north. SVG arcs: positive sweep is clockwise if we use sweep-flag 1.
  // Start: (cx - R, cy). End for θ: angle from west clockwise = θ → absolute SVG angle from +X: π + θ? 
  // From west clockwise θ: parametric angle from +X CCW is π - θ.
  // End x = cx + R*cos(π - θ) = cx - R*cos(θ)
  // End y = cy - R*sin(π - θ) wait SVG y grows down: y = cy + R*sin(π - θ) if we use math y-up then flip...
  // Math (y up): start (cx-R, cy), end (cx - R*cos(θ), cy + R*sin(θ)) for counterclockwise upward? 
  // From west CCW: goes up. End at angle π - θ from +X: (cos(π-θ), sin(π-θ)) = (-cosθ, sinθ)
  // With y-up: end = (cx - R cosθ, cy - R sinθ) if we flip for SVG.
  // SVG: y = cy - R*sin(θ) for upward.

  const theta = (angleDeg * Math.PI) / 180;
  const startX = cx - R;
  const startY = cy;
  const endX = cx - R * Math.cos(theta);
  const endY = cy - R * Math.sin(theta);
  const largeArc = angleDeg > 180 ? 1 : 0;

  // Tangent lengths scaled relative to R for display (capped)
  const maxT = 50;
  const tInScale = tangentIn > 0 || tangentOut > 0
    ? Math.min(maxT, 40)
    : 0;
  const tInLen = tangentIn > 0 ? tInScale : 20; // always show short inlet stub
  const tOutLen = tangentOut > 0 ? tInScale : 20;

  const inletX0 = startX - tInLen;
  const inletY0 = startY;

  // Outlet tangent direction is tangent to arc at end: angle of radius is π - θ, tangent CCW is that + π/2
  // Direction of travel at end (CCW): (-sin(π-θ), cos(π-θ)) in math y-up → (-sin(π-θ), -cos(π-θ)) in SVG? 
  // Parametric: point = (cx + R*cos(α), cy - R*sin(α)) with α from π to π-θ (decreasing for CCW up).
  // α_start = π, α_end = π - θ
  // d/dα of (cos α, -sin α) = (-sin α, -cos α); decreasing α means reverse: (sin α, cos α)
  // At α = π - θ: dir = (sin(π-θ), cos(π-θ)) = (sinθ, -cosθ)
  const dirX = Math.sin(theta);
  const dirY = -Math.cos(theta);
  const outletX1 = endX + dirX * tOutLen;
  const outletY1 = endY + dirY * tOutLen;

  const path = [
    `M ${inletX0} ${inletY0}`,
    `L ${startX} ${startY}`,
    `A ${R} ${R} 0 ${largeArc} 1 ${endX} ${endY}`,
    `L ${outletX1} ${outletY1}`,
  ].join(' ');

  // Radius guide
  const midAlpha = Math.PI - theta / 2;
  const midX = cx + R * Math.cos(midAlpha);
  const midY = cy - R * Math.sin(midAlpha);

  return (
    <svg
      viewBox="0 0 240 200"
      className="bend-diagram"
      role="img"
      aria-label={`Bend schematic, ${angleDeg}°`}
    >
      {/* Center mark */}
      <circle cx={cx} cy={cy} r={3} className="diagram-center" />
      {/* Radius line */}
      <line x1={cx} y1={cy} x2={midX} y2={midY} className="diagram-radius" />
      <text x={(cx + midX) / 2 + 6} y={(cy + midY) / 2 - 4} className="diagram-label">
        CLR
      </text>
      {/* Pipe centerline path */}
      <path d={path} className="diagram-pipe" fill="none" />
      {/* Angle arc (small) */}
      <path
        d={`M ${cx - 28} ${cy} A 28 28 0 ${largeArc} 1 ${cx - 28 * Math.cos(theta)} ${cy - 28 * Math.sin(theta)}`}
        className="diagram-angle-arc"
        fill="none"
      />
      <text
        x={cx - 40 * Math.cos(theta / 2)}
        y={cy - 40 * Math.sin(theta / 2) + 4}
        className="diagram-label"
        textAnchor="middle"
      >
        {angleDeg}°
      </text>
      {/* Takeoff hints */}
      <text x={8} y={16} className="diagram-caption">
        L = R·sin(θ) · H = R·(1−cos(θ))
      </text>
      <text x={8} y={190} className="diagram-caption">
        Arc = {results.arcLengthIn > 0 ? 'R·θ' : '—'} · Developed = arc + tangents
      </text>
    </svg>
  );
}
