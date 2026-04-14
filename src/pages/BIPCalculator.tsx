import React, { useMemo, useState } from 'react';
import { calculateBipValues, BipInputValues } from '../hooks/useBipCalculator';

// ─────────────────────────────────────────────────────────────────────────────
// ROW DEFINITIONS
// All default values are pre-filled exactly as specified.
// User can override any value in the table — the calculation always uses
// whatever is currently in state (not the original defaultValue).
//
// Volumes (Ltrs):  [3000, NA, 2000, NA, 5000, 1000, 5000, 8000, 5000, NA]
// % Recovery:      [27.24, NA, 27.24, NA, 27.24, 26, 26, 5, 5, NA]
// Level/Qty/Time:  [67.0, 64.4, 78.0, 64.4, 87.0, 70.0, 80.0, 8.0, 10.0, 17013.6]
// ─────────────────────────────────────────────────────────────────────────────
const BIP_ROWS = [
  {
    id: 'leg1',
    label: 'MV (%)',
    uom: '%',
    rationale: 'Ltrs',
    formula: 'BIP = ((Level/100) * Volume * (Recovery/100)) / (SD Factor * BoM Output)',
    volume: 3000,           // Bug 2 fix: was 1000
    defaultValue: '67.0',  // Bug 4 fix: was missing
    fields: ['mv'],
  },
  {
    id: 'leg1min',
    label: 'Leg 1 (min)',
    uom: 'min',
    rationale: 'Minutes',
    formula: 'BIP = (1/60) * Time',
    volume: undefined,
    defaultValue: '64.4',  // Bug 4 fix: was (57*1.13).toFixed(2) = 64.41
    fields: ['minutes'],
  },
  {
    id: 'leg2',
    label: 'Intermediate V (%)',
    uom: '%',
    rationale: 'Ltrs',
    formula: 'BIP = ((Level/100) * Volume * (Recovery/100)) / (SD Factor * BoM Output)',
    volume: 2000,           // Bug 2 fix: was 800
    defaultValue: '78.0',  // Bug 4 fix: was missing
    fields: ['intermediate'],
  },
  {
    id: 'leg2min',
    label: 'Leg 2 (min)',
    uom: 'min',
    rationale: 'Minutes',
    formula: 'BIP = (1/60) * Time',
    volume: undefined,
    defaultValue: '64.4',  // Bug 4 fix: was (57*1.13).toFixed(2) = 64.41
    fields: ['minutes'],
  },
  {
    id: 'mbt',
    label: 'MBT (%)',
    uom: '%',
    rationale: 'Ltrs',
    formula: 'BIP = ((Level/100) * Volume * (Recovery/100)) / (SD Factor * BoM Output)',
    volume: 5000,           // Bug 2 fix: was 1200
    defaultValue: '87.0',  // Bug 4 fix: was missing
    fields: ['mbt'],
  },
  {
    id: 'maltodextrin',
    label: 'Maltodextrin Tank',
    uom: '%',
    rationale: 'Ltrs',
    formula: 'BIP = ((Level/100) * Volume * (Recovery/100)) / (SD Factor * BoM Output)',
    volume: 1000,           // Bug 2+8 fix: was undefined (missing entirely)
    defaultValue: '70.0',  // Bug 4 fix: was missing
    fields: ['level'],     // renamed from 'recovery' to avoid confusion
  },
  {
    id: 'wort',
    label: 'Wort (%)',
    uom: '%',
    rationale: 'Ltrs',
    formula: 'BIP = ((Level/100) * Volume * (Recovery/100)) / (SD Factor * BoM Output)',
    volume: 5000,           // Bug 2+8 fix: was undefined (missing entirely)
    defaultValue: '80.0',  // Bug 4 fix: was missing
    fields: ['level'],
  },
  {
    id: 'ww1',
    label: 'WW tank 1 (%)',
    uom: '%',
    rationale: 'Ltrs',
    formula: 'BIP = ((Level/100) * Volume * (Recovery/100)) / (SD Factor * BoM Output)',
    volume: 8000,          // Bug 2 fix: was 600
    defaultValue: '8.0',  // Bug 4 fix: was missing
    fields: ['level'],
  },
  {
    id: 'ww2',
    label: 'WW tank 2 (%)',
    uom: '%',
    rationale: 'Ltrs',
    formula: 'BIP = ((Level/100) * Volume * (Recovery/100)) / (SD Factor * BoM Output)', // Bug 7 fix: was old formula string
    volume: 5000,           // Bug 2 fix: was 700
    defaultValue: '10.0',  // Bug 4 fix: was missing
    fields: ['level'],
  },
  {
    id: 'wortFTQ',
    label: 'Wort FTQ',
    uom: 'kg/hr',
    rationale: 'kg/hr',
    formula: 'BIP = Qty / BoM Output',
    volume: undefined,
    defaultValue: '17013.6',  // Bug 4 fix: was missing
    fields: ['ftq'],
  },
];

const PRODUCT_TYPES = ['MBIL', 'BI', 'horlecs'];

// initialValues seeds state from each row's defaultValue.
// If user changes the input, the state updates — the defaultValue is only
// for the initial render and placeholder text.
const initialValues: BipInputValues = BIP_ROWS.reduce<BipInputValues>((carry, row) => {
  row.fields.forEach((field) => {
    carry[`${row.id}-${field}`] = row.defaultValue ?? '';
  });
  return carry;
}, {});

// ─────────────────────────────────────────────────────────────────────────────

const BIPCalculator: React.FC = () => {
  const [values, setValues]   = useState<BipInputValues>(initialValues);
  const [results, setResults] = useState<Record<string, string>>({});

  // ── Left-panel inputs ────────────────────────────────────────────────────────
  // Bug 6 fix: all seeded with known-good defaults for validation
  const [wf,            setWf]           = useState('1375.31');
  const [mb,            setMb]           = useState('1014.3');   // labelled MB not MG
  const [wg,            setWg]           = useState('119.13');
  const [isp,           setIsp]          = useState('24.03');
  const [inputTypeValue,setInputTypeValue]= useState('1.13');
  const [mashingHour,   setMashingHour]  = useState('');
  const [sdFactor,      setSdFactor]     = useState('0.65477'); // Bug 5 fix: was ''
  const [productType,   setProductType]  = useState(PRODUCT_TYPES[0]);

  // ── Table editable columns ───────────────────────────────────────────────────
  // Bug 3 fix: all volumes match the corrected BIP_ROWS volumes
  const [volumes, setVolumes] = useState<Record<string, string>>({
    leg1:         '3000',
    leg2:         '2000',
    mbt:          '5000',
    maltodextrin: '1000',
    wort:         '5000',
    ww1:          '8000',
    ww2:          '5000',
  });

  // % Recovery defaults — NA rows left blank (time/qty rows)
  const [recoveries, setRecoveries] = useState<Record<string, string>>({
    leg1:         '27.24',
    leg1min:      '',      // N/A — time row
    leg2:         '27.24',
    leg2min:      '',      // N/A — time row
    mbt:          '27.24',
    maltodextrin: '26',
    wort:         '26',
    ww1:          '5',
    ww2:          '5',
    wortFTQ:      '',      // N/A — quantity row
  });

  // ── Derived: BoM Output ──────────────────────────────────────────────────────
  // Formula: (WF + MB + WG + ISP) * Input Type
  const bomOutput = useMemo(() => {
    const wfNum    = Number(wf)            || 0;
    const mbNum    = Number(mb)            || 0;
    const wgNum    = Number(wg)            || 0;
    const ispNum   = Number(isp)           || 0;
    const typeNum  = Number(inputTypeValue) || 1.13;
    return (wfNum + mbNum + wgNum + ispNum) * typeNum;
  }, [wf, mb, wg, isp, inputTypeValue]);

  // ── Derived: Total BIP ────────────────────────────────────────────────────────
  const totalBIP = useMemo(() => {
    return Object.values(results).reduce((sum, val) => {
      const n = Number(val);
      return sum + (Number.isFinite(n) ? n : 0);
    }, 0);
  }, [results]);

  const stdOutput     = 1000; // Placeholder — replace when formula is known
  const actualOutput  = totalBIP;
  const wastage       = stdOutput - actualOutput;
  const wastagePercent= stdOutput > 0 ? (wastage / stdOutput) * 100 : 0;

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleInputChange = (key: string, value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const handleVolumeChange = (rowId: string, value: string) =>
    setVolumes((prev) => ({ ...prev, [rowId]: value }));

  const handleRecoveryChange = (rowId: string, value: string) =>
    setRecoveries((prev) => ({ ...prev, [rowId]: value }));

  // All parameters now correctly passed — hook has full data for every formula.
  const handleCalculate = () => {
    setResults(
      calculateBipValues(
        BIP_ROWS,
        values,
        Number(inputTypeValue) || 1.13,
        volumes,                    // Volume per row (used in level formula)
        recoveries,                 // % Recovery per row
        Number(sdFactor) || 0,     // SD Factor
        bomOutput,                  // (WF + MB + WG + ISP) * inputType
      ),
    );
  };

  // ── Render helpers ────────────────────────────────────────────────────────────
  const renderInput = (rowId: string, key: string) => {
    const inputKey = `${rowId}-${key}`;
    const row      = BIP_ROWS.find((r) => r.id === rowId);
    return (
      <input
        type="number"
        step="any"
        value={values[inputKey]}
        onChange={(e) => handleInputChange(inputKey, e.target.value)}
        className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-center text-xs text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
        placeholder={row?.defaultValue ?? 'Enter'}
      />
    );
  };

  const renderVolumeInput = (rowId: string) => (
    <input
      type="number"
      step="any"
      value={volumes[rowId] ?? ''}
      onChange={(e) => handleVolumeChange(rowId, e.target.value)}
      className="w-full text-center rounded border border-slate-300 bg-white px-1 py-1 text-xs text-slate-900 outline-none transition focus:border-slate-400"
      placeholder="Enter"
    />
  );

  const renderRecoveryInput = (rowId: string) => (
    <input
      type="number"
      step="any"
      value={recoveries[rowId] ?? ''}
      onChange={(e) => handleRecoveryChange(rowId, e.target.value)}
      className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-center text-xs text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
      placeholder="Enter"
    />
  );

  // ── JSX ───────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 bg-blue-50 min-h-screen p-4">
      {/* Header */}
      <div className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">BIP Calculator</h1>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              Default values are pre-filled. Override any value then click Calculate.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleCalculate}
          className="inline-flex items-center justify-center rounded-xl bg-slate-800 px-6 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-700"
        >
          Calculate
        </button>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-12">
        {/* ── Left panel ─────────────────────────────────────────────────────── */}
        <div className="space-y-3 lg:col-span-3 xl:col-span-2 h-full">
          <div className="h-full rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Product Type</h3>
            <select
              value={productType}
              onChange={(e) => setProductType(e.target.value)}
              className="w-full rounded border border-slate-300 px-2 py-1 text-xs text-slate-900 outline-none transition focus:border-slate-400 mb-4"
            >
              {PRODUCT_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <h3 className="text-sm font-semibold text-slate-900 mb-2">Inputs</h3>
            <div className="space-y-2">
              {/* WF, MB, WG, ISP — all defaulted so BoM Output is correct on load */}
              {([
                { label: 'WF',  value: wf,  setter: setWf,  placeholder: '1375.31' },
                { label: 'MB',  value: mb,  setter: setMb,  placeholder: '1014.3'  },
                { label: 'WG',  value: wg,  setter: setWg,  placeholder: '119.13'  },
                { label: 'ISP', value: isp, setter: setIsp, placeholder: '24.03'   },
              ] as const).map(({ label, value, setter, placeholder }) => (
                <label key={label} className="block">
                  <span className="text-xs font-medium text-slate-600">{label}</span>
                  <input
                    type="number"
                    step="any"
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-xs text-slate-900 outline-none transition focus:border-slate-400"
                    placeholder={placeholder}
                  />
                </label>
              ))}

              <label className="block">
                <span className="text-xs font-medium text-slate-600">Input Type</span>
                <input
                  type="number"
                  step="any"
                  value={inputTypeValue}
                  onChange={(e) => setInputTypeValue(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-xs text-slate-900 outline-none transition focus:border-slate-400"
                  placeholder="1.13"
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium text-slate-600">Mashing Hour</span>
                <input
                  type="number"
                  step="any"
                  value={mashingHour}
                  onChange={(e) => setMashingHour(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-xs text-slate-900 outline-none transition focus:border-slate-400"
                  placeholder="Enter"
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium text-slate-600">SD Factor</span>
                <input
                  type="number"
                  step="any"
                  value={sdFactor}
                  onChange={(e) => setSdFactor(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-xs text-slate-900 outline-none transition focus:border-slate-400"
                  placeholder="0.65477"
                />
              </label>
            </div>
          </div>
        </div>

        {/* ── Table ──────────────────────────────────────────────────────────── */}
        <div className="lg:col-span-9 xl:col-span-10 h-full flex flex-col">
          <div className="flex-1 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-xs text-slate-700">
                <thead>
                  <tr className="bg-slate-100 text-[11px] uppercase tracking-[0.1em] text-slate-600">
                    <th className="border border-slate-200 px-3 py-2 text-center align-middle">Equipment</th>
                    <th className="border border-slate-200 px-3 py-2 text-center align-middle">UOM</th>
                    <th className="border border-slate-200 px-3 py-2 text-center align-middle">Level / Qty / Time</th>
                    <th className="border border-slate-200 px-3 py-2 text-center align-middle">UOM Rationale</th>
                    <th className="border border-slate-200 px-3 py-2 text-center align-middle">Volume / Capacity</th>
                    <th className="border border-slate-200 px-3 py-2 text-center align-middle">% Recovery</th>
                    <th className="w-44 border border-slate-200 bg-sky-200 px-6 py-2 text-center align-middle font-semibold text-sky-900">BIP</th>
                  </tr>
                </thead>
                <tbody>
                  {BIP_ROWS.map((row) => (
                    <tr key={row.id} className="odd:bg-slate-50 even:bg-white">
                      {/* Equipment */}
                      <td className="border border-slate-200 px-3 py-2 text-center align-middle font-semibold text-slate-900">
                        <div className="text-xs">{row.label}</div>
                      </td>

                      {/* UOM */}
                      <td className="border border-slate-200 px-3 py-2 text-center align-middle">{row.uom}</td>

                      {/* Level / Qty / Time — always editable, seeded with defaultValue */}
                      <td className="border border-slate-200 px-3 py-2 text-center align-middle">
                        {renderInput(row.id, row.fields[0])}
                      </td>

                      {/* UOM Rationale */}
                      <td className="border border-slate-200 px-3 py-2 text-center align-middle text-slate-500">
                        {row.rationale}
                      </td>

                      {/* Volume — editable for all level-based rows; N/A for time & qty */}
                      <td className="border border-slate-200 px-3 py-2 text-center align-middle">
                        {row.volume !== undefined
                          ? renderVolumeInput(row.id)
                          : <span className="text-slate-400">N/A</span>}
                      </td>

                      {/* % Recovery — editable for level rows; N/A for time & qty */}
                      <td className="border border-slate-200 px-3 py-2 text-center align-middle">
                        {row.uom === '%'
                          ? renderRecoveryInput(row.id)
                          : <span className="text-slate-400">N/A</span>}
                      </td>

                      {/* BIP output — highlighted column */}
                      <td className="w-44 border border-slate-200 bg-sky-50 px-6 py-2 text-center align-middle">
                        <span className={`text-sm font-bold tracking-wide ${
                          results[row.id] && results[row.id] !== '-'
                            ? 'text-sky-700'
                            : 'text-slate-500'
                        }`}>
                          {results[row.id] ?? '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Summary footer ──────────────────────────────────────────────── */}
            <div className="border-t border-slate-200 bg-slate-50 px-3 py-3">
              <div className="grid gap-2 text-xs text-slate-700 sm:grid-cols-[1fr_1fr_1fr_1fr_1fr]">
                {[
                  { label: 'BoM Output',    value: bomOutput.toFixed(2)           },
                  { label: 'STD Output',    value: stdOutput.toFixed(2)           },
                  { label: 'Total BIP',     value: totalBIP.toFixed(2)            },
                  { label: 'Wastage',       value: wastage.toFixed(2)             },
                  { label: 'Wastage %',     value: `${wastagePercent.toFixed(2)}%`},
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-slate-200 bg-white p-2 text-center text-slate-900"
                  >
                    <div className="text-xs uppercase tracking-[0.08em] text-slate-500">{label}</div>
                    <div className="mt-1 text-sm font-bold text-sky-700">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BIPCalculator;