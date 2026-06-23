import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert, RefreshControl, Modal
} from 'react-native';

const VERDE = '#1A6B4A';
const SFONDO = '#E8F2EC';
const GRIGIO = '#6B8A7A';
const TESTO = '#0D2B1F';

import { INDIRIZZO_BACKEND } from './config';

// Mappatura corretta basata sui valori in italiano reali del Database
const COLORI_STATO: Record<string, string> = {
  'Confermato': '#10B981',
  'Annullato': '#EF4444',
};

interface Props {
  utente: any;
  onTorna: () => void;
}

type Tab = 'Prossimi' | 'Passati' | 'Annullati';

export default function MieiAppuntamenti({ utente, onTorna }: Props) {
  const [appuntamenti, setAppuntamenti] = useState<any[]>([]);
  const [caricamento, setCaricamento] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [tabAttiva, setTabAttiva] = useState<Tab>('Prossimi');
  const [appuntamentoSelezionato, setAppuntamentoSelezionato] = useState<any | null>(null);

  const caricaAppuntamenti = useCallback(() => {
    fetch(`${INDIRIZZO_BACKEND}/prenotazioni/utente/${utente.id}`)
      .then(r => r.json())
      .then(data => {
        // 🟢 Allineamento col DB: Il backend usa direttamente le stringhe "Confermato" e "Annullato"
        const mappati = (Array.isArray(data) ? data : []).map((ap: any) => {
          return { 
            ...ap, 
            statoInterno: ap.stato // Mappiamo direttamente lo stato pulito restituito
          };
        });
        setAppuntamenti(mappati);
      })
      .catch(() => Alert.alert("Errore", "Impossibile caricare gli appuntamenti."))
      .finally(() => { setCaricamento(false); setRefresh(false); });
  }, [utente.id]);

  useEffect(() => { caricaAppuntamenti(); }, [caricaAppuntamenti]);

  const ora = new Date();
  const filtrati = appuntamenti.filter(a => {
    const data = new Date(a.data_ora);
    if (tabAttiva === 'Prossimi') return data >= ora && a.statoInterno !== 'Annullato';
    if (tabAttiva === 'Passati') return data < ora && a.statoInterno !== 'Annullato';
    if (tabAttiva === 'Annullati') return a.statoInterno === 'Annullato';
    return true;
  }).sort((a, b) => {
    const da = new Date(a.data_ora).getTime();
    const db = new Date(b.data_ora).getTime();
    return tabAttiva === 'Passati' ? db - da : da - db;
  });

  const tabs: Tab[] = ['Prossimi', 'Passati', 'Annullati'];

  const eseguiDisdetta = (idPrenotazione: number) => {
    Alert.alert(
      "Disdici Appuntamento",
      "Vuoi davvero annullare questa visita medica? L'orario tornerà disponibile per altri pazienti.",
      [
        { text: "No", style: "cancel" },
        { 
          text: "Sì", // C'è solo "Sì" al posto di "Sì, Annulla"
          style: "destructive", 
          onPress: () => {
            fetch(`${INDIRIZZO_BACKEND}/prenotazioni/${idPrenotazione}/disdici`, {
              method: 'PUT',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              }
            })
            .then((res) => {
              if (!res.ok) throw new Error();

              // 🟢 Aggiornamento locale immediato usando la stringa corretta "Annullato"
              setAppuntamenti(prevAppuntamenti => 
                prevAppuntamenti.map(ap => {
                  if (ap.id === idPrenotazione) {
                    return { ...ap, stato: 'Annullato', statoInterno: 'Annullato' };
                  }
                  return ap;
                })
              );

              Alert.alert("Annullato 🎉", "Il tuo appuntamento è stato disdetto con successo.");
              caricaAppuntamenti(); // Sincronizzazione pulita di controllo col backend
            })
            .catch(() => Alert.alert("Errore", "Impossibile completare la disdetta. Riprova."));
          }
        }
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: SFONDO }}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={onTorna} style={s.backBtn}>
          <Text style={s.backTesto}>← Torna</Text>
        </TouchableOpacity>
        <Text style={s.headerTitolo}>I miei appuntamenti</Text>
        <View style={{ width: 70 }} />
      </View>

      {/* Tabs */}
      <View style={s.tabsRow}>
        {tabs.map(t => (
          <TouchableOpacity key={t} style={[s.tab, tabAttiva === t && s.tabAttiva]} onPress={() => setTabAttiva(t)}>
            <Text style={[s.tabTesto, tabAttiva === t && s.tabTestoAttivo]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {caricamento ? (
        <ActivityIndicator color={VERDE} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refresh} onRefresh={() => { setRefresh(true); caricaAppuntamenti(); }} tintColor={VERDE} />}
        >
          {filtrati.length === 0 ? (
            <View style={s.vuoto}>
              <Text style={s.vuotoIcona}>{tabAttiva === 'Prossimi' ? '📅' : tabAttiva === 'Passati' ? '📋' : '🚫'}</Text>
              <Text style={s.vuotoTesto}>
                {tabAttiva === 'Prossimi' ? 'Nessun appuntamento in programma' :
                 tabAttiva === 'Passati' ? 'Nessuna visita passata' : 'Nessun appuntamento annullato'}
              </Text>
            </View>
          ) : (
            filtrati.map((a, i) => (
              <CardAppuntamento 
                key={i} 
                ap={a} 
                mostraDisdici={tabAttiva === 'Prossimi'} 
                onRichiediDisdetta={eseguiDisdetta} 
                onSeleziona={() => setAppuntamentoSelezionato(a)}
              />
            ))
          )}
          <View style={{ height: 30 }} />
        </ScrollView>
      )}

      {/* POP-UP DETTAGLI APPUNTAMENTO */}
      {appuntamentoSelezionato && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={appuntamentoSelezionato !== null}
          onRequestClose={() => setAppuntamentoSelezionato(null)}
        >
          <View style={s.modalOverlay}>
            <View style={s.modalContent}>
              <Text style={s.modalTitolo}>Dettagli Visita</Text>
              <View style={s.divider} />

              <View style={s.infoRow}>
                <Text style={s.infoLabel}>👨‍⚕️ Specialista:</Text>
                <Text style={s.infoValore}>
                  {appuntamentoSelezionato.dottore?.full_name || `Dottore (ID: ${appuntamentoSelezionato.dottore_id})`}
                </Text>
              </View>

              <View style={s.infoRow}>
                <Text style={s.infoLabel}>🩺 Ambito:</Text>
                <Text style={s.infoValore}>{appuntamentoSelezionato.dottore?.specialization || "Visita Medica"}</Text>
              </View>

              <View style={s.infoRow}>
                <Text style={s.infoLabel}>📅 Data e Ora:</Text>
                <Text style={s.infoValore}>
                  {new Date(appuntamentoSelezionato.data_ora).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>

              <View style={s.infoRow}>
                <Text style={s.infoLabel}>📍 Studio Indirizzo:</Text>
                <Text style={s.infoValore}>{appuntamentoSelezionato.dottore?.studio_indirizzo || "Vedi info studio"}</Text>
              </View>

              <View style={s.infoRow}>
                <Text style={s.infoLabel}>🎫 Ticket N°:</Text>
                <Text style={[s.infoValore, { fontWeight: '700', color: VERDE }]}>{appuntamentoSelezionato.codice_ticket}</Text>
              </View>

              <View style={s.infoRow}>
                <Text style={s.infoLabel}>🟢 Stato:</Text>
                <Text style={[s.infoValore, { fontWeight: '700', color: COLORI_STATO[appuntamentoSelezionato.statoInterno] || '#6B7280' }]}>
                  {appuntamentoSelezionato.statoInterno}
                </Text>
              </View>

              <View style={s.divider} />

              <View style={s.modalBottoni}>
                {tabAttiva === 'Prossimi' && appuntamentoSelezionato.statoInterno !== 'Annullato' && (
                  <TouchableOpacity 
                    style={s.popupBottoneDisdici} 
                    onPress={() => {
                      const idDaAnnullare = appuntamentoSelezionato.id;
                      setAppuntamentoSelezionato(null);
                      setTimeout(() => {
                        eseguiDisdetta(idDaAnnullare);
                      }, 300);
                    }}
                  >
                    <Text style={s.testoPopupDisdici}>Disdici questa Visita 🚫</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={s.bottoneChiudi} onPress={() => setAppuntamentoSelezionato(null)}>
                  <Text style={s.testoChiudi}>Chiudi</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

function CardAppuntamento({ ap, mostraDisdici, onRichiediDisdetta, onSeleziona }: { ap: any, mostraDisdici: boolean, onRichiediDisdetta: (id: number) => void, onSeleziona: () => void }) {
  const data = new Date(ap.data_ora);
  const stato = ap.statoInterno;
  const colore = COLORI_STATO[stato] || '#6B7280';

  return (
    <TouchableOpacity style={s.cardContainer} onPress={onSeleziona} activeOpacity={0.8}>
      <View style={s.card}>
        <View style={s.cardData}>
          <Text style={s.cardGiorno}>{data.getDate()}</Text>
          <Text style={s.cardMese}>{data.toLocaleDateString('it-IT', { month: 'short' }).toUpperCase()}</Text>
        </View>

        <View style={s.cardInfo}>
          <View style={s.cardTopRow}>
            <Text style={s.cardOra}>🕐 {data.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</Text>
            <View style={[s.statoBadge, { backgroundColor: colore + '20' }]}>
              <Text style={[s.statoTesto, { color: colore }]}>{stato}</Text>
            </View>
          </View>
          <Text style={s.cardDottore}>
            {ap.dottore?.full_name ? `Dr. ${ap.dottore.full_name}` : `Dottore (ID: ${ap.dottore_id})`}
          </Text>
          <View style={s.ticketRow}>
            <Text style={s.ticketIcona}>🎫</Text>
            <Text style={s.ticketTesto}>{ap.codice_ticket}</Text>
          </View>
        </View>
      </View>

      {mostraDisdici && stato !== 'Annullato' && (
        <TouchableOpacity style={s.bottoneDisdici} onPress={(e) => {
          e.stopPropagation();
          onRichiediDisdetta(ap.id);
        }}>
          <Text style={s.testoBottoneDisdici}>Disdici Visita ❌</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  header: { backgroundColor: '#fff', paddingTop: 54, paddingBottom: 16, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  backBtn: { width: 70 },
  backTesto: { color: VERDE, fontSize: 15, fontWeight: '600' },
  headerTitolo: { fontSize: 17, fontWeight: '700', color: TESTO },
  tabsRow: { flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 18, paddingBottom: 0, borderBottomWidth: 1, borderBottomColor: '#E0EEE8' },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabAttiva: { borderBottomColor: VERDE },
  tabTesto: { fontSize: 13, fontWeight: '600', color: GRIGIO },
  tabTestoAttivo: { color: VERDE },
  scroll: { padding: 16 },
  vuoto: { alignItems: 'center', marginTop: 60 },
  vuotoIcona: { fontSize: 48, marginBottom: 14 },
  vuotoTesto: { color: GRIGIO, fontSize: 15, textAlign: 'center' },
  cardContainer: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 12, paddingBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3, overflow: 'hidden' },
  card: { flexDirection: 'row', padding: 14, paddingBottom: 2 },
  cardData: { width: 54, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8F2EC', borderRadius: 12, marginRight: 14, paddingVertical: 10 },
  cardGiorno: { fontSize: 22, fontWeight: '800', color: VERDE },
  cardMese: { fontSize: 10, fontWeight: '600', color: GRIGIO },
  cardInfo: { flex: 1 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardOra: { fontSize: 14, fontWeight: '600', color: TESTO },
  statoBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statoTesto: { fontSize: 11, fontWeight: '700' },
  cardDottore: { fontSize: 13, color: TESTO, fontWeight: '500', marginBottom: 6 },
  ticketRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ticketIcona: { fontSize: 12 },
  ticketTesto: { fontSize: 12, color: GRIGIO, fontWeight: '500' },
  bottoneDisdici: { backgroundColor: '#FEF2F2', padding: 10, borderRadius: 10, marginHorizontal: 14, alignItems: 'center', borderWidth: 1, borderColor: '#FEE2E2', marginTop: 2 },
  testoBottoneDisdici: { color: '#DC2626', fontWeight: '700', fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 20, width: '100%', maxWidth: 340, elevation: 5 },
  modalTitolo: { fontSize: 18, fontWeight: '700', color: TESTO, textAlign: 'center' },
  divider: { height: 1, backgroundColor: '#E8F2EC', marginVertical: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  infoLabel: { fontSize: 13, fontWeight: '600', color: GRIGIO, width: '40%' },
  infoValore: { fontSize: 13, fontWeight: '600', color: TESTO, width: '60%', textAlign: 'right' },
  modalBottoni: { gap: 10, marginTop: 5 },
  popupBottoneDisdici: { backgroundColor: '#EF4444', padding: 12, borderRadius: 12, alignItems: 'center' },
  testoPopupDisdici: { color: '#fff', fontWeight: '700', fontSize: 13 },
  bottoneChiudi: { backgroundColor: '#F0F7F4', padding: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#D1E5DB' },
  testoChiudi: { color: TESTO, fontWeight: '600', fontSize: 13 }
});