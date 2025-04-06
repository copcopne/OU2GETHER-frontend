import { StyleSheet } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";

export default StyleSheet.create({
    container: {
        // borderRadius: 16,
        // borderWidth: 2,
        // borderColor: "#ddd",
        // backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    content: {
        fontSize: RFValue(14),
    },
    avatar: {
        width: 50,
        height: 50,
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
        paddingVertical: 5,
        paddingHorizontal: 10,
    },
    attachment: {
        width: "100%",
        height: 250,
        borderRadius: 16,
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
        marginVertical: 5,
    },
    stats: {
        justifyContent: "flex-end",
        marginTop: 5,
    },
    actions: {
        justifyContent: "space-evenly",
        marginTop: 10,
        borderWidth: 1,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        borderColor: "#ddd",
    },
    button: {
        backgroundColor: "#fff",
    }
});
