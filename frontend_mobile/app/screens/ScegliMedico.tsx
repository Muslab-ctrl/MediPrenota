import React, { useEffect, useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView,
  TextInput, ActivityIndicator, Alert
} from 'react-native';

import { INDIRIZZO_BACKEND } from './config';

const VERDE = '#1A6B4A';
const SFONDO = '#E8F2EC';
const GRIGIO = '#6B8A7A';
const TESTO = '#0D2B1F';

interface Props {
  utente: any;
  onTorna: () => void;
  onPrenota: (dottore: any) => void;
}

export default function ScegliMedico({ utente, onTorna, onPrenota }: Props) {
  const [medici, setMedici] = useState<any[]>([]);
  const [caricamento, setCaricamento] = useState(true);
  const [ricerca, setRicerca] = useState('');

  useEffect(() => {
    fetch(`${INDIRIZZO_BACKEND}/admin/dottori`)
      .then(r => r.json())
      .then(data => setMedici(Array.isArray(data) ? data : []))
      .catch(() => Alert.alert("Errore", "Impossibile caricare i medici dal server."))
      .finally(() => setCaricamento(false));
  }, []);

  const filtrati = medici.filter(m => {
    const cercaIn = `${m.full_name || ''} ${m.specialization || ''}`.toLowerCase();
    return cercaIn.includes(ricerca.toLowerCase());
  });

  return (
    // 🟢 FIX 1: Spostato il paddingTop dentro la struttura della topBar per evitare il disallineamento dello sfondo
    <View style={{ flex: 1, backgroundColor: SFONDO }}>
      {/* Top Bar */}
      <View style={s.topBar}>
        <TouchableOpacity onPress={onTorna} style={s.backBtn}>
          <Text style={s.backBtnTesto}>← Indietro</Text>
        </TouchableOpacity>
        <Text style={s.topBarTitolo}>Scegli un Medico</Text>
      </View>

      <View style={{ padding: 16 }}>
        <TextInput
          style={s.ricercaInput}
          placeholder="Cerca per nome o specializzazione..."
          placeholderTextColor={GRIGIO}
          value={ricerca}
          onChangeText={setRicerca}
        />
      </View>

      {caricamento ? (
        <ActivityIndicator color={VERDE} size="large" style={{ marginTop: 40 }} />
      ) : filtrati.length === 0 ? (
        <View style={s.vuoto}>
          <Text style={s.vuotoIcona}>🔍</Text>
          <Text style={s.vuotoTesto}>Nessun medico trovato</Text>
        </View>
      ) : (
        // 🟢 FIX 2: Aggiunto il paddingBottom per permettere uno scorrimento fluido senza tagliare l'ultima card
        <ScrollView 
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {filtrati.map((m) => (
            <View key={m.id} style={s.card}>
              <View style={s.cardAvatar}>
                <Text style={s.cardAvatarTesto}>{(m.full_name || 'D')[0]}</Text>
              </View>
              <View style={s.cardInfo}>
                <Text style={s.cardNome}>{m.full_name}</Text>
                <Text style={s.cardSpec}>🩺 {m.specialization}</Text>
                <Text style={s.cardStudio}>📍 {m.studio_indirizzo || 'Studio Clinico'}</Text>
                {m.anni_esperienza && <Text style={s.cardEsperienza}>Esperienza: {m.anni_esperienza} anni</Text>}
              </View>
              <TouchableOpacity style={s.prenotaBtn} onPress={() => onPrenota(m)}>
                <Text style={s.prenotaBtnTesto}>Scegli</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  // 🟢 FIX 3: Il paddingTop (50px per la notch dei telefoni) adesso è applicato qui. 
  // Essendo bianco, si fonderà nativamente con la barra di stato del telefono eliminando lo sfarfallio.
  topBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingTop: 54, 
    paddingBottom: 16, 
    backgroundColor: '#fff', 
    borderBottomWidth: 1, 
    borderBottomColor: '#D4E8DC' 
  },
  backBtn: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#E8F2EC', borderRadius: 8 },
  backBtnTesto: { color: VERDE, fontWeight: '700' },
  topBarTitolo: { fontSize: 18, fontWeight: '800', color: TESTO, marginLeft: 16 },
  ricercaInput: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#D4E8DC', borderRadius: 12, padding: 12, fontSize: 15, color: TESTO },
  vuoto: { alignItems: 'center', marginTop: 60 },
  vuotoIcona: { fontSize: 44, marginBottom: 8 },
  vuotoTesto: { color: GRIGIO, fontSize: 15, fontWeight: '600' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4 },
  cardAvatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#C5DFD0', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cardAvatarTesto: { fontSize: 18, fontWeight: '700', color: VERDE },
  cardInfo: { flex: 1 },
  cardNome: { fontSize: 16, fontWeight: '700', color: TESTO },
  cardSpec: { fontSize: 13, color: VERDE, fontWeight: '600', marginTop: 2 },
  cardStudio: { fontSize: 12, color: GRIGIO, marginTop: 2 },
  cardEsperienza: { fontSize: 11, color: GRIGIO, fontStyle: 'italic' },
  prenotaBtn: { backgroundColor: VERDE, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  prenotaBtnTesto: { color: '#fff', fontWeight: '700', fontSize: 13 }
});