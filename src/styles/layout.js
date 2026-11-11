import { StyleSheet } from "react-native";

const layoutStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 20,
    },
    logo: {
        width: '100%',
        height: 200, 
        marginBottom: 20, 
        resizeMode: 'contain'
    }
})

export default layoutStyles