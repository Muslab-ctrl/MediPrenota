import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert
} from 'react-native';

import { INDIRIZZO_BACKEND } from './config'; 

const VERDE = '#1A6B4A';
const SFONDO = '#E8F2EC';
const GRIGIO = '#6B8A7A';
const TESTO = '#0D2B1F';

const ROSSO_SFONDO = '#FADBD8';
const ROSSO_TESTO = '#922B21';
const ROSSO_BORDO = '#F5B7B1';

interface Props {
  utente: any;
  dottore: any;
  onTorna: () => void;
  onConferma: () => void;
}

const ORE_DISPONIBILI = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'];

const generaGiorniDisponibili = () => {
  const giorni = [];
  const oggi = new Date();
  
  for (let i = 0; i < 5; i++) {
    const dataVisualizzata = new Date(oggi);
    dataVisualizzata.setDate(oggi.getDate() + i);
    
    const giorno = String(dataVisualizzata.getDate()).padStart(2, '0');
    const mese = String(dataVisualizzata.getMonth() + 1).padStart(2, '0');
    const anno = dataVisualizzata.getFullYear();
    
    giorni.push(`${giorno}/${mese}/${anno}`);
  }
  return giorni;
};

export default function PrenotaAppuntamento({ utente, dottore, onTorna, onConferma }: Props) {
  const [giornoSelezionato, setGiornoSelezionato] = useState<string | null>(null);
  const [oraSelezionata, setOraSelezionata] = useState<string | null>(null);
  const [caricamento, setCaricamento] = useState(false);

  const GIORNI_DISPONIBILI = generaGiorniDisponibili();

  const gestisciPrenotazione = () => {
    if (!giornoSelezionato || !oraSelezionata) {
      Alert.alert("Attenzione", "Seleziona giorno e orario.");
      return;
    }

    setCaricamento(true);

    const [giorno, mese, anno] = giornoSelezionato.split('/');
    const [ora, minuto] = oraSelezionata.split(':');

    const dataLocaleISO = `${anno}-${mese.padStart(2, '0')}-${giorno.padStart(2, '0')}T${ora}:${minuto}:00`;

    const payloadPrenotazione = {
      utente_id: Number(utente.id), 
      dottore_id: Number(dottore.id),
      data_ora: dataLocaleISO
    };

    fetch(`${INDIRIZZO_BACKEND}/prenotazioni/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payloadPrenotazione)
    })
    .then(async (res) => {
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail ? errorData.detail : "Slot occupato o errore.");
      }
      return res.json();
    })
    .then((data) => {
      Alert.alert(
        "Prenotazione Confermata 🎉", 
        `Visita registrata con successo.\nCodice Ticket: ${data.codice_ticket}`,
        [{ text: "OK", onPress: onConferma }]
      );
    })
    .catch((err) => {
      Alert.alert("Errore di Prenotazione", err.message);
    })
    .finally(() => setCaricamento(false));
  };
  
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titolo}>Prenota una Visita</Text>
      <Text style={styles.sottoTitolo}>Specialista: <Text style={{fontWeight: '700'}}>{dottore.full_name}</Text></Text>
      
      {/* SEZIONE 1: SCELTA DEL GIORNO */}
      <View style={styles.card}>
        <Text style={styles.sezioneTitolo}>1. Seleziona il Giorno</Text>
        <Text style={styles.infoStudio}>📍 Studio: {dottore.studio_indirizzo}</Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.giorniSlider}>
          {GIORNI_DISPONIBILI.map((giorno) => (
            <TouchableOpacity
              key={giorno}
              style={[styles.giornoChip, giornoSelezionato === giorno && styles.giornoChipSelezionato]}
              onPress={() => {
                setGiornoSelezionato(giorno);
                setOraSelezionata(null); 
              }}
            >
              <Text style={[styles.giornoTesto, giornoSelezionato === giorno && styles.giornoTestoSelezionato]}>
                {giorno === GIORNI_DISPONIBILI[0] ? "Oggi" : giorno.substring(0, 5)}
              </Text>
              <Text style={[styles.giornoSottoTesto, giornoSelezionato === giorno && styles.giornoTestoSelezionato]}>
                {giornoSelezionato === giorno ? "Scelto" : "Disponibile"}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* SEZIONE 2: SCELTA DELL'ORARIO */}
      <View style={styles.card}>
        <Text style={styles.sezioneTitolo}>2. Seleziona l'Orario</Text>
        <Text style={styles.infoStudio}>
          {!giornoSelezionato ? "⚠️ Seleziona prima un giorno per vedere gli orari" : "Orari disponibili per la giornata:"}
        </Text>
        
        <View style={styles.oreGriglia}>
          {ORE_DISPONIBILI.map((ora) => {
            let isOccupato = false;
            
            if (giornoSelezionato) {
              const [g, m, a] = giornoSelezionato.split('/');
              const slotFormattato = `${a}-${m.padStart(2, '0')}-${g.padStart(2, '0')} ${ora}`;
              
              isOccupato = dottore.orari_occupati?.includes(slotFormattato);
            }

            return (
              <TouchableOpacity
                key={ora}
                disabled={isOccupato || !giornoSelezionato}
                style={[
                  styles.oraChip, 
                  oraSelezionata === ora && styles.oraChipSelezionata,
                  isOccupato && styles.oraChipOccupata
                ]}
                onPress={() => setOraSelezionata(ora)}
              >
                <Text style={[
                  styles.oraTesto, 
                  oraSelezionata === ora && styles.oraTestoSelezionato,
                  isOccupato && styles.oraTestoOccupato
                ]}>
                  {ora} {isOccupato ? "🚫" : ""}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* BARRA AZIONI */}
      <View style={styles.bottoniBarra}>
        <TouchableOpacity style={styles.bottoneAnnulla} onPress={onTorna}>
          <Text style={styles.testoAnnulla}>Annulla</Text>
        </TouchableOpacity>

        {caricamento ? (
          <ActivityIndicator color={VERDE} style={{ flex: 1 }} />
        ) : (
          <TouchableOpacity 
            style={[styles.bottoneInvia, (!giornoSelezionato || !oraSelezionata) && { backgroundColor: '#A9DFBF', opacity: 0.7 }]} 
            disabled={!giornoSelezionato || !oraSelezionata}
            onPress={gestisciPrenotazione}
          >
            <Text style={styles.testoInvia}>Conferma Visita 📅</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, backgroundColor: SFONDO },
  titolo: { fontSize: 20, fontWeight: '700', color: TESTO, marginTop: 10 },
  sottoTitolo: { fontSize: 14, color: GRIGIO, marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2 },
  sezioneTitolo: { fontSize: 15, fontWeight: '700', color: TESTO, marginBottom: 4 },
  infoStudio: { fontSize: 13, color: GRIGIO, marginBottom: 12 },
  giorniSlider: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  giornoChip: { backgroundColor: '#F0F7F4', borderWidth: 1, borderColor: '#D1E5DB', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, alignItems: 'center', minWidth: 85 },
  giornoChipSelezionato: { backgroundColor: VERDE, borderColor: VERDE },
  giornoTesto: { fontSize: 13, fontWeight: '700', color: TESTO },
  giornoSottoTesto: { fontSize: 10, color: GRIGIO, marginTop: 2 },
  giornoTestoSelezionato: { color: '#fff' },
  oreGriglia: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between', marginTop: 4 },
  oraChip: { backgroundColor: '#FAFAFA', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: '#D4E8DC', width: '30%', alignItems: 'center' },
  oraChipSelezionata: { backgroundColor: VERDE, borderColor: VERDE },
  oraChipOccupata: { backgroundColor: ROSSO_SFONDO, borderColor: ROSSO_BORDO },
  oraTesto: { fontSize: 13, fontWeight: '600', color: TESTO },
  oraTestoSelezionato: { color: '#fff' },
  oraTestoOccupato: { color: ROSSO_TESTO, fontWeight: 'bold' },
  bottoniBarra: { flexDirection: 'row', gap: 12, marginTop: 10, marginBottom: 20 },
  bottoneAnnulla: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#C5D8CE', padding: 14, borderRadius: 10, alignItems: 'center' },
  testoAnnulla: { color: GRIGIO, fontWeight: '700' },
  bottoneInvia: { flex: 2, backgroundColor: VERDE, padding: 14, borderRadius: 10, alignItems: 'center' },
  testoInvia: { color: '#fff', fontWeight: '700' }
});