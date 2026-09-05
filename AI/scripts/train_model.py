from pathlib import Path

import joblib
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder


BASE_DIR = Path(__file__).resolve().parent.parent

DATA_FILE = BASE_DIR / "data" / "patient_sessions.csv"
MODEL_DIR = BASE_DIR / "models"

MODEL_DIR.mkdir(parents=True, exist_ok=True)


# -----------------------------
# Load data
# -----------------------------

df = pd.read_csv(DATA_FILE)

print(f"Dataset rows: {len(df)}")


# -----------------------------
# Features
# -----------------------------

features = [
    "domain",
    "difficulty",
    "prev_accuracy",
    "prev_response_time",
    "recent_avg_accuracy",
    "recent_avg_response_time",
    "accuracy_trend",
    "attempts",
    "hints_used",
    "completion",
]

target = "recommended_difficulty"

X = df[features]
y = df[target]


# -----------------------------
# Handle missing values
# -----------------------------

numeric_features = [
    "difficulty",
    "prev_accuracy",
    "prev_response_time",
    "recent_avg_accuracy",
    "recent_avg_response_time",
    "accuracy_trend",
    "attempts",
    "hints_used",
    "completion",
]

categorical_features = ["domain"]


X = X.copy()

for column in numeric_features:
    X[column] = X[column].fillna(X[column].median())


# -----------------------------
# Preprocessing
# -----------------------------

preprocessor = ColumnTransformer(
    transformers=[
        (
            "domain",
            OneHotEncoder(handle_unknown="ignore"),
            categorical_features,
        ),
        (
            "numeric",
            "passthrough",
            numeric_features,
        ),
    ]
)


# -----------------------------
# Train/test split
# -----------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y,
)


# -----------------------------
# Preprocess
# -----------------------------

X_train_processed = preprocessor.fit_transform(X_train)
X_test_processed = preprocessor.transform(X_test)


# -----------------------------
# Model
# -----------------------------

model = RandomForestClassifier(
    n_estimators=300,
    max_depth=10,
    random_state=42,
    class_weight="balanced",
)


# -----------------------------
# Train
# -----------------------------

model.fit(X_train_processed, y_train)


# -----------------------------
# Evaluate
# -----------------------------

predictions = model.predict(X_test_processed)

accuracy = accuracy_score(y_test, predictions)

print("\n========== MODEL RESULTS ==========")
print(f"Test Accuracy: {accuracy:.2%}")

print("\nClassification Report:")
print(classification_report(y_test, predictions))


# -----------------------------
# Save
# -----------------------------

joblib.dump(
    model,
    MODEL_DIR / "difficulty_model.pkl"
)

joblib.dump(
    preprocessor,
    MODEL_DIR / "preprocessor.pkl"
)

print("\nModel saved successfully.")