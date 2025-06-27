from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.auth import router as auth_router
from routes.categories import router as categories_router
from routes.tickets import router as tickets_router
from core.middleware import AuthMiddleware

app = FastAPI()

origins = [
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(AuthMiddleware)

app.include_router(auth_router)
app.include_router(categories_router)
app.include_router(tickets_router)

@app.get("/health")
def health():
    return {"status": "ok"} 