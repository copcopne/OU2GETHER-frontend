import { StyleSheet } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";

export default StyleSheet.create({
    container: {
        flex: 1,
    },
    cover: {
        width: "100%",
        height: 150,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 50,
        position: "absolute",
        top: -40,
        right: 15,
        borderWidth: 2,
        borderColor: "#fff",
    },
    name: {
        fontSize: RFValue(20),
        fontWeight: "bold",
    },
    bio: {
        fontSize: RFValue(13),
    },
    m: {
        marginHorizontal: 5,
        marginTop: 8,
    },
    username: {
        fontSize: RFValue(12),
        color: "#666",
        marginLeft: 5,
    },
    followerAvatarContainer: {
        flexDirection: "row", 
        alignItems: "center",
    },
    followerAvatar: {
        width: 20,
        height: 20,
        borderRadius: 50,
        borderWidth: 1,
        borderColor: "#fff",
        position: "absolute",
        zIndex: 1,
    },
    secondFollowerAvatar: {
        left: 10,
    },
    followersText: {
        marginLeft: 32,
    },
    r: {
        flexDirection: "row",
        alignItems: "center",
    },
    button: {
        backgroundColor: "#fff",
        paddingVertical: 7,
        borderRadius: 10,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ccc",
    },
    buttonText: {
        color: "#000",
        fontSize: 12,
        fontWeight: "600",
    },
    p: {
        paddingHorizontal: 5,
    },
    actions: {
        flexDirection: 'row', 
        justifyContent: 'space-evenly',
        marginTop: 10,
    },
    postContainer: {
        borderTopWidth: 1,
        borderColor: "#ccc",
        paddingTop: 5,

    }
});
