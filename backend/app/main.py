from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
import pickle
from fastapi.middleware.cors import CORSMiddleware

# -------------------------------
# Load ML Model (.pkl)
# -------------------------------
import os
import pickle

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "..", "model.pkl")

model = pickle.load(open(MODEL_PATH, "rb")) # 👈 put your .pkl here

# -------------------------------
# FastAPI App
# -------------------------------
app = FastAPI(title="HUL ML Prediction API")

# CORS (for React frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# Input Schema
# -------------------------------
class PredictionInput(BaseModel):
    IT13_01_01: float
    LT13_11_03: float
    IT13_03_01: float
    FT13_11_05: float
    FT12_01_10: float
    IT10_18_01: float
    LT13_10_03: float
    Powder: float
    Husk: float
    Grist: float

# -------------------------------
# Output Schema
# -------------------------------
class PredictionOutput(BaseModel):
    Wort_Solids: float
    WW1_Solids: float
    WW2_Solids: float

# -------------------------------
# Prediction Route
# -------------------------------
@app.post("/predict", response_model=PredictionOutput)
def predict(data: PredictionInput):
    try:
        # Convert input to numpy array
        input_data = np.array([[
            data.IT13_01_01,
            data.LT13_11_03,
            data.IT13_03_01,
            data.FT13_11_05,
            data.FT12_01_10,
            data.IT10_18_01,
            data.LT13_10_03,
            data.Powder,
            data.Husk,
            data.Grist
        ]])

        # Model prediction
        prediction = model.predict(input_data)

        # If model returns array like [[x, y, z]]
        return {
            "Wort_Solids": float(prediction[0][0]),
            "WW1_Solids": float(prediction[0][1]),
            "WW2_Solids": float(prediction[0][2])
        }

    except Exception as e:
        return {"error": str(e)}