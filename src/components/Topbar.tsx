import React, { useState, useEffect } from 'react';
import { PRODUCT } from '../constants/nav';
import StatusBadge from './StatusBadge';

const Topbar: React.FC = () => {
  const [time, setTime] = useState('--:--:--');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-IN'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white border-b border-slate-200 px-7 py-4 flex items-center justify-between flex-shrink-0 shadow-sm">
      <div className="flex items-center gap-4">
        <img src="/images/logo.png" alt="Hindustan Unilever" className="h-14 w-auto rounded-lg shadow-sm" />
        <div>
          <div className="text-xl font-bold text-slate-900">Hindustan Unilever, Sonepat Unit, Haryana</div>
          <div className="text-sm font-medium text-slate-500">Real-time waste analytics and process monitoring</div>
        </div>
      </div>
      <div className="flex gap-4 items-center">
        <span className="bg-blue-600 text-white border border-blue-700 rounded-lg px-4 py-2 text-sm font-bold shadow-md">Product: {PRODUCT}</span>
        <StatusBadge status="Live" />
        <span className="text-slate-500 text-xs font-mono">{time}</span>
      </div>
    </div>
  );
};

export default Topbar;