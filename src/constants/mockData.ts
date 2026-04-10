export const mockBatchInfo = {
  product: 'MBI (L)',
  batchId: 'BT-2025-0409',
  inputType: 'BOM Standard',
  lastRecorded: '09:42:15',
  husk: '11.2%',
  grist: '75%',
  powder: '12.5%',
  standardOutput: 28620,
  actualOutput: 27650,
  wastage: 3.39,
  predictedOutput: 27840,
  totalBIP: 245.67,
};

export const mockKPIs = [
  { label: 'Total BIP', value: 245.67, unit: '', change: 'Current Batch' },
  { label: 'Standard Output', value: 28620, unit: 'kg', change: 'BOM Target' },
  { label: 'Actual Output', value: 27650, unit: 'kg', change: '▼ 3.39% Below Target', warn: true },
  { label: 'Wastage %', value: 3.39, unit: '%', change: 'Above Target', warn: true },
];

export const mockBatchComparison = [
  { batch: 'BT-0409', standard: 28620, actual: 27650, wastage: 3.39, status: 'Warn' },
  { batch: 'BT-0408', standard: 28450, actual: 28070, wastage: 1.34, status: 'Good' },
  { batch: 'BT-0407', standard: 27900, actual: 27480, wastage: 1.51, status: 'Good' },
  { batch: 'BT-0405', standard: 28200, actual: 27210, wastage: 3.51, status: 'Warn' },
  { batch: 'BT-0404', standard: 28000, actual: 27440, wastage: 2.00, status: 'Good' },
];

export const mockWastageData = {
  labels: ['Jan\'25', 'Feb\'25', 'Mar\'25', 'Apr\'25'],
  datasets: [
    {
      label: 'MBI (L) Wastage %',
      data: [1.2, 1.6, 1.3, 1.4],
      borderColor: '#1e5fad',
      backgroundColor: 'rgba(30,95,173,0.07)',
      tension: 0.4,
      fill: true,
      pointRadius: 4,
      pointBackgroundColor: '#1e5fad',
    },
    {
      label: 'Target Wastage (0.8%)',
      data: [0.8, 0.8, 0.8, 0.8],
      borderColor: '#0ea66c',
      borderDash: [5, 4],
      tension: 0,
      pointRadius: 0,
      fill: false,
    },
  ],
};

export const mockAnalyticsData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr'],
  datasets: [
    { label: 'MBI (L) %', data: [1.2, 1.6, 1.3, 1.35], borderColor: '#1e5fad', backgroundColor: 'rgba(30,95,173,0.06)', tension: 0.4, fill: true, pointRadius: 4, pointBackgroundColor: '#1e5fad' },
    { label: 'BI %', data: [1.0, 1.2, 1.1, 1.15], borderColor: '#0ea66c', backgroundColor: 'rgba(14,166,108,0.06)', tension: 0.4, fill: true, pointRadius: 4, pointBackgroundColor: '#0ea66c' },
    { label: 'Target', data: [0.8, 0.8, 0.8, 0.8], borderColor: '#d63031', borderDash: [4, 4], tension: 0, pointRadius: 0, fill: false },
  ],
};

export const mockExtractData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr'],
  datasets: [
    { label: 'MBI(L) Efficiency%', data: [91.2, 89.5, 92.1, 88.6], backgroundColor: 'rgba(30,95,173,0.75)', borderRadius: 4 },
    { label: 'BI Efficiency%', data: [92.0, 91.3, 93.0, 91.0], backgroundColor: 'rgba(14,166,108,0.65)', borderRadius: 4 },
  ],
};

export const mockPredData = {
  labels: ['BT-0400', 'BT-0401', 'BT-0402', 'BT-0403', 'BT-0404', 'BT-0405', 'BT-0406', 'BT-0407', 'BT-0408', 'BT-0409'],
  datasets: [
    { label: 'Wort Predicted', data: [14.5, 14.7, 14.6, 15.0, 14.8, 14.4, 14.9, 14.7, 15.1, 14.6], borderColor: '#1e5fad', tension: 0.3, pointRadius: 3, fill: false },
    { label: 'Wort Measured', data: [14.6, 14.9, 14.7, 15.2, 15.0, 14.5, 15.0, 14.9, 15.1, 14.8], borderColor: '#2d7dd2', borderDash: [4, 3], tension: 0.3, pointRadius: 3, fill: false },
    { label: 'WW1 Predicted', data: [5.3, 5.5, 5.4, 5.6, 5.5, 5.1, 5.4, 5.3, 5.6, 5.4], borderColor: '#e07a1a', tension: 0.3, pointRadius: 3, fill: false },
    { label: 'WW1 Measured', data: [5.2, 5.4, 5.3, 5.6, 5.3, 5.0, 5.3, 5.4, 5.5, 5.2], borderColor: '#e07a1a', borderDash: [4, 3], tension: 0.3, pointRadius: 3, fill: false },
  ],
};

export const mockBatchTable = [
  { id: 'BT-0409', date: '09 Apr', product: 'MBI(L)', std: 28620, actual: 27650, wastage: 3.39, wort: 14.8, ww1: 5.2, status: 'Warn' },
  { id: 'BT-0408', date: '08 Apr', product: 'MBI(L)', std: 28450, actual: 28070, wastage: 1.34, wort: 15.1, ww1: 5.5, status: 'Good' },
  { id: 'BT-0407', date: '07 Apr', product: 'BI', std: 27900, actual: 27480, wastage: 1.51, wort: 14.9, ww1: 5.4, status: 'Good' },
  { id: 'BT-0405', date: '05 Apr', product: 'MBI(L)', std: 28200, actual: 27210, wastage: 3.51, wort: 14.5, ww1: 5.0, status: 'Warn' },
  { id: 'BT-0404', date: '04 Apr', product: 'BI', std: 28000, actual: 27440, wastage: 2.00, wort: 15.0, ww1: 5.3, status: 'Good' },
  { id: 'BT-0403', date: '03 Apr', product: 'MBI(L)', std: 28100, actual: 27850, wastage: 0.89, wort: 15.2, ww1: 5.6, status: 'Optimal' },
];