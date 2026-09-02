"""
Axiom Performance Analysis Engine

Converts raw performance metrics into
human-readable internal performance states.

This is NOT a clinical diagnostic system.
"""


def analyze_performance(
    recent_accuracy: float,
    trend: float,
    difficulty: int,
) -> dict:
    """
    Analyze recent performance and return
    an internal performance summary.

    Parameters:
        recent_accuracy:
            Average accuracy from recent sessions.
            Expected range: 0.0 - 1.0

        trend:
            Difference between recent performance
            and previous performance.

        difficulty:
            Current recommended difficulty level.
            Range: 1 - 5
    """

    # ---------------------------------
    # Convert values for display
    # ---------------------------------

    accuracy_percent = round(
        recent_accuracy * 100,
        1,
    )

    trend_percent = round(
        trend * 100,
        1,
    )

    # ---------------------------------
    # Determine performance status
    # ---------------------------------

    if recent_accuracy < 0.40:

        status = "significant_difficulty"

        message = (
            "The patient is currently struggling "
            "with this cognitive area."
        )

    elif recent_accuracy < 0.60:

        status = "needs_support"

        message = (
            "The patient may benefit from "
            "additional support."
        )

    elif recent_accuracy < 0.80:

        status = "moderate"

        message = (
            "The patient is performing at "
            "a moderate level."
        )

    else:

        status = "strong"

        message = (
            "The patient is performing well "
            "in this area."
        )

    # ---------------------------------
    # Determine trend
    # ---------------------------------

    if trend > 0.15:

        trend_label = "improving"

    elif trend < -0.15:

        trend_label = "declining"

    else:

        trend_label = "stable"

    # ---------------------------------
    # Final result
    # ---------------------------------

    return {
        "accuracy_percent": accuracy_percent,
        "trend_percent": trend_percent,
        "status": status,
        "trend_label": trend_label,
        "current_difficulty": int(difficulty),
        "message": message,
    }