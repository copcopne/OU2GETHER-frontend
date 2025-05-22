import { StyleSheet } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";

export default StyleSheet.create({
    container: {
        backgroundColor: "#fff",
        marginVertical: 3,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
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
        paddingTop: 12,
        paddingHorizontal: 10,
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
        justifyContent: "space-around",
        marginTop: 5,
    },
    createPostButton: {
        paddingVertical: 10,
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: "white",
        width: "100%",
    },
    caption: {
        marginTop: 5,
        color: "#666",
        fontSize: RFValue(12),
    },
});
