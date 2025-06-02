import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useReducer, useState } from 'react';
import UserReducer from './reducers/UserReducer';
import Home from './components/home/Home';
import Post from './components/post/Post';
import Profile from './components/profile/Profile';
import Login from './components/profile/Login';
import Register from './components/profile/Register';
import ChangePassword from './components/profile/ChangePassword';
import Setting from './components/setting/Setting';
import Stats from './components/setting/Stats';
import Invite from './components/setting/Inivte';
import VerifyUser from './components/setting/VerifyUser';
import CreateUser from './components/setting/CreateUser';
import CreatePost from './components/post/CreatePost';
import Anonymous from './components/profile/Anonymous';
import PostDetail from './components/post/PostDetails';
import { ActivityIndicator, Icon, PaperProvider } from 'react-native-paper';
import { DispatchContext, SnackbarProvider, UserContext } from './configs/Contexts';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { PortalProvider } from '@gorhom/portal';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Apis, { authApis, endpoints } from './configs/Apis';
import { View } from 'react-native';
import UnlockAccount from './components/setting/UnlockAccount';
import CreatePostModal from './components/post/CreatePostModal';
import Empty from './components/empty';
import Search from './components/profile/Search';
import AllChats from './components/chat/AllChats';
import Constants from 'expo-constants';

const Stack = createNativeStackNavigator();
const AuthNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName='anonymous'>
      <Stack.Screen name="anonymous" component={Anonymous} options={{ title: "Chào mừng bạn đến với OU2GETHER" }} />
      <Stack.Screen name="login" component={Login} options={{ title: "Đăng nhập" }} />
      <Stack.Screen name="register" component={Register} options={{ title: "Đăng ký tài khoản", headerShown: true,
          headerBackTitleVisible: false }} />
      <Stack.Screen name="changePassword" component={ChangePassword} options={{ title: "Đổi mật khẩu", headerShown: true,
          headerBackTitleVisible: false }} />
    </Stack.Navigator>
  );
}

const HomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="homeStack" component={Home} options={{ title: "Trang chủ" }} />
      <Stack.Screen
        name="createPost"
        component={CreatePost}
        options={{
          title: "Tạo bài viết mới",
          headerShown: true,
          headerBackTitleVisible: false
        }} />
      <Stack.Screen
        name="postDetail"
        component={PostDetail}
        options={{
          title: "Chi tiết bài viết",
          headerShown: true,
          headerBackTitleVisible: false
        }} />
      <Stack.Screen
        name="profileStack"
        component={Profile}
        options={{
          title: "Trang cá nhân",
          headerShown: true,
          headerBackTitleVisible: false
        }} />
        <Stack.Screen
        name="allChats"
        component={AllChats}
        options={{
          title: "Đoạn chat",
          headerShown: true,
          headerBackTitleVisible: false
        }} />
    </Stack.Navigator>
  );
};
const ProfileStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="profileStack"
        component={Profile}
        options={({ route }) => ({
          title: "Trang cá nhân",
          headerShown: route.params?.showHeader === true,
          headerBackTitleVisible: false
        })} />
      <Stack.Screen
        name="createPost"
        component={CreatePost}
        options={{
          title: "Tạo bài viết mới",
          headerShown: true,
          headerBackTitleVisible: false
        }} />
      <Stack.Screen name="post" component={Post} options={{ title: "Bài viết" }} />
      <Stack.Screen
        name="postDetail"
        component={PostDetail}
        options={{
          title: "Chi tiết bài viết",
          headerShown: true,
          headerBackTitleVisible: false,
        }} />
    </Stack.Navigator>
  );
};
const SearchStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="searchStack" component={Search}/>
      <Stack.Screen
        name="profileStack"
        component={Profile}
        options={({ route }) => ({
          title: "Trang cá nhân",
          headerShown: true,
          headerBackTitleVisible: false
        })} />
    </Stack.Navigator>
  );
}
const SettingStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name="settingStack"
        component={Setting}
        options={{
          title: "Tùy chọn"
        }} />
      <Stack.Screen
        name="changePassword"
        component={ChangePassword}
        options={{
          title: "Đổi mật khẩu"
        }} />
      <Stack.Screen
        name="stats"
        component={Stats}
        options={{
          title: "Thống kê hệ thống"
        }} />
      <Stack.Screen
        name="invite"
        component={Invite}
        options={{
          title: "Tạo thư mời"
        }} />
      <Stack.Screen
        name="verifyUser"
        component={VerifyUser}
        options={{
          title: "Xác nhận người dùng"
        }} />
      <Stack.Screen
        name="unlockAccount"
        component={UnlockAccount}
        options={{
          title: "Mở khóa tài khoản"
        }} />
      <Stack.Screen
        name="createUser"
        component={CreateUser}
        options={{
          title: "Tạo người dùng mới"
        }} />
    </Stack.Navigator>)
}
const Tab = createBottomTabNavigator();
const MainNavigator = () => {
  return (<>
    <Tab.Navigator
      screenOptions={({ route }) => {
        const routeName = getFocusedRouteNameFromRoute(route) ?? (route.name === 'home' ? 'homeStack' : 'profileStack');
        return {
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            display: routeName === 'postDetail' ? 'none' : 'flex',
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            elevation: 0,
            backgroundColor: "#f2f2f2",
            borderTopWidth: 0
          },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'home') iconName = 'home';
            else if (route.name === 'search') iconName = 'magnify';
            else if (route.name === 'profile') iconName = 'account';
            else if (route.name === 'setting') iconName = 'menu';

            if (route.name === 'plus') return null;

            return <Icon source={iconName} size={30} color={focused ? '#0865fe' : '#888'} />;
          }
        };
      }}
      initialRouteName='home'
    >
      <Tab.Screen name="home" component={HomeStack} />
      <Tab.Screen name="search" component={SearchStack} />
      <Tab.Screen name="plus" component={Empty} options={{ tabBarButton: () => <CreatePostModal /> }}/>
      <Tab.Screen name="profile" component={ProfileStack} />
      <Tab.Screen name="setting" component={SettingStack} />
    </Tab.Navigator>

  </>);
};

const App = () => {
  const [user, dispatch] = useReducer(UserReducer, null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem("token");
      const refresh = await AsyncStorage.getItem("refresh");
      let res;
      if (!token || !refresh) return;
      try {
        setIsChecking(true);
        res = await authApis(token).get(endpoints['currentUser']);
        dispatch({
          'type': 'login',
          'payload': res.data
        })
      } catch (error) {
        if (error.response?.status === 401) {
          try {
            res = await Apis.post(endpoints['login'], {
              grant_type: "refresh_token",
              refresh_token: refresh,
              client_id: Constants.expoConfig.extra.client_id
            })
            await AsyncStorage.setItem('token', res.data.access_token);
            await AsyncStorage.setItem('refresh', res.data.refresh_token);

            res = await authApis(token).get(endpoints['currentUser']);
            dispatch({
              'type': 'login',
              'payload': res.data
            })
          } catch (e) {
            await AsyncStorage.multiRemove(["token", "refresh"]);
          };
        }
      } finally {
        setIsChecking(false);
      };
    };
    checkLogin();
  }, []);

  if (isChecking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <UserContext.Provider value={user}>
        <DispatchContext.Provider value={dispatch}>
          <PaperProvider>
            <SnackbarProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <BottomSheetModalProvider>
                  <PortalProvider>
                    <NavigationContainer>
                      {user ? <MainNavigator /> : <AuthNavigator />}
                    </NavigationContainer>
                  </PortalProvider>
                </BottomSheetModalProvider>
              </GestureHandlerRootView>
            </SnackbarProvider>
          </PaperProvider>
        </DispatchContext.Provider>
      </UserContext.Provider>
    </SafeAreaProvider>
  );
};
export default App;