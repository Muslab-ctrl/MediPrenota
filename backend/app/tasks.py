import time

def invia_notifica_promemoria_task(codice_ticket: str, email_utente: str):
    """
    Simulazione task asincrono in background per l'invio 
    del promemoria di visita 24 ore prima dell'appuntamento.
    """
    print(print(f"[BACKGROUND TASK START] Preparazione email per {email_utente}..."))
    time.sleep(2)
    print(f"[BACKGROUND TASK SUCCESS] Email inviata per il Ticket {codice_ticket}!")
    return True