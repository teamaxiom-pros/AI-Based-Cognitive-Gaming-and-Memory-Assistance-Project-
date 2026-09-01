"""
Axiom Initial Cognitive Assessment

Converts raw assessment task results into an
Axiom Cognitive Baseline.

IMPORTANT:
This is for personalization in our prototype.
It is NOT a clinical diagnostic score.
"""

from dataclasses import dataclass
from typing import List, Dict


# ---------------------------------
# Result structure
# ---------------------------------

@dataclass
class AssessmentResult:
    task_id: str
    domain: str
    accuracy: float
    response_time: float
    attempts: int
    hints_used: int


# ---------------------------------
# Calculate performance score
# ---------------------------------

def calculate_domain_score(results):
    """
    Calculate one Axiom performance score from multiple
    assessment tasks in the same cognitive domain.

    This is NOT a clinical diagnostic score.
    """

    if not results:
        return 0.0

    avg_accuracy = sum(
        r.accuracy for r in results
    ) / len(results)

    avg_response_time = sum(
        r.response_time for r in results
    ) / len(results)

    avg_hints = sum(
        r.hints_used for r in results
    ) / len(results)

    avg_attempts = sum(
        r.attempts for r in results
    ) / len(results)

    accuracy_score = avg_accuracy * 50

    speed_score = (
        max(
            0,
            min(1, 15 / max(avg_response_time, 1))
        ) * 20
    )

    assistance_score = max(
        0,
        1 - avg_hints * 0.15
    ) * 15

    attempt_score = max(
        0,
        1 - (avg_attempts - 1) * 0.10
    ) * 15

    score = (
        accuracy_score
        + speed_score
        + assistance_score
        + attempt_score
    )

    return round(min(score, 100), 2)


# ---------------------------------
# Interpret score
# ---------------------------------

def get_level(score: float) -> str:

    if score >= 80:
        return "Strong"

    if score >= 60:
        return "Moderate"

    if score >= 40:
        return "Needs Support"

    return "Significant Difficulty"


# ---------------------------------
# Build baseline
# ---------------------------------

def build_baseline(task_results):
    domains = {}

    for result in task_results:

        if result.domain not in domains:
            domains[result.domain] = []

        domains[result.domain].append(result)

    baseline = {}

    for domain, results in domains.items():

        score = calculate_domain_score(results)

        baseline[domain] = {
            "score": score,
            "level": get_level(score),
            "tasks_completed": len(results),
        }

    return baseline


# ---------------------------------
# Example assessment
# ---------------------------------

if __name__ == "__main__":

    results = [
        AssessmentResult(
            task_id="MEM_01",
            domain="memory",
            accuracy=0.60,
            response_time=12,
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
            task_id="SPD_01",
            domain="processing_speed",
            accuracy=0.65,
            response_time=5,
            attempts=1,
            hints_used=0,
        ),

        AssessmentResult(
            task_id="EXE_01",
            domain="executive_function",
            accuracy=0.70,
            response_time=10,
            attempts=1,
            hints_used=1,
        ),

        AssessmentResult(
            task_id="REC_01",
            domain="recognition",
            accuracy=0.90,
            response_time=6,
            attempts=1,
            hints_used=0,
        ),

        AssessmentResult(
            task_id="MEM_02",
            domain="memory",
            accuracy=0.70,
            response_time=10,
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
    ]

    baseline = build_baseline(results)

    print(
        "\n========== AXIOM COGNITIVE BASELINE ==========\n"
    )

    for domain, data in baseline.items():

        print(
            f"{domain:20} "
            f"{data['score']:6.2f} "
            f"({data['level']})"
        )