"""
Axiom Performance Analysis

Analyzes recent patient performance for each cognitive domain.

This is an application-level analysis layer.
It is NOT a clinical assessment or diagnosis.
"""

from pathlib import Path

import pandas as pd


# ---------------------------------
# Paths
# ---------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_FILE = BASE_DIR / "data" / "patient_sessions.csv"


# ---------------------------------
# Load data
# ---------------------------------

df = pd.read_csv(DATA_FILE)


# ---------------------------------
# Analyze one patient/domain
# ---------------------------------

def analyze_domain(
    patient_id,
    domain,
    recent_window=5,
):
    """
    Analyze the patient's recent performance
    within one cognitive domain.
    """

    history = df[
        (df["patient_id"] == patient_id)
        & (df["domain"] == domain)
    ].sort_values("session_number")

    if history.empty:
        return None

    recent = history.tail(recent_window)

    # -----------------------------
    # Recent performance
    # -----------------------------

    recent_accuracy = recent["accuracy"].mean()

    recent_response_time = (
        recent["response_time"].mean()
    )

    # -----------------------------
    # Previous performance window
    # -----------------------------

    previous = history.iloc[
        max(0, len(history) - recent_window * 2):
        max(0, len(history) - recent_window)
    ]

    if len(previous) > 0:
        previous_accuracy = previous["accuracy"].mean()
        trend = recent_accuracy - previous_accuracy
    else:
        previous_accuracy = None
        trend = 0.0

    # -----------------------------
    # Consistency
    # -----------------------------

    consistency = recent["accuracy"].std()

    if pd.isna(consistency):
        consistency = 0.0

    # -----------------------------
    # Current state
    # -----------------------------

    if recent_accuracy >= 0.80:
        state = "strong"

    elif recent_accuracy >= 0.60:
        state = "moderate"

    elif recent_accuracy >= 0.40:
        state = "needs_support"

    else:
        state = "significant_difficulty"

    return {
        "patient_id": patient_id,
        "domain": domain,
        "recent_accuracy": round(
            recent_accuracy, 3
        ),
        "previous_accuracy": (
            round(previous_accuracy, 3)
            if previous_accuracy is not None
            else None
        ),
        "trend": round(trend, 3),
        "consistency": round(
            consistency, 3
        ),
        "recent_response_time": round(
            recent_response_time, 2
        ),
        "sessions_analyzed": len(recent),
        "state": state,
    }


# ---------------------------------
# Analyze complete patient
# ---------------------------------

def analyze_patient(patient_id):

    patient_data = df[
        df["patient_id"] == patient_id
    ]

    if patient_data.empty:
        raise ValueError(
            f"Patient {patient_id} not found."
        )

    domains = patient_data["domain"].unique()

    results = {}

    for domain in domains:

        result = analyze_domain(
            patient_id,
            domain
        )

        if result:
            results[domain] = result

    return results


# ---------------------------------
# Test
# ---------------------------------

if __name__ == "__main__":

    patient_id = "P001"

    results = analyze_patient(
        patient_id
    )

    print(
        "\n========== AXIOM PERFORMANCE ANALYSIS ==========\n"
    )

    for domain, result in results.items():

        print(
            f"{domain:20} "
            f"Recent: {result['recent_accuracy']:.2f} | "
            f"Trend: {result['trend']:+.2f} | "
            f"Consistency: {result['consistency']:.2f} | "
            f"{result['state']}"
        )