import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'medi_prenota_jwt_token';

export const TokenStorage = {
  saveToken: async (token: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch (error) {
      console.error("Errore nel salvataggio sicuro del token:", error);
    }
  },

  getToken: async (): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error("Errore nel recupero sicuro del token:", error);
      return null;
    }
  },

  removeToken: async (): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error("Errore nella rimozione del token:", error);
    }
  }
};