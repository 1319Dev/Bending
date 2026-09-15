/**
 * Steel line pipe ODs per ASME B36.10 / API 5L for oil & gas field bends.
 * NPS = Nominal Pipe Size. OD equals NPS for 14" and larger.
 */

export interface PipeSize {
  /** Nominal Pipe Size label, e.g. "24" */
  nps: string;
  /** Outside diameter in inches (B36.10) */
  odIn: number;
  /** Show in the primary size chip grid */
  common?: boolean;
}

/** Common field sizes through 48" — primary chips marked common */
export const PIPE_SIZES: PipeSize[] = [
  { nps: '4',  odIn: 4.500,  common: true },
  { nps: '6',  odIn: 6.625,  common: true },
  { nps: '8',  odIn: 8.625,  common: true },
  { nps: '10', odIn: 10.750, common: true },
  { nps: '12', odIn: 12.750, common: true },
  { nps: '14', odIn: 14.000, common: true },
  { nps: '16', odIn: 16.000, common: true },
  { nps: '18', odIn: 18.000, common: true },
  { nps: '20', odIn: 20.000, common: true },
  { nps: '22', odIn: 22.000, common: true },
  { nps: '24', odIn: 24.000, common: true },
  { nps: '26', odIn: 26.000, common: true },
  { nps: '28', odIn: 28.000, common: true },
  { nps: '30', odIn: 30.000, common: true },
  { nps: '32', odIn: 32.000, common: true },
  { nps: '34', odIn: 34.000, common: true },
  { nps: '36', odIn: 36.000, common: true },
  { nps: '42', odIn: 42.000, common: true },
  { nps: '48', odIn: 48.000, common: true },
];

/** Extra sizes available under "More sizes" */
export const EXTRA_PIPE_SIZES: PipeSize[] = [
  { nps: '2',     odIn: 2.375 },
  { nps: '2-1/2', odIn: 2.875 },
  { nps: '3',     odIn: 3.500 },
  { nps: '3-1/2', odIn: 4.000 },
  { nps: '5',     odIn: 5.563 },
  { nps: '40',    odIn: 40.000 },
  { nps: '44',    odIn: 44.000 },
  { nps: '46',    odIn: 46.000 },
];

export const ALL_PIPE_SIZES: PipeSize[] = [...PIPE_SIZES, ...EXTRA_PIPE_SIZES];

/**
 * Common specified wall thicknesses for API 5L / line pipe (inches).
 * Not Schedule 40/80 — field crews work from the WT on the joint.
 */
export const COMMON_WALL_THICKNESSES: number[] = [
  0.188, 0.219, 0.250, 0.281, 0.312, 0.344, 0.375, 0.406, 0.438,
  0.469, 0.500, 0.562, 0.625, 0.688, 0.750, 0.812, 0.875, 1.000,
];

/** CLR multiplier presets for field cold bends (relative to OD) */
export const CLR_PRESETS = [
  { id: '18D', label: '18D', multiplier: 18 },
  { id: '21D', label: '21D', multiplier: 21 },
  { id: '30D', label: '30D', multiplier: 30 },
  { id: '40D', label: '40D', multiplier: 40 },
  { id: 'custom', label: 'Custom', multiplier: null },
] as const;

export type ClrPresetId = (typeof CLR_PRESETS)[number]['id'];

/** Common field bend angles (sags / overs / sidebends) */
export const ANGLE_PRESETS: number[] = [3, 6, 11.25, 15, 22.5, 45, 90];

export const DEFAULT_NPS = '24';
export const DEFAULT_WT = 0.500;
export const DEFAULT_ANGLE = 15;
export const DEFAULT_CLR: ClrPresetId = '18D';
