from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import aiosqlite
from app.database import get_db
from app.utils.auth import get_current_user, get_admin_user

router = APIRouter(prefix="/promotions", tags=["Promociones"])

class PromotionCreate(BaseModel):
    name: str
    description: str = ""
    discount_percent: float
    product_id: int | None = None
    category_id: int | None = None
    start_date: str
    end_date: str

class PromotionUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    discount_percent: float | None = None
    product_id: int | None = None
    category_id: int | None = None
    start_date: str | None = None
    end_date: str | None = None
    is_active: bool | None = None

class PromotionResponse(BaseModel):
    id: int
    name: str
    description: str | None
    discount_percent: float
    product_id: int | None
    product_name: str | None
    category_id: int | None
    category_name: str | None
    start_date: str
    end_date: str
    is_active: bool

@router.get("", response_model=List[PromotionResponse])
async def get_promotions(
    active_only: bool = True,
    db: aiosqlite.Connection = Depends(get_db)
):
    query = """
        SELECT pr.id, pr.name, pr.description, pr.discount_percent, 
               pr.product_id, p.name as product_name,
               pr.category_id, c.name as category_name,
               pr.start_date, pr.end_date, pr.is_active
        FROM promotions pr
        LEFT JOIN products p ON pr.product_id = p.id
        LEFT JOIN categories c ON pr.category_id = c.id
        WHERE 1=1
    """
    
    if active_only:
        query += " AND pr.is_active = 1 AND datetime('now') BETWEEN pr.start_date AND pr.end_date"
    
    query += " ORDER BY pr.created_at DESC"
    
    cursor = await db.execute(query)
    rows = await cursor.fetchall()
    
    return [PromotionResponse(
        id=row['id'],
        name=row['name'],
        description=row['description'],
        discount_percent=row['discount_percent'],
        product_id=row['product_id'],
        product_name=row['product_name'],
        category_id=row['category_id'],
        category_name=row['category_name'],
        start_date=row['start_date'],
        end_date=row['end_date'],
        is_active=bool(row['is_active'])
    ) for row in rows]

@router.get("/all", response_model=List[PromotionResponse])
async def get_all_promotions(
    admin: dict = Depends(get_admin_user),
    db: aiosqlite.Connection = Depends(get_db)
):
    cursor = await db.execute("""
        SELECT pr.id, pr.name, pr.description, pr.discount_percent, 
               pr.product_id, p.name as product_name,
               pr.category_id, c.name as category_name,
               pr.start_date, pr.end_date, pr.is_active
        FROM promotions pr
        LEFT JOIN products p ON pr.product_id = p.id
        LEFT JOIN categories c ON pr.category_id = c.id
        ORDER BY pr.created_at DESC
    """)
    rows = await cursor.fetchall()
    
    return [PromotionResponse(
        id=row['id'],
        name=row['name'],
        description=row['description'],
        discount_percent=row['discount_percent'],
        product_id=row['product_id'],
        product_name=row['product_name'],
        category_id=row['category_id'],
        category_name=row['category_name'],
        start_date=row['start_date'],
        end_date=row['end_date'],
        is_active=bool(row['is_active'])
    ) for row in rows]

@router.get("/{promotion_id}", response_model=PromotionResponse)
async def get_promotion(promotion_id: int, db: aiosqlite.Connection = Depends(get_db)):
    cursor = await db.execute("""
        SELECT pr.id, pr.name, pr.description, pr.discount_percent, 
               pr.product_id, p.name as product_name,
               pr.category_id, c.name as category_name,
               pr.start_date, pr.end_date, pr.is_active
        FROM promotions pr
        LEFT JOIN products p ON pr.product_id = p.id
        LEFT JOIN categories c ON pr.category_id = c.id
        WHERE pr.id = ?
    """, (promotion_id,))
    row = await cursor.fetchone()
    
    if not row:
        raise HTTPException(status_code=404, detail="Promocion no encontrada")
    
    return PromotionResponse(
        id=row['id'],
        name=row['name'],
        description=row['description'],
        discount_percent=row['discount_percent'],
        product_id=row['product_id'],
        product_name=row['product_name'],
        category_id=row['category_id'],
        category_name=row['category_name'],
        start_date=row['start_date'],
        end_date=row['end_date'],
        is_active=bool(row['is_active'])
    )

@router.post("", response_model=PromotionResponse)
async def create_promotion(
    promotion: PromotionCreate,
    admin: dict = Depends(get_admin_user),
    db: aiosqlite.Connection = Depends(get_db)
):
    if promotion.product_id:
        cursor = await db.execute("SELECT id FROM products WHERE id = ?", (promotion.product_id,))
        if not await cursor.fetchone():
            raise HTTPException(status_code=400, detail="Producto no encontrado")
    
    if promotion.category_id:
        cursor = await db.execute("SELECT id FROM categories WHERE id = ?", (promotion.category_id,))
        if not await cursor.fetchone():
            raise HTTPException(status_code=400, detail="Categoria no encontrada")
    
    cursor = await db.execute("""
        INSERT INTO promotions (name, description, discount_percent, product_id, category_id, start_date, end_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (promotion.name, promotion.description, promotion.discount_percent, 
          promotion.product_id, promotion.category_id, promotion.start_date, promotion.end_date))
    await db.commit()
    promotion_id = cursor.lastrowid
    
    cursor = await db.execute("""
        SELECT pr.id, pr.name, pr.description, pr.discount_percent, 
               pr.product_id, p.name as product_name,
               pr.category_id, c.name as category_name,
               pr.start_date, pr.end_date, pr.is_active
        FROM promotions pr
        LEFT JOIN products p ON pr.product_id = p.id
        LEFT JOIN categories c ON pr.category_id = c.id
        WHERE pr.id = ?
    """, (promotion_id,))
    row = await cursor.fetchone()
    
    return PromotionResponse(
        id=row['id'],
        name=row['name'],
        description=row['description'],
        discount_percent=row['discount_percent'],
        product_id=row['product_id'],
        product_name=row['product_name'],
        category_id=row['category_id'],
        category_name=row['category_name'],
        start_date=row['start_date'],
        end_date=row['end_date'],
        is_active=bool(row['is_active'])
    )

@router.put("/{promotion_id}", response_model=PromotionResponse)
async def update_promotion(
    promotion_id: int,
    promotion: PromotionUpdate,
    admin: dict = Depends(get_admin_user),
    db: aiosqlite.Connection = Depends(get_db)
):
    cursor = await db.execute("SELECT id FROM promotions WHERE id = ?", (promotion_id,))
    if not await cursor.fetchone():
        raise HTTPException(status_code=404, detail="Promocion no encontrada")
    
    updates = []
    values = []
    
    if promotion.name is not None:
        updates.append("name = ?")
        values.append(promotion.name)
    if promotion.description is not None:
        updates.append("description = ?")
        values.append(promotion.description)
    if promotion.discount_percent is not None:
        updates.append("discount_percent = ?")
        values.append(promotion.discount_percent)
    if promotion.product_id is not None:
        updates.append("product_id = ?")
        values.append(promotion.product_id)
    if promotion.category_id is not None:
        updates.append("category_id = ?")
        values.append(promotion.category_id)
    if promotion.start_date is not None:
        updates.append("start_date = ?")
        values.append(promotion.start_date)
    if promotion.end_date is not None:
        updates.append("end_date = ?")
        values.append(promotion.end_date)
    if promotion.is_active is not None:
        updates.append("is_active = ?")
        values.append(1 if promotion.is_active else 0)
    
    if updates:
        values.append(promotion_id)
        await db.execute(
            f"UPDATE promotions SET {', '.join(updates)} WHERE id = ?",
            values
        )
        await db.commit()
    
    cursor = await db.execute("""
        SELECT pr.id, pr.name, pr.description, pr.discount_percent, 
               pr.product_id, p.name as product_name,
               pr.category_id, c.name as category_name,
               pr.start_date, pr.end_date, pr.is_active
        FROM promotions pr
        LEFT JOIN products p ON pr.product_id = p.id
        LEFT JOIN categories c ON pr.category_id = c.id
        WHERE pr.id = ?
    """, (promotion_id,))
    row = await cursor.fetchone()
    
    return PromotionResponse(
        id=row['id'],
        name=row['name'],
        description=row['description'],
        discount_percent=row['discount_percent'],
        product_id=row['product_id'],
        product_name=row['product_name'],
        category_id=row['category_id'],
        category_name=row['category_name'],
        start_date=row['start_date'],
        end_date=row['end_date'],
        is_active=bool(row['is_active'])
    )

@router.delete("/{promotion_id}")
async def delete_promotion(
    promotion_id: int,
    admin: dict = Depends(get_admin_user),
    db: aiosqlite.Connection = Depends(get_db)
):
    cursor = await db.execute("SELECT id FROM promotions WHERE id = ?", (promotion_id,))
    if not await cursor.fetchone():
        raise HTTPException(status_code=404, detail="Promocion no encontrada")
    
    await db.execute("DELETE FROM promotions WHERE id = ?", (promotion_id,))
    await db.commit()
    
    return {"message": "Promocion eliminada exitosamente"}
