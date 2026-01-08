from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db
from app.routers import auth, categories, products, promotions, orders, users, uploads

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(
    title="Tutti Services API",
    description="API para distribuidora de frutas y verduras",
    version="1.0.0",
    lifespan=lifespan
)

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(products.router)
app.include_router(promotions.router)
app.include_router(orders.router)
app.include_router(users.router)
app.include_router(uploads.router)

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.get("/")
async def root():
    return {
        "message": "Bienvenido a Tutti Services API",
        "docs": "/docs",
        "version": "1.0.0"
    }
