import { Dimensions, StyleSheet } from "react-native";

const numColumns = 2;
const tileSize = Dimensions.get("window").width / numColumns - 24;


export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    grid: {
        margin: 0,
        padding: 5,
        paddingBottom: 100
    },
    tile: {
        backgroundColor: '#f2f2f2',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 10,
        alignItems: 'baseline',
        justifyContent: 'flex-start',
        margin: 8,
        width: tileSize,
        elevation: 2,
    },
    tileText: {
        marginTop: 8,
        fontSize: 14,
        textAlign: 'center',
        fontWeight: '500'
    },
});