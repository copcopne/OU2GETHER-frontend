import { Keyboard } from "react-native";
import { useState, useRef } from "react";
import { Text, View, TouchableOpacity, ScrollView, Image, Platform, Alert, KeyboardAvoidingView } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { TextInput, Button } from "react-native-paper";
import LoginStyle from "../../styles/LoginStyle";
import Apis, { endpoints } from "../../configs/Apis";
import RegisterStyle from "../../styles/RegisterStyle";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Register = () => {
  const insets = useSafeAreaInsets();
  const [newUser, setNewUser] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const info = [
    { label: "Mã số sinh viên", field: "member_id", secureTextEntry: false },
    { label: "Tên", field: "first_name", secureTextEntry: false },
    { label: "Họ và tên lót", field: "last_name", secureTextEntry: false },
    { label: "Email", field: "email", secureTextEntry: false },
    { label: "Tên người dùng", field: "username", secureTextEntry: false },
    { label: "Mật khẩu", field: "password", secureTextEntry: true },
    { label: "Nhập lại mật khẩu", field: "confirm", secureTextEntry: true },
  ];
  const inputRefs = useRef({});
  const isLast = (index) => index === info.length - 1;

  const nav = useNavigation();

  const onImagePress = (field) => {
    if (newUser[field]) {
      Alert.alert(
        field === 'avatar' ? 'Ảnh đại diện' : 'Ảnh bìa',
        'Bạn muốn làm gì?',
        [
          { text: 'Thay ảnh', onPress: () => handlePickImage(field) },
          { text: 'Xoá ảnh', onPress: () => setNewUser({ ...newUser, [field]: null }) },
          { text: 'Huỷ', style: 'cancel' }
        ]
      );
    } else {
      handlePickImage(field);
    }
  };

  const setState = (value, field) =>
    setNewUser({ ...newUser, [field]: value });

  const validate = () => {
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
        if (!/^\d+$/.test(value)) {
          Alert.alert("Thông báo", "Mã số sinh viên phải là số!", [
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

    if (!newUser.avatar) {
      Alert.alert("Thông báo", `Vui lòng nhập chọn ảnh đại diện!`);
      return false;
    }

    if (newUser.password !== newUser.confirm) {
      Alert.alert("Thông báo", "Mật khẩu không khớp!");
      return false;
    }
    return true;
  };

  const register = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      let form = new FormData();
      for (let key in newUser) {
        if (key !== "confirm") {
          if (key === "avatar") {
            form.append(key, {
              uri: newUser.avatar.uri,
              name: newUser.avatar.fileName,
              type: `${newUser.avatar.type}/${newUser.avatar.fileName.split(".").pop()}`,
            });
          } else {
            form.append(key, newUser[key]);
          }
        }
      }
      let res = await Apis.post(endpoints['register'], form, {
        headers: {
          "accept": 'application/json',
          "content-Type": "multipart/form-data"
        }
      });

      Alert.alert("Đăng ký thành công!", "Vui lòng chờ admin xác nhận tài khoản của bạn.");
      nav.goBack();
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

  const handlePickImage = async (field) => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.status !== 'granted') {
        alert('Quyền truy cập ảnh bị từ chối');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: field === 'cover' ? [16, 9] : [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setState(result.assets[0], field);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  return (
    <View style={RegisterStyle.container}>
      <KeyboardAvoidingView
        style={{ flex: 1, width: "100%" }}
        behavior="position"
      ><ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 16 }}
        keyboardShouldPersistTaps="handled"
      >
          <TouchableOpacity onPress={() => onImagePress('cover')}>
            {newUser.cover ? (
              <Image source={{ uri: newUser.cover.uri }} style={RegisterStyle.coverImage} />
            ) : (
              <View style={[RegisterStyle.coverImage, RegisterStyle.coverPlaceholder]}>
                <Text style={RegisterStyle.coverText}>Chọn ảnh bìa</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={RegisterStyle.avatarContainer}>
            <TouchableOpacity onPress={() => onImagePress('avatar')}>
              {newUser.avatar ? (
                <Image
                  source={{ uri: newUser.avatar.uri }}
                  style={RegisterStyle.avatar}
                />
              ) : (
                <View style={[RegisterStyle.avatar, RegisterStyle.avatarPlaceholder]}>
                  <Text style={RegisterStyle.avatarText}>Chọn hình đại diện</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={LoginStyle.p}>


            {info.map((i, idx) => {
              const isPasswordField = i.field === "password";
              const isConfirmField = i.field === "confirm";
              const isSecure = i.secureTextEntry
                ? isPasswordField
                  ? !showPassword
                  : !showConfirm
                : false;

              return (
                <TextInput
                  key={i.field}
                  ref={(el) => (inputRefs.current[i.field] = el)}
                  mode="outlined"
                  autoCapitalize={(isPasswordField || isConfirmField) ? "none" : "sentences"}
                  value={newUser[i.field] || ""}
                  onChangeText={(t) => setState(t, i.field)}
                  style={LoginStyle.input}
                  label={i.label}
                  secureTextEntry={i.secureTextEntry ? isSecure : false}
                  right={
                    i.secureTextEntry ? (
                      <TextInput.Icon
                        icon={
                          (isPasswordField && showPassword) ||
                            (isConfirmField && showConfirm)
                            ? "eye-off"
                            : "eye"
                        }
                        onPress={() => {
                          if (isPasswordField) setShowPassword(!showPassword);
                          if (isConfirmField) setShowConfirm(!showConfirm);
                        }}
                      />
                    ) : null
                  }
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

            <Button
              mode="contained"
              onPress={register}
              disabled={loading}
              loading={loading}
            >
              Đăng ký
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default Register;
