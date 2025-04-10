from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from services.llm_service import LLMService

router = APIRouter()

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    model: Optional[str] = "gpt-4-turbo"
    fixed_info: Optional[Dict[str, str]] = None
    excel_data: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    response: str
    models_used: Dict[str, str]

def get_llm_service():
    return LLMService()

@router.post("/send", response_model=ChatResponse)
async def send_message(request: ChatRequest, llm_service: LLMService = Depends(get_llm_service)):
    """
    Send a message to the LLM and get a response
    """
    try:
        messages = [{"role": msg.role, "content": msg.content} for msg in request.messages]
        
        user_message = next((msg.content for msg in reversed(request.messages) if msg.role == "user"), "")
        
        result = llm_service.process_message(user_message, messages)
        
        return {
            "response": result["response"],
            "models_used": result["models_used"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/initial-question", response_model=ChatResponse)
async def get_initial_question(
    fixed_info: Dict[str, str], 
    excel_data: Optional[Dict[str, Any]] = None,
    llm_service: LLMService = Depends(get_llm_service)
):
    """
    Generate the initial question based on the fixed information and Excel data
    """
    try:
        initial_question = llm_service.generate_initial_question(fixed_info, excel_data)
        
        return {
            "response": initial_question,
            "models_used": {"initial_question": "Claude 3 Opus"}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/has-sufficient-info", response_model=Dict[str, bool])
async def has_sufficient_info(llm_service: LLMService = Depends(get_llm_service)):
    """
    Check if we have sufficient information to generate VBA code
    """
    try:
        return {"has_sufficient_info": llm_service.has_sufficient_information()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/collected-info", response_model=Dict[str, Any])
async def get_collected_info(llm_service: LLMService = Depends(get_llm_service)):
    """
    Get the collected information
    """
    try:
        return llm_service.get_collected_info()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
