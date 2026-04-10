import React from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <div className="flex-1 overflow-y-auto px-7 py-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;