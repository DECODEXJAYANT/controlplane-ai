from fastapi import FastAPI

from app.api.evaluation import router as evaluation_router


app = FastAPI(
    title="ControlPlane.ai",
    description="Adaptive Autonomy Layer for Enterprise AI",
    version="0.1.0",
)


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ControlPlane.ai",
        "version": "0.1.0",
    }


app.include_router(evaluation_router)