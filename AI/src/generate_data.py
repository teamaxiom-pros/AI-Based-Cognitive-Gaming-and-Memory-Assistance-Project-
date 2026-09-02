"""
Generate balanced synthetic patient-session data for Team Axiom.

IMPORTANT:
This is synthetic data for development/testing only.
It is NOT clinical data.
"""

from pathlib import Path
import random
import uuid

import numpy as np
import pandas as pd


# -----------------------------
# Configuration
# -----------------------------

NUM_PATIENTS = 100
SESSIONS_PER_DOMAIN = 8

OUTPUT_DIR = Path(__file__).resolve().parent.parent / "data"
OUTPUT_FILE = OUTPUT_DIR / "patient_sessions.csv"

random.seed(42)
np.random.seed(42)


# -----------------------------
# Cognitive activities
# -----------------------------

ACTIVITIES = {
    "memory": [
        "card_match",
        "story_recall",
        "item_recall",
    ],
    "attention": [
        "target_tap",
        "odd_one_out",
        "spot_difference",
    ],
    "processing_speed": [
        "quick_tap",
        "sorting_sprint",
    ],
    "executive_function": [
        "sequence_builder",
        "rule_switch",
    ],
    "recognition": [
        "object_recognition",
        "familiar_image",
    ],
}


DOMAINS = list(ACTIVITIES.keys())


# -----------------------------
# Patient profiles
# -----------------------------

PROFILE_TYPES = [
    "strong",
    "memory_difficulty",
    "attention_difficulty",
    "slow_processing",
    "improving",
    "inconsistent",
]


def create_patient_profiles(num_patients: int) -> list[dict]:
    profiles = []

    for i in range(num_patients):

        profile_type = random.choice(PROFILE_TYPES)

        abilities = {
            domain: random.uniform(0.55, 0.90)
            for domain in DOMAINS
        }

        if profile_type == "memory_difficulty":
            abilities["memory"] -= random.uniform(0.20, 0.30)

        elif profile_type == "attention_difficulty":
            abilities["attention"] -= random.uniform(0.20, 0.30)

        elif profile_type == "slow_processing":
            abilities["processing_speed"] -= random.uniform(0.20, 0.30)

        elif profile_type == "strong":
            for domain in abilities:
                abilities[domain] += random.uniform(0.05, 0.10)

        abilities = {
            domain: float(np.clip(score, 0.25, 0.95))
            for domain, score in abilities.items()
        }

        profiles.append(
            {
                "patient_id": f"P{i + 1:03d}",
                "profile_type": profile_type,
                "abilities": abilities,
            }
        )

    return profiles


# -----------------------------
# Generate one session
# -----------------------------

def generate_session(
    patient: dict,
    domain: str,
    session_number: int,
) -> dict:

    activity = random.choice(ACTIVITIES[domain])

    difficulty = random.randint(1, 5)

    base_ability = patient["abilities"][domain]

    # Improvement over repeated sessions
    learning_bonus = 0.0

    if patient["profile_type"] == "improving":
        learning_bonus = min(
            0.25,
            session_number * 0.02
        )

    difficulty_penalty = (difficulty - 1) * 0.08

    noise = np.random.normal(0, 0.04)

    accuracy = (
        base_ability
        + learning_bonus
        - difficulty_penalty
        + noise
    )

    accuracy = float(
        np.clip(
            accuracy,
            0.15,
            1.00
        )
    )

    # Larger fluctuations for inconsistent patients
    if patient["profile_type"] == "inconsistent":
        accuracy = float(
            np.clip(
                accuracy + np.random.normal(0, 0.12),
                0.15,
                1.00,
            )
        )

    attempts = 1

    if accuracy < 0.55:
        attempts = random.choice([1, 2, 2, 3])

    hint_probability = max(
        0.0,
        0.65 - accuracy
    )

    hints_used = 0

    if random.random() < hint_probability:
        hints_used = random.choice([1, 1, 2])

    base_time = {
        "memory": 8.0,
        "attention": 5.0,
        "processing_speed": 3.0,
        "executive_function": 9.0,
        "recognition": 5.0,
    }[domain]

    response_time = (
        base_time
        + difficulty * 0.8
        + (1.0 - accuracy) * 5.0
        + np.random.normal(0, 1.0)
    )

    if patient["profile_type"] == "slow_processing":
        response_time += random.uniform(2.0, 5.0)

    response_time = float(
        max(1.0, response_time)
    )

    completion_probability = np.clip(
        0.65
        + accuracy * 0.35
        - difficulty * 0.03,
        0.30,
        0.98,
    )

    completion = int(
        random.random() < completion_probability
    )

    mood = random.choice(
        ["happy", "neutral", "neutral", "tired"]
    )

    return {
        "patient_id": patient["patient_id"],
        "session_id": str(uuid.uuid4())[:8],
        "session_number": session_number,
        "domain": domain,
        "activity": activity,
        "difficulty": difficulty,
        "accuracy": round(accuracy, 3),
        "response_time": round(response_time, 2),
        "attempts": attempts,
        "hints_used": hints_used,
        "completion": completion,
        "mood": mood,
    }


# -----------------------------
# Generate complete dataset
# -----------------------------

def generate_dataset() -> pd.DataFrame:

    patients = create_patient_profiles(NUM_PATIENTS)

    rows = []

    for patient in patients:

        # Every patient gets every domain
        for domain in DOMAINS:

            for session_number in range(
                1,
                SESSIONS_PER_DOMAIN + 1
            ):

                session = generate_session(
                    patient,
                    domain,
                    session_number,
                )

                rows.append(session)

    df = pd.DataFrame(rows)

    # Shuffle rows so the CSV isn't grouped
    # by patient/domain.
    df = df.sample(
        frac=1,
        random_state=42
    ).reset_index(drop=True)

    return df


# -----------------------------
# Main
# -----------------------------

def main():

    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    df = generate_dataset()

    df.to_csv(
        OUTPUT_FILE,
        index=False
    )

    print("Synthetic dataset generated successfully.")
    print(f"Rows: {len(df)}")
    print(f"Patients: {df['patient_id'].nunique()}")

    print("\nSessions per domain:")
    print(df["domain"].value_counts())

    print("\nSessions per patient/domain:")
    print(
        df.groupby(
            ["patient_id", "domain"]
        ).size().head(10)
    )

    print(
        f"\nSaved to: {OUTPUT_FILE}"
    )


if __name__ == "__main__":
    main()