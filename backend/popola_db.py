# backend/popola_db.py
import os
import hashlib
from datetime import datetime
from app.database import Base, engine, SessionLocal
from app.models import Utente, Dottore, OrarioLavoroDottore, Prenotazione

def cifra_password(password: str) -> str:
    # Usiamo lo stesso identico metodo di cifratura SHA256 del backend
    return hashlib.sha256(password.encode()).hexdigest()

def resetta_e_popola():
    if os.path.exists("sql_app.db"):
        try:
            os.remove("sql_app.db")
            print("🗑️ Vecchio database rimosso.")
        except Exception:
            print("⚠️ Impossibile rimuovere sql_app.db, forse è bloccato da uvicorn.")
            print("🛑 SPEGNI il terminale dove gira uvicorn (Ctrl+C), poi esegui nuovamente questo script.")
            return

    # Crea le tabelle aggiornate da zero
    Base.metadata.create_all(bind=engine)
    print("✨ Nuove tabelle create con i vincoli aggiornati.")

    db = SessionLocal()
    try:
        # 1. Creazione Utenti (Password cifrate in SHA256)
        admin = Utente(
            nome="Musiab", 
            cognome="Butt", 
            email="admin@mediprenota.it", 
            hashed_password=cifra_password("admin123"), 
            telefono="3802161139", 
            is_admin=True
        )
        paziente = Utente(
            nome="Marco", 
            cognome="Rossi", 
            email="marco.rossi@email.com", 
            hashed_password=cifra_password("paziente123"), 
            telefono="3471234567", 
            is_admin=False
        )
        
        db.add(admin)
        db.add(paziente)
        db.flush()  # Genera gli ID per gli utenti (es. paziente.id = 9 o simile)

        # 2. Creazione Medici 
        doc1 = Dottore(full_name="Andrea Bianchi", specialization="Medicina generale", studio_indirizzo="Studio San Giuseppe - Via Roma 123, Milano", telefono="02123456", biografia="Il Dott. Bianchi si occupa di medicina generale con particolare attenzione alla prevenzione.", anni_esperienza=15)
        doc2 = Dottore(full_name="Laura Verdi", specialization="Cardiologia", studio_indirizzo="Centro Medico Italia - Via Torino 45, Milano", telefono="02765432", biografia="Specialista in cardiologia clinica e diagnostica strumentale.", anni_esperienza=12)
        doc3 = Dottore(full_name="Stefano Neri", specialization="Dermatologia", studio_indirizzo="Poliambulatorio Salud - Via Milano 76, Milano", telefono="02987654", biografia="Esperto in dermatologia oncologica e trattamenti laser.", anni_esperienza=8)

        db.add_all([doc1, doc2, doc3])
        db.flush()  # Genera gli ID per i dottori

        # 3. Orari di lavoro settimanali (Lun - Ven)
        giorni = ["Lun", "Mar", "Mer", "Gio", "Ven"]
        for doc in [doc1, doc2, doc3]:
            for giorno in giorni:
                orario_mattina = OrarioLavoroDottore(dottore_id=doc.id, giorno_settimana=giorno, ora_inizio="09:00", ora_fine="13:00")
                orario_pomeriggio = OrarioLavoroDottore(dottore_id=doc.id, giorno_settimana=giorno, ora_inizio="15:00", ora_fine="19:00")
                db.add_all([orario_mattina, orario_pomeriggio])

        # 4. Appuntamenti dimostrativi con ENUM ALLINEATI AL DATABASE inglese ('CONFIRMED', 'PENDING')
        pre1 = Prenotazione(
            utente_id=paziente.id, 
            dottore_id=doc1.id, 
            data_ora=datetime(2026, 6, 20, 10, 0), 
            stato="CONFIRMED",  # Passiamo direttamente la stringa Enum corretta
            codice_ticket="TK-88431"
        )
        pre2 = Prenotazione(
            utente_id=paziente.id, 
            dottore_id=doc2.id, 
            data_ora=datetime(2026, 6, 22, 15, 30), 
            stato="PENDING",    # Passiamo direttamente la stringa Enum corretta
            codice_ticket="TK-12940"
        )
        
        db.add_all([pre1, pre2])
        db.commit()
        print("🎉 Database resettato e popolato con successo con i nuovi Enum di stato validi!")

    except Exception as e:
        db.rollback()
        print(f"❌ Errore durante il popolamento: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    resetta_e_popola()