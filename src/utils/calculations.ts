/**
 * Circular pipe bend geometry.
 *
 * Assumptions (single plane bend):
 * - Centerline radius R (CLR) is measured to the pipe centerline.
 * - Bend angle θ in degrees; θ_rad = θ * π / 180.
 * - Developed (centerline) arc length L_arc = R * θ_rad.
 * - Takeoffs for a bend starting along +X and ending at angle θ:
 *     Horizontal projection L = R * sin(θ)
 *     Vertical (rise) projection H = R * (1 - cos(θ))
 *   For θ = 90°: L = R, H = R.
 * - Outer arc = (R + OD/2) * θ_rad
 * - Inner arc = (R - OD/2) * θ_rad
 * - Tangents are straight lengths added before/after the arc (not part of the bend radius).
 */

export interface BendInputs {
  /** Centerline radius in inches */
  clrIn: number;
  /** Bend angle in degrees */
  angleDeg: number;
  /** Outside diameter in inches */
  odIn: number;
  /** Wall thickness in inches */
  wallIn: number;
  /** Inlet tangent length in inches */
  tangentInIn: number;
  /** Outlet tangent length in inches */
  tangentOutIn: number;
}

export interface BendResults {
  angleRad: number;
  /** Centerline arc length (developed bend) */
  arcLengthIn: number;
  /** Total developed length = arc + both tangents */
  totalDevelopedIn: number;
  /** Horizontal takeoff L = R * sin(θ) */
  horizontalProjectionIn: number;
  /** Vertical takeoff H = R * (1 - cos(θ)) */
  verticalProjectionIn: number;
  /** Outer fiber arc length */
  outerArcIn: number;
  /** Inner fiber arc length */
  innerArcIn: number;
  /** Inside diameter */
  idIn: number;
  /** Outside diameter */
  odIn: number;
  wallIn: number;
  clrIn: number;
}

export function calculateBend(inputs: BendInputs): BendResults {
  const { clrIn, angleDeg, odIn, wallIn, tangentInIn, tangentOutIn } = inputs;
  const angleRad = (angleDeg * Math.PI) / 180;
  const arcLengthIn = clrIn * angleRad;
  const outerArcIn = (clrIn + odIn / 2) * angleRad;
  const innerArcIn = Math.max(0, (clrIn - odIn / 2) * angleRad);
  const horizontalProjectionIn = clrIn * Math.sin(angleRad);
  const verticalProjectionIn = clrIn * (1 - Math.cos(angleRad));
  const idIn = odIn - 2 * wallIn;

  return {
    angleRad,
    arcLengthIn,
    totalDevelopedIn: arcLengthIn + tangentInIn + tangentOutIn,
    horizontalProjectionIn,
    verticalProjectionIn,
    outerArcIn,
    innerArcIn,
    idIn,
    odIn,
    wallIn,
    clrIn,
  };
}
