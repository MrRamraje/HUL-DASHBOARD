import React from 'react';
import KPICard from '../components/KPICard';
import Card from '../components/Card';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { mockBatchTable, mockAnalyticsData, mockExtractData } from '../constants/mockData';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Reports: React.FC = () => {
  const tableColumns = [
    { key: 'id', label: 'Batch ID' },
    { key: 'date', label: 'Date' },
    { key: 'product', label: 'Product' },
    { key: 'std', label: 'Std Output' },
    { key: 'actual', label: 'Actual' },
    { key: 'wastage', label: 'Wastage%' },
    { key: 'wort', label: 'Wort %TS' },
    { key: 'ww1', label: 'WW1 %TS' },
    {
      key: 'status',
      label: 'Status',
      render: (status: string) => <StatusBadge status={status} />
    },
  ];

  const analyticsKPIs = [
    { label: 'Average Monthly Loss', value: 1.35, unit: '%', change: '▲ Within target', good: true },
    { label: 'Best Month', value: 'Mar', unit: '1.3%', change: 'Lowest wastage recorded', good: true },
    { label: 'Total Batches Run', value: 48, change: 'Q1–Q2 2025', good: true },
  ];

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: { font: { family: 'IBM Plex Sans', size: 10 } },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 2.2,
        grid: { color: '#f0f0f0' },
        ticks: {
          callback: (value: any) => value + '%',
          font: { family: 'IBM Plex Mono', size: 10 },
        },
      },
      x: { grid: { display: false }, ticks: { font: { family: 'IBM Plex Sans', size: 11 } } },
    },
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { font: { family: 'IBM Plex Sans', size: 10 } } },
    },
    scales: {
      y: {
        min: 85,
        max: 96,
        grid: { color: '#f0f0f0' },
        ticks: {
          callback: (value: any) => value + '%',
          font: { family: 'IBM Plex Mono', size: 10 },
        },
      },
      x: { grid: { display: false }, ticks: { font: { family: 'IBM Plex Sans', size: 11 } } },
    },
  };

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-blue-900">Data Analytics Section</h2>
        <p className="text-gray-500 text-sm mt-1">Monthly performance analysis, trend monitoring, and batch-level reporting</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <select className="px-3 py-2 border border-gray-300 rounded text-sm bg-white text-gray-700">
          <option>Product: MBI (L)</option>
          <option>Product: BI</option>
          <option>All Products</option>
        </select>
        <select className="px-3 py-2 border border-gray-300 rounded text-sm bg-white text-gray-700">
          <option>Jan 2025 – Apr 2025</option>
          <option>Q1 2025</option>
          <option>Q2 2025</option>
        </select>
        <select className="px-3 py-2 border border-gray-300 rounded text-sm bg-white text-gray-700">
          <option>All Batches</option>
          <option>BT-0409</option>
          <option>BT-0408</option>
        </select>
        <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-semibold hover:bg-blue-700">Apply Filters</button>
      </div>

      {/* Trend KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {analyticsKPIs.map((kpi, index) => (
          <KPICard key={index} {...kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card title="Monthly Wastage Trend – MBI (L) vs BI" badge={<span className="text-xs font-semibold text-gray-600">2025</span>}>
          <Line data={mockAnalyticsData} options={lineOptions} />
        </Card>
        <Card title="Extraction Efficiency by Product" badge={<span className="text-xs font-semibold text-gray-600">Monthly Avg</span>}>
          <Bar data={mockExtractData} options={barOptions} />
        </Card>
      </div>

      {/* Batch Table */}
      <Card title="Batch Performance Log" badge={<span className="text-xs font-semibold text-gray-600">April 2025</span>}>
        <DataTable columns={tableColumns} data={mockBatchTable} />
      </Card>
    </div>
  );
};

export default Reports;