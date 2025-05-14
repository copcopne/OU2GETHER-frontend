import { Text, View, ScrollView, TouchableOpacity, Image, FlatList } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Post from "../post/Post";
import HomeStyle from "../../styles/Home";
import PostStyle from "../../styles/PostStyle";
import React, { useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApis, endpoints } from "../../configs/Apis";
import { SnackbarContext } from "../../configs/Contexts";
import { ActivityIndicator } from "react-native-paper";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import LoginStyle from "../../styles/LoginStyle";
import { useNavigation } from "@react-navigation/native";

const Home = () => {
  const tabBarHeight = useBottomTabBarHeight();
  const { setSnackbar } = useContext(SnackbarContext);
  const [selectedTab, setSelectedTab] = React.useState("all");
  const [posts, setPosts] = useState([]);
  const [followingPost, setFollowingPost] = useState([]);
  const [page, setPage] = useState(1);
  const [pageFollowing, setPageFollowing] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      let url = `${endpoints['posts']}`;

      if (selectedTab === "following") {
        url = `${endpoints['posts']}?following=true`;
        if (pageFollowing > 0)
          url = `${url}&page=${pageFollowing}`;
      } else if (page > 0)
        url = `${url}?page=${page}`;

      const token = await AsyncStorage.getItem('token');
      const res = await authApis(token).get(url);

      // if (res.response !== 200){
      //   if (selectedTab === "all")
      //     setPage(0);
      //   else setPageFollowing(0);
      //   return;
      // }

      if (selectedTab === "all") {
        setPosts([...posts, ...res.data.results]);
        if (res.data.next === null)
          setPage(0)
      }
      else {
        setFollowingPost([...followingPost, ...res.data.results]);
        if (res.data.next === null)
          setPageFollowing(0)
      }

    } catch (error) {
      setSnackbar({
        visible: true,
        message: `Lỗi ${error?.response?.status || 'không xác định'} khi fetch bài viết.`,
        type: "error",
      });
      if (selectedTab === "all") {
        setPage(1);
      } else setPageFollowing(1);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTab === "all") {
      setPageFollowing(1);
      setFollowingPost([]);
    } else {
      setPage(1);
      setPosts([]);
    }
    fetchPosts();
  }, [selectedTab]);

  useEffect(() => {
    if ((selectedTab === 'all' && page > 0) ||
      (selectedTab === 'following' && pageFollowing > 0))
      fetchPosts();
  }, [page, pageFollowing]);

  const fetchMore = () => {
    if (!loading)
      if (selectedTab === "all" && page > 0)
        setPage(page + 1);
      else if (selectedTab === "following" && pageFollowing > 0)
        setPageFollowing(pageFollowing + 1);
  }
  return (
    <SafeAreaView style={HomeStyle.container}>
      <View style={HomeStyle.header}>
        <Text style={HomeStyle.headerText}>OU2GETHER</Text>
      </View>

      <View style={HomeStyle.tabContainer}>
        <TouchableOpacity onPress={() => setSelectedTab("all")}>
          <Text
            style={[
              HomeStyle.tabText,
              selectedTab === "all" && HomeStyle.tabTextActive,
            ]}
          >
            Tất cả
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSelectedTab("following")}>
          <Text
            style={[
              HomeStyle.tabText,
              selectedTab === "following" && HomeStyle.tabTextActive,
            ]}
          >
            Đang theo dõi
          </Text>
        </TouchableOpacity>
      </View>

      <View style={HomeStyle.storyContainer}>
        <Image
          style={PostStyle.avatar}
          source={{ uri: "https://i.pinimg.com/736x/c2/33/46/c23346e32c1543eb57afb7af8b6e53fd.jpg" }}
        />
        <View>
          <Text style={PostStyle.username}>copcopne</Text>
          <Text style={PostStyle.caption}>Có gì mới</Text>
        </View>
      </View>

      <View style={HomeStyle.feed}>
        {(selectedTab === 'following' && !loading && followingPost.length === 0) ||
          (selectedTab === 'all' && !loading && posts.length === 0) ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={LoginStyle.title}>Không có bài viết</Text>
          </View>
        ) : (
          <FlatList
            onEndReached={fetchMore}
            ListFooterComponent={loading && <ActivityIndicator />}
            data={selectedTab === "all" ? posts : followingPost}
            keyExtractor={item => `${selectedTab}-${item.id}`}
            contentContainerStyle={{ paddingBottom: tabBarHeight + 16 }}
            renderItem={({ item }) => <Post postData={item} />} />)}
      </View>
    </SafeAreaView>
  );
};

export default Home;
