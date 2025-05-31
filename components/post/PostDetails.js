import { KeyboardAvoidingView, View, TextInput, Keyboard, RefreshControl } from "react-native";
import { ActivityIndicator, IconButton, Text } from "react-native-paper";
import PostStyle from "../../styles/PostStyle";
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { useContext, useEffect, useRef, useState } from "react";
import { SnackbarContext } from "../../configs/Contexts";
import Comment from "./Comment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApis, endpoints } from "../../configs/Apis";
import LoginStyle from "../../styles/LoginStyle";
import Post from "./Post";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const PostDetail = ({ route }) => {
    const insets = useSafeAreaInsets();
    const { initialPostData } = route.params || {}
    const [postData, setPostData] = useState(initialPostData);
    const { onUpdateSuccess } = route.params || {}
    const { onDeleteSuccess } = route.params || {}
    const { setSnackbar } = useContext(SnackbarContext);
    const { commenting } = route.params || {}
    const [comment, setComment] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [page, setPage] = useState(1);
    const commentInputRef = useRef(null);
    const nav = useNavigation();

    if (commenting)
        commentInputRef.current?.focus();

    const fetchComments = async () => {
        try {
            setLoading(true);

            let url = `${endpoints['getComments'](postData.id)}`;
            if (page > 0)
                url = `${url}?&page=${page}`;

            const token = await AsyncStorage.getItem("token");
            const res = await authApis(token).get(url);

            const results = res.data.results;
            if (page === 1)
                setComment(results);
            else {
                const unique = results.filter(r =>
                    !comment.some(c => c.id === r.id)
                );
                setComment(prev => [...prev, ...unique]);
            }

            if (res.data.next === null)
                setPage(0);
        } catch (error) {
            setSnackbar({
                visible: true,
                message: `Lỗi ${error?.response?.status || 'không xác định'} khi fetch bình luận.`,
                type: "error",
            });
            console.error(error);
        }
        finally {
            setLoading(false);
        }
    }
    const fetchMore = () => {
        if (!loading && !refreshing && page > 0)
            setPage(page + 1);
    }

    const fetchPost = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const res = await authApis(token).get(endpoints['post'](postData.id));
            setPostData(res.data);
            if (onUpdateSuccess)
                onUpdateSuccess(res.data);
        } catch (error) {
            setSnackbar({
                visible: true,
                message: `Lỗi ${error?.response?.status || 'không xác định'} khi fetch bài viết.`,
                type: "error",
            });
            console.error(error);
        }
    };

    const handleRefresh = async () => {
        try {
            setRefreshing(true);
            setComment([]);
            await fetchPost();
            if (page !== 1) {
                setPage(1);
            } else {
                await fetchComments();
            }
        }
        catch (error) {
            setSnackbar({
                visible: true,
                message: `Lỗi ${error?.response?.status || 'không xác định'} khi fetch bình luận.`,
                type: "error",
            });
            console.error(error);
        }
        finally {
            setRefreshing(false);
        }
    }

    const validateComment = () => {
        let data = newComment;
        if (data.trim().length === 0)
            return false;
        return true;
    };

    const handleComment = async () => {
        if (!validateComment()) {
            setSnackbar({
                visible: true,
                message: `Vui lòng nhập bình luận!`,
                type: "error",
            });
            return;
        }
        try {
            setUploading(true);
            Keyboard.dismiss();
            const token = await AsyncStorage.getItem("token");
            const res = await authApis(token).post(endpoints['commentOnPost'](postData.id), {
                content: newComment
            });
            await fetchPost();
            
            setComment([res.data, ...comment]);
            setNewComment("");

            if (onUpdateSuccess)
                onUpdateSuccess(postRes.data);
        } catch (error) {
            if (error.response.status === 403)
                setSnackbar({
                    visible: true,
                    message: `Bài viết đã giới hạn quyền bình luận.`,
                    type: "error",

                });
            else console.error(error);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteComment = (commentId) => {
        setComment(prev => prev.filter(c => c.id != commentId))
    }

    const handleDeletePost = (postId) => {
        nav.goBack();
        return onDeleteSuccess(postId);
    }

    useEffect(() => {
        if (page > 0)
            fetchComments();
    }, [page]);

    const renderHeader = () => {
        return <Post initialPostData={postData} commentInputRef={commentInputRef} onUpdateSuccess={onUpdateSuccess} onDeleteSuccess={handleDeletePost} />
    }
    
    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: "white", width: "100%" }}
            behavior="padding"
            keyboardVerticalOffset={insets.bottom + 45}
        >
            <KeyboardAwareFlatList
                enableOnAndroid
                extraScrollHeight={120}
                keyboardOpeningTime={0}
                style={PostStyle.container}
                data={comment}
                ListHeaderComponent={renderHeader()}
                ListFooterComponent={loading ? <ActivityIndicator /> : null}
                ListEmptyComponent={
                    <View style={{ flex: 1, alignItems: 'center', padding: 32 }}>
                        <Text style={LoginStyle.subTitle}>Không có bình luận nào</Text>
                    </View>
                }
                keyExtractor={item => `${item.id}`}
                renderItem={({ item }) => (
                    <Comment
                        initialCommentData={item}
                        commentInputRef={commentInputRef}
                        onDeleteSuccess={handleDeleteComment}
                        postAuthor={postData.author}
                    />
                )}
                contentContainerStyle={{ paddingBottom: 32, flexGrow: 1 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                    />
                }
                onEndReached={!refreshing ? fetchMore : null}
                onEndReachedThreshold={0.7}
                keyboardShouldPersistTaps="handled"
            />
            
            <View
                style={{
                    marginHorizontal: 20,
                    marginBottom: 20,
                    backgroundColor: "#EFEFEF",
                    borderRadius: 18,
                    flexDirection: "row",
                    alignItems: "center",
                    paddingLeft: 10,
                }}
            >
                {postData.can_comment ? (
                    <View style={{flexDirection:"row"}}>
                        <TextInput
                            ref={commentInputRef}
                            style={[{ flex: 1, marginRight: 5}, PostStyle.content]}
                            multiline
                            placeholder="Viết bình luận..."
                            placeholderTextColor="#aaa"
                            value={newComment}
                            onChangeText={setNewComment}
                        />
                        {!uploading ? (
                            <IconButton icon="send" onPress={handleComment} style={{ padding: 0 }} />
                        ) : (
                            <ActivityIndicator color="black" style={{ marginRight: 10 }} />
                        )}
                    </View>
                ) : (
                    <Text style={{ padding: 10, fontSize: 16 }}>
                        Bài viết đã giới hạn quyền bình luận
                    </Text>
                )}
            </View>
        </KeyboardAvoidingView>
    );
};
export default PostDetail;