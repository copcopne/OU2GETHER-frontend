import { useState } from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TextInput } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import LoginStyle from "../../styles/LoginStyle";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <SafeAreaView style={[LoginStyle.container]}>
      <View style={ LoginStyle.p }>
        <Text style={LoginStyle.title}>ĐĂNG NHẬP VÀO OU2GETHER</Text>

        <TextInput
          label="Tên người dùng"
          mode="outlined"
          value={username}
          onChangeText={(text) => setUsername(text)}
          style={LoginStyle.input}
          left={<TextInput.Icon icon="account" />}
        />

        <TextInput
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
        />

        <TouchableOpacity style={LoginStyle.loginButton}>
          <Text style={LoginStyle.buttonText}>Đăng nhập</Text>
        </TouchableOpacity>
        <TouchableOpacity style={LoginStyle.button}>
          <Text style={TextStyle.buttonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Login;
