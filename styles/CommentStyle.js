import { StyleSheet } from "react-native";

export default StyleSheet.create({
    rowDirection : {
        flexDirection: "row", 
        alignItems: "center",
        justifyContent: "space-between"
    },
    reactionLabel : {
        fontSize: 16,
        fontWeight: "500", 
        marginLeft: 10 
    }, 
    actionButtonText: {
        fontSize: 16, 
        fontWeight: "600", 
        marginHorizontal: 20
    },
    optionsBox: {
        backgroundColor: "#eeeeee", 
        width: "100%", 
        alignItems: "center"
    },
    option: {
        backgroundColor: "#b9b9b9",
        padding: 20, 
        width: '100%', 
        alignItems: 'center'
    },
    commentContainer: {
        padding: 8,
        borderColor: "#f2f2f2", 
        borderBottomWidth: 1
    }
});