import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, ScrollView
} from 'react-native';

const VERDE = '#1A6B4A';
const SFONDO = '#E8F2EC';
const GRIGIO = '#6B8A7A';
const TESTO = '#0D2B1F';

import { INDIRIZZO_BACKEND } from './config';

interface Props {
  utente: any;
  onLogout: () => void;
}

const SPECIALIZZAZIONI = ["Medicina Generale", "Cardiologia", "Pediatria", "Dermatologia", "Oculistica"];

export default function DashboardAdmin({ utente, onLogout }: Props) {
  const [nomeDottore, setNomeDottore] = useState('');
  const [specSelezionata, setSpecSelezionata] = useState('Medicina Generale');
  const [indirizzoStudio, setIndirizzoStudio] = useState('');
  const [telefonoDottore, setTelefonoDottore] = useState('');
  const [orariTesto, setOrariTesto] = useState('Lun - Ven, 09:00 - 16:00');
  const [caricamentoMedico, setCaricamentoMedico] = useState(false);

  const [appuntamenti, setAppuntamenti] = useState<any[]>([]);
  const [caricamentoLista, setCaricamentoLista] = useState(true);

  const caricaTutteLePrenotazioni = () => {
    setCaricamentoLista(true);
    
    const controller = new AbortController();
    const idTimeout = setTimeout(() => controller.abort(), 7000);

    fetch(`${INDIRIZZO_BACKEND}/admin/appuntamenti-totali`, { signal: controller.signal })
      .then((res) => {
        clearTimeout(idTimeout);
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => setAppuntamenti(Array.isArray(data) ? data : []))
      .catch(() => {
        clearTimeout(idTimeout);
        console.log("Errore di rete nel caricamento degli appuntamenti globali.");
      })
      .finally(() => setCaricamentoLista(false));
  };

  useEffect(() => {
    caricaTutteLePrenotazioni();
  }, []);

  const gestisciSalvataggioMedico = () => {
    if (!nomeDottore.trim() || !indirizzoStudio.trim() || !telefonoDottore.trim()) {
      Alert.alert("Attenzione", "Compila tutti i campi obbligatori del medico.");
      return;
    }

    setCaricamentoMedico(true);
    
    const payloadMedico = {
      full_name: nomeDottore.trim(),
      specialization: specSelezionata,
      studio_indirizzo: indirizzoStudio.trim(),
      telefono: telefonoDottore.trim(),
      biografia: `Orari di apertura: ${orariTesto}`,
      anni_esperienza: 5
    };

    // Creiamo un meccanismo di timeout a 7 secondi per evitare il caricamento infinito
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    console.log("Tentativo di invio a:", `${INDIRIZZO_BACKEND}/admin/dottori`);

    fetch(`${INDIRIZZO_BACKEND}/admin/dottori`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payloadMedico),
      signal: controller.signal // Collega il segnale di interruzione
    })
    .then(async (res) => {
      clearTimeout(timeoutId); // Rimuove il timeout se ha risposto in tempo
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Errore di validazione del server.");
      }
      return res.json();
    })
    .then((data) => {
      Alert.alert("Successo 🎉", `Il Dott. ${data.full_name} è stato registrato nel database!`);
      setNomeDottore('');
      setIndirizzoStudio('');
      setTelefonoDottore('');
    })
    .catch((err) => {
      clearTimeout(timeoutId);
      console.error("Dettaglio errore riscontrato:", err);
      if (err.name === 'AbortError') {
        Alert.alert("Errore di Connessione (Timeout)", `Il telefono non riesce a raggiungere il computer a questo indirizzo: ${INDIRIZZO_BACKEND}. Controlla che l'IP del PC sia corretto e che entrambi i dispositivi siano sulla stessa rete Wi-Fi.`);
      } else {
        Alert.alert("Errore", err.message || "Impossibile salvare il medico.");
      }
    })
    .finally(() => setCaricamentoMedico(false));
  };

  const gestisciAnnullamento = (idPrenotazione: number, ticket: string) => {
    Alert.alert(
      "Conferma Azione",
      `Sicuro di voler disdire l'appuntamento ${ticket}?`,
      [
        { text: "Annulla", style: "cancel" },
        {
          text: "Sì, Disdici",
          style: "destructive",
          onPress: () => {
            fetch(`${INDIRIZZO_BACKEND}/admin/appuntamenti/${idPrenotazione}/disdici`, { method: 'PUT' })
            .then((res) => {
              if (!res.ok) throw new Error();
              Alert.alert("Successo", "Appuntamento annullato.");
              caricaTutteLePrenotazioni();
            })
            .catch(() => Alert.alert("Errore", "Impossibile annullare l'appuntamento."));
          }
        }
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.badge}>DASHBOARD MANAGEMENT 🛠️</Text>
          <Text style={styles.titolo}>Admin: {utente?.nome || 'Amministratore'}</Text>
        </View>
        <TouchableOpacity style={styles.bottoneLogout} onPress={onLogout}>
          <Text style={styles.testoLogout}>Esci</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sezioneTitolo}>Aggiungi un Medico e Orari</Text>

        <Text style={styles.label}>Nome e Cognome</Text>
        <TextInput style={styles.input} placeholder="Dott.ssa Valeria Bianchi" value={nomeDottore} onChangeText={setNomeDottore} />

        <Text style={styles.label}>Specializzazione medica</Text>
        <View style={styles.grigliaScelte}>
          {SPECIALIZZAZIONI.map((spec) => (
            <TouchableOpacity
              key={spec}
              style={[styles.chip, specSelezionata === spec && styles.chipAttivo]}
              onPress={() => setSpecSelezionata(spec)}
            >
              <Text style={[styles.testoChip, specSelezionata === spec && styles.testoChipAttivo]}>{spec}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Indirizzo Studio</Text>
        <TextInput style={styles.input} placeholder="Via Alessandro Volta 45" value={indirizzoStudio} onChangeText={setIndirizzoStudio} />

        <Text style={styles.label}>Telefono Ambulatorio</Text>
        <TextInput style={styles.input} placeholder="0301234567" value={telefonoDottore} onChangeText={setTelefonoDottore} keyboardType="phone-pad" />

        <Text style={styles.label}>Orari di Ricevimento Disponibili</Text>
        <TextInput style={styles.input} placeholder="Es: Lun - Ven, 09:00 - 16:00" value={orariTesto} onChangeText={setOrariTesto} />

        {caricamentoMedico ? (
          <ActivityIndicator color={VERDE} style={{ marginTop: 15 }} />
        ) : (
          <TouchableOpacity style={styles.bottoneSalva} onPress={gestisciSalvataggioMedico}>
            <Text style={styles.testoBottoneSalva}>Registra Medico Specialista</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.card}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
          <Text style={styles.sezioneTitolo}>Agende e Prenotazioni Pazienti</Text>
          <TouchableOpacity onPress={caricaTutteLePrenotazioni}>
            <Text style={styles.testoRefresh}>Aggiorna 🔄</Text>
          </TouchableOpacity>
        </View>

        {caricamentoLista ? (
          <ActivityIndicator color={VERDE} />
        ) : appuntamenti.length === 0 ? (
          <Text style={styles.testoVuoto}>Nessuna prenotazione presente nel sistema.</Text>
        ) : (
          appuntamenti.map((item) => (
            <View key={item.id.toString()} style={styles.itemAppuntamento}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.ticketCodice}>{item.codice_ticket} • {item.data_ora}</Text>
                <Text style={styles.infoRiga}>Paziente: <Text style={{ fontWeight: '700', color: TESTO }}>{item.paziente}</Text></Text>
                <Text style={styles.infoRiga}>Medico: {item.dottore}</Text>
                <Text style={[styles.statoTesto, item.stato === 'Annullato' ? { color: '#DC2626' } : { color: '#16A34A' }]}>
                  Stato: {item.stato}
                </Text>
              </View>

              {item.stato !== 'Annullato' && (
                <TouchableOpacity style={styles.bottoneAnnulla} onPress={() => gestisciAnnullamento(item.id, item.codice_ticket)}>
                  <Text style={styles.testoAnnulla}>Disdici</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, backgroundColor: SFONDO },
  header: { backgroundColor: TESTO, padding: 18, borderRadius: 14, marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { color: '#A9DFBF', fontWeight: 'bold', fontSize: 10, letterSpacing: 0.8 },
  titolo: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', marginTop: 2 },
  bottoneLogout: { backgroundColor: '#DC2626', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  testoLogout: { color: '#fff', fontWeight: '700', fontSize: 12 },
  card: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.04, elevation: 2 },
  sezioneTitolo: { fontSize: 15, fontWeight: '700', color: TESTO },
  label: { fontSize: 12, fontWeight: '600', color: TESTO, marginBottom: 4, marginTop: 12 },
  input: { backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#E2EFE8', borderRadius: 8, padding: 10, fontSize: 14, color: TESTO },
  grigliaScelte: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4, marginBottom: 4 },
  chip: { backgroundColor: '#F0F7F4', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#D1E5DB' },
  chipAttivo: { backgroundColor: VERDE, borderColor: VERDE },
  testoChip: { color: GRIGIO, fontSize: 12, fontWeight: '500' },
  testoChipAttivo: { color: '#FFFFFF', fontWeight: '700' },
  bottoneSalva: { backgroundColor: VERDE, borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 18 },
  testoBottoneSalva: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  testoRefresh: { color: VERDE, fontWeight: '700', fontSize: 13 },
  testoVuoto: { textAlign: 'center', color: GRIGIO, marginVertical: 14, fontSize: 13 },
  itemAppuntamento: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E2EFE8', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ticketCodice: { fontSize: 14, fontWeight: '700', color: TESTO },
  infoRiga: { fontSize: 13, color: GRIGIO, marginTop: 2 },
  statoTesto: { fontSize: 12, fontWeight: '700', marginTop: 4 },
  bottoneAnnulla: { backgroundColor: '#FEF2F2', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, borderWidth: 1, borderColor: '#FEE2E2' },
  testoAnnulla: { color: '#DC2626', fontWeight: '700', fontSize: 12 }
});