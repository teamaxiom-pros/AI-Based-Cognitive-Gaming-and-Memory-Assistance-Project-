from pathlib import Path
import pandas as pd


BASE_DIR = Path(__file__).resolve().parent.parent
DATA_FILE = BASE_DIR / "data" / "patient_sessions.csv"


def create_history_features(df):
    df = df.sort_values(
        ["patient_id", "domain", "session_number"]
    ).copy()

    group = df.groupby(["patient_id", "domain"])

    # Previous session
    df["prev_accuracy"] = group["accuracy"].shift(1)

    df["prev_response_time"] = group["response_time"].shift(1)

    # Previous 5 sessions
    df["recent_avg_accuracy"] = (
        group["accuracy"]
        .transform(
            lambda x: x.shift(1)
            .rolling(5, min_periods=1)
            .mean()
        )
    )

    df["recent_avg_response_time"] = (
        group["response_time"]
        .transform(
            lambda x: x.shift(1)
            .rolling(5, min_periods=1)
            .mean()
        )
    )

    # -----------------------------------------
    # NEW TREND CALCULATION
    # -----------------------------------------

    # Average of previous 3 sessions
    previous_3 = (
        group["accuracy"]
        .transform(
            lambda x: x.shift(4)
            .rolling(3, min_periods=3)
            .mean()
        )
    )

    # Average of most recent 3 sessions
    recent_3 = (
        group["accuracy"]
        .transform(
            lambda x: x.shift(1)
            .rolling(3, min_periods=3)
            .mean()
        )
    )

    df["accuracy_trend"] = recent_3 - previous_3

    df["accuracy_trend"] = df[
        "accuracy_trend"
    ].fillna(0)

    return df


def create_target(row):
    accuracy = row["recent_avg_accuracy"]
    trend = row["accuracy_trend"]

    if pd.isna(accuracy):
        return int(row["difficulty"])

    # Strong and improving
    if accuracy >= 0.80 and trend >= 0:
        next_difficulty = row["difficulty"] + 1

    # Clearly struggling or declining
    elif accuracy < 0.50 or trend < -0.15:
        next_difficulty = row["difficulty"] - 1

    # Otherwise maintain current difficulty
    else:
        next_difficulty = row["difficulty"]

    return max(1, min(5, int(next_difficulty)))

def main():
    df = pd.read_csv(DATA_FILE)

    df = create_history_features(df)

    # New target based on history
    df["recommended_difficulty"] = df.apply(
        create_target,
        axis=1
    )

    # First session has no history
    df = df[df["recent_avg_accuracy"].notna()].copy()

    df.to_csv(DATA_FILE, index=False)

    print("History features created successfully.")
    print("\nNew columns:")
    print(
        [
            "prev_accuracy",
            "prev_response_time",
            "recent_avg_accuracy",
            "recent_avg_response_time",
            "accuracy_trend",
            "recommended_difficulty",
        ]
    )

    print("\nSample:")
    print(
        df[
            [
                "patient_id",
                "session_number",
                "accuracy",
                "recent_avg_accuracy",
                "accuracy_trend",
                "difficulty",
                "recommended_difficulty",
            ]
        ].head(15)
    )


if __name__ == "__main__":
    main()