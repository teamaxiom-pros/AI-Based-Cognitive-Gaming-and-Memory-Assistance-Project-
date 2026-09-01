"""
Axiom Assistant Actions

Converts detected intents into simple application actions.
Critical actions should ultimately be handled by Tejas's backend.
"""

from personalization_engine import generate_personalised_activity


def handle_intent(intent, patient_id="P001", **data):

    if intent == "MEDICINE_QUERY":
        return {
            "action": "GET_NEXT_MEDICINE",
            "response": "Your next medicine is scheduled according to your medication plan."
        }

    if intent == "TODAY_SCHEDULE":
        return {
            "action": "GET_TODAY_SCHEDULE",
            "response": "I will show your medicines, activities and appointments for today."
        }

    if intent == "START_ACTIVITY":

        recommendation = generate_personalised_activity(
            patient_id
        )

        return {
            "action": "START_ACTIVITY",
            "domain": recommendation["domain"],
            "activity": recommendation["activity"],
            "response": (
                f"Your recommended activity is "
                f"{recommendation['activity']}."
            ),
        }

    if intent == "REMINDER_CREATE":
        return {
            "action": "CREATE_REMINDER",
            "time": data.get("time"),
            "response": (
                f"I will create the reminder"
                + (
                    f" for {data['time']}."
                    if data.get("time")
                    else "."
                )
            ),
        }

    if intent == "CAREGIVER_CALL":
        return {
            "action": "CALL_CAREGIVER",
            "response": "I will contact your configured caregiver."
        }

    if intent == "MEMORY_QUERY":
        return {
            "action": "GET_MEMORY_INFORMATION",
            "response": "I will check the information saved in your memory assistant."
        }

    if intent == "HELP":
        return {
            "action": "SHOW_HELP",
            "response": "I'm here to help. You can ask about your medicines, schedule, activities, or contact your caregiver."
        }

    if intent == "GREETING":
        return {
            "action": "GREETING",
            "response": "Good morning. How can I help you today?"
        }

    return {
        "action": "UNKNOWN",
        "response": "I'm sorry, I didn't understand that. Please try again."
    }


# ---------------------------------
# Test
# ---------------------------------

if __name__ == "__main__":

    tests = [
        ("MEDICINE_QUERY", {}),
        ("TODAY_SCHEDULE", {}),
        ("START_ACTIVITY", {}),
        ("REMINDER_CREATE", {"time": "20:00"}),
        ("CAREGIVER_CALL", {}),
        ("MEMORY_QUERY", {}),
        ("HELP", {}),
        ("GREETING", {}),
        ("UNKNOWN", {}),
    ]

    print("\n========== AXIOM ASSISTANT ACTIONS ==========\n")

    for intent, data in tests:

        result = handle_intent(
            intent,
            patient_id="P001",
            **data
        )

        print(f"Intent : {intent}")
        print(f"Action : {result['action']}")
        print(f"Response: {result['response']}")
        print()