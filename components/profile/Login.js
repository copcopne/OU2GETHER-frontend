import { useContext, useRef, useState } from "react";
import { Text, TouchableOpacity, Keyboard, KeyboardAvoidingView, Platform, View } from "react-native";
import { Button, Dialog, Portal, TextInput } from "react-native-paper";
import LoginStyle from "../../styles/LoginStyle";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import qs from "qs"
import { useNavigation } from "@react-navigation/native";
import { DispatchContext } from "../../configs/Contexts";
import Constants from 'expo-constants';

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
        Keyboard.dismiss();
        setLoading(true);

        const payload = qs.stringify({
          grant_type: 'password',
          username: user.username,
          password: user.password,
          client_id: Constants.expoConfig.extra.client_id
        });
        let res = await Apis.post(endpoints['login'], payload);

        let u = await authApis(res.data.access_token).get(endpoints['currentUser']);
        let userdata = u.data;

        if (userdata['is_verified'] === false) {
          setMsg("Vui lòng chờ quản trị viên xác thực tài khoản của bạn!");
          showDialog();
          return;
        }
        if (userdata['must_change_password'] === true) {
          nav.navigate('changePassword', { userdata, forceChangePassword: true });
          return;
        }
        await AsyncStorage.setItem('token', res.data.access_token);
        await AsyncStorage.setItem('refresh', res.data.refresh_token);

        dispatch({
          'type': 'login',
          'payload': userdata
        });

      } catch (ex) {
        if (ex.response?.status === 400) {
          setMsg("Tài khoản hoặc mật khẩu không đúng!");
          showDialog();
        } else if (ex.response?.status === 403) {
          setMsg("Tài khoản đã bị khóa! Vui lòng liên hệ admin để được mở khóa.");
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
            activeOutlineColor="#1c85fc"
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
              }
            }}
          />
        );
      })}
      <Portal>
        <Dialog visible={visible} onDismiss={hideDialog} style={{ backgroundColor: "white" }}>
          <Dialog.Title>Lỗi</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">{msg}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <TouchableOpacity onPress={hideDialog}>
            <Text style={{ color: '#1976D2' }}>OK</Text>
          </TouchableOpacity>
          </Dialog.Actions>
          
        </Dialog>
      </Portal>

      <Button
        onPress={login}
        disabled={loading}
        loading={loading}
        mode="contained"
        buttonColor="#1c85fc"
      >
        Đăng nhập
      </Button>

      <Button
      style={{marginTop: 15}}
        onPress={() => nav.goBack()}
        mode="contained"
        buttonColor="#e7f3ff"
        textColor="black"
      >
      Quay lại
      </Button>

    </KeyboardAvoidingView>
  );
};

export default Login;
