import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'mercado-simple-token';

export const getSessionToken = () => SecureStore.getItemAsync(TOKEN_KEY);
export const saveSessionToken = (token) => SecureStore.setItemAsync(TOKEN_KEY, token);
export const clearSessionToken = () => SecureStore.deleteItemAsync(TOKEN_KEY);
