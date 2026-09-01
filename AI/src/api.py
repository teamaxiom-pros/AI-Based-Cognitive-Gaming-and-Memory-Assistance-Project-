from fastapi import FastAPI
from .axiom_ai import process_request

app = FastAPI(
    title="Team Axiom AI API",
    description="AI service for the Axiom cognitive assistance platform",
    version="1.0.0",
)


@app.get("/")
def root():
    return {
        "message": "Axiom AI API is running"
    }


@app.post("/ai/process")
def process_ai_request(request: dict):
    return process_request(request)