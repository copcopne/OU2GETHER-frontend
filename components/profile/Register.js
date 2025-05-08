import { useState } from "react";
import { Text, View, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TextInput } from "react-native-paper";
import LoginStyle from "../../styles/LoginStyle";

const Register = () => {
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const info = [{
    label: "Tên",
    field: "first_name",
    secureTextEntry: false,
    icon: "text"
  }, {
    label: "Họ và tên lót",
    field: "last_name",
    secureTextEntry: false,
    icon: "text"
  }, {
    label: "Tên người dùng",
    field: "username",
    secureTextEntry: false,
    icon: "text"
  }, {
    label: "Mật khẩu",
    field: "password",
    secureTextEntry: true,
    icon: "eye"
  }, {
    label: "Nhập lại mật khẩu",
    field: "confirm",
    secureTextEntry: true,
    icon: "eye"
  }, ]
  const [newUser, setNewUer] = useState({});

  const setState = (value, field) => {
    setNewUer({...newUser, [field]: value});
  };

  return (
    <ScrollView>
      <View style={LoginStyle.p}>
        <Text style={LoginStyle.title}>ĐĂNG KÝ TÀI KHOẢN OU2GETHER</Text>

        {info.map(i => {
          const isPasswordField = i.field === 'password';
          const isConfirmField = i.field === 'confirm';
          const isSecure = isPasswordField ? !showPassword : isConfirmField ? !showConfirm : false;

          return (
            <TextInput
              key={`${i.label}${i.field}`}
              value={newUser[i.field]}
              onChangeText={t => setState(t, i.field)}
              style={LoginStyle.m}
              label={i.label}
              secureTextEntry={i.secureTextEntry ? isSecure : false}
              right={
                i.secureTextEntry ? (
                  <TextInput.Icon
                    icon={(isPasswordField && showPassword) || (isConfirmField && showConfirm) ? "eye-off" : "eye"}
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

        
        {/* <TextInput
          label="Mật khẩu"
          mode="outlined"
          value={password}
          onChangeText={(text) => setPassword(text)}
          secureTextEntry={!showPassword}
          style={LoginStyle.input}
          left={<TextInput.Icon icon="lock" />}
          right={
            <TextInput.Icon
              icon={showPassword ? "eye-off" : "eye"}
              onPress={() => setShowPassword(!showPassword)}
            />
          }
        /> */}

        <TouchableOpacity style={LoginStyle.loginButton}>
          <Text style={LoginStyle.buttonText}>Đăng ký</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={LoginStyle.backButton}>
          <Text style={LoginStyle.buttonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default Register;
