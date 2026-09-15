interface Props {
  angleDeg: number;
}

/**
 * Field-layout schematic: two tangents meeting at the PI, circular arc
 * between BC (beginning of curve) and EC (end of curve), with T marked.
 */
export function BendDiagram({ angleDeg }: Props) {
  const R = 62;
  const cx = 118;
  const cy = 128;

  const clamped = Math.min(Math.max(angleDeg, 1), 180);
  const theta = (clamped * Math.PI) / 180;

  // BC = start of bend (incoming tangent meets arc)
  const bcX = cx - R;
  const bcY = cy;
  // EC = end of bend
  const ecX = cx - R * Math.cos(theta);
  const ecY = cy - R * Math.sin(theta);

  // Unit directions along incoming / outgoing tangents (away from BC/EC toward PI)
  // Incoming tangent runs along +X toward PI (from left).
  // For a circular bend, PI is at intersection of tangents:
  // T = R * tan(θ/2); from BC along incoming direction toward PI.
  const Tvis = Math.min(R * Math.tan(theta / 2), 55);
  // Incoming direction toward PI: +X
  const piX = bcX + Tvis;
  const piY = bcY;
  // Outgoing direction from EC toward PI is opposite the outlet run direction.
  // Outlet continues: dir = (sin θ, -cos θ)
  // From EC back toward PI: -dir
  const outDirX = Math.sin(theta);
  const outDirY = -Math.cos(theta);
  // Verify PI from EC: ec + (-outDir) * Tvis should ≈ pi
  // For drawing, compute PI as intersection of extended tangents.
  // Incoming line: y = bcY, x varies. Outgoing: through EC with direction outDir.
  // PI on incoming: (bcX + T, bcY) where T = R tan(θ/2)
  // Also: from EC back along -outDir by T reaches PI.

  const inletLen = 36;
  const outletLen = 36;
  const inletX0 = bcX - inletLen;
  const inletY0 = bcY;
  const outletX1 = ecX + outDirX * outletLen;
  const outletY1 = ecY + outDirY * outletLen;

  const largeArc = clamped > 180 ? 1 : 0;

  const pipePath = [
    `M ${inletX0} ${inletY0}`,
    `L ${bcX} ${bcY}`,
    `A ${R} ${R} 0 ${largeArc} 1 ${ecX} ${ecY}`,
    `L ${outletX1} ${outletY1}`,
  ].join(' ');

  // Extended dashed tangents to PI
  const midAlpha = Math.PI - theta / 2;
  const midX = cx + R * Math.cos(midAlpha);
  const midY = cy - R * Math.sin(midAlpha);

  // Label positions for T along incoming
  const tLabelX = (bcX + piX) / 2;
  const tLabelY = bcY + 14;

  return (
    <svg
      viewBox="0 0 240 185"
      className="bend-diagram"
      role="img"
      aria-label={`Field bend layout from PI, ${clamped}° deflection`}
    >
      {/* Extended tangents to PI (dashed) */}
      <line
        x1={bcX}
        y1={bcY}
        x2={piX}
        y2={piY}
        className="diagram-tangent-ext"
      />
      <line
        x1={ecX}
        y1={ecY}
        x2={piX}
        y2={piY}
        className="diagram-tangent-ext"
      />

      {/* CLR radius to arc midpoint */}
      <line x1={cx} y1={cy} x2={midX} y2={midY} className="diagram-radius" />
      <circle cx={cx} cy={cy} r={2.5} className="diagram-center" />

      {/* Pipe path */}
      <path d={pipePath} className="diagram-pipe" fill="none" />

      {/* BC / EC marks */}
      <circle cx={bcX} cy={bcY} r={4} className="diagram-mark" />
      <circle cx={ecX} cy={ecY} r={4} className="diagram-mark" />
      {/* PI mark */}
      <circle cx={piX} cy={piY} r={4.5} className="diagram-pi" />

      <text x={bcX - 2} y={bcY - 10} className="diagram-label" textAnchor="middle">
        BC
      </text>
      <text x={ecX + 10} y={ecY - 8} className="diagram-label" textAnchor="start">
        EC
      </text>
      <text x={piX + 8} y={piY + 4} className="diagram-label-pi" textAnchor="start">
        PI
      </text>

      {/* T dimension on incoming */}
      <text x={tLabelX} y={tLabelY} className="diagram-label-t" textAnchor="middle">
        T
      </text>

      {/* Angle arc */}
      <path
        d={`M ${cx - 22} ${cy} A 22 22 0 ${largeArc} 1 ${cx - 22 * Math.cos(theta)} ${cy - 22 * Math.sin(theta)}`}
        className="diagram-angle-arc"
        fill="none"
      />
      <text
        x={cx - 34 * Math.cos(theta / 2)}
        y={cy - 34 * Math.sin(theta / 2) + 4}
        className="diagram-label"
        textAnchor="middle"
      >
        {clamped}°
      </text>

      <text x={8} y={16} className="diagram-caption">
        T = R·tan(Δ/2) from PI → BC / EC
      </text>
    </svg>
  );
}
