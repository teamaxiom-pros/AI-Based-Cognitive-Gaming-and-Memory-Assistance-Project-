from pathlib import Path
import pandas as pd
import matplotlib.pyplot as plt

DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "patient_sessions.csv"
GRAPH_DIR = Path(__file__).resolve().parent.parent / "data" / "graphs"

GRAPH_DIR.mkdir(parents=True, exist_ok=True)

df = pd.read_csv(DATA_FILE)

# Graph 1
df["domain"].value_counts().plot(kind="bar")
plt.title("Sessions by Cognitive Domain")
plt.xlabel("Domain")
plt.ylabel("Number of Sessions")
plt.xticks(rotation=45)
plt.tight_layout()
plt.savefig(GRAPH_DIR / "domain_distribution.png")
plt.close()

# Graph 2
df.groupby("difficulty")["accuracy"].mean().plot(marker="o")
plt.title("Average Accuracy vs Difficulty")
plt.xlabel("Difficulty")
plt.ylabel("Average Accuracy")
plt.xticks(range(1, 6))
plt.tight_layout()
plt.savefig(GRAPH_DIR / "difficulty_accuracy.png")
plt.close()

# Graph 3
df["accuracy"].plot(kind="hist", bins=20)
plt.title("Accuracy Distribution")
plt.xlabel("Accuracy")
plt.ylabel("Number of Sessions")
plt.tight_layout()
plt.savefig(GRAPH_DIR / "accuracy_distribution.png")
plt.close()

print("Graphs saved to:", GRAPH_DIR)