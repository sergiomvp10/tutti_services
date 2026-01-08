from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
import aiosqlite
from app.database import get_db
from app.utils.auth import (
    verify_password, 
    get_password_hash, 
    create_access_token,
    get_current_user,
    get_admin_user
)

router = APIRouter(prefix="/auth", tags=["Autenticacion"])

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    phone: str = ""
    address: str = ""

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    phone: str | None
    address: str | None
    role: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class UpdateProfileRequest(BaseModel):
    name: str | None = None
    phone: str | None = None
    address: str | None = None

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: aiosqlite.Connection = Depends(get_db)):
    cursor = await db.execute(
        "SELECT id, email, password_hash, name, phone, address, role, is_active FROM users WHERE email = ?",
        (request.email,)
    )
    user = await cursor.fetchone()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contrasena incorrectos"
        )
    
    if not user['is_active']:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario desactivado"
        )
    
    if not verify_password(request.password, user['password_hash']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contrasena incorrectos"
        )
    
    access_token = create_access_token(data={"user_id": user['id'], "role": user['role']})
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=user['id'],
            email=user['email'],
            name=user['name'],
            phone=user['phone'],
            address=user['address'],
            role=user['role']
        )
    )

@router.post("/register", response_model=TokenResponse)
async def register(request: RegisterRequest, db: aiosqlite.Connection = Depends(get_db)):
    cursor = await db.execute("SELECT id FROM users WHERE email = ?", (request.email,))
    existing = await cursor.fetchone()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya esta registrado"
        )
    
    password_hash = get_password_hash(request.password)
    
    cursor = await db.execute(
        """INSERT INTO users (email, password_hash, name, phone, address, role) 
           VALUES (?, ?, ?, ?, ?, 'buyer')""",
        (request.email, password_hash, request.name, request.phone, request.address)
    )
    await db.commit()
    user_id = cursor.lastrowid
    
    access_token = create_access_token(data={"user_id": user_id, "role": "buyer"})
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=user_id,
            email=request.email,
            name=request.name,
            phone=request.phone,
            address=request.address,
            role="buyer"
        )
    )

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user['id'],
        email=current_user['email'],
        name=current_user['name'],
        phone=current_user['phone'],
        address=current_user['address'],
        role=current_user['role']
    )

@router.put("/profile", response_model=UserResponse)
async def update_profile(
    request: UpdateProfileRequest,
    current_user: dict = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db)
):
    updates = []
    values = []
    
    if request.name is not None:
        updates.append("name = ?")
        values.append(request.name)
    if request.phone is not None:
        updates.append("phone = ?")
        values.append(request.phone)
    if request.address is not None:
        updates.append("address = ?")
        values.append(request.address)
    
    if updates:
        values.append(current_user['id'])
        await db.execute(
            f"UPDATE users SET {', '.join(updates)} WHERE id = ?",
            values
        )
        await db.commit()
    
    cursor = await db.execute(
        "SELECT id, email, name, phone, address, role FROM users WHERE id = ?",
        (current_user['id'],)
    )
    user = await cursor.fetchone()
    
    return UserResponse(
        id=user['id'],
        email=user['email'],
        name=user['name'],
        phone=user['phone'],
        address=user['address'],
        role=user['role']
    )

@router.put("/change-password")
async def change_password(
    request: ChangePasswordRequest,
    current_user: dict = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db)
):
    cursor = await db.execute(
        "SELECT password_hash FROM users WHERE id = ?",
        (current_user['id'],)
    )
    user = await cursor.fetchone()
    
    if not verify_password(request.current_password, user['password_hash']):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Contrasena actual incorrecta"
        )
    
    new_hash = get_password_hash(request.new_password)
    await db.execute(
        "UPDATE users SET password_hash = ? WHERE id = ?",
        (new_hash, current_user['id'])
    )
    await db.commit()
    
    return {"message": "Contrasena actualizada exitosamente"}
