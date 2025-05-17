import { Image, KeyboardAvoidingView, Platform, SafeAreaView, TouchableOpacity, View } from "react-native";
import { ActivityIndicator, IconButton, Text, TextInput } from "react-native-paper";
import PostStyle from "../../styles/PostStyle";
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { useNavigation } from "@react-navigation/native";
import { useContext, useEffect, useState } from "react";
import { SnackbarContext, UserContext } from "../../configs/Contexts";
import Comment from "./Comment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApis, endpoints } from "../../configs/Apis";
import { FlatList } from "react-native-gesture-handler";
import LoginStyle from "../../styles/LoginStyle";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
dayjs.extend(relativeTime);
dayjs.locale('vi');

const PostDetail = ({ route }) => {
    const { setSnackbar } = useContext(SnackbarContext);
    const tabBarHeight = useBottomTabBarHeight();
    const nav = useNavigation();
    const { postData } = route.params || {}
    const currentUser = useContext(UserContext);
    const authorId = postData?.author.id;
    const isMySelf = currentUser?.id === authorId;
    const [comment, setComment] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [page, setPage] = useState(1);


    const fetchComments = async () => {
        try {
            setLoading(true);

            let url = `${endpoints['getComments'](postData.id)}`;
            if (page > 0)
                url = `${url}?&page=${page}`;

            const token = await AsyncStorage.getItem("token");
            const res = await authApis(token).get(url);

            if (page === 1)
                setComment(res.data.results);
            else
                setComment([...comment, ...res.data.results]);

            if (res.data.next === null)
                setPage(0);
        } catch (error) {
            setSnackbar({
                visible: true,
                message: `Lỗi ${error?.response?.status || 'không xác định'} khi fetch bình luận.`,
                type: "error",
            });
            // console.log(error.response);
        }
        finally {
            setLoading(false);
        }
    }
    const fetchMore = () => {
        if (!loading && !refreshing && page > 0)
            setPage(page + 1);
    }

    const handleRefresh = () => {
        try {
            setRefreshing(true);
            setComment([]);
            if (page !== 1) {
                setPage(1);
            } else {
                fetchComments();
            }
        }
        catch (error) {
            setSnackbar({
                visible: true,
                message: `Lỗi ${error?.response?.status || 'không xác định'} khi fetch bình luận.`,
                type: "error",
            });
            console.log(error.response.data);
        }
        finally {
            setRefreshing(false);
        }
    }

    // useEffect(() => {
    //     fetchComments();
    // }, []);

    useEffect(() => {
        if (page > 0)
            fetchComments();
    }, [page]);

    const renderHeader = () => {
        return <><View style={PostStyle.header}>
            <TouchableOpacity onPress={() => {
                if (isMySelf) {
                    nav.popToTop();
                    nav.navigate('profile');
                } else {
                    nav.navigate('profileStack', { userId: authorId });
                }
            }}>
                <Image
                    style={PostStyle.avatar}
                    source={{ uri: postData?.author.avatar }}
                />
            </TouchableOpacity>
            <View>
                <Text style={PostStyle.name}>{postData?.author.last_name + " " + postData?.author.first_name}</Text>
                <Text style={PostStyle.date}>{dayjs(postData?.created_at).fromNow(true)}</Text>
            </View>
        </View>

            <View>
                <Text style={[PostStyle.content, PostStyle.m_v]} >{postData?.content}</Text>
                <Image
                    style={PostStyle.attachment}
                    source={{ uri: "https://i.pinimg.com/736x/c2/33/46/c23346e32c1543eb57afb7af8b6e53fd.jpg" }}
                />
            </View>
            <View style={[PostStyle.r, PostStyle.stats]}>
                <Text style={PostStyle.m_h}>{postData?.interaction_count} tương tác</Text>
                <Text style={PostStyle.m_h}>{postData?.comment_count} bình luận</Text>
                <Text style={PostStyle.m_h}>{postData?.share_count} chia sẻ</Text>
            </View>

            <View style={[PostStyle.r, PostStyle.actions]}>
                <TouchableOpacity style={[PostStyle.r, PostStyle.button]}>
                    <IconButton icon="thumb-up" size={20} />
                    <Text>Thích</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[PostStyle.r, PostStyle.button]}>
                    <IconButton icon="comment" size={20} />
                    <Text>Bình luận</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[PostStyle.r, PostStyle.button]}>
                    <IconButton icon="share" size={20} />
                    <Text>Chia sẻ</Text>
                </TouchableOpacity>
            </View>
        </>
    }
    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 180}
        >
            <SafeAreaView style={[PostStyle.container, { position: "relative", flex: 1 }]}>
                <FlatList
                    style={{ padding: 0, flex: 1 }}
                    ListFooterComponent={loading && <ActivityIndicator />}
                    data={comment}
                    ListHeaderComponent={renderHeader}
                    ListEmptyComponent={() =>
                        <View style={{ flex: 1, alignItems: 'center', padding: 32 }}>
                            <Text style={LoginStyle.subTitle}>Không có bình luận nào</Text>
                        </View>
                    }
                    keyExtractor={item => `${item.id}`}
                    contentContainerStyle={{ paddingBottom: tabBarHeight + 32 }}
                    renderItem={({ item }) => <Comment commentData={item} />}
                    refreshing={refreshing}
                    onEndReached={fetchMore}
                    onRefresh={handleRefresh}
                />

                {/* <TextInput
          mode="outlined"
          placeholder="Viết bình luận..."
          style={{ flex: 1, height: tabBarHeight }}
          value={newComment}
          onChangeText={setNewComment}
          right={<TextInput.Icon icon="send" />}
        /> */}
            </SafeAreaView>
        </KeyboardAvoidingView>
    )
};
export default PostDetail;