"""
Axiom Patient Model

Keeps the patient's basic information, cognitive baseline,
and activity history together.

Prototype only.
"""

from dataclasses import dataclass, field
from typing import Dict, List, Optional


@dataclass
class Patient:
    # -----------------------------
    # Basic information
    # -----------------------------
    patient_id: str
    name: str
    age: int
    language: str
    caregiver_name: str = ""

    # -----------------------------
    # Medical / routine information
    # -----------------------------
    medicines: List[Dict] = field(default_factory=list)
    appointments: List[Dict] = field(default_factory=list)

    # -----------------------------
    # Personal preferences
    # -----------------------------
    preferences: Dict = field(default_factory=dict)

    # -----------------------------
    # Cognitive information
    # -----------------------------
    baseline: Dict = field(default_factory=dict)

    # Activity/session history
    sessions: List[Dict] = field(default_factory=list)

    # Current AI-generated state
    current_state: Dict = field(default_factory=dict)

    # ---------------------------------
    # Add medicine
    # ---------------------------------

    def add_medicine(
        self,
        name: str,
        dose: str,
        time: str,
    ) -> None:

        self.medicines.append(
            {
                "name": name,
                "dose": dose,
                "time": time,
            }
        )

    # ---------------------------------
    # Add appointment
    # ---------------------------------

    def add_appointment(
        self,
        title: str,
        date: str,
        time: str,
    ) -> None:

        self.appointments.append(
            {
                "title": title,
                "date": date,
                "time": time,
            }
        )

    # ---------------------------------
    # Add assessment baseline
    # ---------------------------------

    def set_baseline(
        self,
        baseline: Dict,
    ) -> None:

        self.baseline = baseline

    # ---------------------------------
    # Add completed session
    # ---------------------------------

    def add_session(
        self,
        session: Dict,
    ) -> None:

        self.sessions.append(session)

    # ---------------------------------
    # Update current AI state
    # ---------------------------------

    def update_state(
        self,
        state: Dict,
    ) -> None:

        self.current_state = state

    # ---------------------------------
    # Simple summary
    # ---------------------------------

    def summary(self) -> Dict:

        return {
            "patient_id": self.patient_id,
            "name": self.name,
            "age": self.age,
            "language": self.language,
            "caregiver": self.caregiver_name,
            "medicines": len(self.medicines),
            "appointments": len(self.appointments),
            "sessions": len(self.sessions),
            "baseline_domains": list(
                self.baseline.keys()
            ),
        }


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

    patient.add_appointment(
        title="Doctor Visit",
        date="2026-09-05",
        time="11:00"
    )

    patient.preferences = {
        "favorite_activity": "story",
        "preferred_time": "morning",
    }

    patient.set_baseline(
        {
            "memory": {
                "score": 65,
                "level": "Moderate",
            },
            "attention": {
                "score": 82,
                "level": "Strong",
            },
        }
    )

    patient.add_session(
        {
            "domain": "memory",
            "activity": "card_match",
            "accuracy": 0.72,
            "difficulty": 2,
        }
    )

    patient.update_state(
        {
            "focus_domain": "memory",
            "recommended_difficulty": 2,
        }
    )

    print("\n========== AXIOM PATIENT ==========")
    print(patient.summary())