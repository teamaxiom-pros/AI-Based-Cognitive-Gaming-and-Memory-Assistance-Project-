"""
Axiom Assistant Actions

Connects detected intents to actual patient data
and application functionality.
"""

try:
    from .assistant_data import (
        get_next_medicine,
        get_today_schedule,
        get_caregiver,
        get_memory_information,
    )
    from .recommendation_engine import (
        generate_recommendation,
    )
except ImportError:
    try:
        from AI.src.assistant_data import (
            get_next_medicine,
            get_today_schedule,
            get_caregiver,
            get_memory_information,
        )
        from AI.src.recommendation_engine import (
            generate_recommendation,
        )
    except ImportError:
        import sys
        from pathlib import Path
        _src_dir = Path(__file__).resolve().parent
        if str(_src_dir) not in sys.path:
            sys.path.insert(0, str(_src_dir))
        from assistant_data import (
            get_next_medicine,
            get_today_schedule,
            get_caregiver,
            get_memory_information,
        )
        from recommendation_engine import (
            generate_recommendation,
        )


def handle_intent(
    intent,
    patient,
    **data,
):

    # ---------------------------------
    # Medicine
    # ---------------------------------

    if intent == "MEDICINE_QUERY":

        medicine = get_next_medicine(patient)

        if medicine is None:
            return {
                "action": "GET_NEXT_MEDICINE",
                "response": "You have no medicine scheduled.",
            }

        return {
            "action": "GET_NEXT_MEDICINE",
            "medicine": medicine,
            "response": (
                f"Your next medicine is "
                f"{medicine['name']}, "
                f"{medicine['dose']}, "
                f"at {medicine['time']}."
            ),
        }


    # ---------------------------------
    # Today's schedule
    # ---------------------------------

    if intent == "TODAY_SCHEDULE":

        schedule = get_today_schedule(patient)

        medicines = schedule["medicines"]
        appointments = schedule["appointments"]

        medicine_text = (
            f"You have {len(medicines)} medicine reminder(s)."
            if medicines
            else "You have no medicine reminders."
        )

        appointment_text = (
            f"You have {len(appointments)} appointment(s)."
            if appointments
            else "You have no appointments."
        )

        return {
            "action": "GET_TODAY_SCHEDULE",
            "schedule": schedule,
            "response": (
                f"{medicine_text} "
                f"{appointment_text}"
            ),
        }


    # ---------------------------------
    # Start activity
    # ---------------------------------

    if intent == "START_ACTIVITY":

        recommendation = generate_recommendation(
            patient_id=patient.patient_id,
            preferred_activity=patient.preferences.get(
                "favorite_activity"
            ),
        )

        return {
            "action": "START_ACTIVITY",
            "domain": recommendation["domain"],
            "activity": recommendation["activity"],
            "difficulty": recommendation["final_difficulty"],
            "response": (
                f"Your recommended activity is "
                f"{recommendation['activity']} "
                f"at difficulty "
                f"{recommendation['final_difficulty']}."
            ),
    }


    # ---------------------------------
    # Reminder
    # ---------------------------------

    if intent == "REMINDER_CREATE":

        reminder_time = data.get("time")

        return {
            "action": "CREATE_REMINDER",
            "time": reminder_time,
            "response": (
                f"I will create the reminder"
                + (
                    f" for {reminder_time}."
                    if reminder_time
                    else "."
                )
            ),
        }


    # ---------------------------------
    # Caregiver
    # ---------------------------------

    if intent == "CAREGIVER_CALL":

        caregiver = get_caregiver(patient)

        if caregiver is None:
            return {
                "action": "CALL_CAREGIVER",
                "response": (
                    "No caregiver is configured yet."
                ),
            }

        return {
            "action": "CALL_CAREGIVER",
            "caregiver": caregiver,
            "response": (
                f"I will contact "
                f"{caregiver['name']}."
            ),
        }


    # ---------------------------------
    # Memory assistance
    # ---------------------------------

    if intent == "MEMORY_QUERY":

        memory = get_memory_information(patient)

        if not memory:
            return {
                "action": "GET_MEMORY_INFORMATION",
                "response": (
                    "I don't have any saved information "
                    "for this memory query."
                ),
            }

        return {
            "action": "GET_MEMORY_INFORMATION",
            "memory": memory,
            "response": (
                f"I found saved information: "
                f"{memory}"
            ),
        }


    # ---------------------------------
    # Help
    # ---------------------------------

    if intent == "HELP":

        return {
            "action": "SHOW_HELP",
            "response": (
                "You can ask me about your medicine, "
                "today's schedule, activities, reminders, "
                "or your caregiver."
            ),
        }


    # ---------------------------------
    # Greeting
    # ---------------------------------

    if intent == "GREETING":

        return {
            "action": "GREETING",
            "response": (
                "Good morning. "
                "How can I help you today?"
            ),
        }


    # ---------------------------------
    # Unknown
    # ---------------------------------

    return {
        "action": "UNKNOWN",
        "response": (
            "I'm sorry, I didn't understand that. "
            "Please try again."
        ),
    }


# ---------------------------------
# Test
# ---------------------------------

if __name__ == "__main__":

    from .patient import Patient


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
        time="08:00",
    )

    patient.add_medicine(
        name="Medicine B",
        dose="1 tablet",
        time="20:00",
    )


    patient.add_appointment(
        title="Doctor Visit",
        date="2026-09-05",
        time="11:00",
    )


    patient.preferences = {
        "favorite_activity": "story",
        "preferred_time": "morning",
        "memory_information": {
            "daughter": "Aarti",
        },
    }


    tests = [
        ("MEDICINE_QUERY", {}),
        ("TODAY_SCHEDULE", {}),
        ("START_ACTIVITY", {}),
        ("REMINDER_CREATE", {"time": "20:00"}),
        ("CAREGIVER_CALL", {}),
        ("MEMORY_QUERY", {}),
        ("HELP", {}),
        ("GREETING", {}),
    ]


    print(
        "\n========== AXIOM ASSISTANT ==========\n"
    )


    for intent, data in tests:

        result = handle_intent(
            intent,
            patient,
            **data,
        )

        print(
            f"Intent   : {intent}"
        )

        print(
            f"Action   : {result['action']}"
        )

        print(
            f"Response : {result['response']}"
        )

        print()