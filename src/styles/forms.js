import { StyleSheet } from "react-native"
import colors from "./colors"

const formsStyles = StyleSheet.create({
    input: {
        marginBottom: 10,
    },
    btnSuccess: {
        padding: 5,
        backgroundColor: colors.primary,
    },
    btnText: {
        padding: 5,
        marginTop: 10,
        color: colors.primary,
    }
})

export default formsStyles