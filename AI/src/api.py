from fastapi import FastAPI
try:
    from .smriti_ai import process_request
except ImportError:
    try:
        from AI.src.smriti_ai import process_request
    except ImportError:
        import sys
        from pathlib import Path
        _src_dir = Path(__file__).resolve().parent
        if str(_src_dir) not in sys.path:
            sys.path.insert(0, str(_src_dir))
        from smriti_ai import process_request

app = FastAPI(
    title="SMRITI AI API",
    description="AI Cognitive Engine for SMRITI Platform (Team Axiom • SIH 2026)",
    version="1.0.0",
)


@app.get("/")
def root():
    return {
        "message": "SMRITI AI API is running"
    }


@app.post("/ai/process")
def process_ai_request(request: dict):
    return process_request(request)