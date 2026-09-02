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
# Load data + model
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
# Get patient's current domain state
# ---------------------------------

def get_domain_state(patient_id, domain):

    history = df[
        (df["patient_id"] == patient_id)
        & (df["domain"] == domain)
    ].sort_values("session_number")

    if history.empty:
        return None

    recent = history.tail(5)

    long_term_score = history["accuracy"].mean() * 100
    recent_score = recent["accuracy"].mean() * 100

    # Compare recent performance with long-term performance
    trend = recent_score - long_term_score

    if recent_score >= 80:
        state = "strong"

    elif recent_score >= 60:
        state = "moderate"

    elif recent_score >= 40:
        state = "needs_support"

    else:
        state = "significant_difficulty"

    return {
        "long_term_score": round(long_term_score, 2),
        "recent_score": round(recent_score, 2),
        "trend": round(trend, 2),
        "state": state,
    }


# ---------------------------------
# Get complete patient state
# ---------------------------------

def get_patient_state(patient_id):

    states = {}

    for domain in ACTIVITIES:
        state = get_domain_state(
            patient_id,
            domain
        )

        if state:
            states[domain] = state

    return states


# ---------------------------------
# Choose focus domain
# ---------------------------------

def choose_focus_domain(states):

    return min(
        states,
        key=lambda domain: states[domain]["recent_score"]
    )


# ---------------------------------
# Get ML features
# ---------------------------------

def get_ml_features(patient_id, domain):

    history = df[
        (df["patient_id"] == patient_id)
        & (df["domain"] == domain)
    ].sort_values("session_number")

    recent = history.tail(5)
    previous = history.iloc[-1]

    recent_avg_accuracy = recent["accuracy"].mean()

    recent_avg_response_time = (
        recent["response_time"].mean()
    )

    if len(history) >= 5:
        accuracy_trend = (
            history["accuracy"].iloc[-1]
            - history["accuracy"].iloc[-5]
        )
    else:
        accuracy_trend = 0

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
        "accuracy_trend": float(
            accuracy_trend
        ),
        "attempts": int(previous["attempts"]),
        "hints_used": int(previous["hints_used"]),
        "completion": int(previous["completion"]),
    }


# ---------------------------------
# Predict difficulty
# ---------------------------------

def predict_difficulty(domain, features):

    data = pd.DataFrame(
        [{
            "domain": domain,
            **features
        }]
    )

    processed = preprocessor.transform(data)

    prediction = model.predict(processed)

    return int(prediction[0])


# ---------------------------------
# Safety layer
# ---------------------------------

def apply_safety_limit(
    recommended_difficulty,
    current_difficulty,
    state,
    trend,
):
    state_limits = {
        "significant_difficulty": 2,
        "needs_support": 3,
        "moderate": 4,
        "strong": 5,
    }

    max_allowed = state_limits[state]

    # First restrict ML recommendation to the patient's state
    difficulty = min(
        recommended_difficulty,
        max_allowed
    )

    # Allow only one-level movement from the current difficulty
    lower_bound = max(
        1,
        current_difficulty - 1
    )

    upper_bound = min(
        5,
        current_difficulty + 1
    )

    difficulty = max(
        lower_bound,
        min(difficulty, upper_bound)
    )

    # IMPORTANT:
    # State safety limit has final authority.
    difficulty = min(
        difficulty,
        max_allowed
    )

    # Sustained decline → don't increase difficulty
    if trend < -10:
        difficulty = min(
            difficulty,
            current_difficulty
        )

    return int(max(1, min(5, difficulty)))


# ---------------------------------
# Full Axiom adaptive recommendation
# ---------------------------------

def generate_recommendation(patient_id):

    states = get_patient_state(patient_id)

    if not states:
        raise ValueError(
            f"No data found for {patient_id}"
        )

    focus_domain = choose_focus_domain(states)

    state_info = states[focus_domain]

    features = get_ml_features(
        patient_id,
        focus_domain
    )

    ml_difficulty = predict_difficulty(
        focus_domain,
        features
    )

    final_difficulty = apply_safety_limit(
        ml_difficulty,
        features["difficulty"],
        state_info["state"],
        state_info["trend"],
    )

    return {
        "patient_id": patient_id,
        "states": states,
        "focus_domain": focus_domain,
        "activity": ACTIVITIES[focus_domain],
        "ml_difficulty": ml_difficulty,
        "final_difficulty": final_difficulty,
    }


# ---------------------------------
# Test
# ---------------------------------

if __name__ == "__main__":

    patient_id = "P001"

    result = generate_recommendation(
        patient_id
    )

    print("\n========== AXIOM ADAPTIVE AI ==========")
    print(f"Patient: {patient_id}")

    print("\nCurrent Cognitive State:")

    for domain, info in result["states"].items():

        print(
            f"{domain:20} "
            f"Recent: {info['recent_score']:6.2f} | "
            f"Trend: {info['trend']:6.2f} | "
            f"{info['state']}"
        )

    print("\nAI Recommendation:")
    print(
        f"Focus Domain       : {result['focus_domain']}"
    )

    print(
        f"Activity            : {result['activity']}"
    )

    print(
        f"ML Difficulty       : {result['ml_difficulty']}"
    )

    print(
        f"Final Difficulty    : {result['final_difficulty']}"
    )