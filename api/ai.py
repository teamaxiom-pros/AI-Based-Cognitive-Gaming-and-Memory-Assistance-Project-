import sys
import os
from pathlib import Path

# Add project root to sys.path so AI package can be imported in Vercel serverless environment
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from fastapi import FastAPI
from AI.src.axiom_ai import process_request

app = FastAPI(
    title="Team Axiom AI API",
    description="AI service for the Axiom cognitive assistance platform",
    version="1.0.0",
)


@app.get("/")
@app.get("/ai")
@app.get("/api/ai")
def root():
    return {
        "message": "Axiom AI API is running"
    }


@app.post("/ai/process")
@app.post("/api/ai/process")
def process_ai_request(request: dict):
    return process_request(request)
