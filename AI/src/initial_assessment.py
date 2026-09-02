"""
Axiom Initial Cognitive Assessment

Converts raw task results into:
    Task score → Domain score → Cognitive baseline

IMPORTANT:
This is an internal prototype score for personalization.
It is NOT a medical/clinical diagnostic score.
"""

from dataclasses import dataclass
from typing import List, Dict


# ============================================
# 1. Store the result of ONE assessment task
# ============================================

@dataclass
class AssessmentResult:
    task_id: str
    domain: str
    accuracy: float
    response_time: float
    attempts: int
    hints_used: int


# ============================================
# 2. Convert ONE task result into 0–100 score
# ============================================

def calculate_task_score(
    result: AssessmentResult,
) -> float:

    # -----------------------------
    # Accuracy → 50%
    # -----------------------------

    accuracy_score = result.accuracy * 50


    # -----------------------------
    # Speed → 30%
    # -----------------------------

    # 15 seconds is our prototype reference.
    speed_score = (
        max(
            0,
            min(
                1,
                15 / max(result.response_time, 1)
            )
        )
        * 30
    )


    # -----------------------------
    # Assistance / hints → 10%
    # -----------------------------

    assistance_score = max(
        0,
        1 - result.hints_used * 0.15
    ) * 10


    # -----------------------------
    # Attempts → 10%
    # -----------------------------

    attempt_score = max(
        0,
        1 - (result.attempts - 1) * 0.10
    ) * 10


    # -----------------------------
    # Final task score
    # -----------------------------

    score = (
        accuracy_score
        + speed_score
        + assistance_score
        + attempt_score
    )

    return round(
        min(score, 100),
        2
    )


# ============================================
# 3. Convert score → simple internal level
# ============================================

def get_level(score: float) -> str:

    if score >= 80:
        return "Strong"

    if score >= 60:
        return "Moderate"

    if score >= 40:
        return "Needs Support"

    return "Significant Difficulty"


# ============================================
# 4. Build domain baseline
# ============================================

def build_baseline(
    task_results: List[AssessmentResult],
) -> Dict:

    # Normalize dict inputs to AssessmentResult if passed as dictionaries
    normalized_results = []
    for r in task_results:
        if isinstance(r, dict):
            normalized_results.append(
                AssessmentResult(
                    task_id=r.get("task_id", ""),
                    domain=r.get("domain", ""),
                    accuracy=float(r.get("accuracy", 0.0)),
                    response_time=float(r.get("response_time", 0.0)),
                    attempts=int(r.get("attempts", 1)),
                    hints_used=int(r.get("hints_used", r.get("hints", 0))),
                )
            )
        else:
            normalized_results.append(r)

    # Group task results by domain
    domains = {}

    for result in normalized_results:

        if result.domain not in domains:
            domains[result.domain] = []

        domains[result.domain].append(result)


    baseline = {}


    # Calculate each domain
    for domain, results in domains.items():

        task_scores = [
            calculate_task_score(result)
            for result in results
        ]

        domain_score = sum(task_scores) / len(
            task_scores
        )

        baseline[domain] = {
            "score": round(domain_score, 2),
            "level": get_level(domain_score),
            "tasks_completed": len(results),
            "task_scores": [
                round(score, 2)
                for score in task_scores
            ],
        }

    return baseline


# ============================================
# 5. Test with a complete 10-task assessment
# ============================================

if __name__ == "__main__":

    results = [

        # -------- MEMORY --------

        AssessmentResult(
            "MEM_01",
            "memory",
            0.60,
            12,
            1,
            1,
        ),

        AssessmentResult(
            "MEM_02",
            "memory",
            0.70,
            10,
            1,
            0,
        ),


        # -------- ATTENTION --------

        AssessmentResult(
            "ATT_01",
            "attention",
            0.80,
            7,
            1,
            0,
        ),

        AssessmentResult(
            "ATT_02",
            "attention",
            0.75,
            8,
            1,
            0,
        ),


        # -------- PROCESSING SPEED --------

        AssessmentResult(
            "SPD_01",
            "processing_speed",
            0.65,
            5,
            1,
            0,
        ),

        AssessmentResult(
            "SPD_02",
            "processing_speed",
            0.70,
            1.2,
            1,
            0,
        ),


        # -------- EXECUTIVE FUNCTION --------

        AssessmentResult(
            "EXE_01",
            "executive_function",
            0.70,
            10,
            1,
            1,
        ),

        AssessmentResult(
            "EXE_02",
            "executive_function",
            0.75,
            9,
            1,
            0,
        ),


        # -------- RECOGNITION --------

        AssessmentResult(
            "REC_01",
            "recognition",
            0.90,
            6,
            1,
            0,
        ),

        AssessmentResult(
            "REC_02",
            "recognition",
            0.85,
            7,
            1,
            0,
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
            f"({data['level']}) "
            f"Tasks: {data['tasks_completed']}"
        )

        print(
            f"  Task scores: "
            f"{data['task_scores']}"
        )