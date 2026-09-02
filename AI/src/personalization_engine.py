"""
Axiom Personalisation Engine

Chooses a suitable cognitive activity based on:
- Current cognitive performance
- Patient preferences
- Recent activity history

Prototype only.
"""

from pathlib import Path
import pandas as pd


BASE_DIR = Path(__file__).resolve().parent.parent
DATA_FILE = BASE_DIR / "data" / "patient_sessions.csv"


# ---------------------------------
# Activities
# ---------------------------------

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


def load_data():
    return pd.read_csv(DATA_FILE)


# ---------------------------------
# Find priority domain
# ---------------------------------

def choose_priority_domain(patient_id):

    df = load_data()

    patient_data = df[
        df["patient_id"] == patient_id
    ]

    if patient_data.empty:
        raise ValueError(
            f"Patient {patient_id} not found."
        )

    domain_scores = (
        patient_data
        .groupby("domain")["accuracy"]
        .mean()
    )

    return domain_scores.idxmin()


# ---------------------------------
# Get recent activities
# ---------------------------------

def get_recent_activities(
    patient_id,
    count=2,
):

    df = load_data()

    history = (
        df[df["patient_id"] == patient_id]
        .sort_values("session_number")
    )

    return history["activity"].tail(count).tolist()


# ---------------------------------
# Choose activity
# ---------------------------------

def choose_activity(
    patient_id,
    domain,
    preferred_activity=None,
):

    recent_activities = get_recent_activities(
        patient_id
    )

    available = ACTIVITIES[domain]

    # Prefer the patient's preference
    # if it belongs to the chosen domain
    if (
        preferred_activity in available
        and preferred_activity not in recent_activities
    ):
        return preferred_activity

    # Otherwise choose an activity
    # that wasn't recently used
    for activity in available:

        if activity not in recent_activities:
            return activity

    # If everything was recently used,
    # return the first available one
    return available[0]


# ---------------------------------
# Full recommendation
# ---------------------------------

def generate_personalised_activity(
    patient_id,
    preferred_activity=None,
):

    priority_domain = choose_priority_domain(
        patient_id
    )

    activity = choose_activity(
        patient_id,
        priority_domain,
        preferred_activity,
    )

    return {
        "patient_id": patient_id,
        "domain": priority_domain,
        "activity": activity,
        "preference_used": (
            activity == preferred_activity
        ),
    }


# ---------------------------------
# Test
# ---------------------------------

if __name__ == "__main__":

    result = generate_personalised_activity(
        patient_id="P001",
        preferred_activity="story_recall",
    )

    print(
        "\n========== AXIOM PERSONALISATION ==========\n"
    )

    print(
        f"Patient       : {result['patient_id']}"
    )

    print(
        f"Priority domain: {result['domain']}"
    )

    print(
        f"Recommended activity: {result['activity']}"
    )

    print(
        f"Preference used: {result['preference_used']}"
    )