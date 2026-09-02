from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="SIH Transport AI",
    description="AI-powered Transport Monitoring System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "status": "running",
        "message": "SIH Transport AI Backend"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }