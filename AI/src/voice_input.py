"""
Axiom Voice Input

Microphone -> Speech-to-Text

Prototype only.
"""

import speech_recognition as sr


def listen():
    """
    Listen through the microphone and convert speech to text.
    """

    recognizer = sr.Recognizer()

    with sr.Microphone() as source:

        print("\n🎤 Listening...")
        print("Speak now.")

        # Adjust to background noise
        recognizer.adjust_for_ambient_noise(
            source,
            duration=1
        )

        audio = recognizer.listen(
            source,
            timeout=5,
            phrase_time_limit=10
        )

    print("🔄 Converting speech to text...")

    try:
        text = recognizer.recognize_google(
            audio
        )

        return text

    except sr.UnknownValueError:
        return None

    except sr.RequestError:
        print(
            "Speech recognition service is unavailable."
        )
        return None

    except Exception as error:
        print(
            f"Unexpected error: {error}"
        )
        return None


if __name__ == "__main__":

    text = listen()

    if text:
        print(f"\nYou said: {text}")

    else:
        print(
            "\nI couldn't understand you."
        )