import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_ITEMS, PRODUCT, BATCH_ID } from '../constants/nav';

const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="w-56 min-w-56 bg-blue-900 flex flex-col overflow-y-auto shadow-2xl">
      <div className="px-5 py-4 pb-3 border-b border-white/8">
        <div className="bg-slate-900 text-white font-bold text-xs uppercase tracking-wide px-3 py-1 rounded mb-2">HUL AI</div>
        <div className="text-white font-semibold text-base leading-tight">Industrial Monitor</div>
        <div className="text-slate-300 text-xs uppercase tracking-wide mt-1">Waste Management System</div>
      </div>

      <div className="text-blue-300 text-xs font-semibold uppercase tracking-wide px-5 py-2">Navigation</div>

      {NAV_ITEMS.map((item) => (
        <Link
          key={item.id}
          to={item.path}
          className={`flex items-start gap-3 px-4 py-3 mx-2 my-1 cursor-pointer border-l-3 transition-all text-sm font-normal leading-relaxed ${
            location.pathname === item.path
              ? 'bg-blue-600/35 border-blue-400 text-white font-semibold'
              : 'border-transparent text-white/65 hover:bg-white/6 hover:text-white'
          }`}
        >
          <span className="text-base mt-0.5 flex-shrink-0">{item.icon}</span>
          <span>{item.label}</span>
        </Link>
      ))}

      <div className="mt-auto px-5 py-4 border-t border-white/8 text-white/35 text-xs">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>System Online</span>
        </div>
        <div>Batch: {BATCH_ID}</div>
      </div>
    </nav>
  );
};

export default Sidebar;