import os
import uuid
import aiofiles
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import FileResponse

from app.utils.auth import get_current_user

router = APIRouter(prefix="/uploads", tags=["uploads"])

UPLOAD_DIR = "/data/uploads" if os.path.exists("/data") else "uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


@router.post("")
async def upload_file(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Solo administradores pueden subir archivos")
    
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"Tipo de archivo no permitido. Use: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="Archivo muy grande. Maximo 5MB")
    
    unique_filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    async with aiofiles.open(file_path, "wb") as f:
        await f.write(content)
    
    return {"filename": unique_filename, "url": f"/uploads/{unique_filename}"}


@router.get("/{filename}")
async def get_file(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    
    return FileResponse(file_path)
