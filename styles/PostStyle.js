import { StyleSheet } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";

export default StyleSheet.create({
    container: {
        flex: 1,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#000",
    },
    avatarContainer: {
        alignItems: "center", 
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: "#fff"
    },
    attachment: {
        width: 300,
        height: 400,
        borderRadius: 16,
    },
    r: {
        flexDirection: "row",
        alignItems: "center",
    },
    name: {
        fontSize: RFValue(13),
    }, 
    date: {
        fontSize: RFValue(10),
        color: "#666",
    },
    p: {
        paddingHorizontal:15,
        paddingVertical: 10,
    },
    m_v: {
        marginVertical: 5,
    },
    m_h: {
        marginHorizontal: 5,
    },
    m: {
        margin: 5,
    },
    
});