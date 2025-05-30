import { Alert, FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import ProfileStyle from "../../styles/ProfileStyle";
import Post from "../post/Post";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
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
import PostStyle from "../../styles/PostStyle";
import { useNavigation } from "@react-navigation/native";

const Profile = ({ route }) => {
  const nav = useNavigation();
  const tabBarHeight = useBottomTabBarHeight();
  const { setSnackbar } = useContext(SnackbarContext);
  const bottomSheetModalRef = useRef(null);
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
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
  const [firstLoadDone, setFirstLoadDone] = useState(false);
  const showUploadAlert = (type) => {
    Alert.alert(type === "avatar" ? "Ảnh đại diện" : "Ảnh bìa", "Bạn muốn làm gì", [
      { text: "Thay đổi", onPress: () => handleMediaUpload(type) },
      { text: "Hủy", sytle: "cancel" },
    ]);
  };

  const fetchPosts = async () => {
    let res;
    try {
      setLoading(true);
      let url = `${endpoints['posts']}`;

      if (!userId) {
        url = `${url}?userId=${currentUser.id}`;
      } else url = `${url}?userId=${userId}`;
      if (page > 0)
        url = `${url}&page=${page}`;
      const token = await AsyncStorage.getItem('token');
      res = await authApis(token).get(url);

      const results = res.data.results;
      if (page === 1)
        setPost(results);
      else {
        const unique = results.filter(r => !post.some(p => p.id === r.id));
        setPost(prev => [...prev, ...unique]);
      }

    } catch (error) {
      setSnackbar({
        visible: true,
        message: `Lỗi ${error?.response?.status || 'không xác định'} khi fetch bài viết.`,
        type: "error",
      });
      console.log(error.response.data);
    } finally {
      setLoading(false);
      if (res.data.next === null)
        setPage(0);
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
      setFirstLoadDone(true);
    } catch (err) {
      console.error("Lỗi mạng:", err);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [currentUser]);

  useEffect(() => {
    if (page > 0)
      fetchPosts();
  }, [page])

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadProfile();
      setPost([]);
      if (page !== 1) {
        setPage(1);
      } else {
        await fetchPosts();
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

  const fetchMore = () => {
    if (!loading && !refreshing && page > 0 && post.length > 0)
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
    return (
      <>
        <TouchableOpacity onPress={profileData?.is_myself ? () => showUploadAlert("cover") : null}>
          <Image
            style={ProfileStyle.cover}
            source={
              profileData?.cover
                ? { uri: profileData.cover }
                : require("../../assets/default-cover.png")
            }
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={profileData?.is_myself ? () => showUploadAlert("avatar") : null}>
          <Image
            style={ProfileStyle.avatar}
            source={
              profileData?.avatar
                ? { uri: profileData.avatar }
                : require("../../assets/default-avatar.jpg")
            }
          />
        </TouchableOpacity>

        {firstLoadDone ? <>
          <View style={ProfileStyle.m}>
            <Text
              style={[
                ProfileStyle.name,
                ProfileStyle.m,
              ]}
            >
              {profileData?.last_name + " " + profileData?.first_name}
            </Text>
            <Text style={[ProfileStyle.m, ProfileStyle.username]}>
              {profileData?.username}
            </Text>
            {profileData?.bio && (
              <Text style={[ProfileStyle.bio, ProfileStyle.m]}>
                {profileData?.bio}
              </Text>
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
                    && { marginLeft: 10 }
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
          </View>
        </> :
          <Text style={[ProfileStyle.name, ProfileStyle.m]}>Đang tải thông tin cá nhân</Text>
        }

        {profileData?.is_myself && <TouchableOpacity
          style={[PostStyle.createPostButton, PostStyle.p, PostStyle.m_v]}
          onPress={() => nav.navigate("createPost", {
            onGoBack: (newPost) => {
              setPost((prevPosts) => [newPost, ...prevPosts]);
            }
          })}
        >
          <Image
            style={PostStyle.avatar}
            source={{ uri: currentUser?.avatar }}
          />
          <View>
            <Text style={PostStyle.name}>{currentUser?.last_name + " " + currentUser?.first_name}</Text>
            <Text style={PostStyle.caption}>Có gì mới?</Text>
          </View>
        </TouchableOpacity>}
      </>
    )
  };

  const handleOnUpdatePost = (updatedPost) => {
    setPost(prev =>
      prev.map(p => (p.id === updatedPost.id ? updatedPost : p))
    );
  };

  const handleOnDeletePost = (postId) => {
    setPost(prev => prev.filter(p => p.id != postId))
  };

  const renderItem = ({ item }) => {
    return (<TouchableOpacity
      onPress={() =>
        nav.navigate("postDetail",
          { initialPostData: item, onUpdateSuccess: handleOnUpdatePost, onDeleteSuccess: handleOnDeletePost }
        )}>
      <Post initialPostData={item} onUpdateSuccess={handleOnUpdatePost} onDeleteSuccess={handleOnDeletePost} />
    </TouchableOpacity>);
  };
  return (
    <>
      <FlatList
        style={{ padding: 0 }}
        ListFooterComponent={loading && <ActivityIndicator />}
        data={post}
        extraData={post}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={() =>
          <View style={{ flex: 1, alignItems: 'center', padding: 32 }}>
            <Text style={LoginStyle.subTitle}>Không có bài viết</Text>
          </View>
        }
        keyExtractor={item => `${item.id}`}
        contentContainerStyle={{ paddingBottom: tabBarHeight + 16 }}
        renderItem={renderItem}
        refreshing={refreshing}
        onEndReached={fetchMore}
        onRefresh={handleRefresh}
        onEndReachedThreshold={0.7}
      />

      {profileData.is_myself && (
        <BottomSheetModal
          ref={bottomSheetModalRef}
          snapPoints={["95%"]}
        >
          <BottomSheetView style={{ flex: 1 }}>
            <EditProfile
              profileData={profileData}
              modalRef={bottomSheetModalRef}
            />
          </BottomSheetView>
        </BottomSheetModal>
      )}
    </>
  );
};

export default Profile;
