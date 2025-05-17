import { Alert, FlatList, Image, SafeAreaView, ScrollView, StatusBar, TouchableOpacity, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import ProfileStyle from "../../styles/ProfileStyle";
import Post from "../post/Post";
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  DispatchContext,
  SnackbarContext,
  UserContext,
} from "../../configs/Contexts";
import { authApis, endpoints } from "../../configs/Apis";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import EditProfile from "./EditProfile";
import * as ImagePicker from "expo-image-picker";
import LoginStyle from "../../styles/LoginStyle";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

const Profile = React.memo(({ route }) => {
  const tabBarHeight = useBottomTabBarHeight();
  const { setSnackbar } = useContext(SnackbarContext);
  const bottomSheetModalRef = useRef(null);
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);
  const handleSheetChanges = useCallback((index) => {
    console.log("handleSheetChanges", index);
  }, []);
  const currentUser = useContext(UserContext);
  const [profileData, setProfileData] = useState({});
  const { userId } = route.params || {};
  const [minimalFollowers, setMinimalFollowers] = useState([]);
  const dispatch = useContext(DispatchContext);
  const [post, setPost] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const showUploadAlert = (type) => {
    Alert.alert(type === "avatar" ? "Ảnh đại diện" : "Ảnh bìa", "Bạn muốn làm gì", [
      { text: "Thay đổi", onPress: () => handleMediaUpload(type) },
      { text: "Hủy", sytle: "cancel" },
    ]);
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      let url = `${endpoints['posts']}`;

      if (!userId) {
        url = `${url}?userId=${currentUser.id}`;
      } else url = `${url}?userId=${userId}`;
      if (page > 0)
        url = `${url}&page=${page}`;

      const token = await AsyncStorage.getItem('token');
      const res = await authApis(token).get(url);

      if (page === 1)
        setPost(res.data.results);
      else
        setPost([...post, ...res.data.results]);

      if (res.data.next === null)
        setPage(0);

    } catch (error) {
      setSnackbar({
        visible: true,
        message: `Lỗi ${error?.response?.status || 'không xác định'} khi fetch bài viết.`,
        type: "error",
      });
      console.log(error.response.data);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    try {
      setRefreshing(true);
      loadProfile();
      setPost([]);
      if (page !== 1) {
        setPage(1);
      } else {
        fetchPosts();
      }
    } catch (error) {
      setSnackbar({
        visible: true,
        message: `Lỗi ${error?.response?.status || 'không xác định'} khi fetch bài viết.`,
        type: "error",
      });
      console.log(error.response.data);
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    if (page > 0)
      fetchPosts();
  }, [page])

  const fetchMore = () => {
    if (!loading && !refreshing && page > 0)
      setPage(page + 1);
  }
  const handleMediaUpload = async (type) => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.status !== "granted") {
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: type === "cover" ? [16, 9] : [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        let form = new FormData();
        form.append(type, {
          uri: result.assets[0].uri,
          name: result.assets[0].fileName,
          type: result.assets[0].mimeType,
        });
        let token = await AsyncStorage.getItem("token");
        let res = await authApis(token).patch(endpoints["currentUser"], form, {
          headers: {
            accept: "application/json",
            "content-Type": "multipart/form-data",
          },
        });
        if (res.status === 200) {
          setSnackbar({
            visible: true,
            message: `Cập nhật thành công!`,
            type: "success",
          });
          let updated = await authApis(token).get(endpoints["currentUser"]);
          if (updated.status === 200)
            dispatch({
              type: "update",
              payload: updated.data,
            });
        } else {
          setSnackbar({
            visible: true,
            message: `Lỗi ${res.status} khi thực hiện cập nhật ${type === "avatar" ? "Ảnh đại diện" : "Ảnh bìa"
              }`,
            type: "error",
          });
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  const loadProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      let res = ''
      if (!userId) {
        res = await authApis(token).get(endpoints["currentUser"]);
      }
      else {
        res = await authApis(token).get(endpoints["getUser"](userId));
      }
        if (res.data.number_of_followers > 0) {
          const followers = await authApis(token).get(
            endpoints["getUserFollowers"](res.data.id)
          );
            setMinimalFollowers(followers.data.results);
        }
        setProfileData(res.data);
    } catch (err) {
      console.error("Lỗi mạng:", err);
    }
  };

useEffect(() => {
  loadProfile();
}, [userId, currentUser, profileData]);

  const handleFollow = async () => {
    const token = await AsyncStorage.getItem("token");
    const res = await authApis(token).post(endpoints["followUser"](userId));
    if (res.status === 200) {
      setProfileData({
        ...profileData,
        is_following: !profileData.is_following,
        number_of_followers: profileData.is_following
          ? profileData.number_of_followers - 1
          : profileData.number_of_followers + 1,
      });
      setMinimalFollowers((prev) => {
        const exists = prev.some((u) => u.username === currentUser.username);
        if (exists) {
          return prev.filter((u) => u.id !== currentUser.id);
        } else {
          return [...prev, currentUser];
        }
      });
    }
  };

  const renderHeader = () => {
    return <><TouchableOpacity onPress={() => showUploadAlert("cover")}>
      <Image
        style={ProfileStyle.cover}
        source={
          profileData?.cover
            ? { uri: profileData.cover }
            : require("../../assets/default-cover.png")
        }
      />
    </TouchableOpacity>

      <TouchableOpacity onPress={() => showUploadAlert("avatar")}>
        <Image
          style={ProfileStyle.avatar}
          source={
            profileData?.avatar
              ? { uri: profileData.avatar }
              : require("../../assets/default-avatar.jpg")
          }
        />
      </TouchableOpacity>
      <View style={ProfileStyle.m}>
        <Text
          style={[
            ProfileStyle.name,
            ProfileStyle.m,
            { flexShrink: 1, flexWrap: "wrap", maxWidth: "70%" },
          ]}
        >
          {profileData?.last_name + " " + profileData?.first_name}
        </Text>
        <Text style={[ProfileStyle.m, ProfileStyle.username]}>
          {profileData?.username}
        </Text>
        {profileData?.bio ? (
          <Text style={[ProfileStyle.bio, ProfileStyle.m]}>
            {profileData?.bio}
          </Text>
        ) : (
          <></>
        )}

        <TouchableOpacity
          style={[ProfileStyle.followerAvatarContainer, ProfileStyle.m]}
        >
          {profileData.number_of_followers > 0 &&
            minimalFollowers.map((follower, index) => {
              if (index < 2) {
                return (
                  <Image
                    key={index}
                    style={[
                      ProfileStyle.followerAvatar,
                      index === 1 ? ProfileStyle.secondFollowerAvatar : {},
                    ]}
                    source={
                      follower?.avatar
                        ? { uri: follower.avatar }
                        : require("../../assets/default-avatar.jpg")
                    }
                  />
                );
              }
            })}
          <Text
            style={[
              ProfileStyle.followersText,
              profileData.number_of_followers > 0
                ? { marginLeft: 10 }
                : null,
            ]}
          >
            {profileData.number_of_followers} người theo dõi
          </Text>
        </TouchableOpacity>
      </View>
      <View style={[ProfileStyle.r, ProfileStyle.actions]}>
        {profileData?.is_myself ? (
          <TouchableOpacity
            style={[ProfileStyle.button, { flex: 1, margin: 5 }]}
            onPress={handlePresentModalPress}
          >
            <Text style={[ProfileStyle.buttonText, ProfileStyle.p]}>
              Chỉnh sửa thông tin cá nhân
            </Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={[ProfileStyle.button, { flex: 1, margin: 5 }]}
              onPress={() => handleFollow()}
            >
              <Text style={[ProfileStyle.buttonText, ProfileStyle.p]}>
                {profileData?.is_following ? "Bỏ theo dõi" : "Theo dõi"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[ProfileStyle.button, { flex: 1, margin: 5 }]}
            >
              <Text style={[ProfileStyle.buttonText, ProfileStyle.p]}>
                Nhắn tin
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View></>
  }
  return (
    <SafeAreaView>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      <FlatList
        style={{ padding: 0 }}
        ListFooterComponent={loading && <ActivityIndicator />}
        data={post}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={() =>
          <View style={{ flex: 1, alignItems: 'center', paddingTop: 32 }}>
            <Text style={LoginStyle.subTitle}>Không có bài viết</Text>
          </View>
        }
        keyExtractor={item => `${item.id}`}
        contentContainerStyle={{ paddingBottom: tabBarHeight + 16 }}
        renderItem={({ item }) => <Post postData={item} />}
        refreshing={refreshing}
        onEndReached={fetchMore}
        onRefresh={handleRefresh}
      />

      {profileData.is_myself && (
        <BottomSheetModal
          ref={bottomSheetModalRef}
          snapPoints={["80%"]}
          onChange={handleSheetChanges}
        >
          <BottomSheetView style={{ flex: 1 }}>
            <EditProfile
              profileData={profileData}
              modalRef={bottomSheetModalRef}
            />
          </BottomSheetView>
        </BottomSheetModal>
      )}
    </SafeAreaView>
  );
});

export default Profile;
