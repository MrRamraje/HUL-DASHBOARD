"""
fastapi_process_endpoints.py
----------------------------
Drop-in FastAPI router for all 4 process section endpoints.
Mount this in your main FastAPI app:

    from fastapi_process_endpoints import router
    app.include_router(router, prefix="/api")

Each endpoint returns the exact JSON shape expected by the React components.
Replace the mock_* functions with your real Python calculation logic.
"""

from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import random

app = FastAPI(title="HUL Process API")

# ── CORS (allow your React dev server) ──────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

router = APIRouter()


# ═══════════════════════════════════════════════════════════════════════════
# SOLID HANDLING
# ═══════════════════════════════════════════════════════════════════════════
class SolidHandlingResponse(BaseModel):
    wg_target_flow: float
    wg_actual_flow: float
    wf_target_flow: float
    wf_actual_flow: float
    mb_actual_flow: float
    mb_target_flow: float
    mb_gap: float
    mb_current: float
    mb_husk_pct: float
    mb_grist_pct: float
    mb_powder_pct: float
    conveyor_flow_rate: float
    conveyor_pct_mb: float
    conveyor_pct_wg: float
    conveyor_pct_wf: float
    mixing_rpm: float
    mixing_current: float
    mixing_tank_level: float
    mixing_flow_rate: float
    mixing_flow_target: float
    mixing_pct_ts: float
    mixing_pct_mb: float
    mixing_pct_wg: float
    mixing_pct_wf: float
    # Calculated outputs (your Python BIP logic goes here)
    output_bom: float
    output_std_kg: float
    output_actual_kg: float
    output_wastage_pct: float


@router.get("/process/solid-handling", response_model=SolidHandlingResponse)
def get_solid_handling():
    """
    Replace this with real sensor reads + your BIP Python calculation.
    For BIP calculation call your existing Python formula file here.
    """
    # --- READ FROM YOUR PLC/OPC-UA/DATABASE HERE ---
    wg_actual = 9600 + random.uniform(-300, 300)
    wf_actual = 850 + random.uniform(-60, 60)
    mb_actual = 1200 + random.uniform(-80, 80)
    conveyor_flow = 9600 + random.uniform(-400, 200)
    mixing_level = random.uniform(55, 85)
    mixing_flow = 9600 + random.uniform(-500, 300)
    husk = 11.2 + random.uniform(-1, 1)
    grist = 75.0 + random.uniform(-2, 2)
    powder = 100.0 - husk - grist

    # --- YOUR BIP FORMULA (replace with actual import) ---
    std_kg = 28620.0
    actual_kg = mixing_flow * 2.88  # placeholder
    wastage_pct = (std_kg - actual_kg) / std_kg * 100
    bom = std_kg / 116.4  # placeholder formula

    return SolidHandlingResponse(
        wg_target_flow=9600, wg_actual_flow=round(wg_actual, 1),
        wf_target_flow=850, wf_actual_flow=round(wf_actual, 1),
        mb_actual_flow=round(mb_actual, 1), mb_target_flow=1200,
        mb_gap=round(0.38 + random.uniform(0, 0.14), 2),
        mb_current=round(13 + random.uniform(0, 4), 1),
        mb_husk_pct=round(husk, 1), mb_grist_pct=round(grist, 1),
        mb_powder_pct=round(powder, 1),
        conveyor_flow_rate=round(conveyor_flow, 0),
        conveyor_pct_mb=round(husk, 1),
        conveyor_pct_wg=round(grist, 1),
        conveyor_pct_wf=round(powder, 1),
        mixing_rpm=100, mixing_current=round(17 + random.uniform(0, 4), 1),
        mixing_tank_level=round(mixing_level, 1),
        mixing_flow_rate=round(mixing_flow, 0), mixing_flow_target=10850,
        mixing_pct_ts=round(14 + random.uniform(-1, 2), 1),
        mixing_pct_mb=round(husk, 1), mixing_pct_wg=round(grist, 1),
        mixing_pct_wf=round(powder, 1),
        output_bom=round(bom, 2),
        output_std_kg=std_kg,
        output_actual_kg=round(actual_kg, 0),
        output_wastage_pct=round(abs(wastage_pct), 2),
    )


# ═══════════════════════════════════════════════════════════════════════════
# MASHING SECTION
# ═══════════════════════════════════════════════════════════════════════════
class HexData(BaseModel):
    temp_setpoint: float
    temp_actual: float
    flow_in: float
    flow_out: float

class MashingResponse(BaseModel):
    water_flow: float
    water_flow_min: float
    water_flow_max: float
    mixing_tank1_level: float
    mixing_tank2_level: float
    hex: List[HexData]
    output_mashing_efficiency: float
    output_temp_profile: List[float]
    output_actual_kg: float
    output_std_kg: float
    output_wastage_pct: float


@router.get("/process/mashing", response_model=MashingResponse)
def get_mashing():
    setpoints = [60.0, 64.0, 74.0, 74.0, 74.0, 80.0]
    actuals = [round(sp + random.uniform(-1.5, 1.5), 1) for sp in setpoints]
    flow = round(7500 + random.uniform(0, 1200), 0)
    eff = round(91 + random.uniform(0, 6), 1)
    actual_kg = round(27000 + random.uniform(0, 1500), 0)
    std_kg = 28620.0

    return MashingResponse(
        water_flow=flow, water_flow_min=7500, water_flow_max=8700,
        mixing_tank1_level=round(55 + random.uniform(0, 30), 1),
        mixing_tank2_level=round(50 + random.uniform(0, 30), 1),
        hex=[HexData(temp_setpoint=sp, temp_actual=a, flow_in=flow, flow_out=flow)
             for sp, a in zip(setpoints, actuals)],
        output_mashing_efficiency=eff,
        output_temp_profile=actuals,
        output_actual_kg=actual_kg,
        output_std_kg=std_kg,
        output_wastage_pct=round((std_kg - actual_kg) / std_kg * 100, 2),
    )


# ═══════════════════════════════════════════════════════════════════════════
# EXTRACTION SECTION
# ═══════════════════════════════════════════════════════════════════════════
class ExtractorUnitData(BaseModel):
    name: str
    pct_predicted: float
    pct_ts: float
    pct_measured: float
    wash_tank_level: float

class ExtractionResponse(BaseModel):
    buffer_tank_level: float
    units: List[ExtractorUnitData]
    target_extraction: float
    measured_extraction: float
    output_wort_brix: float
    output_wort_extraction: float
    output_total_wastage: float
    output_actual_kg: float
    output_std_kg: float


@router.get("/process/extraction", response_model=ExtractionResponse)
def get_extraction():
    wort_meas = round(86 + random.uniform(0, 4), 1)
    return ExtractionResponse(
        buffer_tank_level=round(60 + random.uniform(0, 30), 1),
        units=[
            ExtractorUnitData(name="Wort",
                pct_predicted=round(88 + random.uniform(-2, 2), 1),
                pct_ts=round(14.5 + random.uniform(-1, 1), 1),
                pct_measured=wort_meas,
                wash_tank_level=round(50 + random.uniform(0, 40), 1)),
            ExtractorUnitData(name="Weak Wort 1",
                pct_predicted=round(76 + random.uniform(-2, 2), 1),
                pct_ts=round(8.4 + random.uniform(-0.5, 0.5), 1),
                pct_measured=round(75 + random.uniform(-2, 2), 1),
                wash_tank_level=round(40 + random.uniform(0, 40), 1)),
            ExtractorUnitData(name="Weak Wort 2",
                pct_predicted=round(62 + random.uniform(-2, 2), 1),
                pct_ts=round(4.2 + random.uniform(-0.5, 0.5), 1),
                pct_measured=round(61 + random.uniform(-2, 2), 1),
                wash_tank_level=round(35 + random.uniform(0, 40), 1)),
        ],
        target_extraction=91.0,
        measured_extraction=wort_meas,
        output_wort_brix=round(14 + random.uniform(0, 2), 1),
        output_wort_extraction=wort_meas,
        output_total_wastage=round(2 + random.uniform(0, 2.5), 2),
        output_actual_kg=round(27000 + random.uniform(0, 1400), 0),
        output_std_kg=28620.0,
    )


# ═══════════════════════════════════════════════════════════════════════════
# COMPLETE PROCESS SUMMARY
# ═══════════════════════════════════════════════════════════════════════════
class CompleteProcessResponse(BaseModel):
    wg_flow: float; wf_flow: float; mb_flow: float; conveyor_flow: float
    mixing1_level: float; mixing2_level: float
    water_flow: float; steam_on: bool
    hex_temps: List[float]
    wort_pct: float; ww1_pct: float; ww2_pct: float; buffer_level: float
    total_bip_output: float; std_output: float
    mashing_efficiency: float; wort_extraction: float
    total_wastage: float; wastage_deviation: float


@router.get("/process/complete", response_model=CompleteProcessResponse)
def get_complete_process():
    hex_sp = [60, 64, 74, 74, 74, 80]
    hex_actual = [round(sp + random.uniform(-1.5, 1.5), 1) for sp in hex_sp]
    actual_out = round(27000 + random.uniform(0, 1200), 0)
    std_out = 28620.0
    wastage_kg = std_out - actual_out

    return CompleteProcessResponse(
        wg_flow=round(9600 + random.uniform(-300, 300), 0),
        wf_flow=round(850 + random.uniform(-60, 60), 0),
        mb_flow=round(1200 + random.uniform(-80, 80), 0),
        conveyor_flow=round(9600 + random.uniform(-400, 200), 0),
        mixing1_level=round(58 + random.uniform(0, 28), 1),
        mixing2_level=round(52 + random.uniform(0, 30), 1),
        water_flow=round(7700 + random.uniform(0, 800), 0),
        steam_on=True,
        hex_temps=hex_actual,
        wort_pct=round(86 + random.uniform(0, 4), 1),
        ww1_pct=round(73 + random.uniform(0, 5), 1),
        ww2_pct=round(59 + random.uniform(0, 5), 1),
        buffer_level=round(58 + random.uniform(0, 30), 1),
        total_bip_output=actual_out,
        std_output=std_out,
        mashing_efficiency=round(91 + random.uniform(0, 5.5), 1),
        wort_extraction=round(85 + random.uniform(0, 5), 1),
        total_wastage=round(wastage_kg, 0),
        wastage_deviation=round(wastage_kg / std_out * 100, 2),
    )


# Include router
app.include_router(router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)