import React, { useEffect, useState } from 'react';
import KPICard from '../components/KPICard';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import { mockBatchInfo, mockKPIs, mockWastageData } from '../constants/mockData';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

const Dashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mashingHour, setMashingHour] = useState('10');
  const [presentOutput, setPresentOutput] = useState('7');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate gauge data for wastage percentage
  const wastagePercentage = mockBatchInfo.wastage;
  const gaugeValue = Math.min(wastagePercentage * 10, 100); // Scale for better visualization

  const gaugeData = {
    datasets: [{
      data: [gaugeValue, 100 - gaugeValue],
      backgroundColor: [
        wastagePercentage > 4 ? '#ef4444' : wastagePercentage > 1 ? '#f59e0b' : '#10b981',
        '#e5e7eb'
      ],
      borderWidth: 0,
      cutout: '70%',
      circumference: 180,
      rotation: 270,
    }]
  };

  const gaugeOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false }
    }
  };

  const liveWastageData = {
    ...mockWastageData,
    labels: mockWastageData.labels.map(label => {
      if (label === 'Apr\'25') {
        return currentTime.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      }
      return label;
    }),
    datasets: mockWastageData.datasets.map(dataset => ({
      ...dataset,
      data: dataset.label === 'MBI (L) Wastage %'
        ? [...dataset.data.slice(0, -1), mockBatchInfo.wastage]
        : dataset.data
    }))
  };

  const liveChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeInOutCubic' as const
    },
    plugins: {
      legend: {
        labels: {
          font: { family: 'IBM Plex Sans', size: 12 },
        },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 5,
        grid: { color: '#f0f0f0' },
        ticks: {
          callback: (value: any) => value + '%',
          font: { family: 'IBM Plex Mono', size: 11 },
          stepSize: 1,
        },
      },
      x: {
        grid: { display: false },
        ticks: {
          font: { family: 'IBM Plex Sans', size: 12 },
          maxRotation: 0,
        },
      },
    },
    elements: {
      point: {
        radius: 4,
        hoverRadius: 6,
      },
      line: {
        borderWidth: 2,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">HUL Waste Management System</h1>
          <p className="text-slate-600 text-lg mb-6">Real-time Process Intelligence & Waste Monitoring</p>
          <div className="flex items-center justify-center gap-6">
            <StatusBadge status="Live" />
            <span className="text-sm text-slate-500 font-mono bg-white/50 px-3 py-1 rounded-full">
              Last Updated: {currentTime.toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Inputs */}
          <div className="lg:col-span-1 space-y-6">
            {/* Malted Barley Analysis */}
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Malted Barley Analysis</h3>
            <Card className="bg-white/80 backdrop-blur-sm">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <span className="text-sm font-medium text-slate-700">Husk %</span>
                  <span className="text-lg font-bold text-blue-600 font-mono">{mockBatchInfo.husk}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <span className="text-sm font-medium text-slate-700">Grist %</span>
                  <span className="text-lg font-bold text-green-600 font-mono">{mockBatchInfo.grist}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <span className="text-sm font-medium text-slate-700">Powder %</span>
                  <span className="text-lg font-bold text-orange-600 font-mono">{mockBatchInfo.powder}</span>
                </div>
              </div>
            </Card>

            {/* Current Batch Info */}
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Current Batch Information</h3>
            <Card className="bg-white/80 backdrop-blur-sm">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <span className="text-sm font-medium text-slate-700">Product</span>
                  <span className="text-sm font-semibold text-slate-900">{mockBatchInfo.product}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <span className="text-sm font-medium text-slate-700">Batch ID</span>
                  <span className="text-sm font-semibold text-slate-900 font-mono">{mockBatchInfo.batchId}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <span className="text-sm font-medium text-slate-700">Input Type</span>
                  <span className="text-sm font-semibold text-slate-900">{mockBatchInfo.inputType}</span>
                </div>
              </div>
            </Card>

          </div>

          {/* Center Column - Output Metrics */}
          <div className="lg:col-span-2 space-y-6">
            {/* KPI Cards */}
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Output Metrics</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {mockKPIs.map((kpi, index) => (
                  <KPICard key={index} {...kpi} />
                ))}
              </div>
            </div>

            {/* Gauge Chart */}
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Wastage Analysis</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <Card title="Production Inputs" className="bg-white/80 backdrop-blur-sm">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                    <span className="text-sm font-medium text-slate-700">Mashing Hour</span>
                    <input
                      type="number"
                      value={mashingHour}
                      onChange={(e) => setMashingHour(e.target.value)}
                      className="w-20 rounded-md border border-slate-300 bg-white px-2 py-1 text-right text-base font-bold text-blue-600 font-mono focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                    <span className="text-sm font-medium text-slate-700">Present BIP</span>
                    <input
                      type="number"
                      value={presentOutput}
                      onChange={(e) => setPresentOutput(e.target.value)}
                      className="w-20 rounded-md border border-slate-300 bg-white px-2 py-1 text-right text-base font-bold text-green-600 font-mono focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                </div>
              </Card>
              <Card title="Wastage Percentage" className="bg-white/80 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="relative h-32">
                      <Doughnut data={gaugeData} options={gaugeOptions} />
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-2xl font-bold text-slate-900 font-mono">
                          {wastagePercentage}%
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Current Wastage
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-6 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm text-slate-600">Good (&lt;1%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      <span className="text-sm text-slate-600">Warning (1-4%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-sm text-slate-600">High (&gt;4%)</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Full Width Live Wastage Chart */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Live Wastage Monitoring</h3>
          <Card badge={<StatusBadge status="Live" />} className="bg-white/80 backdrop-blur-sm">
            <div className="h-80">
              <Line data={liveWastageData} options={liveChartOptions} />
            </div>
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-200">
              <div className="flex gap-8">
                <div className="text-center">
                  <span className="text-xs text-slate-500 block">Current Wastage</span>
                  <strong className="font-mono text-xl text-orange-600">{mockBatchInfo.wastage}%</strong>
                </div>
                <div className="text-center">
                  <span className="text-xs text-slate-500 block">Target</span>
                  <strong className="font-mono text-xl text-green-600">0.8%</strong>
                </div>
                <div className="text-center">
                  <span className="text-xs text-slate-500 block">Status</span>
                  <strong className={`font-mono text-xl ${mockBatchInfo.wastage > 4 ? 'text-red-600' : mockBatchInfo.wastage > 1 ? 'text-orange-600' : 'text-green-600'}`}>
                    {mockBatchInfo.wastage > 4 ? 'High' : mockBatchInfo.wastage > 1 ? 'Warning' : 'Good'}
                  </strong>
                </div>
              </div>
              <div className="text-xs text-slate-500">
                Updates every second • Real-time data
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;