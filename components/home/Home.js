import { Text, View, TouchableOpacity, Image, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Post from "../post/Post";
import HomeStyle from "../../styles/Home";
import PostStyle from "../../styles/PostStyle";
import { useContext, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApis, endpoints } from "../../configs/Apis";
import { SnackbarContext, UserContext } from "../../configs/Contexts";
import { ActivityIndicator, IconButton } from "react-native-paper";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import LoginStyle from "../../styles/LoginStyle";
import { useNavigation } from "@react-navigation/native";

const Home = () => {
  const nav = useNavigation();
  const currentUser = useContext(UserContext);
  const tabBarHeight = useBottomTabBarHeight();
  const { setSnackbar } = useContext(SnackbarContext);

  const [selectedTab, setSelectedTab] = useState("all");

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);

  const [followingPost, setFollowingPost] = useState([]);
  const [pageFollowing, setPageFollowing] = useState(1);

  const [polls, setPolls] = useState([]);
  const [pollPage, setPollPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [pollLoading, setPollLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const listRef = useRef(null);
  const scrollToTop = () => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const fetchPolls = async () => {
    if (pollPage === 0) return;
    try {
      setPollLoading(true);
      const token = await AsyncStorage.getItem("token");
      const url = `${endpoints["posts"]}?poll=true&page=${pollPage}`;
      const res = await authApis(token).get(url);
      const results = res.data.results || [];

      if (pollPage === 1) {
        setPolls(results);
      } else {
        const unique = results.filter((r) => !polls.some((p) => p.id === r.id));
        setPolls((prev) => [...prev, ...unique]);
      }
      if (res.data.next === null) {
        setPollPage(0);
      }
    } catch (error) {
      console.error(error);
      setSnackbar({
        visible: true,
        message: `Lỗi ${error?.response?.status || "không xác định"} khi fetch poll.`,
        type: "error",
      });
    } finally {
      setPollLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);

      const baseUrl = `${endpoints["posts"]}`;
      const params = ["all=true"];

      if (selectedTab === "following") {
        params.push("following=true");
        if (pageFollowing > 0) params.push(`page=${pageFollowing}`);
      } else {
        if (page > 0) params.push(`page=${page}`);
      }

      const url = `${baseUrl}?${params.join("&")}`;
      
      const token = await AsyncStorage.getItem("token");
      const res = await authApis(token).get(url);

      const results = res.data.results || [];

      if (selectedTab === "all") {
        if (page === 1) {
          setPosts(results);
        } else {
          const unique = results.filter((r) => !posts.some((p) => p.id === r.id));
          setPosts((prev) => [...prev, ...unique]);
        }
      } else {
        if (pageFollowing === 1) {
          setFollowingPost(results);
        } else {
          const unique = results.filter((r) => !followingPost.some((p) => p.id === r.id));
          setFollowingPost((prev) => [...prev, ...unique]);
        }
      }

      if (res.data.next === null) {
        if (selectedTab === "all") setPage(0);
        else setPageFollowing(0);
      }

    } catch (error) {
      console.error(error);
      setSnackbar({
        visible: true,
        message: `Lỗi ${error?.response?.status || "không xác định"} khi fetch bài viết.`,
        type: "error",
      });
      if (selectedTab === "all") {
        setPage(1);
      } else {
        setPageFollowing(1);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTab === "all") {
      if (page > 0) {
        fetchPosts();
      }
    } else {
      if (pageFollowing > 0) {
        fetchPosts();
      }
    }
  }, [selectedTab, page, pageFollowing]);

  useEffect(() => {
    if (selectedTab === "all") {
      if (pollPage > 0)
        fetchPolls();
    }
  }, [selectedTab, pollPage]);

  const fetchMore = () => {
    if (loading || refreshing) return;
    if (selectedTab === "all" && page > 0) {
      setPage((prev) => prev + 1);
    } else if (
      selectedTab === "following" &&
      pageFollowing > 0
    ) {
      setPageFollowing((prev) => prev + 1);
    }
  };

  const fetchMorePoll = () => {
    if (pollLoading || pollPage === 0) return;
    setPollPage((prev) => prev + 1);
  }

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      if (selectedTab === "all") {
        if (pollPage === 1)
          await fetchPolls();
        else setPollPage(1);

        if (page === 1)
          await fetchPosts();
        else setPage(1);
      } else {
        if (pageFollowing === 1)
          await fetchPosts();
        else setPageFollowing(1);
      }
    } catch (error) {
      console.error(error);
      setSnackbar({
        visible: true,
        message: `Lỗi ${error?.response?.status || "không xác định"} khi làm mới dữ liệu.`,
        type: "error",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleOnUpdatePost = (updatedPost) => {
    if (updatedPost.post_type === "poll") {
      setPolls((prev) =>
        prev.map((p) => (p.id === updatedPost.id ? updatedPost : p))
      );
    } else {
      if (selectedTab === "all") {
        setPosts((prev) =>
          prev.map((p) => (p.id === updatedPost.id ? updatedPost : p))
        );
      } else {
        setFollowingPost((prev) =>
          prev.map((p) => (p.id === updatedPost.id ? updatedPost : p))
        );
      }
    }
  };

  const handleOnDeletePost = (postId) => {
    setPolls((prev) => prev.filter((p) => p.id !== postId));
    if (selectedTab === "all") {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } else {
      setFollowingPost((prev) => prev.filter((p) => p.id !== postId));
    }
  };

  const renderPollItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={{ marginRight: 8 }}
        onPress={() =>
          nav.navigate("postDetail", {
            initialPostData: item,
            onUpdateSuccess: handleOnUpdatePost,
            onDeleteSuccess: handleOnDeletePost,
          })
        }
      >
        <Post
          postData={item}
          onUpdateSuccess={handleOnUpdatePost}
          onDeleteSuccess={handleOnDeletePost}
        />
      </TouchableOpacity>
    );
  };

  const renderHeader = () => {
    return (
      <View>
        <TouchableOpacity
          style={[PostStyle.createPostButton, PostStyle.p]}
          onPress={() =>
            nav.navigate("createPost", {
              onGoBack: (newPost) => {
                if (newPost.post_type === "poll") {
                  setPolls((prev) => [newPost, ...prev]);
                } else {
                  setPosts((prev) => [newPost, ...prev]);
                }
              },
            })
          }
        >
          <Image style={PostStyle.avatar} source={{ uri: currentUser?.avatar }} />
          <View>
            <Text style={PostStyle.name}>
              {currentUser?.last_name + " " + currentUser?.first_name}
            </Text>
            <Text style={PostStyle.caption}>Có gì mới?</Text>
          </View>
        </TouchableOpacity>

        {selectedTab === "all" && polls.length > 0 && (
          <View style={{ marginTop: 16 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                marginBottom: 8,
                paddingHorizontal: 12,
              }}
            >
              📊 Khảo sát khả dụng
            </Text>
            <FlatList
              data={polls}
              horizontal={true}
              keyExtractor={(item) => `poll-${item.id}`}
              renderItem={renderPollItem}
              showsHorizontalScrollIndicator={false}
              onEndReached={fetchMorePoll}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                pollLoading && <View style={{ width: "50", }}>
                  <ActivityIndicator style={{ marginRight: 8 }} size="small" />
                </View>}
              contentContainerStyle={{ paddingHorizontal: 12, alignItems: "center" }}
            />
          </View>
        )}

        {selectedTab === "all" && <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            margin: 16,
            marginBottom: 8,
          }}
        >
          📰 Tất cả bài viết
        </Text>}
      </View>
    );
  };

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() =>
          nav.navigate("postDetail", {
            initialPostData: item,
            onUpdateSuccess: handleOnUpdatePost,
            onDeleteSuccess: handleOnDeletePost,
          })
        }
      >
        <Post
          postData={item}
          onUpdateSuccess={handleOnUpdatePost}
          onDeleteSuccess={handleOnDeletePost}
        />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={HomeStyle.container}>
      <View style={HomeStyle.header}>
        <TouchableOpacity
          onPress={() => {
            scrollToTop();
            handleRefresh();
          }}
        >
          <Text style={HomeStyle.headerText}>OU2GETHER</Text>
        </TouchableOpacity>
        <IconButton
          size={20}
          icon="message-text-outline"
          iconColor="black"
          onPress={() => nav.navigate("allChats")}
          style={{ marginVertical: 5 }}
        />
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

      <FlatList
        style={{ padding: 0 }}
        ref={listRef}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={loading && <ActivityIndicator style={{margin: 10}} />}
        ListEmptyComponent={() => (
          <View style={{ flex: 1, padding: 32, alignItems: "center" }}>
            <Text style={LoginStyle.subTitle}>Không có bài viết</Text>
          </View>
        )}
        data={selectedTab === "all" ? posts : followingPost}
        extraData={{ posts, followingPost }}
        keyExtractor={(item) => `${selectedTab}-${item.id}`}
        contentContainerStyle={{ paddingBottom: tabBarHeight + 32 }}
        renderItem={renderItem}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onEndReached={fetchMore}
        onEndReachedThreshold={0.7}
        removeClippedSubviews={true}
      />
    </SafeAreaView>
  );
};

export default Home;
