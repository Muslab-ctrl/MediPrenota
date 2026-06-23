import React, { useState } from 'react';
import { View } from 'react-native';

import LoginScreen from '../screens/LoginScreen';
import DashboardPaziente from '../screens/DashboardPaziente';
import ScegliMedico from '../screens/ScegliMedico';
import PrenotaAppuntamento from '../screens/PrenotaAppuntamento';
import MieiAppuntamenti from '../screens/MieiAppuntamenti';
import DashboardAdmin from '../screens/DashboardAdmin';

type Schermata = 'login' | 'dashboard' | 'medici' | 'prenota' | 'appuntamenti' | 'admin_dashboard';

export default function App() {
  const [utente, setUtente] = useState<any>(null);
  const [schermata, setSchermata] = useState<Schermata>('login');
  const [dottoreSelezionato, setDottoreSelezionato] = useState<any>(null);
  
  const [refreshKey, setRefreshKey] = useState<number>(Date.now());

  const handleLogin = (u: any) => {
    setUtente(u);
    if (u.is_admin === true) {
      setSchermata('admin_dashboard');
    } else {
      setSchermata('dashboard'); 
    }
  };

  const handleLogout = () => {
    setUtente(null);
    setSchermata('login');
  };

  const navigaVersoMedici = () => {
    setRefreshKey(Date.now()); 
    setDottoreSelezionato(null); 
    setSchermata('medici');
  };

  return (
    <View style={{ flex: 1 }}>
      {schermata === 'login' && (
        <LoginScreen onLogin={handleLogin} />
      )}

      {/* RENDERIZZA LA SCHERMATA DELL'AMMINISTRATORE */}
      {schermata === 'admin_dashboard' && utente && (
        <DashboardAdmin utente={utente} onLogout={handleLogout} />
      )}

      {/* SCHERMATE DEDICATE AI PAZIENTI */}
      {schermata === 'dashboard' && utente && (
        <DashboardPaziente
          utente={utente}
          onLogout={handleLogout}
          onVaiMedici={navigaVersoMedici} 
          onVaiAppuntamenti={() => setSchermata('appuntamenti')}
        />
      )}

      {schermata === 'medici' && utente && (
        <ScegliMedico
          key={refreshKey} 
          utente={utente}
          onTorna={() => setSchermata('dashboard')}
          onPrenota={(dottore) => {
            setDottoreSelezionato(dottore);
            setSchermata('prenota');
          }}
        />
      )}

      {schermata === 'prenota' && utente && dottoreSelezionato && (
        <PrenotaAppuntamento
          key={`${dottoreSelezionato.id}-${refreshKey}`}
          utente={utente}
          dottore={dottoreSelezionato}
          onTorna={() => setSchermata('medici')}
          onConferma={() => setSchermata('appuntamenti')}
        />
      )}

      {schermata === 'appuntamenti' && utente && (
        <MieiAppuntamenti
          utente={utente}
          onTorna={() => setSchermata('dashboard')}
        />
      )}
    </View>
  );
}