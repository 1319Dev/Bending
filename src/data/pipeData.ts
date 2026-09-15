/**
 * Standard steel pipe dimensions per ASME B36.10M.
 * OD and wall thicknesses in inches.
 * NPS = Nominal Pipe Size (US customary)
 * DN  = Diamètre Nominal / Diameter Nominal (metric designation)
 */

export type Schedule = '40' | '80';

export interface PipeSize {
  /** Nominal Pipe Size label, e.g. "2" or "1/2" */
  nps: string;
  /** Diameter Nominal (metric), e.g. 50 */
  dn: number;
  /** Outside diameter in inches */
  odIn: number;
  /** Wall thickness Schedule 40 in inches */
  sch40In: number;
  /** Wall thickness Schedule 80 in inches */
  sch80In: number;
}

/** Common NPS sizes from 1/2" through 24" */
export const PIPE_SIZES: PipeSize[] = [
  { nps: '1/2',  dn: 15,  odIn: 0.840,  sch40In: 0.109, sch80In: 0.147 },
  { nps: '3/4',  dn: 20,  odIn: 1.050,  sch40In: 0.113, sch80In: 0.154 },
  { nps: '1',    dn: 25,  odIn: 1.315,  sch40In: 0.133, sch80In: 0.179 },
  { nps: '1-1/4', dn: 32, odIn: 1.660,  sch40In: 0.140, sch80In: 0.191 },
  { nps: '1-1/2', dn: 40, odIn: 1.900,  sch40In: 0.145, sch80In: 0.200 },
  { nps: '2',    dn: 50,  odIn: 2.375,  sch40In: 0.154, sch80In: 0.218 },
  { nps: '2-1/2', dn: 65, odIn: 2.875,  sch40In: 0.203, sch80In: 0.276 },
  { nps: '3',    dn: 80,  odIn: 3.500,  sch40In: 0.216, sch80In: 0.300 },
  { nps: '3-1/2', dn: 90, odIn: 4.000,  sch40In: 0.226, sch80In: 0.318 },
  { nps: '4',    dn: 100, odIn: 4.500,  sch40In: 0.237, sch80In: 0.337 },
  { nps: '5',    dn: 125, odIn: 5.563,  sch40In: 0.258, sch80In: 0.375 },
  { nps: '6',    dn: 150, odIn: 6.625,  sch40In: 0.280, sch80In: 0.432 },
  { nps: '8',    dn: 200, odIn: 8.625,  sch40In: 0.322, sch80In: 0.500 },
  { nps: '10',   dn: 250, odIn: 10.750, sch40In: 0.365, sch80In: 0.594 },
  { nps: '12',   dn: 300, odIn: 12.750, sch40In: 0.406, sch80In: 0.688 },
  { nps: '14',   dn: 350, odIn: 14.000, sch40In: 0.438, sch80In: 0.750 },
  { nps: '16',   dn: 400, odIn: 16.000, sch40In: 0.500, sch80In: 0.844 },
  { nps: '18',   dn: 450, odIn: 18.000, sch40In: 0.562, sch80In: 0.938 },
  { nps: '20',   dn: 500, odIn: 20.000, sch40In: 0.594, sch80In: 1.031 },
  { nps: '24',   dn: 600, odIn: 24.000, sch40In: 0.688, sch80In: 1.219 },
];

export function getWallThickness(pipe: PipeSize, schedule: Schedule): number {
  return schedule === '40' ? pipe.sch40In : pipe.sch80In;
}

export function getInsideDiameter(pipe: PipeSize, schedule: Schedule): number {
  return pipe.odIn - 2 * getWallThickness(pipe, schedule);
}

/** CLR multiplier presets relative to pipe OD (D) */
export const CLR_PRESETS = [
  { id: '1.5D', label: '1.5D (Long Radius)', multiplier: 1.5 },
  { id: '3D',   label: '3D',                 multiplier: 3 },
  { id: '5D',   label: '5D',                 multiplier: 5 },
  { id: 'custom', label: 'Custom CLR',       multiplier: null },
] as const;

export type ClrPresetId = (typeof CLR_PRESETS)[number]['id'];
