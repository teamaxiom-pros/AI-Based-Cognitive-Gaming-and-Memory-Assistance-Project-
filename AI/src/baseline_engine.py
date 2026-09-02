from pathlib import Path
import pandas as pd


DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "patient_sessions.csv"


def load_data():
    return pd.read_csv(DATA_FILE)


def calculate_domain_scores(patient_data, recent_sessions=5):
    """
    Calculate recent performance for each cognitive domain.
    """

    scores = {}

    domains = patient_data["domain"].unique()

    for domain in domains:
        domain_data = (
            patient_data[patient_data["domain"] == domain]
            .sort_values("session_number")
            .tail(recent_sessions)
        )

        if len(domain_data) == 0:
            continue

        # Simple weighted performance score
        accuracy = domain_data["accuracy"].mean()
        hints = domain_data["hints_used"].mean()
        completion = domain_data["completion"].mean()

        score = (
            accuracy * 0.70
            + (1 - min(hints / 3, 1)) * 0.15
            + completion * 0.15
        )

        scores[domain] = round(score * 100, 2)

    return scores


def get_performance_level(score):
    if score >= 80:
        return "strong"
    elif score >= 60:
        return "moderate"
    elif score >= 40:
        return "needs_support"
    else:
        return "significant_difficulty"


def recommend_difficulty(score):
    if score >= 85:
        return 4
    elif score >= 70:
        return 3
    elif score >= 55:
        return 2
    else:
        return 1


def recommend_activity(domain):
    activities = {
        "memory": "card_match",
        "attention": "target_tap",
        "processing_speed": "quick_tap",
        "executive_function": "sequence_builder",
        "recognition": "object_recognition",
    }

    return activities.get(domain, "card_match")


def analyze_patient(patient_id):
    df = load_data()

    patient_data = df[df["patient_id"] == patient_id].copy()

    if patient_data.empty:
        print(f"No data found for {patient_id}")
        return

    scores = calculate_domain_scores(patient_data)

    weakest_domain = min(scores, key=scores.get)
    weakest_score = scores[weakest_domain]

    level = get_performance_level(weakest_score)
    difficulty = recommend_difficulty(weakest_score)
    activity = recommend_activity(weakest_domain)

    print("\n========== AXIOM AI ==========")
    print(f"Patient: {patient_id}")

    print("\nDomain Performance:")
    for domain, score in scores.items():
        print(f"{domain:20} {score}")

    print("\nRecommendation:")
    print(f"Focus Domain     : {weakest_domain}")
    print(f"Performance      : {level}")
    print(f"Activity         : {activity}")
    print(f"Difficulty       : {difficulty}")


if __name__ == "__main__":
    analyze_patient("P110")