import { Keyboard } from "react-native";
import { useState, useRef, useLayoutEffect } from "react";
import { View, ScrollView, Alert, Button } from "react-native";
import { ActivityIndicator, TextInput, Menu, IconButton, Text } from "react-native-paper";
import LoginStyle from "../../styles/LoginStyle";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import RegisterStyle from "../../styles/RegisterStyle";
import { useNavigation } from "@react-navigation/native";
import { Asset } from 'expo-asset';
import AsyncStorage from "@react-native-async-storage/async-storage";

const CreateUser = () => {
    const [newUser, setNewUser] = useState({ role: 1 });
    const [loading, setLoading] = useState(false);

    const info = [
        { label: "Email", field: "email", },
        { label: "Họ và tên lót", field: "last_name" },
        { label: "Tên", field: "first_name" },
        { label: "Mã hệ thống", field: "member_id" },
        { label: "Tên người dùng", field: "username" },
    ];
    const [menuVisible, setMenuVisible] = useState(false);

    const roles = [
        { label: "Quản trị viên", field: 0 },
        { label: "Giảng viên", field: 1 },
        { label: "Cựu Sinh Viên", field: 2 }
    ];

    const inputRefs = useRef({});
    const isLast = (index) => index === info.length - 1;

    const nav = useNavigation();
    useLayoutEffect(() => {
        nav.setOptions({
            headerRight: () => (
                <Button
                    onPress={register}
                    disabled={loading}
                    color="black"
                    title="Lưu"
                />
            ),
        });
    }, [nav]);

    const setState = (value, field) =>
        setNewUser({ ...newUser, [field]: value });

    const validate = () => {
        if (!newUser.role) {
            Alert.alert("Thông báo", "Vui lòng chọn vai trò trong hệ thống!");
            return false;
        }
        for (let i of info) {
            const value = newUser[i.field] || "";
            if (value === "") {
                Alert.alert(
                    "Thông báo",
                    `Vui lòng nhập ${i.label}!`,
                    [{
                        text: "OK",
                        onPress: () => setTimeout(() => {
                            inputRefs.current[i.field]?.focus();
                        }, 100)
                    }]
                );
                return false;
            }
            if (i.field === "member_id") {
                if (value.length > 12) {
                    Alert.alert("Thông báo", "Mã số sinh viên tối đa 12 ký tự!", [
                        {
                            text: "OK",
                            onPress: () =>
                                setTimeout(() => {
                                    inputRefs.current["member_id"]?.focus();
                                }, 100),
                        },
                    ]);
                    return false;
                }
            }
        }
        return true;
    };

    const register = async () => {
        if (!validate()) return;
        try {
            setLoading(true);
            let form = new FormData();
            for (let key in newUser) {
                form.append(key, newUser[key]);
            }

            const imageAsset = Asset.fromModule(require('../../assets/default-avatar.jpg'));
            await imageAsset.downloadAsync();
            const extension = imageAsset.name.split(".").pop();
            const mime = `image/${extension}`;
            form.append("avatar", {
                uri: imageAsset.localUri || imageAsset.uri,
                name: imageAsset.name,
                type: mime
            });
            const token = await AsyncStorage.getItem("token");

            await authApis(token).post(endpoints['register'], form, {
                headers: {
                    "accept": 'application/json',
                    "content-Type": "multipart/form-data"
                }
            });

            Alert.alert("Thông báo", "Tạo tài khoản thành công!");
            setNewUser({});
        } catch (error) {
            let message = "";

            if (error.response && error.response.data) {
                const data = error.response.data;
                const firstKey = Object.keys(data)[0];
                const errors = data[firstKey];

                if (Array.isArray(errors)) {
                    message = errors.join("\n");
                } else if (typeof errors === "string") {
                    message = errors;
                } else {
                    message = JSON.stringify(errors);
                }
            }

            else if (error.request && error.request._response) {
                try {
                    const data = JSON.parse(error.request._response);
                    const firstKey = Object.keys(data)[0];
                    const errors = data[firstKey];
                    message = Array.isArray(errors)
                        ? errors.join("\n")
                        : typeof errors === "string"
                            ? errors
                            : JSON.stringify(errors);
                } catch {
                    message = "Không xác định lỗi từ server.";
                }
            }
            else {
                message = error.message || "Đã có lỗi xảy ra.";
            }

            Alert.alert("Thông báo", message);
        } finally {
            setLoading(false);
        }
    };

    if (loading)
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "transparent" }}>
                <ActivityIndicator size="large" color="black" />
            </View>
        );

    return (
        <View style={RegisterStyle.container}>
            <ScrollView style={{ width: "100%" }}>
                <View style={[LoginStyle.p]}>
                    <View style={{ marginBottom: 10 }}>
                        <Menu
                            visible={menuVisible}
                            onDismiss={() => setMenuVisible(false)}
                            anchor={
                                <TextInput
                                    mode="outlined"
                                    value={roles.find(r => r.field === newUser.role)?.label || ""}
                                    style={LoginStyle.input}
                                    editable={false}
                                    label="Vai trò"
                                    right={<TextInput.Icon icon="menu-down" onPress={() => setMenuVisible(true)} />}
                                />
                            }
                        >
                            {roles.map((r) => (
                                <Menu.Item
                                    key={r.field}
                                    onPress={() => {
                                        setState(r.field, "role");
                                        setMenuVisible(false);
                                    }}
                                    title={r.label}
                                />
                            ))}
                        </Menu>
                    </View>
                    {info.map((i, idx) => {
                        return (
                            <TextInput
                                key={i.field}
                                ref={(el) => (inputRefs.current[i.field] = el)}
                                mode="outlined"
                                autoCapitalize="sentences"
                                value={newUser[i.field] || ""}
                                onChangeText={(t) => setState(t, i.field)}
                                style={LoginStyle.input}
                                label={i.label}

                                returnKeyType={isLast(idx) ? "done" : "next"}
                                onSubmitEditing={() => {
                                    if (!isLast(idx)) {
                                        const nextField = info[idx + 1].field;
                                        inputRefs.current[nextField]?.focus();
                                    } else {
                                        register();
                                        Keyboard.dismiss();
                                    }
                                }}
                            />
                        );
                    })}
                <TextInput style={LoginStyle.input} disabled={true} value="ou@123" label="Mật khẩu mặc định" />
                </View>
            </ScrollView>
        </View>
    );
};
export default CreateUser;