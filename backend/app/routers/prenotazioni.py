from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import models, schemas
from app.database import SessionLocal
import random, string

router = APIRouter(prefix="/prenotazioni", tags=["Prenotazioni"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/utente/{utente_id}")
def ottieni_prenotazioni_utente(utente_id: int, db: Session = Depends(get_db)):
    prenotazioni = db.query(models.Prenotazione).filter(models.Prenotazione.utente_id == utente_id).all()
    
    risultato = []
    for p in prenotazioni:
        risultato.append({
            "id": p.id,
            "data_ora": p.data_ora.strftime("%Y-%m-%d %H:%M") if hasattr(p.data_ora, "strftime") else str(p.data_ora),
            "stato": p.stato,
            "codice_ticket": p.codice_ticket,
            # 🟢 Inviamo i dati del dottore direttamente dentro la prenotazione
            "dottore": {
                "id": p.dottore.id,
                "full_name": p.dottore.full_name,
                "specialization": p.dottore.specialization,
                "studio_indirizzo": p.dottore.studio_indirizzo,
                "telefono": p.dottore.telefono
            } if p.dottore else None
        })
    return risultato
    
@router.post("/", response_model=schemas.PrenotazioneRisposta)
def crea_prenotazione(prenotazione_in: schemas.PrenotazioneCreate, db: Session = Depends(get_db)):
    gia_occupato = db.query(models.Prenotazione).filter(
        models.Prenotazione.dottore_id == prenotazione_in.dottore_id,
        models.Prenotazione.data_ora == prenotazione_in.data_ora,
        models.Prenotazione.stato != "CANCELLED" 
    ).first()

    if gia_occupato:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Questo orario è stato appena occupato da un altro paziente. Scegli un altro slot."
        )

    codice = "TK-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=5))

    nuova_prenotazione = models.Prenotazione(
        utente_id=prenotazione_in.utente_id,
        dottore_id=prenotazione_in.dottore_id,
        data_ora=prenotazione_in.data_ora,
        codice_ticket=codice,
        stato="CONFIRMED"
    )
    db.add(nuova_prenotazione)
    db.commit()
    db.refresh(nuova_prenotazione)
    return nuova_prenotazione

@router.put("/{prenotazione_id}/disdici")
def disdici_prenotazione(prenotazione_id: int, db: Session = Depends(get_db)):
    prenotazione = db.query(models.Prenotazione).filter(models.Prenotazione.id == prenotazione_id).first()
    if not prenotazione:
        raise HTTPException(status_code=404, detail="Prenotazione non trovata.")
    
    # 🟢 CORREZIONE: Assegniamo il valore corretto dell'enum, ovvero la stringa "Annullato"
    prenotazione.stato = "Annullato"
    
    try:
        db.commit()
        db.refresh(prenotazione) # Sincronizza lo stato modificato nel modello
        return {"status": "success", "message": "Appuntamento disdetto correttamente."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Errore durante il salvataggio sul database.")