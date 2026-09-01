"""
Axiom Session Tracker

Records completed cognitive-activity sessions so that the
adaptive engine can use them for future recommendations.

Development prototype only.
"""

from pathlib import Path
from datetime import datetime
import uuid

import pandas as pd


# ---------------------------------
# Paths
# ---------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_FILE = BASE_DIR / "data" / "patient_sessions.csv"


# ---------------------------------
# Record a completed session
# ---------------------------------

def record_session(
    patient_id,
    domain,
    activity,
    difficulty,
    accuracy,
    response_time,
    attempts=1,
    hints_used=0,
    completion=1,
    mood="neutral",
):
    """
    Add one completed activity session to the dataset.
    """

    df = pd.read_csv(DATA_FILE)

    # Find the patient's current highest session number
    patient_sessions = df[
        df["patient_id"] == patient_id
    ]

    if patient_sessions.empty:
        session_number = 1
    else:
        session_number = (
            patient_sessions["session_number"].max() + 1
        )

    new_session = {
        "patient_id": patient_id,
        "session_id": str(uuid.uuid4())[:8],
        "session_number": session_number,
        "domain": domain,
        "activity": activity,
        "difficulty": difficulty,
        "accuracy": accuracy,
        "response_time": response_time,
        "attempts": attempts,
        "hints_used": hints_used,
        "completion": completion,
        "mood": mood,
        "timestamp": datetime.now().isoformat(),
    }

    new_row = pd.DataFrame([new_session])

    # Add timestamp column if the existing dataset doesn't have it
    if "timestamp" not in df.columns:
        df["timestamp"] = ""

    df = pd.concat(
        [df, new_row],
        ignore_index=True
    )

    df.to_csv(
        DATA_FILE,
        index=False
    )

    print("\nSession recorded successfully.")
    print(new_session)


# ---------------------------------
# Test
# ---------------------------------

if __name__ == "__main__":

    record_session(
        patient_id="P001",
        domain="memory",
        activity="card_match",
        difficulty=2,
        accuracy=0.82,
        response_time=8.2,
        attempts=1,
        hints_used=0,
        completion=1,
        mood="happy",
    )