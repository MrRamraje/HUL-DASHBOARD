import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Machines from './pages/Machines';
import Reports from './pages/Reports';
import BIPCalculator from './pages/BIPCalculator';

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/machines" element={<Machines />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/bip-calculator" element={<BIPCalculator />} />
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;