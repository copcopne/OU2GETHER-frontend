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
        justifyContent: "space-between",
    },
    more: {
        marginRight: 0,
    },
    content: {
        fontSize: RFValue(16),
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
        fontSize: RFValue(14),
        fontWeight: "bold",
    },
    date: {
        fontSize: 13,
        color: "#666",
    },
    commentDate: {
        fontSize: 16,
        color: "#666",
    },
    p: {
        paddingTop: 10,
        paddingHorizontal: 8,
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
        justifyContent: "space-between",
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
        fontSize: RFValue(16),
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 6,
        borderTopWidth: 0.5,
        borderColor: '#ccc',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    reactionBox: {
        flexDirection: 'row',
        backgroundColor: '#eeeeee',
        padding: 8,
        borderRadius: 30,
    },
    reactionIcon: {
        borderRadius: 20,
        marginHorizontal: 8,
    },
});
