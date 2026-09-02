"""
Axiom Assistant Data Layer

Provides patient-specific information to assistant actions.
Prototype only.
"""

from .patient import Patient


def get_next_medicine(patient: Patient):
    """Return the next scheduled medicine."""

    if not patient.medicines:
        return None

    # Prototype: choose the earliest stored medicine time
    medicines = sorted(
        patient.medicines,
        key=lambda medicine: medicine["time"]
    )

    return medicines[0]


def get_today_schedule(patient: Patient):
    """Return the patient's current schedule."""

    return {
        "medicines": patient.medicines,
        "appointments": patient.appointments,
        "preferences": patient.preferences,
    }


def get_caregiver(patient: Patient):
    """Return configured caregiver information."""

    if not patient.caregiver_name:
        return None

    return {
        "name": patient.caregiver_name
    }


def get_memory_information(patient: Patient):
    """Return stored personal-memory information."""

    return patient.preferences.get(
        "memory_information",
        {}
    )


# ---------------------------------
# Test
# ---------------------------------

if __name__ == "__main__":

    patient = Patient(
        patient_id="P001",
        name="Demo Patient",
        age=68,
        language="Assamese",
        caregiver_name="Family Member",
    )

    patient.add_medicine(
        name="Medicine A",
        dose="1 tablet",
        time="08:00"
    )

    patient.add_medicine(
        name="Medicine B",
        dose="1 tablet",
        time="20:00"
    )

    patient.add_appointment(
        title="Doctor Visit",
        date="2026-09-05",
        time="11:00"
    )

    patient.preferences = {
        "favorite_activity": "story",
        "preferred_time": "morning",
        "memory_information": {
            "daughter": "Aarti"
        }
    }

    print("\n========== AXIOM DATA LAYER ==========\n")

    print(
        "Next medicine:",
        get_next_medicine(patient)
    )

    print(
        "\nSchedule:",
        get_today_schedule(patient)
    )

    print(
        "\nCaregiver:",
        get_caregiver(patient)
    )

    print(
        "\nMemory:",
        get_memory_information(patient)
    )