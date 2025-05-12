import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useReducer } from 'react';
import UserReducer from './reducers/UserReducer';
import Home from './components/home/Home';
import Post from './components/post/Post';
import Profile from './components/profile/Profile';
import Login from './components/profile/Login';
import Register from './components/profile/Register';
import ChangePassword from './components/profile/ChangePassword';
import { Icon, PaperProvider } from 'react-native-paper';
import { DispatchContext, UserContext } from './configs/Contexts';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import Anonymous from './components/profile/Anonymous';


const AuthTab = createNativeStackNavigator();
const AuthNavigator = () => {
  return (
    <AuthTab.Navigator screenOptions={{ headerShown: false }} initialRouteName='anonymous'>
      <AuthTab.Screen name="anonymous" component={Anonymous} options={{ title: "Chào mừng bạn đến với OU2GETHER" }} />
      <AuthTab.Screen name="login" component={Login} options={{ title: "Đăng nhập" }} />
      <AuthTab.Screen name="register" component={Register} options={{ title: "Đăng ký" }} />
      <AuthTab.Screen name="changePassword" component={ChangePassword} options={{ title: "Đổi mật khẩu" }} />
    </AuthTab.Navigator>
  );
}

const Stack = createNativeStackNavigator();
const StackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false}}>
      <Stack.Screen name="homestack" component={Home} options={{ title: "Trang chủ" }} />
      <Stack.Screen name="post" component={Post} options={{ title: "Bài viết" }} />
      <Stack.Screen name="profile" component={Profile} options={{ title: "Trang cá nhân" }} />

    </Stack.Navigator>
  );
};

const Tab = createBottomTabNavigator();
const MainNavigator = () => {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarStyle: { position: "absolute", bottom: 0, left: 0, right: 0, elevation: 0, backgroundColor: "#fff", borderTopWidth: 0 } }} initialRouteName='home'>
      <Tab.Screen name="home" component={StackNavigator} options={{ title: "Trang chủ", tabBarIcon: () => <Icon size={30} source="home" /> }} />
      {/* <Tab.Screen name="search" options={{ title: "Tìm kiếm", tabBarIcon: () => <Icon size={30} source="home" /> }} /> */}
      {/* <Tab.Screen name="createPost" options={{ title: "Tạo bài viết mới", tabBarIcon: () => <Icon size={30} source="home" /> }} /> */}
      {/* <Tab.Screen name="chat" component={Profile} options={{ title: "Tin nhắn", tabBarIcon: () => <Icon size={30} source="account" /> }} /> */}
      <Tab.Screen name="profile" component={Profile} options={{ title: "Trang cá nhân", tabBarIcon: () => <Icon size={30} source="account" /> }} />
    </Tab.Navigator>
  );
};

const App = () => {
  const [user, dispatch] = useReducer(UserReducer, null);
  return (
    <UserContext.Provider value={user}>
      <DispatchContext.Provider value={dispatch}>
        <PaperProvider>
          <NavigationContainer>
            {user
              ? <MainNavigator />
              : <AuthNavigator />}
            <StatusBar style="auto" />
          </NavigationContainer>
        </PaperProvider>
      </DispatchContext.Provider>
    </UserContext.Provider>
  );
};

export default App;