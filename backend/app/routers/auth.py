from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import hashlib
from app import models, schemas
from app.database import SessionLocal

router = APIRouter(prefix="/auth", tags=["Autenticazione"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register", response_model=schemas.UtenteRisposta, status_code=status.HTTP_201_CREATED)
def registra_utente(utente_in: schemas.UtenteCreate, db: Session = Depends(get_db)):
    utente_esistente = db.query(models.Utente).filter(models.Utente.email == utente_in.email).first()
    if utente_esistente:
        raise HTTPException(status_code=400, detail="Email già registrata!")

    password_segreta = hashlib.sha256(utente_in.password.encode()).hexdigest()

    nuovo_utente = models.Utente(
        email=utente_in.email,
        hashed_password=password_segreta,
        nome=utente_in.nome,
        cognome=utente_in.cognome,
        is_admin=False
    )
    db.add(nuovo_utente)
    db.commit()
    db.refresh(nuovo_utente)
    return nuovo_utente

@router.post("/login", response_model=schemas.LoginRisposta)
def login_utente(utente_in: schemas.LoginInput, db: Session = Depends(get_db)):
    utente = db.query(models.Utente).filter(models.Utente.email == utente_in.email).first()
    if not utente:
        raise HTTPException(status_code=400, detail="Credenziali non valide.")

    password_inserita_hashed = hashlib.sha256(utente_in.password.encode()).hexdigest()
    if password_inserita_hashed != utente.hashed_password:
        raise HTTPException(status_code=400, detail="Credenziali non valide.")

    return {
        "messaggio": "Login effettuato con successo",
        "id": utente.id,
        "email": utente.email,
        "nome": utente.nome,
        "cognome": utente.cognome,
        "is_admin": utente.is_admin
    }