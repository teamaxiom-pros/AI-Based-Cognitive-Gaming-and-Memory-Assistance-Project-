"""
Axiom Initial Cognitive Assessment

This file defines the assessment tasks and processes
the results produced by the patient/frontend.

This is an application baseline, NOT a clinical diagnosis.
"""

from dataclasses import dataclass
from typing import List, Dict


# ---------------------------------
# Assessment task definition
# ---------------------------------

@dataclass
class AssessmentTask:
    task_id: str
    domain: str
    name: str
    description: str


# ---------------------------------
# Axiom assessment tasks
# ---------------------------------

ASSESSMENT_TASKS = [

    # -----------------------------
    # Memory
    # -----------------------------

    AssessmentTask(
        task_id="MEM_01",
        domain="memory",
        name="Immediate Recall",
        description="Remember 3–5 familiar items and repeat them immediately."
    ),

    AssessmentTask(
        task_id="MEM_02",
        domain="memory",
        name="Delayed Recall",
        description="Recall the earlier items after completing other tasks."
    ),

    AssessmentTask(
        task_id="MEM_03",
        domain="memory",
        name="Recognition Memory",
        description="Identify previously shown items among new items."
    ),

    # -----------------------------
    # Attention
    # -----------------------------

    AssessmentTask(
        task_id="ATT_01",
        domain="attention",
        name="Target Tap",
        description="Tap the target symbol while ignoring other symbols."
    ),

    AssessmentTask(
        task_id="ATT_02",
        domain="attention",
        name="Odd One Out",
        description="Identify the different item among similar items."
    ),

    # -----------------------------
    # Processing Speed
    # -----------------------------

    AssessmentTask(
        task_id="SPD_01",
        domain="processing_speed",
        name="Quick Tap",
        description="Respond to visual targets as quickly and accurately as possible."
    ),

    AssessmentTask(
        task_id="SPD_02",
        domain="processing_speed",
        name="Simple Reaction",
        description="Respond as quickly as possible when a target appears."
    ),

    # -----------------------------
    # Executive Function
    # -----------------------------

    AssessmentTask(
        task_id="EXE_01",
        domain="executive_function",
        name="Sequence Builder",
        description="Arrange familiar daily activities in the correct order."
    ),

    AssessmentTask(
        task_id="EXE_02",
        domain="executive_function",
        name="Rule Switch",
        description="Sort items according to a rule that changes during the task."
    ),

    # -----------------------------
    # Recognition
    # -----------------------------

    AssessmentTask(
        task_id="REC_01",
        domain="recognition",
        name="Object Recognition",
        description="Identify familiar everyday objects."
    ),

    AssessmentTask(
        task_id="REC_02",
        domain="recognition",
        name="Familiar Image",
        description="Identify previously shown familiar images among distractors."
    ),
]


# ---------------------------------
# Find task
# ---------------------------------

def get_task(task_id: str) -> AssessmentTask | None:

    for task in ASSESSMENT_TASKS:
        if task.task_id == task_id:
            return task

    return None


# ---------------------------------
# Process one task result
# ---------------------------------

def process_task_result(
    task_id: str,
    accuracy: float,
    response_time: float,
    attempts: int = 1,
    hints_used: int = 0,
) -> Dict:

    task = get_task(task_id)

    if task is None:
        raise ValueError(
            f"Unknown task: {task_id}"
        )

    return {
        "task_id": task.task_id,
        "domain": task.domain,
        "accuracy": max(0.0, min(1.0, accuracy)),
        "response_time": max(0.1, response_time),
        "attempts": max(1, attempts),
        "hints_used": max(0, hints_used),
    }


# ---------------------------------
# Process complete assessment
# ---------------------------------

def process_assessment(
    task_results: List[Dict],
) -> Dict[str, List[Dict]]:

    results_by_domain = {}

    for result in task_results:

        domain = result["domain"]

        if domain not in results_by_domain:
            results_by_domain[domain] = []

        results_by_domain[domain].append(result)

    return results_by_domain


# ---------------------------------
# Example test
# ---------------------------------

if __name__ == "__main__":

    sample_results = [
        process_task_result(
            "MEM_01",
            accuracy=0.60,
            response_time=12,
            attempts=1,
            hints_used=1,
        ),

        process_task_result(
            "ATT_01",
            accuracy=0.80,
            response_time=7,
            attempts=1,
            hints_used=0,
        ),

        process_task_result(
            "SPD_01",
            accuracy=0.65,
            response_time=5,
            attempts=1,
            hints_used=0,
        ),

        process_task_result(
            "EXE_01",
            accuracy=0.70,
            response_time=10,
            attempts=1,
            hints_used=1,
        ),

        process_task_result(
            "REC_01",
            accuracy=0.90,
            response_time=6,
            attempts=1,
            hints_used=0,
        ),
    ]

    grouped_results = process_assessment(
        sample_results
    )

    print("\n========== ASSESSMENT RESULTS ==========")

    for domain, results in grouped_results.items():

        print(f"\n{domain}")

        for result in results:
            print(result)