import { useContext, useRef, useState } from "react";
import { Text, View, TouchableOpacity, Keyboard, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Dialog, Portal, TextInput } from "react-native-paper";
import LoginStyle from "../../styles/LoginStyle";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import qs from "qs"
import { useNavigation } from "@react-navigation/native";
import { DispatchContext } from "../../configs/Contexts";

const Login = () => {
  const info = [{
    label: 'Tên đăng nhập',
    field: 'username',
    icon: 'account',
    secureTextEntry: false
  }, {
    label: 'Mật khẩu',
    field: 'password',
    icon: 'eye',
    secureTextEntry: true
  }];

  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const nav = useNavigation();
  const dispatch = useContext(DispatchContext);

  const inputRefs = useRef({});
  const isLast = (index) => index === info.length - 1;

  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);
  const [msg, setMsg] = useState('');

  const setState = (value, field) => {
    setUser({ ...user, [field]: value })
  }

  const validate = () => {
    if (Object.values(user).length == 0) {
      setMsg("Vui lòng nhập thông tin!");
      return false;
    }

    for (let i of info)
      if (user[i.field] === '') {
        setMsg(`Vui lòng nhập ${i.label}!`);
        return false;
      }

    setMsg('');
    return true;
  }

  const login = async () => {
    if (validate() !== true) {
      showDialog();
    } else {
      try {
        setLoading(true);

        const payload = qs.stringify({
          grant_type: 'password',
          username: user.username,
          password: user.password,
          client_id: 'FFtLr1EegBDRWsI7unpeQtEbIuMPgrfWM69ED7Qe',
        });
        let res = await Apis.post(endpoints['login'], payload);
        await AsyncStorage.setItem('token', res.data.access_token);

        let u = await authApis(res.data.access_token).get(endpoints['currentUser']);
        let userdata = u.data;

        if (userdata['is_active'] === false) {
          setMsg("Tài khoản của bạn đã bị khóa, vui lòng liên hệ quản trị viên để biết thêm chi tiết.");
          showDialog();
          return;
        }
        if (userdata['is_locked'] === true) {
          setMsg("Tài khoản của bạn đã bị khóa do không đổi mật khẩu trong thời gian quy định.");
          showDialog();
          return;
        }
        if (userdata['is_verified'] === false) {
          setMsg("Vui lòng chờ quản trị viên xác thực tài khoản của bạn!");
          showDialog();
          return;
        }

        dispatch({
          'type': 'login',
          'payload': userdata
        });

        if (userdata['must_change_password'] === true) {
          nav.navigate('changePassword');
        }

      } catch (ex) {
        if (ex.response?.status === 400) {
          setMsg("Tài khoản hoặc mật khẩu không đúng!");
          showDialog();
        } else {
          setMsg("Có lỗi xảy ra, vui lòng thử lại sau!");
          showDialog();
          console.error('Status:', ex.response?.status);
          console.error('Data:', ex.response?.data);
          console.error(ex);
        }

      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={[LoginStyle.p, LoginStyle.container]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
        <Text style={LoginStyle.subTitle}>Đăng nhập vào</Text>
        <Text style={LoginStyle.title}>OU2GETHER</Text>

        {info.map((i, idx) => {
          const isPasswordField = i.field === "password";
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
              autoCapitalize="none"
              value={user[i.field] || ""}
              onChangeText={(t) => setState(t, i.field)}
              style={LoginStyle.input}
              label={i.label}
              secureTextEntry={i.secureTextEntry ? isSecure : false}
              right={
                i.secureTextEntry ? (
                  <TextInput.Icon
                    icon={
                      (isPasswordField && showPassword)
                        ? "eye-off"
                        : "eye"
                    }
                    onPress={() => {
                      if (isPasswordField) setShowPassword(!showPassword);
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
                  login();
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
          onPress={login}
          disabled={loading}
          loading={loading}
          mode="contained"
        >
          Đăng nhập
        </Button>

        <TouchableOpacity
          style={LoginStyle.backButton}
          onPress={() => nav.goBack()}
        >
          <Text style={LoginStyle.buttonText}>Quay lại</Text>
        </TouchableOpacity>

    </KeyboardAvoidingView>
  );
};

export default Login;
