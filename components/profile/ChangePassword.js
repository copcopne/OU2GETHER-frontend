import { useState, useRef } from "react";
import { Keyboard, TouchableOpacity, View } from "react-native";
import { Button, Dialog, PaperProvider, Portal, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import LoginStyle from "../../styles/LoginStyle";

const ChangePassword = () => {

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

    const updatePasswordField = (value, field) => {
        setPasswordData({ ...passwordData, [field]: value })
    }

    const validate = () => {
        
    }

    return (
        <PaperProvider>
            <SafeAreaView style={[LoginStyle.container]}>
                <View style={LoginStyle.p}>
                    <Text style={LoginStyle.title}>Cập nhật mật khẩu</Text>

                    {info.map((i, idx) => {

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
                                        // login();
                                        Keyboard.dismiss();
                                    }
                                }}
                            />
                        );
                    })}

                    <Portal>
                        <Dialog visible={visible} onDismiss={hideDialog}>
                            <Dialog.Title>Lỗi</Dialog.Title>
                            <Dialog.Content>
                                <Text variant="bodyMedium">{msg}</Text>
                            </Dialog.Content>
                            <Dialog.Actions>
                                <Button onPress={hideDialog}>OK</Button>
                            </Dialog.Actions>
                        </Dialog>
                    </Portal>

                    <Button
                        onPress={() => { }}
                        disabled={loading}
                        loading={loading}
                        mode="contained"
                    >
                        Cập nhật mật khẩu
                    </Button>

                    <TouchableOpacity style={LoginStyle.backButton}>
                        <Text style={LoginStyle.buttonText}>Quay lại</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </PaperProvider>
    );
};
export default ChangePassword;