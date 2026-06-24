import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { TokenStorage } from './tokenStorage';

const VERDE = '#1A6B4A';
const SFONDO = '#E8F2EC';
const GRIGIO = '#6B8A7A';
const TESTO = '#0D2B1F';

interface Props {
  utente: any;
  onLogout: () => void;
  onVaiMedici: () => void;
  onVaiAppuntamenti: () => void;
}

export default function DashboardPaziente({ utente, onLogout, onVaiMedici, onVaiAppuntamenti }: Props) {
  
  const eseguiLogoutSicuro = async () => {
    await TokenStorage.removeToken();
    onLogout();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.saluto}>Gentile Paziente,</Text>
          <Text style={styles.nomeUtente}>{utente?.nome} {utente?.cognome}</Text>
        </View>
        <TouchableOpacity style={styles.bottoneLogout} onPress={eseguiLogoutSicuro}>
          <Text style={styles.testoLogout}>Esci</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.titoloSezione}>Servizi Struttura Sanitaria</Text>

      <TouchableOpacity style={styles.cardServizio} onPress={onVaiMedici}>
        <Text style={styles.iconaCard}>🩺</Text>
        <View style={styles.infoCard}>
          <Text style={styles.titoloCard}>Prenota Visita Specialistica</Text>
          <Text style={styles.descCard}>Trova i medici disponibili, visualizza gli orari di ambulatorio e blocca il tuo posto.</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cardServizio} onPress={onVaiAppuntamenti}>
        <Text style={styles.iconaCard}>📅</Text>
        <View style={styles.infoCard}>
          <Text style={styles.titoloCard}>I Miei Appuntamenti</Text>
          <Text style={styles.descCard}>Visualizza i tuoi ticket attivi, lo stato delle visite e lo storico complessivo.</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: SFONDO, justifyContent: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, backgroundColor: '#fff', padding: 16, borderRadius: 16 },
  saluto: { fontSize: 14, color: GRIGIO },
  nomeUtente: { fontSize: 18, fontWeight: '700', color: TESTO },
  bottoneLogout: { backgroundColor: '#EF4444', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  testoLogout: { color: '#fff', fontWeight: '600', fontSize: 13 },
  titoloSezione: { fontSize: 16, fontWeight: '700', color: TESTO, marginBottom: 15 },
  cardServizio: { backgroundColor: '#fff', borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 16, elevation: 2 },
  iconaCard: { fontSize: 32, marginRight: 16 },
  infoCard: { flex: 1 },
  titoloCard: { fontSize: 15, fontWeight: '700', color: TESTO, marginBottom: 4 },
  descCard: { fontSize: 12, color: GRIGIO, lineHeight: 16 }
});