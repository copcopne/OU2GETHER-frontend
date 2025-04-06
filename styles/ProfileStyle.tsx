import { StyleSheet } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";

export default StyleSheet.create({
    container: {
        flex: 1,
    },
    cover: {
        width: "100%",
        height: 200,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 50,
        position: "absolute",
        top: -40,
        right: 10,
    },
    name: {
        fontSize: RFValue(20),
        fontWeight: "bold",
        
    },
    bio: {
        fontSize: RFValue(13),
    },
    m: {
        marginHorizontal: 10,
        marginTop: 10,
    },
    username: {
        fontSize: RFValue(12),
        color: "#666",
        marginLeft: 5,
    },
    followerAvatar: {
        width: 20,
        height: 20,
        borderRadius: 50,
    },
    r: {
        flexDirection: "row",
        alignItems: "center",
    },
    button: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#000",
    },
    buttonText: {
        color: "#000",
        fontSize: 16,
        fontWeight: "600",
    },
});