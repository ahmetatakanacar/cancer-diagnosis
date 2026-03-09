from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import joblib
import pandas as pd
from schemas import TumorVerisi

app = FastAPI(
    title="Kanser Teşhis API",
    description="XGBoost tabanlı tümör sınıflandırma servisi",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    model = joblib.load("cancer_pipeline.pkl")
    print("Model yüklendi!")
except Exception as e:
    model = None
    print(f"Model yüklenemedi: {e}")

THRESHOLD = 0.2

@app.get("/")
def ana_sayfa():
    return {"mesaj": "Kanser Teşhis API — Aktif"}

@app.post("/tahmin-et")
def tahmin_et(veri: TumorVerisi):
    if model is None:
        raise HTTPException(status_code=503, detail="Model yüklü değil.")
    
    try:
        input_dict = {
            "radius_mean": veri.radius_mean,
            "texture_mean": veri.texture_mean,
            "perimeter_mean": veri.perimeter_mean,
            "area_mean": veri.area_mean,
            "smoothness_mean": veri.smoothness_mean,
            "compactness_mean": veri.compactness_mean,
            "concavity_mean": veri.concavity_mean,
            "concave points_mean": veri.concave_points_mean,
            "symmetry_mean": veri.symmetry_mean,
            "fractal_dimension_mean": veri.fractal_dimension_mean,
            "radius_se": veri.radius_se,
            "texture_se": veri.texture_se,
            "perimeter_se": veri.perimeter_se,
            "area_se": veri.area_se,
            "smoothness_se": veri.smoothness_se,
            "compactness_se": veri.compactness_se,
            "concavity_se": veri.concavity_se,
            "concave points_se": veri.concave_points_se,
            "symmetry_se": veri.symmetry_se,
            "fractal_dimension_se": veri.fractal_dimension_se,
            "radius_worst": veri.radius_worst,
            "texture_worst": veri.texture_worst,
            "perimeter_worst": veri.perimeter_worst,
            "area_worst": veri.area_worst,
            "smoothness_worst": veri.smoothness_worst,
            "compactness_worst": veri.compactness_worst,
            "concavity_worst": veri.concavity_worst,
            "concave points_worst": veri.concave_points_worst,
            "symmetry_worst": veri.symmetry_worst,
            "fractal_dimension_worst": veri.fractal_dimension_worst,
        }

        df = pd.DataFrame([input_dict])
        olasilik = model.predict_proba(df)[0][1]
        tahmin = 1 if olasilik >= THRESHOLD else 0
        karar = "Malignant — Kötü huylu tümör tespit edildi." if tahmin == 1 else "Benign — İyi huylu tümör."

        return {
            "tahmin_kodu": tahmin,
            "karar": karar,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Tahmin hatası: {str(e)}")