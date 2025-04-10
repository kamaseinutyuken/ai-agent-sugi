from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
import tempfile
import os
from services.excel_service import ExcelService

router = APIRouter()

class ExcelData(BaseModel):
    sheet_name: str
    data: Dict[str, Dict[str, str]]

class ExcelAnalysisResponse(BaseModel):
    sheets: List[str]
    data: Dict[str, Any]
    fixed_info: Dict[str, str]
    message: str

class FixedInfoRequest(BaseModel):
    project_name: str  # 工事名（セルI9）
    location: str      # 施工場所（セルI11）
    period: str        # 工期（セルI13）
    workers: str       # 作業者数（セルQ15）

class FixedInfoResponse(BaseModel):
    success: bool
    message: str
    data: Dict[str, str]

@router.post("/upload", response_model=ExcelAnalysisResponse)
async def upload_excel_file(file: UploadFile = File(...)):
    """
    Upload and analyze an Excel file
    """
    try:
        content = await file.read()
        
        excel_service = ExcelService(file_content=content)
        
        data = excel_service.extract_data()
        
        fixed_info = excel_service.get_fixed_info()
        
        excel_service.cleanup()
        
        return {
            "sheets": list(data.keys()),
            "data": data,
            "fixed_info": fixed_info,
            "message": "Excel file analyzed successfully."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/fixed-info", response_model=FixedInfoResponse)
async def save_fixed_info(info: FixedInfoRequest):
    """
    Save fixed information for Excel file
    """
    try:
        return {
            "success": True,
            "message": "Fixed information saved successfully",
            "data": {
                "project_name": info.project_name,
                "location": info.location,
                "period": info.period,
                "workers": info.workers
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
