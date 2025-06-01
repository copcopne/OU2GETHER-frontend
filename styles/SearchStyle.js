import { StyleSheet } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";


export default StyleSheet.create({
    userContainter: {
        position: "relative",
        paddingVertical: 5,
        paddingHorizontal: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    }, card: {
        padding: 8,
        flexDirection: "row",
        justifyContent: "flex-start",
        backgroundColor: "white",
        borderRadius: 16,
        width: "100%",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginVertical: 5
    }, label: {
        fontSize: 22,
        marginLeft: 10,
        fontWeight: "semibold",
        marginTop: 5
    },
    name: {
        fontSize: RFValue(17),
        fontWeight: "bold",
        flexShrink: 1,
        flexWrap: "wrap",
        maxWidth: "90%"
    },
    button: {
        margin: 5,
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
        fontWeight: "semibold",
    },
    p: {
        paddingHorizontal: 5,
    },
});
