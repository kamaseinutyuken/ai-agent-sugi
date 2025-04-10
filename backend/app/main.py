from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.routers import chat, excel, vba

load_dotenv()

app = FastAPI(title="Mastra AI Excel Agent API")

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(excel.router, prefix="/api/excel", tags=["excel"])
app.include_router(vba.router, prefix="/api/vba", tags=["vba"])

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}
