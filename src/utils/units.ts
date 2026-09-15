export type UnitSystem = 'ft-in' | 'in' | 'mm';

const IN_TO_MM = 25.4;

/** Convert inches → display numeric value (for 'in' and 'mm'; ft-in uses formatLength) */
export function fromInches(valueIn: number, units: UnitSystem): number {
  if (units === 'mm') return valueIn * IN_TO_MM;
  if (units === 'ft-in') return valueIn / 12;
  return valueIn;
}

/** Convert display units → inches (internal storage). For ft-in, value is decimal feet. */
export function toInches(value: number, units: UnitSystem): number {
  if (units === 'mm') return value / IN_TO_MM;
  if (units === 'ft-in') return value * 12;
  return value;
}

export function unitLabel(units: UnitSystem): string {
  if (units === 'mm') return 'mm';
  if (units === 'ft-in') return 'ft';
  return 'in';
}

/**
 * Field-style length: 18' 4.1"  (feet + decimal inches to 1 place)
 * Also supports in and mm.
 */
export function formatLength(valueIn: number, units: UnitSystem, decimals?: number): string {
  if (!Number.isFinite(valueIn)) return '—';

  if (units === 'ft-in') {
    const sign = valueIn < 0 ? '-' : '';
    const abs = Math.abs(valueIn);
    const feet = Math.floor(abs / 12);
    let inches = abs - feet * 12;
    // Round inches to 1 decimal; roll over 12.0
    inches = Math.round(inches * 10) / 10;
    let f = feet;
    if (inches >= 12) {
      f += 1;
      inches = 0;
    }
    const inchStr = inches.toFixed(1);
    if (f === 0) return `${sign}${inchStr}"`;
    return `${sign}${f}' ${inchStr}"`;
  }

  const v = fromInches(valueIn, units);
  const d = decimals ?? (units === 'mm' ? 1 : 3);
  return v.toFixed(d);
}

/** Secondary readout: decimal feet */
export function formatDecimalFeet(valueIn: number): string {
  if (!Number.isFinite(valueIn)) return '—';
  return (valueIn / 12).toFixed(3) + ' ft';
}

/** Secondary readout: total inches */
export function formatInches(valueIn: number): string {
  if (!Number.isFinite(valueIn)) return '—';
  return valueIn.toFixed(2) + ' in';
}

/** Format wall thickness chip label */
export function formatWt(wtIn: number): string {
  return wtIn.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
}
