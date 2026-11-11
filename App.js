import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Auth from './src/screens/Auth'
import { PaperProvider } from 'react-native-paper';
import { useState } from 'react';

export default function App() {
    const [auth, setAuth] = useState(undefined)
  
    return (
        <PaperProvider>
            {auth ? <Text>Bienvenidos</Text> : <Auth />}
        </PaperProvider>
    
    
  );
}

const styles = StyleSheet.create({
});
