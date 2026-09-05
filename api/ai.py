import sys
import os
from pathlib import Path

# Add project root to sys.path so AI package can be imported in Vercel serverless environment
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from fastapi import FastAPI
from AI.src.smriti_ai import process_request

app = FastAPI(
    title="SMRITI AI API",
    description="AI Cognitive Engine for SMRITI Platform (Team Axiom • SIH 2026)",
    version="1.0.0",
)


@app.get("/")
@app.get("/ai")
@app.get("/api/ai")
def root():
    return {
        "message": "SMRITI AI API is running"
    }


@app.post("/ai/process")
@app.post("/api/ai/process")
@app.post("/process")
def process_ai_request(request: dict):
    return process_request(request)

