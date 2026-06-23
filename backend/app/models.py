# backend/app/models.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
import enum
from .database import Base

class StatoPrenotazione(str, enum.Enum):
    PENDING = "In attesa"
    CONFIRMED = "Confermato"
    COMPLETED = "Completato"
    CANCELLED = "Annullato"

class Utente(Base):
    __tablename__ = "utenti"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String)
    cognome = Column(String)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    telefono = Column(String, nullable=True)
    is_admin = Column(Boolean, default=False)
    
    prenotazioni = relationship("Prenotazione", back_populates="utente")

class Dottore(Base):
    __tablename__ = "dottori"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String)
    specialization = Column(String)
    studio_indirizzo = Column(String)
    telefono = Column(String)
    biografia = Column(String, nullable=True)
    anni_esperienza = Column(Integer, nullable=True)
    
    orari = relationship("OrarioLavoroDottore", back_populates="dottore")
    prenotazioni = relationship("Prenotazione", back_populates="dottore")

class OrarioLavoroDottore(Base):
    __tablename__ = "orari_dottori"
    id = Column(Integer, primary_key=True, index=True)
    dottore_id = Column(Integer, ForeignKey("dottori.id"))
    giorno_settimana = Column(String) # E.g., 'Lun', 'Mar'
    ora_inizio = Column(String) # E.g., '09:00'
    ora_fine = Column(String) # E.g., '18:00'
    
    dottore = relationship("Dottore", back_populates="orari")

class Prenotazione(Base):
    __tablename__ = "prenotazioni"
    id = Column(Integer, primary_key=True, index=True)
    utente_id = Column(Integer, ForeignKey("utenti.id"))
    dottore_id = Column(Integer, ForeignKey("dottori.id"))
    data_ora = Column(DateTime)
    stato = Column(Enum(StatoPrenotazione), default=StatoPrenotazione.PENDING)
    codice_ticket = Column(String, unique=True)
    
    utente = relationship("Utente", back_populates="prenotazioni")
    dottore = relationship("Dottore", back_populates="prenotazioni")