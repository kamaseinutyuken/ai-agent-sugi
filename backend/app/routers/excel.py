from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Dict, List, Optional

router = APIRouter()

class ExcelData(BaseModel):
    sheet_name: str
    data: Dict[str, Dict[str, str]]

class ExcelAnalysisResponse(BaseModel):
    sheets: List[str]
    data: Dict[str, ExcelData]
    message: str

@router.post("/upload", response_model=ExcelAnalysisResponse)
async def upload_excel_file(file: UploadFile = File(...)):
    """
    Upload and analyze an Excel file
    """
    try:
        return {
            "sheets": ["安全施工計画書", "リスクアセスメント"],
            "data": {},
            "message": "Excel file uploaded successfully. Analysis will be implemented."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class FixedInfoRequest(BaseModel):
    project_name: str  # 工事名（セルI9）
    location: str      # 施工場所（セルI11）
    period: str        # 工期（セルI13）
    workers: int       # 作業者数（セルQ15）

@router.post("/fixed-info", response_model=dict)
async def save_fixed_info(info: FixedInfoRequest):
    """
    Save fixed information for Excel file
    """
    try:
        return {
            "success": True,
            "message": "Fixed information saved successfully",
            "data": info.dict()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
