import React, { useMemo, useState } from 'react';
import { calculateBipValues, BipInputValues } from '../hooks/useBipCalculator';

const BIP_ROWS = [
  {
    id: 'leg1',
    label: 'MV (%)',
    uom: '%',
    rationale: 'Ltrs',
    formula: 'BIP = (MV % ÷ 100 × Volume × Recovery % ÷ 100) ÷ SD ÷ BOM',
    volume: 1000,
    recovery: 95,
    sd: 100,
    bom: 1,
    fields: ['mv'],
  },
  {
    id: 'leg1min',
    label: 'Leg 1 (min)',
    uom: 'min',
    rationale: 'Minutes',
    formula: 'BIP = Leg time in minutes ÷ 60',
    fields: ['minutes'],
    defaultValue: (57 * 1.13).toFixed(2),
  },
  {
    id: 'leg2',
    label: 'Intermediate V (%)',
    uom: '%',
    rationale: 'Ltrs',
    formula: 'BIP = (Intermediate V % ÷ 100 × Volume × Recovery % ÷ 100) ÷ SD ÷ BOM',
    volume: 800,
    recovery: 90,
    sd: 100,
    bom: 1,
    fields: ['intermediate'],
  },
  {
    id: 'leg2min',
    label: 'Leg 2 (min)',
    uom: 'min',
    rationale: 'Minutes',
    formula: 'BIP = Leg time in minutes ÷ 60',
    fields: ['minutes'],
    defaultValue: (57 * 1.13).toFixed(2),
  },
  {
    id: 'mbt',
    label: 'MBT (%)',
    uom: '%',
    rationale: 'Ltrs',
    formula: 'BIP = (MBT % ÷ 100 × Volume × Recovery % ÷ 100) ÷ SD ÷ BOM',
    volume: 1200,
    recovery: 92,
    sd: 100,
    bom: 1,
    fields: ['mbt'],
  },
  {
    id: 'maltodextrin',
    label: 'Maltodextrin Tank',
    uom: '%',
    rationale: 'Ltrs',
    formula: 'BIP = (Recovery % ÷ 100 × Volume × Recovery factor ÷ 100) ÷ SD ÷ BOM',
    volume: 500,
    recovery: 85,
    recoveryFactor: 90,
    sd: 100,
    bom: 1,
    fields: ['recovery'],
  },
  {
    id: 'wort',
    label: 'Wort (%)',
    uom: '%',
    rationale: 'Ltrs',
    formula: 'BIP = (Recovery % ÷ 100 × Volume × Recovery factor ÷ 100) ÷ SD ÷ BOM',
    volume: 1500,
    recovery: 88,
    recoveryFactor: 95,
    sd: 100,
    bom: 1,
    fields: ['wort'],
  },
  {
    id: 'ww1',
    label: 'WW tank 1 (%)',
    uom: '%',
    rationale: 'Ltrs',
    formula: 'BIP = (Recovery % ÷ 100 × Volume × Recovery factor ÷ 100) ÷ SD ÷ BOM',
    volume: 600,
    recovery: 80,
    recoveryFactor: 85,
    sd: 100,
    bom: 1,
    fields: ['ww1'],
  },
  {
    id: 'ww2',
    label: 'WW tank 2 (%)',
    uom: '%',
    rationale: 'Ltrs',
    formula: 'BIP = (Recovery % ÷ 100 × Volume × Recovery factor ÷ 100) ÷ SD ÷ BOM',
    volume: 700,
    recovery: 82,
    recoveryFactor: 87,
    sd: 100,
    bom: 1,
    fields: ['ww2'],
  },
  {
    id: 'wortFTQ',
    label: 'Wort FTQ',
    uom: 'kg/hr',
    rationale: 'kg/hr',
    formula: 'BIP = Wort FTQ ÷ SD',
    sd: 100,
    fields: ['ftq'],
  },
];

const PRODUCT_TYPES = ['MBIL', 'IB', 'horlecs'];

const INPUT_TYPES = [
  { label: 'MBIL', value: 1.13 },
  { label: 'IB', value: 1.13 },
  { label: 'Horlecs', value: 1.13 },
];

const initialValues: BipInputValues = BIP_ROWS.reduce<BipInputValues>((carry, row) => {
  row.fields.forEach((field) => {
    carry[`${row.id}-${field}`] = row.defaultValue || '';
  });
  return carry;
}, {});

const BIPCalculator: React.FC = () => {
  const [values, setValues] = useState<BipInputValues>(initialValues);
  const [results, setResults] = useState<Record<string, string>>({});
  const [wf, setWf] = useState('');
  const [mg, setMg] = useState('');
  const [wg, setWg] = useState('');
  const [isp, setIsp] = useState('');
  const [inputTypeValue, setInputTypeValue] = useState('1.13');
  const [mashingHour, setMashingHour] = useState('');
  const [productType, setProductType] = useState(PRODUCT_TYPES[0]);
  const [volumes, setVolumes] = useState<Record<string, string>>({
    leg1: '1000',
    leg2: '800',
    mbt: '1200',
    maltodextrin: '500',
    wort: '1500',
    ww1: '600',
    ww2: '700',
  });

  const totalBIP = useMemo(() => {
    return Object.keys(results).reduce((sum, rowId) => {
      const raw = results[rowId];
      const parsed = raw ? Number(raw) : NaN;
      return sum + (Number.isFinite(parsed) ? parsed : 0);
    }, 0);
  }, [results]);

  const bomOutput = useMemo(() => {
    const wfNum = Number(wf) || 0;
    const mgNum = Number(mg) || 0;
    const wgNum = Number(wg) || 0;
    const ispNum = Number(isp) || 0;
    const inputValue = Number(inputTypeValue) || 1.13;
    return (wfNum + mgNum + wgNum + ispNum) * inputValue;
  }, [wf, mg, wg, isp, inputTypeValue]);

  // Placeholder calculations for other outputs - need actual formulas
  const stdOutput = 1000; // Placeholder
  const actualOutput = totalBIP; // Placeholder
  const wastage = stdOutput - actualOutput; // Placeholder
  const wastagePercent = stdOutput > 0 ? (wastage / stdOutput) * 100 : 0; // Placeholder

  const handleInputChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleCalculate = () => {
    const inputValue = Number(inputTypeValue) || 1.13;
    setResults(calculateBipValues(BIP_ROWS, values, inputValue, volumes));
  };

  const renderInput = (rowId: string, key: string) => {
    const inputKey = `${rowId}-${key}`;
    const defaultValue = BIP_ROWS.find(row => row.id === rowId)?.defaultValue;
    return (
      <input
        type="number"
        step="any"
        value={values[inputKey]}
        onChange={(event) => handleInputChange(inputKey, event.target.value)}
        className="w-full text-center rounded border border-slate-300 bg-amber-100 px-1 py-1 text-xs text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-amber-200"
        placeholder={defaultValue || "Enter"}
      />
    );
  };

  const handleVolumeChange = (rowId: string, value: string) => {
    setVolumes((prev) => ({ ...prev, [rowId]: value }));
  };

  const renderVolumeInput = (rowId: string) => {
    const volumeKey = rowId === 'leg1' ? 'leg1' : rowId === 'leg2' ? 'leg2' : rowId;
    return (
      <input
        type="number"
        step="any"
        value={volumes[volumeKey] || ''}
        onChange={(event) => handleVolumeChange(volumeKey, event.target.value)}
        className="w-full text-center rounded border border-slate-300 bg-white px-1 py-1 text-xs text-slate-900 outline-none transition focus:border-slate-400"
        placeholder="Enter"
      />
    );
  };

  return (
    <div className="space-y-4 bg-blue-50 min-h-screen p-4">
      <div className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">BIP Calculator</h1>
            <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-600">
              Enter values and click Calculate.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCalculate}
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
          >
            Calculate
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1 space-y-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
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
              <label className="block">
                <span className="text-xs font-medium text-slate-600">WF</span>
                <input
                  type="number"
                  step="any"
                  value={wf}
                  onChange={(e) => setWf(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-xs text-slate-900 outline-none transition focus:border-slate-400"
                  placeholder="Enter WF"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-600">MG</span>
                <input
                  type="number"
                  step="any"
                  value={mg}
                  onChange={(e) => setMg(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-xs text-slate-900 outline-none transition focus:border-slate-400"
                  placeholder="Enter MG"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-600">WG</span>
                <input
                  type="number"
                  step="any"
                  value={wg}
                  onChange={(e) => setWg(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-xs text-slate-900 outline-none transition focus:border-slate-400"
                  placeholder="Enter WG"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-600">ISP</span>
                <input
                  type="number"
                  step="any"
                  value={isp}
                  onChange={(e) => setIsp(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-xs text-slate-900 outline-none transition focus:border-slate-400"
                  placeholder="Enter ISP"
                />
              </label>
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
                  placeholder="Enter Mashing Hour"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-xs text-slate-700">
                <thead>
                  <tr className="bg-slate-100 text-xs uppercase tracking-[0.12em] text-slate-500">
                    <th className="border border-slate-200 px-2 py-2 text-center">Equipment</th>
                    <th className="border border-slate-200 px-2 py-2 text-center">UOM</th>
                    <th className="border border-slate-200 px-2 py-2 text-center">Level / Qty / Time</th>
                    <th className="border border-slate-200 px-2 py-2 text-center">UOM Rationale</th>
                    <th className="border border-slate-200 px-2 py-2 text-center">Volume / Capacity</th>
                    <th className="border border-slate-200 px-2 py-2 text-center">% Recovery</th>
                    <th className="border border-slate-200 px-4 py-2 text-center w-24">BIP</th>
                  </tr>
                </thead>
                <tbody>
                  {BIP_ROWS.map((row) => (
                    <tr key={row.id} className="odd:bg-slate-50 even:bg-white">
                      <td className="border border-slate-200 px-2 py-2 text-center font-semibold text-slate-900">
                        <div className="text-xs">{row.label}</div>
                      </td>
                      <td className="border border-slate-200 px-2 py-2 text-center">{row.uom}</td>
                      <td className="border border-slate-200 px-2 py-2 text-center">
                        {row.fields.length > 0 ? (
                          renderInput(row.id, row.fields[0])
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                      <td className="border border-slate-200 px-2 py-2 text-center text-slate-500">{row.rationale}</td>
                      <td className="border border-slate-200 px-2 py-2 text-center">
                        {row.volume ? renderVolumeInput(row.id) : '-'}
                      </td>
                      <td className="border border-slate-200 px-2 py-2 text-center text-slate-900">{row.recovery || row.recoveryFactor || '-'}</td>
                      <td className="border border-slate-200 px-4 py-2 text-center font-semibold text-slate-900 w-24">{results[row.id] ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-slate-200 bg-slate-50 px-3 py-3">
              <div className="grid gap-2 text-xs text-slate-700 sm:grid-cols-[1fr_1fr_1fr_1fr_1fr]">
                <div className="rounded-2xl border border-slate-200 bg-white p-2 text-center text-slate-900">
                  <div className="text-xs uppercase tracking-[0.08em] text-slate-500">BoM Output</div>
                  <div className="mt-1 text-sm font-semibold">{bomOutput.toFixed(2)}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-2 text-center text-slate-900">
                  <div className="text-xs uppercase tracking-[0.08em] text-slate-500">STD Output</div>
                  <div className="mt-1 text-sm font-semibold">{stdOutput.toFixed(2)}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-2 text-center text-slate-900">
                  <div className="text-xs uppercase tracking-[0.08em] text-slate-500">Actual Output</div>
                  <div className="mt-1 text-sm font-semibold">{actualOutput.toFixed(4)}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-2 text-center text-slate-900">
                  <div className="text-xs uppercase tracking-[0.08em] text-slate-500">Wastage</div>
                  <div className="mt-1 text-sm font-semibold">{wastage.toFixed(2)}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-2 text-center text-slate-900">
                  <div className="text-xs uppercase tracking-[0.08em] text-slate-500">Wastage %</div>
                  <div className="mt-1 text-sm font-semibold">{wastagePercent.toFixed(2)}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BIPCalculator;
