import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';

import Dashboard from './pages/Dashboard';
import Machines from './pages/Machines';
import MLPrediction from './pages/MLPrediction';
import BIPCalculator from './pages/BIPCalculator';

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>

          {/* Default */}
          <Route path="/" element={<Dashboard />} />

          {/* Core Pages */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/machines" element={<Machines />} />

          {/* 🔥 ML Prediction (MAIN FEATURE) */}
          <Route path="/ml-prediction" element={<MLPrediction />} />

          {/* Tool */}
          <Route path="/bip-calculator" element={<BIPCalculator />} />

        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;