from pathlib import Path
import pandas as pd


DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "patient_sessions.csv"


def recommend_next_difficulty(row):
    """
    Create a simple training target for the prototype.

    This is NOT a clinical recommendation.
    It is only a synthetic label for learning the ML pipeline.
    """

    performance = row["accuracy"]

    # Strong performance → increase difficulty
    if performance >= 0.80:
        recommended = row["difficulty"] + 1

    # Weak performance → decrease difficulty
    elif performance < 0.50:
        recommended = row["difficulty"] - 1

    # Otherwise → keep current difficulty
    else:
        recommended = row["difficulty"]

    # Keep difficulty between 1 and 5
    return max(1, min(5, recommended))


def main():
    df = pd.read_csv(DATA_FILE)

    df["recommended_difficulty"] = df.apply(
        recommend_next_difficulty,
        axis=1
    )

    df.to_csv(DATA_FILE, index=False)

    print("Target column created successfully.")
    print("\nTarget distribution:")
    print(df["recommended_difficulty"].value_counts().sort_index())

    print("\nSample:")
    print(
        df[
            [
                "accuracy",
                "difficulty",
                "recommended_difficulty"
            ]
        ].head(10)
    )


if __name__ == "__main__":
    main()