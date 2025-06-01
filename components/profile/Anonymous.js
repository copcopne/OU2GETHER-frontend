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
                buttonColor="#1c85fc"
                onPress={() => nav.navigate("login")}>
                    Đăng nhập
            </Button>
            <Button
                mode="contained" style={{ marginTop: 15 }}
                buttonColor="#e7f3ff"
                textColor="black"
                onPress={() => nav.navigate("register")}>
                    Đăng ký
            </Button>
        </View>
    );
};
export default Anonymous;