import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Button, TextInput } from 'react-native-paper'
import formsStyles from '../styles/forms'


export default function LoginForm({changeForm}) {
  return (
    <View>
        <TextInput label= "Correo Electronicoco" style={formsStyles.input}/>
        <TextInput label= "Password" style={formsStyles.input} secureTextEntry/>
        <Button mode="contained" style={formsStyles.btnText}>
            Iniciar Sesion
        </Button>
        
        <Button
            mode="outlined"
            style={formsStyles.btnText}
            onPress={changeForm}
        >
            Registrarse
        </Button>
    </View>
  )
}

const styles = StyleSheet.create({})