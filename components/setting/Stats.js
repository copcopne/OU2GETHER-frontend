import { View } from "react-native";
import WebView from "react-native-webview";

const Stats = () => {

    return <View style={{ flex: 1 }}>
        <WebView
            source={{
                uri: 'https://copcopne.pythonanywhere.com/admin/stats/',
            }}
        />
    </View>
};
export default Stats;