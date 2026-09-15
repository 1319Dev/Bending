export type UnitSystem = 'in' | 'mm';

const IN_TO_MM = 25.4;

/** Convert inches → display units */
export function fromInches(valueIn: number, units: UnitSystem): number {
  return units === 'mm' ? valueIn * IN_TO_MM : valueIn;
}

/** Convert display units → inches (internal storage) */
export function toInches(value: number, units: UnitSystem): number {
  return units === 'mm' ? value / IN_TO_MM : value;
}

export function unitLabel(units: UnitSystem): string {
  return units === 'mm' ? 'mm' : 'in';
}

/** Format a length for display with sensible precision */
export function formatLength(valueIn: number, units: UnitSystem, decimals?: number): string {
  const v = fromInches(valueIn, units);
  const d = decimals ?? (units === 'mm' ? 1 : 3);
  return v.toFixed(d);
}
