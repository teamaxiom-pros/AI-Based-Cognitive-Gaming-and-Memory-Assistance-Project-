"""
Team Axiom - AI API Interface

JSON/dictionary request
        ↓
Axiom AI
        ↓
JSON/dictionary response
"""

from typing import Dict, List, Optional

from .initial_assessment import (
    AssessmentResult,
    build_baseline,
)

from .recommendation_engine import (
    generate_recommendation,
)


# ---------------------------------
# New patient: create baseline
# ---------------------------------

def create_baseline_from_request(
    assessment_results: List[Dict],
) -> Dict:
    """
    Convert JSON-style assessment results into
    AssessmentResult objects and create a baseline.
    """

    results = []

    for item in assessment_results:
        results.append(
            AssessmentResult(
                task_id=item["task_id"],
                domain=item["domain"],
                accuracy=float(item["accuracy"]),
                response_time=float(
                    item["response_time"]
                ),
                attempts=int(item.get("attempts", 1)),
                hints_used=int(
                    item.get("hints_used", 0)
                ),
            )
        )

    return build_baseline(results)


# ---------------------------------
# Main public interface
# ---------------------------------

def process_request(request: Dict) -> Dict:
    """
    Main entry point for Team Axiom's backend.

    Supported actions:
        - initial_assessment
        - recommend
    """

    patient_id = request.get("patient_id")

    if not patient_id:
        return {
            "success": False,
            "error": "patient_id is required",
        }

    action = request.get("action")

    # ---------------------------------
    # New patient assessment
    # ---------------------------------

    if action == "initial_assessment":

        assessment_results = request.get(
            "assessment_results"
        )

        if not assessment_results:
            return {
                "success": False,
                "error": (
                    "assessment_results are required"
                ),
            }

        baseline = create_baseline_from_request(
            assessment_results
        )

        weakest_domain = min(
            baseline,
            key=lambda domain:
            baseline[domain]["score"]
        )

        return {
            "success": True,
            "patient_id": patient_id,
            "action": "initial_assessment",
            "baseline": baseline,
            "focus_domain": weakest_domain,
        }

    # ---------------------------------
    # Existing patient recommendation
    # ---------------------------------

    if action == "recommend":

        recommendation = generate_recommendation(
            patient_id=patient_id,
            preferred_activity=request.get(
                "preferred_activity"
            ),
        )

        return {
            "success": True,
            "patient_id": patient_id,
            "action": "recommend",
            "focus_domain": recommendation[
                "domain"
            ],
            "recommended_activity": (
                recommendation["activity"]
            ),
            "recommended_difficulty": (
                recommendation[
                    "final_difficulty"
                ]
            ),
            "performance": {
                "recent_accuracy": (
                    recommendation[
                        "recent_accuracy"
                    ]
                ),
                "trend": (
                    recommendation["trend"]
                ),
            },
        }

    # ---------------------------------
    # Unknown action
    # ---------------------------------

    return {
        "success": False,
        "error": f"Unknown action: {action}",
    }


# ---------------------------------
# Test
# ---------------------------------

if __name__ == "__main__":

    new_patient_request = {
        "patient_id": "DEMO_NEW",
        "action": "initial_assessment",
        "assessment_results": [
            {
                "task_id": "MEM_01",
                "domain": "memory",
                "accuracy": 0.60,
                "response_time": 12,
                "attempts": 1,
                "hints_used": 1,
            },
            {
                "task_id": "MEM_02",
                "domain": "memory",
                "accuracy": 0.70,
                "response_time": 10,
                "attempts": 1,
                "hints_used": 0,
            },
            {
                "task_id": "ATT_01",
                "domain": "attention",
                "accuracy": 0.80,
                "response_time": 7,
                "attempts": 1,
                "hints_used": 0,
            },
            {
                "task_id": "ATT_02",
                "domain": "attention",
                "accuracy": 0.75,
                "response_time": 8,
                "attempts": 1,
                "hints_used": 0,
            },
        ],
    }

    existing_patient_request = {
        "patient_id": "P001",
        "action": "recommend",
        "preferred_activity": "story_recall",
    }

    print("\n========== NEW PATIENT ==========\n")

    print(
        process_request(
            new_patient_request
        )
    )

    print("\n========== EXISTING PATIENT ==========\n")

    print(
        process_request(
            existing_patient_request
        )
    )