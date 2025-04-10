from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
from app.services.vba_service import VBAService

router = APIRouter()

class VBAGenerationRequest(BaseModel):
    project_name: str
    location: str
    period: str
    workers: str
    safety_plan_data: Dict[str, Dict[str, str]]
    risk_assessment_data: Dict[str, Dict[str, str]]
    messages: List[Dict[str, str]]

class VBAGenerationResponse(BaseModel):
    vba_code: str
    message: str

def get_vba_service():
    return VBAService()

@router.post("/generate", response_model=VBAGenerationResponse)
async def generate_vba_code(request: VBAGenerationRequest, vba_service: VBAService = Depends(get_vba_service)):
    """
    Generate VBA code based on the provided data
    """
    try:
        fixed_info = {
            "project_name": request.project_name,
            "location": request.location,
            "period": request.period,
            "workers": request.workers
        }
        
        excel_data = {
            "safety_plan": request.safety_plan_data,
            "risk_assessment": request.risk_assessment_data
        }
        
        vba_code = vba_service.generate_vba_code(fixed_info, excel_data, request.messages)
        
        return {
            "vba_code": vba_code,
            "message": "VBA code generated successfully."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
