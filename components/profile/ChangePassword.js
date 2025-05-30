import { useState, useRef, useContext } from "react";
import { Keyboard, TouchableOpacity, View } from "react-native";
import { Button, Dialog, Portal, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import LoginStyle from "../../styles/LoginStyle";
import { useNavigation } from "@react-navigation/native";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import qs from "qs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DispatchContext } from "../../configs/Contexts";

const ChangePassword = ({ route }) => {
    const { userdata, forceChangePassword = false } = route.params || {};
    const dispatch = useContext(DispatchContext);
    const nav = useNavigation();
    const info = [{
        label: 'Mật khẩu cũ',
        field: 'oldPassword',
        icon: 'eye',
        secureTextEntry: true
    }, {
        label: 'Mật khẩu mới',
        field: 'password',
        icon: 'eye',
        secureTextEntry: true
    }, {
        label: 'Xác nhận mật khẩu',
        field: 'confirm',
        icon: 'eye',
        secureTextEntry: true
    }];
    const fields = forceChangePassword
        ? info.filter(i => i.field !== 'oldPassword')
        : info;

    const [showField, setShowField] = useState({
        oldPassword: false,
        password: false,
        confirm: false,
    });
    const [passwordData, setPasswordData] = useState({});
    const inputRefs = useRef({});
    const isLast = (index) => index === info.length - 1;

    const showDialog = () => setVisible(true);
    const hideDialog = () => setVisible(false);
    const [msg, setMsg] = useState('');

    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [postAction, setPostAction] = useState(() => () => { });

    const updatePasswordField = (value, field) => {
        setPasswordData({ ...passwordData, [field]: value })
    }

    const validate = () => {
        if (Object.values(passwordData).length === 0) {
            setMsg("Vui lòng nhập thông tin!");
            return false;
        }
        for (let i of fields)
            if (passwordData[i.field] === '') {
                setMsg(`Vui lòng nhập ${i.label}!`);
                return false;
            }
        if (passwordData.password !== passwordData.confirm) {
            setMsg('Mật khẩu không khớp!');
            return false;
        }
        setMsg('');
        return true;
    };

    const updatePassword = async () => {
        if (validate() !== true) {
            showDialog();
        } else
            try {
                setLoading(true);
                let token = '';
                if (!forceChangePassword) {
                    const payload = qs.stringify({
                        grant_type: 'password',
                        username: userdata.username,
                        password: passwordData.oldPassword,
                        client_id: 'FFtLr1EegBDRWsI7unpeQtEbIuMPgrfWM69ED7Qe',
                    });
                    token = (await Apis.post(endpoints['login'], payload)).data.access_token;
                } else token = await AsyncStorage.getItem("token");

                let res = await authApis(token).patch(endpoints['currentUser'], passwordData);
                setMsg(`Thay đổi mật khẩu thành công! ${forceChangePassword ? "" : "\nVui lòng đăng nhập lại để có hiệu lực"}`);
                setPostAction(() => () => {
                    if (forceChangePassword) {
                        dispatch({
                            'type': 'login',
                            'payload': res.data
                        });
                    } else {
                        dispatch({
                            'type': 'logout',
                        });
                    }
                });
                showDialog();
            } catch (error) {
                if (error.status === 400) {
                    setMsg("Mật khẩu cũ không đúng!");
                    showDialog();
                }
                else {
                    setMsg(error);
                    showDialog();
                }
            } finally {
                setLoading(false);
            }
    };

    return (
        <SafeAreaView style={[LoginStyle.container]}>
            <View style={LoginStyle.p}>
                <Text style={LoginStyle.title}>Cập nhật mật khẩu</Text>

                {fields.map((i, idx) => {

                    return (
                        <TextInput
                            key={i.field}
                            ref={(el) => (inputRefs.current[i.field] = el)}
                            mode="outlined"
                            autoCapitalize="none"
                            value={passwordData[i.field] || ""}
                            onChangeText={(t) => updatePasswordField(t, i.field)}
                            style={LoginStyle.input}
                            label={i.label}
                            secureTextEntry={i.secureTextEntry ? !showField[i.field] : false}
                            right={
                                i.secureTextEntry ? (
                                    <TextInput.Icon
                                        icon={showField[i.field] ? "eye-off" : "eye"}
                                        onPress={() => setShowField(prev => ({
                                            ...prev,
                                            [i.field]: !prev[i.field]
                                        }))}
                                    />
                                ) : null
                            }
                            returnKeyType={isLast(idx) ? "done" : "next"}
                            onSubmitEditing={() => {
                                if (!isLast(idx)) {
                                    const nextField = info[idx + 1].field;
                                    inputRefs.current[nextField]?.focus();
                                } else {
                                    updatePassword();
                                    Keyboard.dismiss();
                                }
                            }}
                        />
                    );
                })}

                <Portal>
                    <Dialog visible={visible} onDismiss={hideDialog}>
                        <Dialog.Title>Thông báo</Dialog.Title>
                        <Dialog.Content>
                            <Text variant="bodyMedium">{msg}</Text>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={() => {
                                hideDialog();
                                postAction();
                            }}>
                                OK
                            </Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>

                <Button
                    onPress={updatePassword}
                    disabled={loading}
                    loading={loading}
                    mode="contained"
                >
                    Cập nhật mật khẩu
                </Button>

                <TouchableOpacity
                    style={LoginStyle.backButton}
                    onPress={nav.goBack}>
                    <Text style={LoginStyle.buttonText}>Quay lại</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};
export default ChangePassword;