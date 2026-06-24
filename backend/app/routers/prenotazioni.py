from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import models, schemas
from app.database import SessionLocal
from app.security import get_current_user_id
from datetime import datetime
import random
import string

router = APIRouter(prefix="/prenotazioni", tags=["Prenotazioni"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/mie-prenotazioni")
def ottieni_prenotazioni_utente(utente_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    prenotazioni = db.query(models.Prenotazione).filter(models.Prenotazione.utente_id == utente_id).all()
    risultato = []
    for p in prenotazioni:
        risultato.append({
            "id": p.id,
            "data_ora": p.data_ora.strftime("%Y-%m-%d %H:%M") if hasattr(p.data_ora, "strftime") else str(p.data_ora),
            "stato": p.stato.value if isinstance(p.stato, models.StatoPrenotazione) else p.stato,
            "codice_ticket": p.codice_ticket,
            "dottore": {
                "id": p.dottore.id,
                "full_name": p.dottore.full_name,
                "specialization": p.dottore.specialization,
                "studio_indirizzo": p.dottore.studio_indirizzo
            } if p.dottore else None
        })
    return risultato

@router.post("/", status_code=status.HTTP_201_CREATED)
def crea_prenotazione(
    prenotazione_in: schemas.PrenotazioneCreate, 
    utente_id: int = Depends(get_current_user_id), 
    db: Session = Depends(get_db)
):
    try:
        data_visita = datetime.strptime(prenotazione_in.data_ora, "%Y-%m-%d %H:%M")
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Formato data/ora non valido. Usa il formato YYYY-MM-DD HH:MM"
        )

    if data_visita < datetime.now():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Impossibile prenotare una visita in una data o ora passata."
        )

    gia_occupato = db.query(models.Prenotazione).filter(
        models.Prenotazione.dottore_id == prenotazione_in.dottore_id,
        models.Prenotazione.data_ora == data_visita,
        models.Prenotazione.stato != models.StatoPrenotazione.CANCELLED
    ).first()

    if gia_occupato:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Questo orario è stato appena occupato da un altro paziente. Scegli un altro slot."
        )

    codice = "TK-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=5))

    nuova_prenotazione = models.Prenotazione(
        utente_id=utente_id,
        dottore_id=prenotazione_in.dottore_id,
        data_ora=data_visita,
        codice_ticket=codice,
        stato=models.StatoPrenotazione.CONFIRMED
    )
    
    try:
        db.add(nuova_prenotazione)
        db.commit()
        db.refresh(nuova_prenotazione)
        return nuova_prenotazione
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore interno durante il salvataggio della prenotazione."
        )

@router.put("/{prenotazione_id}/disdici")
def disdici_prenotazione(
    prenotazione_id: int, 
    utente_id: int = Depends(get_current_user_id), 
    db: Session = Depends(get_db)
):
    prenotazione = db.query(models.Prenotazione).filter(
        models.Prenotazione.id == prenotazione_id,
        models.Prenotazione.utente_id == utente_id
    ).first()

    if not prenotazione:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prenotazione non trovata o non autorizzata."
        )

    if prenotazione.stato == models.StatoPrenotazione.CANCELLED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Questa prenotazione è già stata annullata."
        )

    prenotazione.stato = models.StatoPrenotazione.CANCELLED
    
    try:
        db.commit()
        db.refresh(prenotazione)
        return {"messaggio": "Prenotazione disdetta con successo.", "id": prenotazione.id, "stato": prenotazione.stato.value}
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore durante l'annullamento della prenotazione."
        )