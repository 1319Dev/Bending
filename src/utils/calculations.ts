/**
 * Circular pipe bend geometry for oil & gas field bends.
 *
 * Layout from the PI (point of intersection):
 * - Incoming and outgoing straights would meet at the PI if extended.
 * - Circular field bend of centerline radius R and deflection angle Δ (degrees).
 * - Tangent distance T = R * tan(Δ/2)  — distance from PI back along each
 *   tangent to the BC (beginning of curve / start of bend) and EC (end of curve).
 * - Arc / pull length L = R * Δ_rad
 * - Chord C = 2 * R * sin(Δ/2)
 * - External E = R * (1/cos(Δ/2) - 1)  — PI to midpoint of the arc
 * - Ahead (tangent projection) L_ahead = R * sin(Δ)
 * - Offset (rise) H = R * (1 - cos(Δ))
 */

export interface BendInputs {
  /** Centerline radius in inches */
  clrIn: number;
  /** Bend / deflection angle in degrees (Δ) */
  angleDeg: number;
  /** Outside diameter in inches */
  odIn: number;
  /** Wall thickness in inches */
  wallIn: number;
  /** Inlet tangent length in inches (straight added before arc — optional) */
  tangentInIn: number;
  /** Outlet tangent length in inches (straight added after arc — optional) */
  tangentOutIn: number;
}

export interface BendResults {
  angleRad: number;
  /** Centerline arc length (developed / pull length) L = R · Δ_rad */
  arcLengthIn: number;
  /** Total developed length = arc + both tangents */
  totalDevelopedIn: number;
  /** Tangent distance from PI to BC/EC: T = R · tan(Δ/2) */
  tangentDistanceIn: number;
  /** External (PI to arc midpoint): E = R · (1/cos(Δ/2) − 1) */
  externalIn: number;
  /** Ahead / tangent projection L = R * sin(Δ) */
  horizontalProjectionIn: number;
  /** Offset / rise H = R * (1 - cos(Δ)) */
  verticalProjectionIn: number;
  /** Chord length = 2 * R * sin(Δ/2) */
  chordLengthIn: number;
  /** Outer fiber arc length (OD) */
  outerArcIn: number;
  /** Inner fiber arc length (ID side of wall at OD/2 from CL — uses OD/2) */
  innerArcIn: number;
  /** Inside diameter */
  idIn: number;
  /** Outside diameter */
  odIn: number;
  wallIn: number;
  clrIn: number;
  /** CLR as multiple of OD */
  clrMultiple: number;
}

export function calculateBend(inputs: BendInputs): BendResults {
  const { clrIn, angleDeg, odIn, wallIn, tangentInIn, tangentOutIn } = inputs;
  const angleRad = (angleDeg * Math.PI) / 180;
  const half = angleRad / 2;
  const arcLengthIn = clrIn * angleRad;
  const outerArcIn = (clrIn + odIn / 2) * angleRad;
  const innerArcIn = Math.max(0, (clrIn - odIn / 2) * angleRad);
  const horizontalProjectionIn = clrIn * Math.sin(angleRad);
  const verticalProjectionIn = clrIn * (1 - Math.cos(angleRad));
  const chordLengthIn = 2 * clrIn * Math.sin(half);
  // T = R · tan(Δ/2) — hero layout number from the PI
  const tangentDistanceIn = clrIn * Math.tan(half);
  // E = R · (sec(Δ/2) − 1)
  const cosHalf = Math.cos(half);
  const externalIn = cosHalf > 1e-12 ? clrIn * (1 / cosHalf - 1) : 0;
  const idIn = Math.max(0, odIn - 2 * wallIn);
  const clrMultiple = odIn > 0 ? clrIn / odIn : 0;

  return {
    angleRad,
    arcLengthIn,
    totalDevelopedIn: arcLengthIn + tangentInIn + tangentOutIn,
    tangentDistanceIn,
    externalIn,
    horizontalProjectionIn,
    verticalProjectionIn,
    chordLengthIn,
    outerArcIn,
    innerArcIn,
    idIn,
    odIn,
    wallIn,
    clrIn,
    clrMultiple,
  };
}
