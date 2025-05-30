import { TouchableOpacity, View } from "react-native";
import { Button, Dialog, Icon, Portal, Text } from "react-native-paper";
import SettingStyle from "../../styles/SettingStyle";
import { useContext, useState } from "react";
import { DispatchContext, UserContext } from "../../configs/Contexts";
import { useNavigation } from "@react-navigation/native";

const Setting = () => {
    const dispatch = useContext(DispatchContext);
    const currentUser = useContext(UserContext);
    const nav = useNavigation();
    const [visible, setVisible] = useState(false);

    const showDialog = () => setVisible(true);
    const hideDialog = () => setVisible(false);
    return (
        <View>
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
                        onPress={() => nav.navigate("unlockAccount")}
                        style={SettingStyle.button}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
                            <Icon size={32} source="account-alert" />
                            <Text style={SettingStyle.buttonText}>Gia hạn đổi mật khẩu</Text>
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
                onPress={showDialog}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
                    <Icon size={32} source="logout" />
                    <Text style={SettingStyle.buttonText}>Đăng xuất</Text>
                </View>
            </TouchableOpacity>

            <Portal>
                <Dialog visible={visible} onDismiss={hideDialog}>
                    <Dialog.Title>Thông báo</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium">Bạn có muốn đăng xuất không?</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => {
                            hideDialog(); dispatch({
                                type: "logout"
                            })
                        }}>OK</Button>
                        <Button onPress={hideDialog}>Hủy</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View>
    )
};
export default Setting;