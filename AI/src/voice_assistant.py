"""
Axiom Voice Assistant

Voice
  ↓
Speech-to-Text
  ↓
Intent Detection
  ↓
Action
  ↓
Patient Data / AI
  ↓
Response
  ↓
Text-to-Speech
"""

from voice_input import listen
from assistant_intent import process_message
from assistant_actions import handle_intent
from voice_output import speak
from patient import Patient


def create_demo_patient():
    """Create a demo patient for testing."""

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

    patient.preferences = {
        "favorite_activity": "story_recall",
        "preferred_time": "morning",
        "memory_information": {
            "daughter": "Aarti",
        },
    }

    return patient


def run_voice_assistant():
    """Run one complete voice interaction."""

    patient = create_demo_patient()

    print("\n========== AXIOM VOICE ASSISTANT ==========\n")

    # ---------------------------------
    # 1. Listen to patient
    # ---------------------------------

    text = listen()

    if not text:
        message = "I couldn't understand you. Please try again."
        print(f"Axiom: {message}")
        speak(message)
        return

    print(f"\nYou said: {text}")

    # ---------------------------------
    # 2. Detect intent
    # ---------------------------------

    result = process_message(text)

    intent = result["intent"]

    print(f"Detected intent: {intent}")

    # ---------------------------------
    # 3. Execute action
    # ---------------------------------

    response = handle_intent(
        intent,
        patient,
        time=result.get("time"),
    )

    # ---------------------------------
    # 4. Respond
    # ---------------------------------

    response_text = response["response"]

    print(f"Axiom: {response_text}")

    speak(response_text)


if __name__ == "__main__":
    run_voice_assistant()