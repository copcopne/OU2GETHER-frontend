import { TouchableOpacity, View } from "react-native";
import { Icon, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import SettingStyle from "../../styles/SettingStyle";
import { useContext } from "react";
import { DispatchContext, UserContext } from "../../configs/Contexts";
import { useNavigation } from "@react-navigation/native";

const Setting = () => {
    const dispatch = useContext(DispatchContext);
    const currentUser = useContext(UserContext);
    const nav = useNavigation();
    return (
        <SafeAreaView>
            {currentUser.role === 0 ?
                <>
                    <TouchableOpacity
                        onPress={() => nav.navigate("createUser")}
                        style={SettingStyle.button}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
                            <Icon size={32} source="account-plus" />
                            <Text style={SettingStyle.buttonText}>Tạo người dùng mới</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => nav.navigate("verifyUser")}
                        style={SettingStyle.button}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
                            <Icon size={32} source="account-arrow-up" />
                            <Text style={SettingStyle.buttonText}>Xác nhận người dùng</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => nav.navigate("invite")}
                        style={SettingStyle.button}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
                            <Icon size={32} source="email-edit" />
                            <Text style={SettingStyle.buttonText}>Tạo thư mời</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => nav.navigate("stats")}
                        style={SettingStyle.button}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
                            <Icon size={32} source="chart-arc" />
                            <Text style={SettingStyle.buttonText}>Thống kê hệ thống</Text>
                        </View>
                    </TouchableOpacity>
                </> : null
            }
            <TouchableOpacity
                style={SettingStyle.button}
                onPress={() => nav.navigate("changePassword", { userdata: currentUser })}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
                    <Icon size={32} source="form-textbox-password" />
                    <Text style={SettingStyle.buttonText}>Đổi mật khẩu</Text>
                </View>
            </TouchableOpacity>
            <TouchableOpacity
                style={SettingStyle.button}
                onPress={() => dispatch({
                    type: "logout"
                })}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
                    <Icon size={32} source="logout" />
                    <Text style={SettingStyle.buttonText}>Đăng xuất</Text>
                </View>
            </TouchableOpacity>
        </SafeAreaView>
    )
};
export default Setting;