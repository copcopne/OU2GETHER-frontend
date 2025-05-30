import { StyleSheet } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";


export default StyleSheet.create({
    name: {
        fontSize: RFValue(17),
        fontWeight: "semibold",
        flexShrink: 1, 
        flexWrap: "wrap", 
        maxWidth: "90%"
    },
    button: {
        margin: 5 ,
        backgroundColor: "#fff",
        paddingVertical: 7,
        borderRadius: 10,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ccc",
    },
    buttonText: {
        color: "#000",
        fontSize: 14,
        fontWeight: "600",
    },
    p: {
        paddingHorizontal: 5,
    },
});
