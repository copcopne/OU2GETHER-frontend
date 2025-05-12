import { Button, Text } from "react-native-paper";
import LoginStyle from "../../styles/LoginStyle";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";

const Anonymous = () => {
    const nav = useNavigation();
    return (
        <View style={[LoginStyle.container, LoginStyle.p]}>
            <Text style={LoginStyle.subTitle}>Chào mừng bạn đến với</Text>
            <Text style={LoginStyle.title}>OU2GETHER</Text>
            <Button
                mode="contained"
                onPress={() => nav.navigate("login")}>
                    Đăng nhập
            </Button>
            <Button
                mode="contained-tonal" style={{ marginTop: 16 }}
                onPress={() => nav.navigate("register")}>
                    Đăng ký
            </Button>
        </View>
    );
};
export default Anonymous;