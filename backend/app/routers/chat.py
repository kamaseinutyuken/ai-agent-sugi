from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    model: Optional[str] = "gpt-4-turbo"

class ChatResponse(BaseModel):
    response: str
    model_used: str

@router.post("/send", response_model=ChatResponse)
async def send_message(request: ChatRequest):
    """
    Send a message to the LLM and get a response
    """
    try:
        return {
            "response": "This is a placeholder response. LLM integration will be implemented.",
            "model_used": request.model
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
