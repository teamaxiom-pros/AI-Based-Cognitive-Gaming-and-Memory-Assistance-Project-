from pathlib import Path
import pandas as pd

from adaptive_engine import generate_recommendation


BASE_DIR = Path(__file__).resolve().parent.parent
DATA_FILE = BASE_DIR / "data" / "patient_sessions.csv"

df = pd.read_csv(DATA_FILE)


# Pick representative patients based on their synthetic profile patterns.
# Since profile_type isn't stored in the CSV, we'll identify patients
# by their overall average performance.

patient_scores = (
    df.groupby("patient_id")["accuracy"]
    .mean()
    .sort_values()
)

test_patients = {
    "Weakest": patient_scores.index[0],
    "Weak": patient_scores.index[len(patient_scores) // 4],
    "Middle": patient_scores.index[len(patient_scores) // 2],
    "Strong": patient_scores.index[(len(patient_scores) * 3) // 4],
    "Strongest": patient_scores.index[-1],
}


print("\n========== AXIOM ADAPTIVE ENGINE TEST ==========\n")


for label, patient_id in test_patients.items():

    result = generate_recommendation(patient_id)

    print(f"--- {label} Patient: {patient_id} ---")

    print(
        f"Focus domain       : "
        f"{result['focus_domain']}"
    )

    print(
        f"Activity           : "
        f"{result['activity']}"
    )

    print(
        f"ML difficulty      : "
        f"{result['ml_difficulty']}"
    )

    print(
        f"Final difficulty   : "
        f"{result['final_difficulty']}"
    )

    print()