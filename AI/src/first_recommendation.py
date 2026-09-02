from pathlib import Path
import pandas as pd

from initial_assessment import (
    AssessmentResult,
    build_baseline,
)


ACTIVITIES = {
    "memory": "card_match",
    "attention": "target_tap",
    "processing_speed": "quick_tap",
    "executive_function": "sequence_builder",
    "recognition": "object_recognition",
}


def choose_initial_difficulty(score):
    """
    Choose a safe starting difficulty from the
    initial baseline.

    This is an application rule, NOT a clinical rule.
    """

    if score >= 80:
        return 3

    if score >= 60:
        return 2

    return 1


def generate_first_recommendation(baseline):
    """
    Find the weakest domain and recommend the
    first activity and starting difficulty.
    """

    weakest_domain = min(
        baseline,
        key=lambda domain: baseline[domain]["score"]
    )

    score = baseline[weakest_domain]["score"]

    difficulty = choose_initial_difficulty(score)

    return {
        "focus_domain": weakest_domain,
        "activity": ACTIVITIES[weakest_domain],
        "difficulty": difficulty,
        "score": score,
        "level": baseline[weakest_domain]["level"],
    }


if __name__ == "__main__":

    # Example new patient assessment results
    results = [
        AssessmentResult(
            task_id="MEM_01",
            domain="memory",
            accuracy=0.55,
            response_time=13,
            attempts=2,
            hints_used=1,
        ),

        AssessmentResult(
            task_id="MEM_02",
            domain="memory",
            accuracy=0.60,
            response_time=11,
            attempts=1,
            hints_used=1,
        ),

        AssessmentResult(
            task_id="ATT_01",
            domain="attention",
            accuracy=0.80,
            response_time=7,
            attempts=1,
            hints_used=0,
        ),

        AssessmentResult(
            task_id="ATT_02",
            domain="attention",
            accuracy=0.75,
            response_time=8,
            attempts=1,
            hints_used=0,
        ),

        AssessmentResult(
            task_id="SPD_01",
            domain="processing_speed",
            accuracy=0.70,
            response_time=6,
            attempts=1,
            hints_used=0,
        ),

        AssessmentResult(
            task_id="EXE_01",
            domain="executive_function",
            accuracy=0.72,
            response_time=10,
            attempts=1,
            hints_used=0,
        ),

        AssessmentResult(
            task_id="REC_01",
            domain="recognition",
            accuracy=0.85,
            response_time=6,
            attempts=1,
            hints_used=0,
        ),
    ]

    baseline = build_baseline(results)

    recommendation = generate_first_recommendation(
        baseline
    )

    print("\n========== AXIOM NEW PATIENT ==========\n")

    print("Cognitive Baseline:")

    for domain, data in baseline.items():
        print(
            f"{domain:20} "
            f"{data['score']:6.2f} "
            f"({data['level']})"
        )

    print("\nFirst Recommendation:")

    print(
        f"Focus Domain : "
        f"{recommendation['focus_domain']}"
    )

    print(
        f"Activity     : "
        f"{recommendation['activity']}"
    )

    print(
        f"Difficulty   : "
        f"{recommendation['difficulty']}"
    )