import { Text, View, ScrollView, TouchableOpacity, Image, FlatList, TouchableWithoutFeedback } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Post from "../post/Post";
import HomeStyle from "../../styles/Home";
import PostStyle from "../../styles/PostStyle";
import React, { useContext, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApis, endpoints } from "../../configs/Apis";
import { SnackbarContext, UserContext } from "../../configs/Contexts";
import { ActivityIndicator, Icon } from "react-native-paper";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import LoginStyle from "../../styles/LoginStyle";
import { useNavigation } from "@react-navigation/native";

const Home = () => {
  const nav = useNavigation();
  const currentUser = useContext(UserContext);
  const tabBarHeight = useBottomTabBarHeight();
  const { setSnackbar } = useContext(SnackbarContext);
  const [selectedTab, setSelectedTab] = React.useState("all");
  const [posts, setPosts] = useState([]);
  const [followingPost, setFollowingPost] = useState([]);
  const [page, setPage] = useState(1);
  const [pageFollowing, setPageFollowing] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const listRef = useRef(null);

  const scrollToTop = () => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const fetchPosts = async () => {
    let res
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
      res = await authApis(token).get(url);

      if (selectedTab === "all") {
        if (page === 1) setPosts(res.data.results);
        else setPosts([...posts, ...res.data.results]);
      }
      else {
        if (pageFollowing === 1) setFollowingPost(res.data.results);
        else setFollowingPost([...followingPost, ...res.data.results]);
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
      console.error(error);
    } finally {
      setLoading(false);
      if (res.data.next === null)
        setPage(0)
      if (res.data.next === null)
        setPageFollowing(0)
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      if (selectedTab === "all") {
        setPosts([]);
        if (page !== 1) {
          setPage(1);
        } else {
          await fetchPosts();
        }
      } else {
        setFollowingPost([]);
        if (pageFollowing !== 1) {
          setPageFollowing(1);
        } else {
          await fetchPosts();
        }
      }
    } catch (error) {
      setSnackbar({
        visible: true,
        message: `Lỗi ${error?.response?.status || 'không xác định'} khi fetch bài viết.`,
        type: "error",
      });
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  }

  const handleOnUpdatePost = (updatedPost) => {
    if (selectedTab === "all") {
      setPosts(prev =>
        prev.map(p => (p.id === updatedPost.id ? updatedPost : p))
      );
    } else {
      setFollowingPost(prev =>
        prev.map(p => (p.id === updatedPost.id ? updatedPost : p))
      );
    }
  };
  
  const handleOnDeletePost = (postId) => {
    if (selectedTab === "all") {
      setPosts(prev => prev.filter(p => p.id != postId))
    } else {
      setFollowingPost(prev => prev.filter(p => p.id != postId))
    }
  }

  useEffect(() => {
    if ((selectedTab === 'all' && page > 0) ||
      (selectedTab === 'following' && pageFollowing > 0))
      fetchPosts();
  }, [page, pageFollowing, selectedTab]);

  const fetchMore = () => {
    if (!loading && !refreshing)
      if (selectedTab === "all" && page > 0 && posts.length > 0)
        setPage(page + 1);
      else if (selectedTab === "following" && pageFollowing > 0 && followingPost.length > 0)
        setPageFollowing(pageFollowing + 1);
  }
  const renderHeader = () => {
    return (
      <>
        <TouchableOpacity
          style={[PostStyle.createPostButton, PostStyle.p]}
          onPress={() => nav.navigate("createPost", {
            onGoBack: (newPost) => {
              setPosts((prevPosts) => [newPost, ...prevPosts]);
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
        </TouchableOpacity>
      </>
    );
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
    <SafeAreaView style={HomeStyle.container}>
      <TouchableOpacity
        onPress={() => {
          scrollToTop();
          handleRefresh();
        }}>
        <View style={HomeStyle.header}>
          <Text style={HomeStyle.headerText}>OU2GETHER</Text>
        </View>
      </TouchableOpacity>


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

      <FlatList
        style={{ padding: 0 }}
        ListFooterComponent={loading && <ActivityIndicator />}
        ref={listRef}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={() =>
          <View style={{ flex: 1, padding: 32, alignItems: 'center' }}>
            <Text style={LoginStyle.subTitle}>Không có bài viết</Text>
          </View>
        }
        data={selectedTab === "all" ? posts : followingPost}
        extraData={selectedTab === "all" ? posts : followingPost}
        keyExtractor={item => `${selectedTab}-${item.id}`}
        contentContainerStyle={{ paddingBottom: tabBarHeight + 16 }}
        renderItem={renderItem}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onEndReached={fetchMore}
        onEndReachedThreshold={0.7}
      />
    </SafeAreaView>
  );
};

export default Home;
