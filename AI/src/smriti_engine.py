from pathlib import Path

import joblib
import pandas as pd


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
# Activity mapping
# ---------------------------------

ACTIVITIES = {
    "memory": "card_match",
    "attention": "target_tap",
    "processing_speed": "quick_tap",
    "executive_function": "sequence_builder",
    "recognition": "object_recognition",
}


# ---------------------------------
# Build patient profile
# ---------------------------------

def get_patient_profile(patient_id):

    patient_data = df[
        df["patient_id"] == patient_id
    ].copy()

    if patient_data.empty:
        raise ValueError(
            f"Patient {patient_id} not found."
        )

    scores = (
        patient_data
        .groupby("domain")["accuracy"]
        .mean()
        .mul(100)
    )

    return scores.to_dict()


# ---------------------------------
# Find weakest domain
# ---------------------------------

def get_weakest_domain(profile):

    return min(
        profile,
        key=profile.get
    )


# ---------------------------------
# Get recent history
# ---------------------------------

def get_recent_features(patient_id, domain):

    history = df[
        (df["patient_id"] == patient_id)
        & (df["domain"] == domain)
    ].sort_values("session_number")

    if history.empty:
        raise ValueError(
            f"No {domain} history for {patient_id}."
        )

    # Last 5 sessions
    recent = history.tail(5)

    previous = history.iloc[-1]

    recent_avg_accuracy = recent["accuracy"].mean()

    recent_avg_response_time = (
        recent["response_time"].mean()
    )

    # Trend
    if len(history) >= 5:
        accuracy_trend = (
            history["accuracy"].iloc[-1]
            - history["accuracy"].iloc[-5]
        )
    else:
        accuracy_trend = 0

    return {
        "prev_accuracy": previous["accuracy"],
        "prev_response_time": previous["response_time"],
        "recent_avg_accuracy": recent_avg_accuracy,
        "recent_avg_response_time": recent_avg_response_time,
        "accuracy_trend": accuracy_trend,
        "attempts": previous["attempts"],
        "hints_used": previous["hints_used"],
        "completion": previous["completion"],
        "difficulty": previous["difficulty"],
    }


# ---------------------------------
# ML difficulty prediction
# ---------------------------------

def predict_difficulty(domain, features):

    input_data = pd.DataFrame(
        [{
            "domain": domain,
            "difficulty": features["difficulty"],
            "prev_accuracy": features["prev_accuracy"],
            "prev_response_time": features["prev_response_time"],
            "recent_avg_accuracy": features[
                "recent_avg_accuracy"
            ],
            "recent_avg_response_time": features[
                "recent_avg_response_time"
            ],
            "accuracy_trend": features["accuracy_trend"],
            "attempts": features["attempts"],
            "hints_used": features["hints_used"],
            "completion": features["completion"],
        }]
    )

    processed = preprocessor.transform(
        input_data
    )

    prediction = model.predict(processed)

    return int(prediction[0])


# ---------------------------------
# Axiom recommendation
# ---------------------------------

def generate_recommendation(patient_id):

    profile = get_patient_profile(patient_id)

    weakest_domain = get_weakest_domain(
        profile
    )

    features = get_recent_features(
        patient_id,
        weakest_domain
    )

    recommended_difficulty = predict_difficulty(
        weakest_domain,
        features
    )

    activity = ACTIVITIES[
        weakest_domain
    ]

    return {
        "patient_id": patient_id,
        "profile": profile,
        "focus_domain": weakest_domain,
        "recommended_activity": activity,
        "recommended_difficulty": recommended_difficulty,
    }


# ---------------------------------
# Test
# ---------------------------------

if __name__ == "__main__":

    patient_id = "P001"

    result = generate_recommendation(
        patient_id
    )

    print("\n========== AXIOM RECOMMENDATION ==========")

    print(
        f"Patient: {result['patient_id']}"
    )

    print("\nCognitive Profile:")

    for domain, score in result["profile"].items():
        print(
            f"{domain:20} {score:.2f}"
        )

    print("\nRecommendation:")
    print(
        f"Focus Domain : {result['focus_domain']}"
    )

    print(
        f"Activity     : {result['recommended_activity']}"
    )

    print(
        f"Difficulty   : {result['recommended_difficulty']}"
    )