export type BipInputValues = Record<string, string>;
export type BipOutputValues = Record<string, string>;

const parseNumber = (value: string): number | null => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const safeDivide = (numerator: number, denominator: number): number | null => {
  if (denominator === 0) return null;
  return numerator / denominator;
};

const toDisplay = (value: number | null): string => {
  if (value === null || Number.isNaN(value)) return '-';
  return value.toFixed(4);
};

const computeForRow = (row: any, values: BipInputValues, inputTypeValue: number): string => {
  let mv = parseNumber(values[`${row.id}-mv`]);
  const intermediate = parseNumber(values[`${row.id}-intermediate`]);
  const volume = row.volume;
  const recovery = row.recovery;
  const sd = row.sd;
  const bom = row.bom;
  const recoveryFactor = row.recoveryFactor;
  const minutes = parseNumber(values[`${row.id}-minutes`]);
  const ftq = parseNumber(values[`${row.id}-ftq`]);

  // For leg1 and leg2, override mv with calculated value
  if (row.id === 'leg1' || row.id === 'leg2') {
    mv = 57 * inputTypeValue;
  }

  switch (row.id) {
    case 'leg1': {
      if (mv === null || volume === null || recovery === null || sd === null || bom === null) return '-';
      const numerator = (mv / 100) * volume * (recovery / 100);
      const divided = safeDivide(numerator, sd);
      return toDisplay(divided !== null ? safeDivide(divided, bom) : null);
    }
    case 'leg2': {
      if (intermediate === null || volume === null || recovery === null || sd === null || bom === null) return '-';
      const numerator = (intermediate / 100) * volume * (recovery / 100);
      const divided = safeDivide(numerator, sd);
      return toDisplay(divided !== null ? safeDivide(divided, bom) : null);
    }
    case 'legTime': {
      if (minutes === null) return '-';
      return toDisplay(minutes / 60);
    }
    case 'mbt': {
      if (mv === null || volume === null || recovery === null || sd === null || bom === null) return '-';
      const numerator = (mv / 100) * volume * (recovery / 100);
      const divided = safeDivide(numerator, sd);
      return toDisplay(divided !== null ? safeDivide(divided, bom) : null);
    }
    case 'maltodextrin':
    case 'wort':
    case 'ww1':
    case 'ww2': {
      if (recovery === null || volume === null || recoveryFactor === null || sd === null || bom === null) return '-';
      const numerator = (recovery / 100) * volume * (recoveryFactor / 100);
      const divided = safeDivide(numerator, sd);
      return toDisplay(divided !== null ? safeDivide(divided, bom) : null);
    }
    case 'wortFTQ': {
      if (ftq === null || sd === null) return '-';
      return toDisplay(safeDivide(ftq, sd));
    }
    default:
      return '-';
  }
};

export const calculateBipValues = (
  rows: any[],
  values: BipInputValues,
  inputTypeValue: number,
  volumes?: any,
): BipOutputValues => {
  return rows.reduce<BipOutputValues>((acc, row) => {
    acc[row.id] = computeForRow(row, values, inputTypeValue);
    return acc;
  }, {});
};
