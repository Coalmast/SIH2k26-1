from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/ocr", tags=["OCR"])

@router.post("/extract")
async def extract_document():
    return {"status": "success"}

@router.get("/documents")
async def list_documents():
    return []
