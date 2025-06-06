import { useState, useRef, useContext } from "react";
import { Keyboard, TouchableOpacity, View } from "react-native";
import { Button, Dialog, Portal, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import LoginStyle from "../../styles/LoginStyle";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import qs from "qs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DispatchContext } from "../../configs/Contexts";
import Constants from 'expo-constants';

const ChangePassword = ({ route }) => {
    const { userdata, forceChangePassword = false } = route.params || {};
    const dispatch = useContext(DispatchContext);
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
    const isLast = (index) => index === fields.length - 1;

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
                let token;
                let authData;
                let p = forceChangePassword ? Constants.expoConfig.extra.defaultPassword : passwordData.oldPassword;

                const payload = qs.stringify({
                    grant_type: 'password',
                    username: userdata.username,
                    password: p,
                    client_id: Constants.expoConfig.extra.client_id
                });
                authData = (await Apis.post(endpoints['login'], payload)).data;
                token = authData.access_token;

                let res = await authApis(token).patch(endpoints['currentUser'], passwordData);
                await AsyncStorage.setItem("token", token);
                if (authData) await AsyncStorage.setItem("refesh", authData.refresh_token);

                setMsg(`Thay đổi mật khẩu thành công! ${!forceChangePassword ? "\nVui lòng đăng nhập lại để có hiệu lực" : ""}`);
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
                    setMsg(error?.response?.data?.detail || error.message || "Đã có lỗi xảy ra!");
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
                            activeOutlineColor="#1c85fc"
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
                                    const nextField = fields[idx + 1].field;
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
                    <Dialog visible={visible} onDismiss={hideDialog} style={{ backgroundColor: "white" }}>
                        <Dialog.Title>Thông báo</Dialog.Title>
                        <Dialog.Content>
                            <Text variant="bodyMedium">{msg}</Text>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <TouchableOpacity onPress={() => {
                                hideDialog();
                                postAction();
                            }}>
                                <Text style={{ color: '#1976D2', marginRight: 20 }}>OK</Text>
                            </TouchableOpacity>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>

                <Button
                    onPress={updatePassword}
                    disabled={loading}
                    loading={loading}
                    buttonColor="#1c85fc"
                    mode="contained"
                >
                    Cập nhật mật khẩu
                </Button>

            </View>
        </SafeAreaView>
    );
};
export default ChangePassword;