from pydantic import BaseModel, Field, field_validator
import re
from typing import Optional
from datetime import datetime

# --- SCHEMI UTENTE ---
class LoginInput(BaseModel):
    """Schema dedicato solo al login - risolve il 422"""
    email: str
    password: str

class UtenteCreate(BaseModel):
    email: str
    password: str
    nome: Optional[str] = None
    cognome: Optional[str] = None

class UtenteRisposta(BaseModel):
    id: int
    email: str
    is_admin: bool

    class Config:
        from_attributes = True

class LoginRisposta(BaseModel):
    messaggio: str = ""
    id: int
    email: str
    nome: Optional[str] = None
    cognome: Optional[str] = None
    is_admin: bool

# --- SCHEMI DOTTORE ---
class DottoreCreate(BaseModel):
    full_name: str
    specialization: str
    studio_indirizzo: Optional[str] = None
    telefono: Optional[str] = None
    biografia: Optional[str] = None
    anni_esperienza: Optional[int] = None

    @field_validator('telefono')
    @classmethod
    def valida_telefono(cls, v):
        
        clean_phone = re.sub(r'[\s\-()]', '', v)
        
        if not re.match(r'^\+?[0-9]+$', clean_phone):
            raise ValueError("Il numero di telefono può contenere solo cifre ed eventualmente il prefisso '+'")
        
        if len(clean_phone) < 6 or len(clean_phone) > 15:
            raise ValueError("Il numero di telefono deve essere compreso tra 6 e 15 cifre")
            
        return v

class DottoreRisposta(BaseModel):
    id: int
    full_name: str
    specialization: str
    studio_indirizzo: Optional[str] = None
    telefono: Optional[str] = None
    biografia: Optional[str] = None
    anni_esperienza: Optional[int] = None

    class Config:
        from_attributes = True

# --- SCHEMI PRENOTAZIONE ---
class PrenotazioneCreate(BaseModel):
    utente_id: int
    dottore_id: int
    data_ora: datetime

class PrenotazioneRisposta(BaseModel):
    id: int
    utente_id: int
    dottore_id: int
    data_ora: datetime
    codice_ticket: str
    stato: str

    class Config:
        from_attributes = True