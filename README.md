# 🏥 MediPrenota

Un'applicazione full-stack moderna e performante per la ricerca di medici specialisti e la prenotazione di visite in tempo reale.

Il sistema è strutturato con un'architettura disaccoppiata:

- **Backend** in Python (FastAPI) per la logica di business e la persistenza dei dati
- **Frontend mobile** in React Native (Expo) sviluppato in TypeScript

---

## 🚀 Funzionalità principali

- **Autenticazione utente** - flusso sicuro di registrazione e login
- **Ricerca specialistica** - ricerca dinamica dei medici e dei relativi studi per nome o specializzazione
- **Prenotazione slot** - controllo delle concomitanze orarie in tempo reale per prevenire doppie prenotazioni
- **Gestione appuntamenti** - visualizzazione organizzata delle visite tramite tab suddivisi in *Prossimi*, *Passati* e *Annullati*
- **Disdetta in tempo reale** - aggiornamento istantaneo dello stato sia sul database che sull'interfaccia mobile, con liberazione immediata dello slot per altri pazienti

---

## 🛠️ Stack tecnologico

### Backend
- **Python** - linguaggio core
- **FastAPI** - framework asincrono ad alte prestazioni per API RESTful
- **SQLAlchemy** - ORM per l'astrazione e la gestione del database relazionale
- **SQLite** - database relazionale leggero incorporato
- **Uvicorn** - server ASGI di produzione

### Frontend
- **React Native** con **Expo**
- **TypeScript** - tipizzazione statica per un codice più robusto
- **React Hooks** - gestione dello stato e del ciclo di vita (`useState`, `useEffect`, `useCallback`)

---

## 📦 Installazione e configurazione locale

### Prerequisiti

Prima di procedere, assicurati di avere installato sul tuo PC di sviluppo:

- [Node.js](https://nodejs.org/) (versione LTS raccomandata)
- [Python](https://www.python.org/) (versione 3.10 o superiore - *su Windows ricorda di spuntare "Add Python to PATH" durante l'installazione*)
- [Git](https://git-scm.com/)

### 1. Clonazione del progetto

```bash
git clone https://github.com/Muslab-ctrl/MediPrenota.git
cd MediPrenota
```

### 2. Configurazione e avvio del backend (FastAPI)

1. Spostati nella directory del server:

   ```bash
   cd backend
   ```

2. Crea l'ambiente virtuale per le dipendenze Python:

   ```bash
   # Windows
   python -m venv venv

   # Mac/Linux
   python3 -m venv venv
   ```

3. Attiva l'ambiente virtuale:

   ```bash
   # Windows (Prompt dei comandi)
   venv\Scripts\activate

   # Windows (PowerShell)
   .\venv\Scripts\Activate.ps1

   # Mac/Linux
   source venv/bin/activate
   ```

   Una volta attivato, vedrai `(venv)` all'inizio della riga del terminale.

4. Installa le dipendenze:

   ```bash
   pip install -r requirements.txt
   ```

5. Avvia il server di sviluppo:

   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

   > Il database SQLite `salute.db` viene generato automaticamente nella cartella del backend alla prima chiamata API o al primo avvio del server.

### 3. Configurazione e avvio del frontend (React Native / Expo)

1. Apri un **secondo terminale** (lasciando il primo attivo con il backend in esecuzione) e spostati nella cartella mobile:

   ```bash
   cd frontend_mobile
   ```

2. Installa le dipendenze Node.js:

   ```bash
   npm install
   ```

3. **Allinea l'IP di rete** (fondamentale per testare su dispositivi fisici):

   - Apri il file di configurazione di rete del frontend (es. `config.ts`)
   - Individua la costante `INDIRIZZO_BACKEND` e sostituisci `localhost` con l'indirizzo IP locale della tua macchina (es. `http://192.168.1.50:8000`)
   - Assicurati che PC di sviluppo e smartphone di test siano connessi alla stessa rete Wi-Fi

4. Avvia il server di sviluppo Expo:

   ```bash
   npx expo start
   ```

---

## 📱 Esecuzione e test su smartphone

1. Scarica l'app gratuita **Expo Go** da [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) o [Apple App Store](https://apps.apple.com/it/app/expo-go/id1241737596).
2. Una volta avviato il server Expo nel terminale, comparirà un **QR code**.
3. Inquadra il codice per lanciare l'app:
   - **Android**: apri *Expo Go* e seleziona "Scan QR Code"
   - **iOS**: apri l'app *Fotocamera* nativa, inquadra il codice e tocca il link di reindirizzamento a Expo Go
4. Attendi il completamento del bundle JavaScript: l'app si aprirà sul telefono pronta all'uso.
