import React, { useState } from 'react';
import Card from '../components/Card';

const Reports: React.FC = () => {
  const [formData, setFormData] = useState({
    IT13_01_01: '',
    LT13_11_03: '',
    IT13_03_01: '',
    FT13_11_05: '',
    FT12_01_10: '',
    IT10_18_01: '',
    LT13_10_03: '',
    Powder: '',
    Husk: '',
    Grist: '',
  });

  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle Input Change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // API Call
  const handlePredict = async () => {
    setLoading(true);
    setError('');
    setPrediction(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          // Convert to numbers
          IT13_01_01: Number(formData.IT13_01_01),
          LT13_11_03: Number(formData.LT13_11_03),
          IT13_03_01: Number(formData.IT13_03_01),
          FT13_11_05: Number(formData.FT13_11_05),
          FT12_01_10: Number(formData.FT12_01_10),
          IT10_18_01: Number(formData.IT10_18_01),
          LT13_10_03: Number(formData.LT13_10_03),
          Powder: Number(formData.Powder),
          Husk: Number(formData.Husk),
          Grist: Number(formData.Grist),
        }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setPrediction(data);
      }
    } catch (err) {
      setError('Server not reachable');
    }

    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto">

      {/* Header */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-blue-900">
          ML Prediction System
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Enter process parameters to predict solids output
        </p>
      </div>

      {/* Input Form */}
      <Card title="Input Parameters">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

          {Object.keys(formData).map((key) => (
            <input
              key={key}
              name={key}
              value={(formData as any)[key]}
              onChange={handleChange}
              placeholder={key}
              type="number"
              className="px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          ))}

        </div>

        <div className="mt-6 text-center">
          <button
            onClick={handlePredict}
            className="px-6 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition"
          >
            {loading ? 'Predicting...' : 'Predict'}
          </button>
        </div>
      </Card>

      {/* Error */}
      {error && (
        <div className="mt-4 text-center text-red-500 font-medium">
          {error}
        </div>
      )}

      {/* Output */}
      {prediction && (
        <div className="mt-6">
          <Card title="Prediction Output">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">

              <div className="p-4 bg-blue-50 rounded shadow">
                <p className="text-sm text-gray-500">Wort Solids %</p>
                <h3 className="text-xl font-bold text-blue-700">
                  {prediction.Wort_Solids}
                </h3>
              </div>

              <div className="p-4 bg-green-50 rounded shadow">
                <p className="text-sm text-gray-500">WW1 Solids %</p>
                <h3 className="text-xl font-bold text-green-700">
                  {prediction.WW1_Solids}
                </h3>
              </div>

              <div className="p-4 bg-purple-50 rounded shadow">
                <p className="text-sm text-gray-500">WW2 Solids %</p>
                <h3 className="text-xl font-bold text-purple-700">
                  {prediction.WW2_Solids}
                </h3>
              </div>

            </div>
          </Card>
        </div>
      )}

    </div>
  );
};

export default Reports;