import { useState } from "react";
import { Text, View, TouchableOpacity, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from 'expo-image-picker';
import { HelperText, TextInput, Button } from "react-native-paper";
import LoginStyle from "../../styles/LoginStyle";
import ProfileStyle from "../../styles/ProfileStyle";
import Apis, { endpoints } from "../../configs/Apis";

const Register = () => {
  const [newUser, setNewUser] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [msg, setMsg] = useState(null);
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

  const setState = (value, field) =>
    setNewUser({ ...newUser, [field]: value });

  const validate = () => {
    for (let i of info) {
      if (!(i.field in newUser) || newUser[i.field] === "") {
        setMsg(`Vui lòng nhập ${i.label}!`);
        return false;
      }
    }
    if (newUser.password !== newUser.confirm) {
      setMsg("Mật khẩu không khớp!");
      return false;
    }
    setMsg(null);
    return true;
  };

  const register = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      console.log("Posting to:", Apis.defaults.baseURL + endpoints.register);
fetch(Apis.defaults.baseURL + endpoints.register)
  .then(r => console.log("Ping OK", r.status))
  .catch(e => console.log("Ping FAIL", e.message));
      let form = new FormData();
      for (let key in newUser) {
        if (key !== "confirm") {
          if (key === "avatar") {
            form.append(key, {
              uri: newUser.avatar.uri,
              name: newUser.avatar.fileName,
              type: newUser.avatar.type,
            });
          } else {
            form.append(key, newUser[key]);
          }
        }
      }
      try {
        let res = await fetch('https://copcopne.pythonanywhere.com/users/register/', {
          method: 'POST',
          body: form
        });
        console.log('Fetch status', res.status);
      } catch(e) {
        console.log('Fetch error', e.message);
      }
    } catch (ex) {
      console.error(ex);
      setMsg("Đăng ký thất bại, thử lại sau nhé!");
    } finally {
      setLoading(false);
    }
  };

  const pick = async () => {
    let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Quyền bị từ chối!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync();
    if (!result.canceled) setState(result.assets[0], "avatar");
  };

  return (
    <ScrollView>
      <View style={LoginStyle.p}>
        <Text style={LoginStyle.title}>
          ĐĂNG KÝ TÀI KHOẢN OU2GETHER
        </Text>

        <HelperText type="error" visible={!!msg}>
          {msg}
        </HelperText>

        {info.map((i) => {
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
              mode="outlined"
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
            />
          );
        })}

        <TouchableOpacity onPress={pick}>
          <Text>Chọn ảnh đại diện...</Text>
        </TouchableOpacity>
        {newUser.avatar && (
          <Image
            source={{ uri: newUser.avatar.uri }}
            style={ProfileStyle.avatar}
          />
        )}

        <Button
          mode="contained"
          onPress={register}
          disabled={loading}
          loading={loading}
          style={LoginStyle.loginButton}
        >
          Đăng ký
        </Button>

        <TouchableOpacity style={LoginStyle.backButton}>
          <Text style={LoginStyle.buttonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default Register;
