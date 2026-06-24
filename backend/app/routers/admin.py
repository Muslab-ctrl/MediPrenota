from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import models, schemas
from app.database import SessionLocal

router = APIRouter(prefix="/admin", tags=["Amministrazione"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/dottori")
def lista_completa_dottori(db: Session = Depends(get_db)):
    dottori = db.query(models.Dottore).all()
    risultato = []
    for d in dottori:
        orari_occupati = []
        for p in d.prenotazioni:
            if p.stato != models.StatoPrenotazione.CANCELLED:
                if hasattr(p.data_ora, "strftime"):
                    orari_occupati.append(p.data_ora.strftime("%Y-%m-%d %H:%M"))
                else:
                    orari_occupati.append(str(p.data_ora).replace("T", " ")[:16])

        risultato.append({
            "id": d.id,
            "full_name": d.full_name,
            "specialization": d.specialization,
            "studio_indirizzo": d.studio_indirizzo,
            "telefono": d.telefono,
            "orari_occupati": orari_occupati
        })
    return risultato

@router.post("/dottori", response_model=schemas.DottoreRisposta, status_code=status.HTTP_201_CREATED)
def aggiungi_dottore(dottore_in: schemas.DottoreCreate, db: Session = Depends(get_db)):
    nuovo_dottore = models.Dottore(
        full_name=dottore_in.full_name,
        specialization=dottore_in.specialization,
        studio_indirizzo=dottore_in.studio_indirizzo,
        telefono=dottore_in.telefono,
        biografia=dottore_in.biografia,
        anni_esperienza=dottore_in.anni_esperienza
    )
    try:
        db.add(nuovo_dottore)
        db.commit()
        db.refresh(nuovo_dottore)
        return nuovo_dottore
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Errore interno durante il salvataggio nel database.")

@router.get("/appuntamenti-totali", status_code=200)
def lista_appuntamenti_totali(db: Session = Depends(get_db)):
    prenotazioni = db.query(models.Prenotazione).all()
    risultato = []
    for p in prenotazioni:
        risultato.append({
            "id": p.id,
            "data_ora": p.data_ora,
            "codice_ticket": p.codice_ticket,
            "stato": p.stato.value if isinstance(p.stato, models.StatoPrenotazione) else p.stato,
            "paziente": f"{p.utente.nome} {p.utente.cognome}" if p.utente else "Sconosciuto",
            "dottore": p.dottore.full_name if p.dottore else "Sconosciuto"
        })
    return risultato

@router.put("/appuntamenti/{prenotazione_id}/disdici", status_code=200)
def disdici_appuntamento_admin(prenotazione_id: int, db: Session = Depends(get_db)):
    prenotazione = db.query(models.Prenotazione).filter(models.Prenotazione.id == prenotazione_id).first()
    if not prenotazione:
        raise HTTPException(status_code=404, detail="Appuntamento non trovato.")
    
    prenotazione.stato = models.StatoPrenotazione.CANCELLED
    db.commit()
    return {"status": "success"}