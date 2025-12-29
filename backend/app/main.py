from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes.components import router as components_router
from app.api.routes.subsystems import router as subsystems_router

app = FastAPI(title="Satellite Components DB", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development convenience; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(components_router, prefix="/components", tags=["components"])
app.include_router(subsystems_router, prefix="/subsystems", tags=["subsystems"])

@app.get("/healthz")
def healthz() -> dict:
    return {"status": "ok"}
