import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Button, TextInput } from 'react-native-paper'
import formsStyles from '../styles/forms'
import { useFormik, validateYupSchema } from 'formik'
import * as Yup from 'yup'


export default function RegisterForm({ changeForm }) {

    const formik = useFormik({
        initialValues: initialValues(),
        validationSchema: Yup.object(validationSchema()),
        
        onSubmit:(formData) =>{
            console.log(formData)
        }
    })

    return (
        <View>
            <TextInput 
            label= "Correo Electronicoco" 
            style={formsStyles.input}
            onChangeText={(text) => formik.setFieldValue('username')}
            error={formik.errors.email}
            value={formik.values.email}
            />
            <Text>{formirk.errors.email}</Text>
            <TextInput 
            label= "Username" 
            style={formsStyles.input}
            onChangeText={(text) => formik.setFieldValue('username', text)}
            error={formik.errors.username}
            value={formik.values.username}
            />
            <TextInput 
            label= "Password" 
            style={formsStyles.input}
            onChangeText={(text) => formik.setFieldValue('password', text)}
            error={formik.errors.password}
            value={formik.values.password}
            secureTextEntry
            
            />
            <TextInput 
            label= "Repeat Contraseña" 
            style={formsStyles.input}
            onChangeText={(text) => formik.setFieldValue('repeatPassword', text)}
            error={formik.errors.repeatPassword}
            value={formik.values.repeatPassword}
            secureTextEntry
            
            />
            <Button 
            mode="contained" 
            style={formsStyles.btnSuccess}
            onPress={formik.handleSubmit}

            >
                Registrate Dog
            </Button>

            <Button 
            mode="outlined" 
            style={formsStyles.btnText}
            onPress={changeForm}
            >
                Iniciar Sesion
            </Button>
        </View>
    )
}


function initialValues(){
    return{
        email: "",
        username: "",
        password: "",
        repeatPassword: "",
    }
}

function validationSchema(){
    return{
        email: Yup.string().email("El correo no es validó").required(true),
        username: Yup.string().required(true),
        password: Yup.string().required(true),
        repeatPassword: Yup.string().required(true).oneOf([Yup.ref('password')]),
    }
}

const styles = StyleSheet.create({})