from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.evaluation import router as evaluation_router


app = FastAPI(
    title="ControlPlane.ai",
    description="Adaptive Autonomy Layer for Enterprise AI",
    version="0.1.0",
)


# Allow the React frontend to communicate with the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ControlPlane.ai",
        "version": "0.1.0",
    }


app.include_router(evaluation_router)