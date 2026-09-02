"""
Axiom Recommendation Engine

Combines:
1. Activity personalisation
2. ML difficulty prediction
3. Safety limits
4. Performance analysis

Output:
    Final activity + difficulty recommendation
    + patient performance interpretation

Note:
    This is a prototype AI system for adaptive assistance.
    It is NOT a clinical diagnostic system.
"""

from pathlib import Path

import joblib
import pandas as pd

from .performance_engine import analyze_performance

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
    """
    Collect recent performance features for a patient
    in a particular cognitive domain.
    """

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

    # Average of the latest 5 sessions
    recent_avg_accuracy = recent["accuracy"].mean()

    recent_avg_response_time = (
        recent["response_time"].mean()
    )

    # ---------------------------------
    # Performance trend
    # ---------------------------------
    # Compare latest 3 sessions
    # against the previous 3 sessions.

    if len(history) >= 6:

        latest_3 = (
            history["accuracy"]
            .tail(3)
            .mean()
        )

        previous_3 = (
            history["accuracy"]
            .iloc[-6:-3]
            .mean()
        )

        trend = latest_3 - previous_3

    else:

        trend = 0.0

    return {
        "difficulty": int(
            previous["difficulty"]
        ),

        "prev_accuracy": float(
            previous["accuracy"]
        ),

        "prev_response_time": float(
            previous["response_time"]
        ),

        "recent_avg_accuracy": float(
            recent_avg_accuracy
        ),

        "recent_avg_response_time": float(
            recent_avg_response_time
        ),

        "accuracy_trend": float(
            trend
        ),

        "attempts": int(
            previous["attempts"]
        ),

        "hints_used": int(
            previous["hints_used"]
        ),

        "completion": int(
            previous["completion"]
        ),
    }


# ---------------------------------
# ML prediction
# ---------------------------------

def predict_difficulty(domain, features):
    """
    Predict difficulty using the trained ML model.
    """

    input_data = pd.DataFrame(
        [{
            "domain": domain,
            **features,
        }]
    )

    processed = preprocessor.transform(
        input_data
    )

    prediction = model.predict(
        processed
    )

    return int(
        prediction[0]
    )


# ---------------------------------
# Safety layer
# ---------------------------------

def apply_safety_limit(
    ml_difficulty,
    current_difficulty,
    recent_accuracy,
    trend,
):
    """
    Prevent unsafe or sudden difficulty changes.

    Difficulty range:
        1 = easiest
        5 = hardest
    """

    difficulty = ml_difficulty

    # ---------------------------------
    # Performance-based safety limits
    # ---------------------------------

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

    # ---------------------------------
    # Prevent sudden jumps
    # ---------------------------------

    difficulty = max(
        current_difficulty - 1,
        difficulty
    )

    difficulty = min(
        current_difficulty + 1,
        difficulty
    )

    # ---------------------------------
    # Sustained decline
    # ---------------------------------

    if trend < -0.15:

        difficulty = min(
            difficulty,
            current_difficulty
        )

    # ---------------------------------
    # Final range: 1–5
    # ---------------------------------

    return int(
        max(
            1,
            min(
                5,
                difficulty
            )
        )
    )


# ---------------------------------
# Final recommendation
# ---------------------------------

def generate_recommendation(
    patient_id,
    preferred_activity=None,
):
    """
    Generate a complete personalised recommendation.
    """

    # ---------------------------------
    # 1. Find priority domain
    # ---------------------------------

    domain = choose_priority_domain(
        patient_id
    )

    # ---------------------------------
    # 2. Choose activity
    # ---------------------------------

    activity = choose_activity(
        patient_id,
        domain,
        preferred_activity,
    )

    # ---------------------------------
    # 3. Get patient history
    # ---------------------------------

    features = get_domain_features(
        patient_id,
        domain,
    )

    # ---------------------------------
    # 4. ML difficulty prediction
    # ---------------------------------

    ml_difficulty = predict_difficulty(
        domain,
        features,
    )

    # ---------------------------------
    # 5. Apply safety layer
    # ---------------------------------

    final_difficulty = apply_safety_limit(
        ml_difficulty,
        features["difficulty"],
        features["recent_avg_accuracy"],
        features["accuracy_trend"],
    )

    # ---------------------------------
    # 6. Analyze performance
    # ---------------------------------

    performance = analyze_performance(
        recent_accuracy=features[
            "recent_avg_accuracy"
        ],
        trend=features[
            "accuracy_trend"
        ],
        difficulty=final_difficulty,
    )

    # ---------------------------------
    # 7. Final result
    # ---------------------------------

    return {
        "patient_id": patient_id,

        "domain": domain,

        "activity": activity,

        "ml_difficulty": ml_difficulty,

        "final_difficulty": final_difficulty,

        "recent_accuracy": round(
            features[
                "recent_avg_accuracy"
            ],
            3,
        ),

        "trend": round(
            features[
                "accuracy_trend"
            ],
            3,
        ),

        "performance": performance,
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
        f"Patient            : "
        f"{result['patient_id']}"
    )

    print(
        f"Domain             : "
        f"{result['domain']}"
    )

    print(
        f"Activity           : "
        f"{result['activity']}"
    )

    print(
        f"Recent accuracy    : "
        f"{result['recent_accuracy']}"
    )

    print(
        f"Performance trend  : "
        f"{result['trend']:+.3f}"
    )

    print(
        f"ML difficulty      : "
        f"{result['ml_difficulty']}"
    )

    print(
        f"FINAL difficulty   : "
        f"{result['final_difficulty']}"
    )

    print(
        "\n========== PERFORMANCE ANALYSIS =========="
    )

    print(
        f"Accuracy           : "
        f"{result['performance']['accuracy_percent']}%"
    )

    print(
        f"Trend              : "
        f"{result['performance']['trend_percent']:+.1f}%"
    )

    print(
        f"Status             : "
        f"{result['performance']['status']}"
    )

    print(
        f"Trend label        : "
        f"{result['performance']['trend_label']}"
    )

    print(
        f"Message            : "
        f"{result['performance']['message']}"
    )