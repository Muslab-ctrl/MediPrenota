# 🏥 MediPrenota

Un'applicazione Full-Stack moderna e performante per la ricerca di medici specialisti e la prenotazione di visite in tempo reale. Il sistema è strutturato con un'architettura disaccoppiata: un **Backend in Python (FastAPI)** per la logica di business e la persistenza dei dati, e un **Frontend Mobile in React Native (Expo)** sviluppato in TypeScript.

---

## 🚀 Funzionalità Principali

* **Autenticazione Utente**: Flusso sicuro di registrazione e login.
* **Ricerca Specialistica**: Ricerca dinamica dei medici e dei relativi studi per nome o specializzazione.
* **Prenotazione Slot**: Controllo delle concomitanze orarie in tempo reale per prevenire doppie prenotazioni.
* **Gestione Appuntamenti**: Visualizzazione organizzata delle visite tramite Tab suddivisi in *Prossimi*, *Passati* e *Annullati*.
* **Disdetta Real-Time**: Aggiornamento istantaneo dello stato sia sul database locale che sul componente di interfaccia grafica mobile, rendendo lo slot immediatamente disponibile per altri pazienti.

---

## 🛠️ Stack Tecnologico

### Backend
* **Python** (Linguaggio core)
* **FastAPI** (Framework asincrono ad alte prestazioni per lo sviluppo di API RESTful)
* **SQLAlchemy** (ORM per l'astrazione e la gestione del database relazionale)
* **SQLite** (Database relazionale leggero incorporato)
* **Uvicorn** (Server ASGI di produzione)

### Frontend
* **React Native** con **Expo Ecosystem**
* **TypeScript** (Tipizzazione statica per un codice più robusto)
* **React Hooks** (Gestione avanzata dello stato e del ciclo di vita con `useState`, `useEffect`, `useCallback`)

---

## 📦 Installazione e Configurazione Locale

### Prerequisiti
Prima di procedere con l'avvio, assicurati di aver installato sul tuo PC di sviluppo:
* [Node.js](https://nodejs.org/) (Versione LTS raccomandata)
* [Python](https://www.python.org/) (Versione 3.10 o superiore. *Nota per Windows: spuntare la casella "Add Python to PATH" durante l'installazione*)
* [Git](https://git-scm.com/)

---

### 1. Clonazione del Progetto
Apri il terminale del tuo computer ed esegui il comando per scaricare il codice dalla tua repository:
```bash
git clone [https://github.com/Muslab-ctrl/MediPrenota.git](https://github.com/Muslab-ctrl/MediPrenota.git)
cd MediPrenota

```

---

### 2. Configurazione e Avvio del Backend (FastAPI)

1. Spostati nella directory dedicata al server:
```bash
cd backend

```


2. Crea l'ambiente virtuale isolato per le dipendenze Python:
* **Windows**:
```bash
python -m venv venv

```


* **Mac/Linux**:
```bash
python3 -m venv venv

```




3. Attiva l'ambiente virtuale:
* **Windows (Prompt dei comandi)**:
```bash
venv\Scripts\activate

```


* **Windows (PowerShell)**:
```bash
.\venv\Scripts\Activate.ps1

```


* **Mac/Linux**:
```bash
source venv/bin/activate

```




*(Una volta attivato, noterai la dicitura `(venv)` all'inizio della riga del terminale)*
4. Installa tutti i pacchetti necessari tramite il gestore di pacchetti `pip`:
```bash
pip install -r requirements.txt

```


5. Avvia il server di sviluppo locale:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

```



*Nota: Il database SQLite `salute.db` verrà autogenerato e configurato nella cartella del backend alla primissima chiamata API o avvio del server.*

---

### 3. Configurazione e Avvio del Frontend (React Native / Expo)

1. Apri un **secondo terminale** (lasciando il primo in esecuzione con il backend attivo) e spostati nella cartella mobile:
```bash
cd frontend_mobile

```


2. Installa tutti i moduli e i pacchetti Node.js richiesti dal progetto:
```bash
npm install

```


3. **Allineamento dell'IP di rete (Fondamentale per dispositivi fisici)**:
* Apri con il tuo editor il file di configurazione di rete del frontend (es. `config.ts`).
* Individua la costante `INDIRIZZO_BACKEND` e sostituisci `localhost` con l'indirizzo IP locale della tua macchina (ad esempio: `http://192.168.1.50:8000`).
* *Assicurati che sia il PC di sviluppo che lo smartphone di test siano connessi sotto la stessa identica rete Wi-Fi.*


4. Inizia la sessione di sviluppo di Expo:
```bash
npx expo start

```



---

## 📱 Esecuzione e Test su Smartphone

1. Scarica l'applicazione gratuita **Expo Go** disponibile sui rispettivi store digitali ([Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) o [Apple App Store](https://www.google.com/search?q=https://apps.apple.com/it/app/expo-go/id1241737596)).
2. Una volta avviato il server Expo nel terminale del computer, vedrai comparire un grande **Codice QR**.
3. Inquadra il codice QR per lanciare l'applicazione:
* **Dispositivi Android**: Apri l'app *Expo Go* e seleziona la voce "Scan QR Code".
* **Dispositivi iOS (iPhone)**: Apri l'app *Fotocamera* nativa del telefono, inquadra il codice e clicca sul link giallo di reindirizzamento a Expo Go.


4. Attendi pochi secondi il completamento del bundle JavaScript: l'applicazione si aprirà sullo schermo del tuo telefono pronta per essere utilizzata!

```

```
