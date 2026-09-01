"""
Axiom Voice Assistant - Intent Prototype

Input:
    Natural-language text

Output:
    Detected intent + extracted information

This is only an intent-understanding prototype.
Critical actions should still be validated/executed by the backend.
"""

import re


# ---------------------------------
# Intent definitions
# ---------------------------------

INTENTS = {
    "MEDICINE_QUERY": [
        "when is my medicine",
        "when do i take my medicine",
        "what time is my medicine",
        "when should i take my tablet",
        "is it time for my medicine",
    ],

    "TODAY_SCHEDULE": [
        "what do i have today",
        "what is my schedule today",
        "what do i need to do today",
        "what is planned for today",
    ],

    "START_ACTIVITY": [
        "start my activity",
        "start today's activity",
        "start my game",
        "open my activity",
        "i want to play",
    ],

    "REMINDER_CREATE": [
        "remind me",
        "set a reminder",
        "remember to remind me",
    ],

    "CAREGIVER_CALL": [
        "call my daughter",
        "call my son",
        "call my caregiver",
        "call my family",
    ],

    "MEMORY_QUERY": [
        "who is this",
        "who is she",
        "who is he",
        "what is this",
        "do i know this person",
    ],

    "HELP": [
        "i need help",
        "help me",
        "i need assistance",
        "please help",
    ],

    "GREETING": [
        "hello",
        "hi",
        "good morning",
        "good afternoon",
        "good evening",
    ],
}


# ---------------------------------
# Normalize input
# ---------------------------------

def normalize_text(text: str) -> str:
    """
    Convert user input into a simpler format.
    """

    text = text.lower().strip()

    # Remove punctuation
    text = re.sub(r"[^\w\s]", "", text)

    # Remove extra spaces
    text = re.sub(r"\s+", " ", text)

    return text


# ---------------------------------
# Detect intent
# ---------------------------------

def detect_intent(text: str) -> str:

    text = normalize_text(text)

    # Exact/phrase matching for prototype
    for intent, examples in INTENTS.items():

        for example in examples:

            example = normalize_text(example)

            if example in text:
                return intent

    return "UNKNOWN"


# ---------------------------------
# Extract reminder information
# ---------------------------------

def extract_reminder(text: str):

    text = normalize_text(text)

    time_match = re.search(
        r"\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b",
        text
    )

    reminder_time = None

    if time_match:

        hour = int(time_match.group(1))
        minute = (
            int(time_match.group(2))
            if time_match.group(2)
            else 0
        )

        period = time_match.group(3)

        if period == "pm" and hour < 12:
            hour += 12

        elif period == "am" and hour == 12:
            hour = 0

        reminder_time = (
            f"{hour:02d}:{minute:02d}"
        )

    return reminder_time


# ---------------------------------
# Process user message
# ---------------------------------

def process_message(text: str):

    intent = detect_intent(text)

    result = {
        "text": text,
        "intent": intent,
    }

    if intent == "REMINDER_CREATE":

        result["time"] = extract_reminder(text)

    return result


# ---------------------------------
# Test
# ---------------------------------

if __name__ == "__main__":

    test_messages = [
        "Could you tell me when I need to take my tablets?"
    ]

    print("\n========== AXIOM ASSISTANT ==========\n")

    for message in test_messages:

        result = process_message(message)

        print(f"User: {message}")
        print(f"Intent: {result['intent']}")

        if "time" in result:
            print(f"Time: {result['time']}")

        print()