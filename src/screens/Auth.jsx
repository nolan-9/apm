import React, { useState} from 'react'
import layoutStyles from '../styles/layout'
import logo from '../../assets/icon.png'
import RegisterForm from '../components/RegisterForm'
import LoginForm from '../components/LoginForm'
import { Image, StyleSheet, View} from 'react-native'

const Auth = () => {
    const [showLogin, setShowLogin] = useState(false)

    const changeForm = () => setShowLogin(!showLogin)

    return (
        <View>
            <Image source={logo} style={layoutStyles.logo} />
            {showLogin ? <LoginForm changeForm={ changeForm } /> : <RegisterForm changeForm={changeForm}/>}
        </View>
    )
}                           

export default Auth

const styles = StyleSheet.create({

})