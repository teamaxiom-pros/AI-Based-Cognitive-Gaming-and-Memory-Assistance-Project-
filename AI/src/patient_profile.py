from pathlib import Path
import pandas as pd


BASE_DIR = Path(__file__).resolve().parent.parent
DATA_FILE = BASE_DIR / "data" / "patient_sessions.csv"


def load_data():
    return pd.read_csv(DATA_FILE)


def get_level(score):
    if score >= 80:
        return "Strong"
    elif score >= 60:
        return "Moderate"
    elif score >= 40:
        return "Needs Support"
    else:
        return "Significant Difficulty"


def build_patient_profile(patient_id):
    df = load_data()

    patient_data = df[df["patient_id"] == patient_id].copy()

    if patient_data.empty:
        print(f"No data found for {patient_id}")
        return None

    # Average performance for each cognitive domain
    domain_scores = (
        patient_data
        .groupby("domain")["accuracy"]
        .mean()
        .mul(100)
        .round(2)
    )

    profile = {}

    for domain, score in domain_scores.items():
        profile[domain] = {
            "score": score,
            "level": get_level(score),
        }

    return profile


def display_profile(patient_id):
    profile = build_patient_profile(patient_id)

    if profile is None:
        return

    print("\n========== AXIOM PATIENT PROFILE ==========")
    print(f"Patient: {patient_id}\n")

    for domain, data in profile.items():
        print(
            f"{domain:20} "
            f"{data['score']:6.2f}  "
            f"({data['level']})"
        )


if __name__ == "__main__":
    display_profile("P001")