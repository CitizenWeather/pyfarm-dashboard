"""
pyfarm-dashboard FastAPI server.

Serves the built React SPA from frontend/dist/ and provides a /config.json
endpoint so the SPA can discover the API URLs at runtime.
"""

from __future__ import annotations

import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

DIST_DIR = Path(__file__).parent / "frontend" / "dist"

API_URL = os.environ.get("PYFARM_API_URL", "http://localhost:8002")
AUTH_URL = os.environ.get("PYFARM_AUTH_URL", "http://localhost:8001")

app = FastAPI(title="pyfarm-dashboard", docs_url=None, redoc_url=None)


@app.get("/health")
async def health() -> JSONResponse:
    return JSONResponse({"status": "ok"})


@app.get("/config.json")
async def config() -> JSONResponse:
    return JSONResponse({"apiUrl": API_URL, "authUrl": AUTH_URL})


# Mount static assets (JS/CSS bundles) if the dist folder exists.
_assets_dir = DIST_DIR / "assets"
if _assets_dir.exists():
    app.mount("/assets", StaticFiles(directory=str(_assets_dir)), name="assets")


@app.get("/{full_path:path}")
async def spa_fallback(full_path: str) -> FileResponse:
    """Return the built index.html for all non-asset routes (SPA routing)."""
    index = DIST_DIR / "index.html"
    if index.exists():
        return FileResponse(str(index))
    # During development / before build, return a minimal placeholder.
    return FileResponse(str(Path(__file__).parent / "frontend" / "index.html"))


def main() -> None:
    import uvicorn

    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=int(os.environ.get("PORT", "8003")),
        reload=False,
    )


if __name__ == "__main__":
    main()
