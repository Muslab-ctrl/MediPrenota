// frontend_mobile/screens/LoginScreen.tsx
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { INDIRIZZO_BACKEND } from './config';

interface LoginScreenProps {
  onLogin: (utente: any) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [confermaPassword, setConfermaPassword] = useState('');
  
  const [caricamento, setCaricamento] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);

  const validaEmail = (text: string) => {
    const reg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return reg.test(text);
  };

  const gestisciPasswordDimenticata = () => {
    Alert.alert(
      "Recupero Credenziali",
      "Per motivi di sicurezza e privacy medica, contatta l'assistenza del reparto IT o rivolgiti allo sportello della struttura per reimpostare la password."
    );
  };

  const eseguiLogin = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Errore", "Compila tutti i campi richiesti!");
      return;
    }

    if (!validaEmail(email.trim())) {
      Alert.alert("Errore", "L'indirizzo email inserito non è valido.");
      return;
    }

    setCaricamento(true);
    
    fetch(`${INDIRIZZO_BACKEND}/auth/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ 
        email: email.trim(), 
        password: password.trim() 
      })
    })
    .then((res) => {
      if (!res.ok) throw new Error("Email o password errate.");
      return res.json();
    })
    .then((utente) => {
      Alert.alert("Benvenuto", `Accesso eseguito come ${utente.nome || ''} ${utente.cognome || ''}`);
      onLogin(utente);
    })
    .catch((err) => {
      if (err.message.includes("Network request failed") || err.message.includes("timed out")) {
        Alert.alert("Errore di Connessione", "Impossibile raggiungere il server del PC. Verifica che il PC e il telefono siano sulla stessa rete Wi-Fi e che Uvicorn sia attivo.");
      } else {
        Alert.alert("Errore di Login", err.message);
      }
      setPassword('');
    })
    .finally(() => setCaricamento(false));
  };

  const eseguiRegistrazione = () => {
    // Il .trim() rimuove spazi vuoti accidentali inseriti dal correttore automatico dello smartphone
    const emailPulita = email.trim();
    const passwordPulita = password.trim();
    const nomePulito = nome.trim();
    const cognomePulito = cognome.trim();

    if (!emailPulita || !passwordPulita || !nomePulito || !cognomePulito || !confermaPassword.trim()) {
      Alert.alert("Errore", "Tutti i campi sono obbligatori per la registrazione!");
      return;
    }
    if (!validaEmail(emailPulita)) {
      Alert.alert("Errore", "L'indirizzo email inserito non è valido.");
      return;
    }
    if (passwordPulita !== confermaPassword.trim()) {
      Alert.alert("Errore Password", "Le due password inserite non corrispondono!");
      setPassword('');
      setConfermaPassword('');
      return;
    }

    setCaricamento(true);
    
    fetch(`${INDIRIZZO_BACKEND}/auth/register`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: emailPulita,
        password: passwordPulita,
        nome: nomePulito,
        cognome: cognomePulito
      })
    })
    .then((res) => {
      // Se il backend risponde con un errore (es. email duplicata), lo intercettiamo subito
      if (!res.ok) {
        return res.json().then(errData => {
          throw new Error(errData.detail || "Impossibile registrarsi.");
        });
      }
      return res.json();
    })
    .then(() => {
      setCaricamento(false);
      Alert.alert("Account Creato!", "La registrazione è andata a buon fine. Ora puoi effettuare il login.");
      setIsLoginMode(true); // Cambia schermata e torna al login grafico
      setPassword('');
      setConfermaPassword('');
    })
    .catch((err) => {
      setCaricamento(false);
      if (err.message.includes("Network request failed") || err.message.includes("timed out")) {
        Alert.alert("Errore di Rete", "Account creato nel DB, ma la risposta è andata in timeout. Controlla che Uvicorn usi l'host 0.0.0.0");
      } else {
        Alert.alert("Errore di Registrazione", err.message);
      }
      setPassword('');
      setConfermaPassword('');
    })
    .finally(() => setCaricamento(false));
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.cardAutenticazione}>
        
        <View style={styles.bloccoLogo}>
          <Text style={styles.iconaLogo}>💚</Text> 
          <Text style={styles.testoLogo}>MediPrenota</Text>
          <Text style={styles.sloganLogo}>Il tuo appuntamento,{"\n"}la tua salute.</Text>
        </View>

        <Text style={styles.titoloForm}>
          {isLoginMode ? "Accedi al tuo account" : "Crea il tuo account"}
        </Text>
        <Text style={styles.sottoTitoloForm}>
          {isLoginMode ? "" : "Compila i campi per registrarti"}
        </Text>

        {!isLoginMode && (
          <>
            <Text style={styles.label}>Nome</Text>
            <TextInput style={styles.input} placeholder="Inserisci il tuo nome" value={nome} onChangeText={setNome} />

            <Text style={styles.label}>Cognome</Text>
            <TextInput style={styles.input} placeholder="Inserisci il tuo cognome" value={cognome} onChangeText={setCognome} />
          </>
        )}

        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} placeholder="Inserisci la tua email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

        <Text style={styles.label}>Password</Text>
        <TextInput style={styles.input} placeholder={isLoginMode ? "Inserisci la tua password" : "Crea una password"} value={password} onChangeText={setPassword} secureTextEntry />

        {!isLoginMode && (
          <>
            <Text style={styles.label}>Conferma password</Text>
            <TextInput style={styles.input} placeholder="Conferma la password" value={confermaPassword} onChangeText={setConfermaPassword} secureTextEntry />
          </>
        )}

        {isLoginMode && (
          <TouchableOpacity style={styles.bottoneDimenticata} onPress={gestisciPasswordDimenticata}>
            <Text style={styles.testoDimenticata}>Password dimenticata?</Text>
          </TouchableOpacity>
        )}

        {caricamento ? (
          <ActivityIndicator size="small" color="#26775C" style={{ marginVertical: 15 }} />
        ) : (
          <TouchableOpacity style={styles.bottonePrincipale} onPress={isLoginMode ? eseguiLogin : eseguiRegistrazione}>
            <Text style={styles.testoBottonePrincipale}>{isLoginMode ? "Accedi" : "Registrati"}</Text>
          </TouchableOpacity>
        )}

        <View style={styles.divisore}>
          <View style={styles.linea} />
          <Text style={styles.testoDivisore}>oppure</Text>
          <View style={styles.linea} />
        </View>

        <TouchableOpacity style={styles.bottoneSecondario} onPress={() => { setIsLoginMode(!isLoginMode); setPassword(''); setConfermaPassword(''); }}>
          <Text style={styles.testoBottoneSecondario}>
            {isLoginMode ? "Non hai un account? Registrati" : "Hai già un account? Accedi"}
          </Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 20, backgroundColor: '#E4EFEA' },
  cardAutenticazione: { backgroundColor: '#FFFFFF', padding: 25, borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 5 },
  bloccoLogo: { alignItems: 'center', marginBottom: 20 },
  iconaLogo: { fontSize: 40, marginBottom: 5 },
  testoLogo: { fontSize: 26, fontWeight: 'bold', color: '#1A4D3E' },
  sloganLogo: { fontSize: 13, color: '#5A756C', textAlign: 'center', marginTop: 4, lineHeight: 16 },
  titoloForm: { fontSize: 20, fontWeight: 'bold', color: '#1A4D3E', textAlign: 'center', marginTop: 10 },
  sottoTitoloForm: { fontSize: 13, color: '#708880', textAlign: 'center', marginBottom: 15 },
  label: { fontSize: 13, fontWeight: '600', color: '#2B473E', marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#E2E8E5', borderRadius: 10, padding: 12, fontSize: 15, color: '#1A4D3E' },
  bottoneDimenticata: { alignSelf: 'flex-end', marginTop: 8, marginBottom: 15 },
  testoDimenticata: { color: '#26775C', fontSize: 13, fontWeight: '500' },
  bottonePrincipale: { backgroundColor: '#26775C', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 10 },
  testoBottonePrincipale: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  divisore: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  linea: { flex: 1, height: 1, backgroundColor: '#E2E8E5' },
  testoDivisore: { color: '#708880', paddingHorizontal: 10, fontSize: 13 },
  bottoneSecondario: { borderWidth: 1, borderColor: '#26775C', borderRadius: 10, padding: 14, alignItems: 'center' },
  testoBottoneSecondario: { color: '#26775C', fontSize: 15, fontWeight: '600' }
});