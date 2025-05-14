import { Alert, Image, ScrollView, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
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

const Profile = ({ route }) => {
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
  const showUploadAlert = (type) => {
    Alert.alert(type === "avatar" ? "Ảnh đại diện" : "Ảnh bìa", "", [
      { text: "Thay đổi", onPress: () => handleMediaUpload(type) },
      { text: "Hủy", sytle: "cancel" },
    ]);
  };
  const handleMediaUpload = async (type) => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.status !== "granted") {
        // alert("Quyền truy cập ảnh bị từ chối");
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
            message: `Lỗi ${res.status} khi thực hiện cập nhật ${
              type === "avatar" ? "Ảnh đại diện" : "Ảnh bìa"
            }`,
            type: "error",
          });
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) {
        setProfileData(currentUser);
      } else {
        try {
          const token = await AsyncStorage.getItem("token");
          const res = await authApis(token).get(endpoints["getUser"](userId));
          if (res.status === 200) {
            if (res.data.number_of_followers > 0) {
              const followers = await authApis(token).get(
                endpoints["getUserFollowers"](userId)
              );
              if (followers.status === 200) {
                setMinimalFollowers(followers.data.results);
              } else console.log("Lỗi lấy followers:", followers.status);
            }
            setProfileData(res.data);
          } else console.log("Lỗi lấy thông tin người dùng:", res.status);
        } catch (err) {
          console.error("Lỗi mạng:", err);
        }
      }
    };
    loadProfile();
  }, [userId, currentUser]);

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

  return (
    <ScrollView style={ProfileStyle.container}>
      <TouchableOpacity onPress={() => showUploadAlert("cover")}>
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
          style={[ProfileStyle.followerAvatarContainer, ProfileStyle.r]}
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
              ProfileStyle.username,
              profileData.number_of_followers > 0
                ? ProfileStyle.followersText
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
      </View>
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

      <View style={[ProfileStyle.postContainer]}>
        <View></View>
        <Post />
      </View>
    </ScrollView>
  );
};

export default Profile;
