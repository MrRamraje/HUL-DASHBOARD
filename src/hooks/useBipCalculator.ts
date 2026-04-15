// ─── Types ────────────────────────────────────────────────────────────────────

export type BipInputValues = Record<string, string>;

export interface BipRow {
  id: string;
  uom: string;
  fields: string[];
  volume?: number;
  defaultValue?: string;
  [key: string]: unknown;
}

// ─── Formula helpers ──────────────────────────────────────────────────────────

/**
 * BIP(for level) = ((Level / 100) * Volume * (% Recovery / 100)) / (SD Factor * BoM Output)
 *
 * @param level      - User-entered level % (e.g. 67.0)
 * @param volume     - Tank volume in Ltrs (e.g. 3000)
 * @param recovery   - % Recovery for the row (e.g. 27.24)
 * @param sdFactor   - SD Factor (e.g. 0.65477)
 * @param bomOutput  - Calculated BoM Output: (WF + MB + WG + ISP) * inputType
 */
function calcLevelBip(
  level: number,
  volume: number,
  recovery: number,
  sdFactor: number,
  bomOutput: number,
): number | null {
  if (sdFactor <= 0 || bomOutput <= 0 || volume <= 0) return null;
  return ((level / 100) * volume * (recovery / 100)) / (sdFactor * bomOutput);
}

/**
 * BIP(for time) = (1 / 60) * Time
 *
 * @param timeMinutes - User-entered time in minutes (e.g. 64.4)
 */
function calcTimeBip(timeMinutes: number): number | null {
  if (timeMinutes <= 0) return null;
  return (1 / 60) * timeMinutes;
}

/**
 * BIP(for quantity) = Qty / BoM Output
 *
 * @param qty        - User-entered quantity in kg/hr (e.g. 17013.6)
 * @param bomOutput  - Calculated BoM Output
 */
function calcQtyBip(qty: number, bomOutput: number): number | null {
  if (bomOutput <= 0) return null;
  return qty / bomOutput;
}

function clampSpecificBip(value: number): number {
  return Math.max(0, Math.min(1, value));
}

// ─── Main calculator ──────────────────────────────────────────────────────────

export function calculateBipValues(
  rows: BipRow[],
  values: BipInputValues,
  _inputValue: number,          // kept for API compatibility
  volumes: Record<string, string>,
  recoveries: Record<string, string>,
  sdFactor: number,
  bomOutput: number,
): Record<string, string> {
  const results: Record<string, string> = {};

  for (const row of rows) {
    const fieldKey = `${row.id}-${row.fields[0]}`;
    const inputNum = Number(values[fieldKey]);

    let bip: number | null = null;

    if (row.uom === 'min') {
      // ── Time-based: Leg 1 (min), Leg 2 (min) ────────────────────────────────
      // Formula: (1/60) * Time
      bip = calcTimeBip(inputNum);

    } else if (row.uom === 'kg/hr') {
      // ── Quantity-based: Wort FTQ ─────────────────────────────────────────────
      // Formula: Qty / BoM Output
      bip = calcQtyBip(inputNum, bomOutput);

    } else {
      // ── Level-based: all % UOM rows ──────────────────────────────────────────
      // Formula: ((Level/100) * Volume * (Recovery/100)) / (SD Factor * BoM Output)
      const volume   = Number(volumes[row.id])    || 0;
      const recovery = Number(recoveries[row.id]) || 0;
      bip = calcLevelBip(inputNum, volume, recovery, sdFactor, bomOutput);
    }

    results[row.id] = (bip !== null && Number.isFinite(bip))
      ? clampSpecificBip(bip).toFixed(4)
      : '-';
  }

  return results;
}