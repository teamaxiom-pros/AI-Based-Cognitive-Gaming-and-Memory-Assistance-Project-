"""
Axiom Recommendation Engine

Combines:
1. Activity personalisation
2. ML difficulty prediction
3. Safety limits

Output:
    Final activity + difficulty recommendation
"""

from pathlib import Path

import joblib
import pandas as pd

from .personalization_engine import (
    choose_priority_domain,
    choose_activity,
)


# ---------------------------------
# Paths
# ---------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_FILE = BASE_DIR / "data" / "patient_sessions.csv"
MODEL_FILE = BASE_DIR / "models" / "difficulty_model.pkl"
PREPROCESSOR_FILE = BASE_DIR / "models" / "preprocessor.pkl"


# ---------------------------------
# Load resources
# ---------------------------------

df = pd.read_csv(DATA_FILE)

model = joblib.load(MODEL_FILE)
preprocessor = joblib.load(PREPROCESSOR_FILE)


# ---------------------------------
# Get latest domain history
# ---------------------------------

def get_domain_features(patient_id, domain):

    history = df[
        (df["patient_id"] == patient_id)
        & (df["domain"] == domain)
    ].sort_values("session_number")

    if history.empty:
        raise ValueError(
            f"No history found for {patient_id} / {domain}"
        )

    recent = history.tail(5)
    previous = history.iloc[-1]

    recent_avg_accuracy = recent["accuracy"].mean()

    recent_avg_response_time = (
        recent["response_time"].mean()
    )

    # Compare latest 3 with previous 3
    if len(history) >= 6:

        latest_3 = history["accuracy"].tail(3).mean()

        previous_3 = history["accuracy"].iloc[-6:-3].mean()

        trend = latest_3 - previous_3

    else:

        trend = 0.0

    return {
        "difficulty": int(previous["difficulty"]),
        "prev_accuracy": float(previous["accuracy"]),
        "prev_response_time": float(
            previous["response_time"]
        ),
        "recent_avg_accuracy": float(
            recent_avg_accuracy
        ),
        "recent_avg_response_time": float(
            recent_avg_response_time
        ),
        "accuracy_trend": float(trend),
        "attempts": int(previous["attempts"]),
        "hints_used": int(previous["hints_used"]),
        "completion": int(previous["completion"]),
    }


# ---------------------------------
# ML prediction
# ---------------------------------

def predict_difficulty(domain, features):

    input_data = pd.DataFrame(
        [{
            "domain": domain,
            **features,
        }]
    )

    processed = preprocessor.transform(
        input_data
    )

    prediction = model.predict(processed)

    return int(prediction[0])


# ---------------------------------
# Safety layer
# ---------------------------------

def apply_safety_limit(
    ml_difficulty,
    current_difficulty,
    recent_accuracy,
    trend,
):

    difficulty = ml_difficulty

    # Basic performance safety limits
    if recent_accuracy < 0.40:
        difficulty = min(
            difficulty,
            2
        )

    elif recent_accuracy < 0.60:
        difficulty = min(
            difficulty,
            3
        )

    elif recent_accuracy < 0.80:
        difficulty = min(
            difficulty,
            4
        )

    # Do not jump more than one level
    difficulty = max(
        current_difficulty - 1,
        difficulty
    )

    difficulty = min(
        current_difficulty + 1,
        difficulty
    )

    # Sustained decline → don't increase
    if trend < -0.15:
        difficulty = min(
            difficulty,
            current_difficulty
        )

    return int(
        max(1, min(5, difficulty))
    )


# ---------------------------------
# Final recommendation
# ---------------------------------

def generate_recommendation(
    patient_id,
    preferred_activity=None,
):

    # 1. Find domain needing attention
    domain = choose_priority_domain(
        patient_id
    )

    # 2. Choose suitable activity
    activity = choose_activity(
        patient_id,
        domain,
        preferred_activity,
    )

    # 3. Get patient history
    features = get_domain_features(
        patient_id,
        domain,
    )

    # 4. ML predicts difficulty
    ml_difficulty = predict_difficulty(
        domain,
        features,
    )

    # 5. Safety layer
    final_difficulty = apply_safety_limit(
        ml_difficulty,
        features["difficulty"],
        features["recent_avg_accuracy"],
        features["accuracy_trend"],
    )

    return {
        "patient_id": patient_id,
        "domain": domain,
        "activity": activity,
        "ml_difficulty": ml_difficulty,
        "final_difficulty": final_difficulty,
        "recent_accuracy": round(
            features["recent_avg_accuracy"],
            3,
        ),
        "trend": round(
            features["accuracy_trend"],
            3,
        ),
    }


# ---------------------------------
# Test
# ---------------------------------

if __name__ == "__main__":

    result = generate_recommendation(
        patient_id="P001",
        preferred_activity="story_recall",
    )

    print(
        "\n========== AXIOM FINAL RECOMMENDATION =========="
    )

    print(
        f"Patient            : {result['patient_id']}"
    )

    print(
        f"Domain             : {result['domain']}"
    )

    print(
        f"Activity           : {result['activity']}"
    )

    print(
        f"Recent accuracy    : {result['recent_accuracy']}"
    )

    print(
        f"Performance trend  : {result['trend']:+.3f}"
    )

    print(
        f"ML difficulty      : {result['ml_difficulty']}"
    )

    print(
        f"FINAL difficulty   : {result['final_difficulty']}"
    )