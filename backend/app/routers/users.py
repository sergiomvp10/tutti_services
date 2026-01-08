from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel
from typing import List, Optional
import aiosqlite
from app.database import get_db
from app.utils.auth import get_admin_user, get_password_hash

router = APIRouter(prefix="/users", tags=["Usuarios"])

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    phone: str | None
    address: str | None
    city: str | None
    purchase_volume: str | None
    role: str
    is_active: bool

class UserCreate(BaseModel):
    email: str
    password: str
    name: str
    phone: str = ""
    address: str = ""
    city: str = ""
    purchase_volume: str = ""
    role: str = "buyer"

class UserUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    address: str | None = None
    city: str | None = None
    purchase_volume: str | None = None
    is_active: bool | None = None
    role: str | None = None

@router.get("", response_model=List[UserResponse])
async def get_users(
    role: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    admin: dict = Depends(get_admin_user),
    db: aiosqlite.Connection = Depends(get_db)
):
    query = "SELECT id, email, name, phone, address, city, purchase_volume, role, is_active FROM users WHERE 1=1"
    params = []
    
    if role:
        query += " AND role = ?"
        params.append(role)
    
    if search:
        query += " AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%", f"%{search}%"])
    
    query += " ORDER BY name"
    
    cursor = await db.execute(query, params)
    rows = await cursor.fetchall()
    
    return [UserResponse(
        id=row['id'],
        email=row['email'],
        name=row['name'],
        phone=row['phone'],
        address=row['address'],
        city=row['city'],
        purchase_volume=row['purchase_volume'],
        role=row['role'],
        is_active=bool(row['is_active'])
    ) for row in rows]

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    admin: dict = Depends(get_admin_user),
    db: aiosqlite.Connection = Depends(get_db)
):
    cursor = await db.execute(
        "SELECT id, email, name, phone, address, city, purchase_volume, role, is_active FROM users WHERE id = ?",
        (user_id,)
    )
    row = await cursor.fetchone()
    
    if not row:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    return UserResponse(
        id=row['id'],
        email=row['email'],
        name=row['name'],
        phone=row['phone'],
        address=row['address'],
        city=row['city'],
        purchase_volume=row['purchase_volume'],
        role=row['role'],
        is_active=bool(row['is_active'])
    )

@router.post("", response_model=UserResponse)
async def create_user(
    user: UserCreate,
    admin: dict = Depends(get_admin_user),
    db: aiosqlite.Connection = Depends(get_db)
):
    cursor = await db.execute("SELECT id FROM users WHERE email = ?", (user.email,))
    if await cursor.fetchone():
        raise HTTPException(status_code=400, detail="El email ya esta registrado")
    
    if user.role not in ['admin', 'buyer']:
        raise HTTPException(status_code=400, detail="Rol invalido. Roles validos: admin, buyer")
    
    password_hash = get_password_hash(user.password)
    
    cursor = await db.execute(
        """INSERT INTO users (email, password_hash, name, phone, address, city, purchase_volume, role) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        (user.email, password_hash, user.name, user.phone, user.address, user.city, user.purchase_volume, user.role)
    )
    await db.commit()
    user_id = cursor.lastrowid
    
    return UserResponse(
        id=user_id,
        email=user.email,
        name=user.name,
        phone=user.phone,
        address=user.address,
        city=user.city,
        purchase_volume=user.purchase_volume,
        role=user.role,
        is_active=True
    )

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user: UserUpdate,
    admin: dict = Depends(get_admin_user),
    db: aiosqlite.Connection = Depends(get_db)
):
    cursor = await db.execute("SELECT id FROM users WHERE id = ?", (user_id,))
    if not await cursor.fetchone():
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    updates = []
    values = []
    
    if user.name is not None:
        updates.append("name = ?")
        values.append(user.name)
    if user.phone is not None:
        updates.append("phone = ?")
        values.append(user.phone)
    if user.address is not None:
        updates.append("address = ?")
        values.append(user.address)
    if user.city is not None:
        updates.append("city = ?")
        values.append(user.city)
    if user.purchase_volume is not None:
        updates.append("purchase_volume = ?")
        values.append(user.purchase_volume)
    if user.is_active is not None:
        updates.append("is_active = ?")
        values.append(1 if user.is_active else 0)
    if user.role is not None:
        if user.role not in ['admin', 'buyer']:
            raise HTTPException(status_code=400, detail="Rol invalido")
        updates.append("role = ?")
        values.append(user.role)
    
    if updates:
        values.append(user_id)
        await db.execute(
            f"UPDATE users SET {', '.join(updates)} WHERE id = ?",
            values
        )
        await db.commit()
    
    cursor = await db.execute(
        "SELECT id, email, name, phone, address, city, purchase_volume, role, is_active FROM users WHERE id = ?",
        (user_id,)
    )
    row = await cursor.fetchone()
    
    return UserResponse(
        id=row['id'],
        email=row['email'],
        name=row['name'],
        phone=row['phone'],
        address=row['address'],
        city=row['city'],
        purchase_volume=row['purchase_volume'],
        role=row['role'],
        is_active=bool(row['is_active'])
    )

@router.delete("/{user_id}")
async def deactivate_user(
    user_id: int,
    admin: dict = Depends(get_admin_user),
    db: aiosqlite.Connection = Depends(get_db)
):
    cursor = await db.execute("SELECT id, role FROM users WHERE id = ?", (user_id,))
    user = await cursor.fetchone()
    
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    if user_id == admin['id']:
        raise HTTPException(status_code=400, detail="No puedes desactivar tu propia cuenta")
    
    await db.execute("UPDATE users SET is_active = 0 WHERE id = ?", (user_id,))
    await db.commit()
    
    return {"message": "Usuario desactivado exitosamente"}
