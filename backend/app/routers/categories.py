from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List
import aiosqlite
from app.database import get_db
from app.utils.auth import get_current_user, get_admin_user

router = APIRouter(prefix="/categories", tags=["Categorias"])

class CategoryCreate(BaseModel):
    name: str
    description: str = ""
    image_url: str = ""

class CategoryUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    image_url: str | None = None

class CategoryResponse(BaseModel):
    id: int
    name: str
    description: str | None
    image_url: str | None

@router.get("", response_model=List[CategoryResponse])
async def get_categories(db: aiosqlite.Connection = Depends(get_db)):
    cursor = await db.execute("SELECT id, name, description, image_url FROM categories ORDER BY name")
    rows = await cursor.fetchall()
    return [CategoryResponse(
        id=row['id'],
        name=row['name'],
        description=row['description'],
        image_url=row['image_url']
    ) for row in rows]

@router.get("/{category_id}", response_model=CategoryResponse)
async def get_category(category_id: int, db: aiosqlite.Connection = Depends(get_db)):
    cursor = await db.execute(
        "SELECT id, name, description, image_url FROM categories WHERE id = ?",
        (category_id,)
    )
    row = await cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Categoria no encontrada")
    return CategoryResponse(
        id=row['id'],
        name=row['name'],
        description=row['description'],
        image_url=row['image_url']
    )

@router.post("", response_model=CategoryResponse)
async def create_category(
    category: CategoryCreate,
    admin: dict = Depends(get_admin_user),
    db: aiosqlite.Connection = Depends(get_db)
):
    cursor = await db.execute(
        "INSERT INTO categories (name, description, image_url) VALUES (?, ?, ?)",
        (category.name, category.description, category.image_url)
    )
    await db.commit()
    category_id = cursor.lastrowid
    
    return CategoryResponse(
        id=category_id,
        name=category.name,
        description=category.description,
        image_url=category.image_url
    )

@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: int,
    category: CategoryUpdate,
    admin: dict = Depends(get_admin_user),
    db: aiosqlite.Connection = Depends(get_db)
):
    cursor = await db.execute("SELECT id FROM categories WHERE id = ?", (category_id,))
    if not await cursor.fetchone():
        raise HTTPException(status_code=404, detail="Categoria no encontrada")
    
    updates = []
    values = []
    
    if category.name is not None:
        updates.append("name = ?")
        values.append(category.name)
    if category.description is not None:
        updates.append("description = ?")
        values.append(category.description)
    if category.image_url is not None:
        updates.append("image_url = ?")
        values.append(category.image_url)
    
    if updates:
        values.append(category_id)
        await db.execute(
            f"UPDATE categories SET {', '.join(updates)} WHERE id = ?",
            values
        )
        await db.commit()
    
    cursor = await db.execute(
        "SELECT id, name, description, image_url FROM categories WHERE id = ?",
        (category_id,)
    )
    row = await cursor.fetchone()
    return CategoryResponse(
        id=row['id'],
        name=row['name'],
        description=row['description'],
        image_url=row['image_url']
    )

@router.delete("/{category_id}")
async def delete_category(
    category_id: int,
    admin: dict = Depends(get_admin_user),
    db: aiosqlite.Connection = Depends(get_db)
):
    cursor = await db.execute("SELECT id FROM categories WHERE id = ?", (category_id,))
    if not await cursor.fetchone():
        raise HTTPException(status_code=404, detail="Categoria no encontrada")
    
    await db.execute("UPDATE products SET category_id = NULL WHERE category_id = ?", (category_id,))
    await db.execute("DELETE FROM categories WHERE id = ?", (category_id,))
    await db.commit()
    
    return {"message": "Categoria eliminada exitosamente"}
