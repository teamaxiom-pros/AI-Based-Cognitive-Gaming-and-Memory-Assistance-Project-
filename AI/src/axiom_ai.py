"""
Axiom AI

Main AI interface for:
1. Initial cognitive assessment
2. Personalised recommendation
3. Performance analysis
"""

from .initial_assessment import build_baseline
from .recommendation_engine import generate_recommendation


# ---------------------------------
# Initial Assessment
# ---------------------------------

def create_baseline_from_request(assessment_results):
    """
    Create a cognitive baseline for a new patient.
    """

    baseline = build_baseline(
        assessment_results
    )

    # Find weakest domain
    focus_domain = min(
        baseline,
        key=lambda domain: baseline[domain]["score"]
    )

    return {
        "success": True,
        "action": "initial_assessment",
        "baseline": baseline,
        "focus_domain": focus_domain,
    }


# ---------------------------------
# Recommendation
# ---------------------------------

def get_recommendation(
    patient_id,
    preferred_activity=None,
):
    """
    Generate a personalised recommendation
    for an existing patient.
    """

    result = generate_recommendation(
        patient_id=patient_id,
        preferred_activity=preferred_activity,
    )

    return {
        "success": True,
        "patient_id": patient_id,
        "action": "recommend",

        "focus_domain": result[
            "domain"
        ],

        "recommended_activity": result[
            "activity"
        ],

        "recommended_difficulty": result[
            "final_difficulty"
        ],

        "performance": result[
            "performance"
        ],
    }


# ---------------------------------
# Patient Processing
# ---------------------------------

def process_patient(
    patient_id,
    preferred_activity=None,
):
    """
    Process an existing patient.
    """

    return get_recommendation(
        patient_id=patient_id,
        preferred_activity=preferred_activity,
    )


# ---------------------------------
# Main Request Handler
# ---------------------------------

def process_request(request):
    """
    Main entry point for the Axiom AI API.

    Supported actions:
        initial_assessment
        recommend
    """

    action = request.get(
        "action"
    )

    # ---------------------------------
    # Initial Assessment
    # ---------------------------------

    if action == "initial_assessment":

        assessment_results = request.get(
            "assessment_results",
            []
        )

        if not assessment_results:

            return {
                "success": False,
                "error": (
                    "assessment_results "
                    "are required"
                ),
            }

        return create_baseline_from_request(
            assessment_results
        )

    # ---------------------------------
    # Recommendation
    # ---------------------------------

    elif action == "recommend":

        patient_id = request.get(
            "patient_id"
        )

        if not patient_id:

            return {
                "success": False,
                "error": (
                    "patient_id is required"
                ),
            }

        preferred_activity = request.get(
            "preferred_activity"
        )

        try:

            return get_recommendation(
                patient_id=patient_id,
                preferred_activity=preferred_activity,
            )

        except Exception as error:

            return {
                "success": False,
                "error": str(error),
            }

    # ---------------------------------
    # Unknown action
    # ---------------------------------

    else:

        return {
            "success": False,
            "error": (
                f"Unknown action: {action}"
            ),
        }


# ---------------------------------
# Local Test
# ---------------------------------

if __name__ == "__main__":

    print(
        "\n========== NEW PATIENT =========="
    )

    assessment_results = [
        {
            "task_id": "MEM_01",
            "domain": "memory",
            "accuracy": 0.80,
            "response_time": 8.0,
            "attempts": 1,
            "hints": 0,
        },
        {
            "task_id": "MEM_02",
            "domain": "memory",
            "accuracy": 0.70,
            "response_time": 10.0,
            "attempts": 1,
            "hints": 1,
        },
        {
            "task_id": "ATT_01",
            "domain": "attention",
            "accuracy": 0.90,
            "response_time": 6.0,
            "attempts": 1,
            "hints": 0,
        },
    ]

    new_patient_request = {
        "action": "initial_assessment",
        "assessment_results": assessment_results,
    }

    print(
        process_request(
            new_patient_request
        )
    )

    print(
        "\n========== EXISTING PATIENT =========="
    )

    existing_patient_request = {
        "patient_id": "P001",
        "action": "recommend",
        "preferred_activity": "story_recall",
    }

    print(
        process_request(
            existing_patient_request
        )
    )