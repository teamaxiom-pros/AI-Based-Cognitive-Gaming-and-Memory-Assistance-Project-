from pathlib import Path

import joblib
import pandas as pd


# -----------------------------
# Paths
# -----------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_FILE = BASE_DIR / "models" / "difficulty_model.pkl"
PREPROCESSOR_FILE = BASE_DIR / "models" / "preprocessor.pkl"


# -----------------------------
# Load model
# -----------------------------

model = joblib.load(MODEL_FILE)
preprocessor = joblib.load(PREPROCESSOR_FILE)


# -----------------------------
# Prediction function
# -----------------------------

def predict_difficulty(
    domain,
    current_difficulty,
    prev_accuracy,
    prev_response_time,
    recent_avg_accuracy,
    recent_avg_response_time,
    accuracy_trend,
    attempts,
    hints_used,
    completion,
):
    data = pd.DataFrame(
        [{
            "domain": domain,
            "difficulty": current_difficulty,
            "prev_accuracy": prev_accuracy,
            "prev_response_time": prev_response_time,
            "recent_avg_accuracy": recent_avg_accuracy,
            "recent_avg_response_time": recent_avg_response_time,
            "accuracy_trend": accuracy_trend,
            "attempts": attempts,
            "hints_used": hints_used,
            "completion": completion,
        }]
    )

    processed_data = preprocessor.transform(data)

    prediction = model.predict(processed_data)

    return int(prediction[0])


# -----------------------------
# Test scenarios
# -----------------------------

scenarios = [
    {
        "name": "Strong patient",
        "domain": "memory",
        "current_difficulty": 2,
        "prev_accuracy": 0.90,
        "prev_response_time": 7,
        "recent_avg_accuracy": 0.88,
        "recent_avg_response_time": 7.5,
        "accuracy_trend": 0.10,
        "attempts": 1,
        "hints_used": 0,
        "completion": 1,
    },
    {
        "name": "Struggling patient",
        "domain": "memory",
        "current_difficulty": 3,
        "prev_accuracy": 0.42,
        "prev_response_time": 14,
        "recent_avg_accuracy": 0.40,
        "recent_avg_response_time": 15,
        "accuracy_trend": -0.10,
        "attempts": 3,
        "hints_used": 2,
        "completion": 1,
    },
    {
        "name": "Improving patient",
        "domain": "attention",
        "current_difficulty": 2,
        "prev_accuracy": 0.76,
        "prev_response_time": 7,
        "recent_avg_accuracy": 0.78,
        "recent_avg_response_time": 6.5,
        "accuracy_trend": 0.15,
        "attempts": 1,
        "hints_used": 0,
        "completion": 1,
    },
]


# -----------------------------
# Run predictions
# -----------------------------

for scenario in scenarios:

    name = scenario.pop("name")

    result = predict_difficulty(**scenario)

    print("\n==========================")
    print(name)
    print("==========================")
    print(f"Recommended difficulty: {result}")