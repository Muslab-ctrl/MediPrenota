from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # <-- NUOVO IMPORT
from app.database import engine
from app import models
from .routers import auth, admin, prenotazioni 

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Sistema Prenotazioni Mediche")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Permette l'accesso a qualsiasi dispositivo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(prenotazioni.router) 

@app.get("/")
def home():
    return {"messaggio": "Backend Medico Attivo e Database Sincronizzato!"}