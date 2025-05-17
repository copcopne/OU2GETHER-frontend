import { StyleSheet } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";

export default StyleSheet.create({
    container: {
        margin: 10
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 5,
    },
    content: {
        fontSize: RFValue(13),
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: "#fff",
        marginRight: 10,
    },
    name: {
        fontSize: RFValue(12),
        fontWeight: "bold",
    },
    date: {
        fontSize: RFValue(10),
        color: "#666",
    },
    p: {
        paddingVertical: 8,
        paddingHorizontal: 5,
    },
    attachment: {
        width: "100%",
        height: 250,
        borderRadius: 8,
        marginVertical: 10,
    },
    r: {
        flexDirection: "row",
        alignItems: "center",
    },
    m_h: {
        marginHorizontal: 5,
    },
    m_v: {
        marginVertical: 3,
    },
    stats: {
        justifyContent: "flex-end",
        marginTop: 5,
    },
    actions: {
        justifyContent: "space-evenly",
        marginTop: 5,
        borderWidth: 1,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        borderColor: "#ddd",
    },
});
