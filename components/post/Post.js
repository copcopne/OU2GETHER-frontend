import { Image, TouchableOpacity, View } from "react-native";
import { Button, Card, Checkbox, Dialog, IconButton, Portal, Text } from "react-native-paper";
import PostStyle from "../../styles/PostStyle";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { useNavigation } from "@react-navigation/native";
import { SnackbarContext, UserContext } from "../../configs/Contexts";
import Popover from "react-native-popover-view";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApis, endpoints } from "../../configs/Apis";
import LoginStyle from "../../styles/LoginStyle";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import UpdatePost from "./UpdatePost";

dayjs.extend(relativeTime);
dayjs.locale('vi');

const Post = ({ initialPostData, commentInputRef, onDeleteSuccess, onUpdateSuccess }) => {

    const [postData, setPostData] = useState(initialPostData);
    const [pollData, setPollData] = useState(initialPostData.post_type === 'poll' ? initialPostData.poll : null);
    const [options, setOptions] = useState([]);
    const [oldOptions, setOldOptions] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [isDiff, setIsDiff] = useState(false);
    const [loading, setLoading] = useState(false);

    const reactions = [
        { type: 'like', icon: '👍', label: 'Đã Thích', color: "#3C3CCC" },
        { type: 'love', icon: '💖', label: 'Yêu thích', color: "#CC99A2" },
        { type: 'haha', icon: '😆', label: 'Haha', color: "#ffb02e" },
        { type: 'wow', icon: '😯', label: 'Wow', color: "#ffb02e" },
        { type: 'sad', icon: '😢', label: 'Buồn', color: "#ffb02e" },
        { type: 'angry', icon: '😡', label: 'Phẫn nộ', color: "#CC0000" },
    ];
    const bottomSheetModalRef = useRef(null);
    const handlePresentModalPress = useCallback(() => {
        bottomSheetModalRef.current?.present();
    }, []);
    const likeButtonRef = useRef();
    const [showReactions, setShowReactions] = useState(false);
    const { setSnackbar } = useContext(SnackbarContext);
    const nav = useNavigation();
    const currentUser = useContext(UserContext);
    const authorId = postData?.author.id;
    const isMySelf = currentUser?.id === authorId;
    const canOpenOptions = isMySelf || currentUser.role === 0;
    const getCurrentReaction = () =>
        postData.my_interaction
            ? reactions.find(r => r.type === postData.my_interaction)
            : null;
    const [showOptions, setShowOptions] = useState(false);
    const showOptionsRef = useRef(null);

    const [visible, setVisible] = useState(false);

    const showDialog = () => setVisible(true);
    const hideDialog = () => setVisible(false);
    const [msg, setMsg] = useState('');

    const sendReaction = async (type) => {
        try {
            const token = await AsyncStorage.getItem("token");
            const url = endpoints['interactPost'](postData.id, type);
            const res = await authApis(token).post(url);
            setPostData(res.data);

            if (onUpdateSuccess)
                onUpdateSuccess(res.data);
        } catch (error) {
            console.error('not ok: ', error);
        }
    };

    const getReactionDisplay = () => {
        const currentReaction = getCurrentReaction();
        if (!currentReaction) {
            return { icon: "thumb-up", label: "Thích", type: "like" };
        }
        return {
            icon: null,
            label: currentReaction.label,
            emoji: currentReaction.icon,
            type: currentReaction.type,
            color: currentReaction.color
        };
    };
    const reactionDisplay = getReactionDisplay();

    useEffect(() => {
        setPostData(initialPostData);
        setPollData(initialPostData.post_type === 'poll' ? initialPostData.poll : null);
        const options = initialPostData.post_type === 'poll' ? initialPostData.poll?.options : null;
        setOptions(options);

        if (options) {
            const voted = options
                .filter(option => option.is_voted === true)
                .map(option => option.id);
            setOldOptions(voted);
            setSelectedOptions(voted);
        }
    }, [initialPostData]);

    useEffect(() => {
        const setOld = new Set(oldOptions);
        const setNew = new Set(selectedOptions);
        if ((oldOptions.length !== selectedOptions.length) || (setOld.size !== setNew.size)) {
            setIsDiff(true);
            return;
        }
        for (let item of setOld)
            if (!setNew.has(item)) {
                setIsDiff(true); 
                return;
            }

        setIsDiff(false);
    }, [selectedOptions]);

    const toggleOption = (optionId) => {
        setSelectedOptions((prev) => {
            if (prev.includes(optionId)) {
                return prev.filter(id => id !== optionId);
            } else {
                return [...prev, optionId];
            }
        });
    };

    const handleSubmitPollOptions = async () => {
        if(isDiff) {
            try {
                setLoading(true);
                const token = await AsyncStorage.getItem("token");
                const result = authApis(token).post(endpoints['vote'], {
                    options_ids: selectedOptions
                });
                setPostData(result.data);
                if(onUpdateSuccess)
                    onDeleteSuccess(result.data);
            } catch (error) {

            } finally {
                setLoading(false);
            }
        }

    }

    const handleToggleComment = async () => {
        setShowOptions(false);
        try {
            const token = await AsyncStorage.getItem("token");
            const res = await authApis(token).patch(endpoints['updatePost'](postData.id), {
                can_comment: !postData.can_comment,
            });
            setPostData(res.data);
            setSnackbar({
                visible: true,
                message: `${postData.can_comment ? "Khóa" : "Mở khóa"} bình luận thành công!`,
                type: "success",
            });
            onUpdateSuccess(res.data);
        } catch (error) {
            let msg;
            if (error.response?.status === 403)
                msg = "Bạn không có thay đổi trạng thái bài viết này!";
            else if (error.response?.status >= 500) {
                msg = "Lỗi máy chủ khi thực hiện thay đổi trạng thái bài viết này!";
            } else {
                msg = "Lỗi không xác định khi thực hiện thay đổi trạng thái bài viết này!";
                console.error(error);
            }

            setSnackbar({
                visible: true,
                message: msg,
                type: "error",
            });
        }
    }

    const handleDeletePost = async () => {
        hideDialog();
        try {
            const token = await AsyncStorage.getItem("token");
            await authApis(token).delete(endpoints['post'](postData.id));
            setSnackbar({
                visible: true,
                message: "Xóa thành công!",
                type: "success",
            });

            onDeleteSuccess(postData.id);
        } catch (error) {
            let msg;
            if (error.response?.status === 403)
                msg = "Bạn không có quyền xóa bài viết này!";
            else if (error.response?.status >= 500) {
                msg = "Lỗi máy chủ khi thực hiện xóa bài viết này!";
            } else {
                msg = "Lỗi không xác định khi xóa bài viết này!";
                console.error(error);
            }

            setSnackbar({
                visible: true,
                message: msg,
                type: "error",
            });
        }
    };

    return (
        <View style={[PostStyle.p, PostStyle.container]}>
            <View style={PostStyle.header}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TouchableOpacity onPress={() => {
                        if (isMySelf) {
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
                        <Text style={PostStyle.date}>{`${dayjs(postData?.created_at).fromNow(true)} ${postData?.is_edited === true ? `(chỉnh sửa ${dayjs(postData?.updated_at).fromNow()})` : ""}`}</Text>
                    </View>
                </View>
                {canOpenOptions ? <IconButton
                    ref={showOptionsRef}
                    icon="dots-horizontal"
                    size={24}
                    onPress={() => setShowOptions(true)}
                    style={PostStyle.more}
                /> : null}
            </View>
            <Popover
                isVisible={showOptions}
                from={showOptionsRef}
                onRequestClose={() => setShowOptions(false)}
                placement="auto"
                arrowSize={{ width: 20, height: 10 }}
                backgroundStyle={{ backgroundColor: 'transparent' }}
                popoverStyle={{ borderRadius: 15, backgroundColor: "#eeeeee" }}
            >
                <View style={{ backgroundColor: "#eeeeee", width: "100%", alignItems: "center" }}>
                    {isMySelf ? <><TouchableOpacity
                        style={{ padding: 20, width: '100%', alignItems: 'center' }}
                        onPress={() => {
                            setShowOptions(false);
                            handlePresentModalPress();
                        }}
                    >
                        <Text style={[LoginStyle.buttonText, { color: "black" }]}>Chỉnh sửa</Text>
                    </TouchableOpacity>
                        <View style={{ height: 1, backgroundColor: "#ccc", width: "90%" }} />
                        <TouchableOpacity
                            style={{ padding: 20, width: '100%', alignItems: 'center' }}
                            onPress={handleToggleComment}
                        >
                            <Text style={[LoginStyle.buttonText, { color: "black" }]}>{postData.can_comment ? "Khoá" : "Mở khóa"} bình luận</Text>
                        </TouchableOpacity>
                        <View style={{ height: 1, backgroundColor: "#ccc", width: "90%" }} /></> : null}
                    <TouchableOpacity
                        style={{ padding: 20, width: '100%', alignItems: 'center' }}
                        onPress={() => {
                            setShowOptions(false);
                            setMsg("Bạn có chắc muốn xóa bài viết này không?");
                            showDialog();
                        }}
                    >
                        <Text style={[LoginStyle.buttonText, { color: "black" }]}>Xóa bài viết</Text>
                    </TouchableOpacity>
                </View>
            </Popover>

            <View>
                <Text style={[PostStyle.content, PostStyle.m_v]} >{postData?.content}</Text>
            </View>
            {pollData &&
                <Card style={{margin: 8}}>
                    <Card.Title
                    titleStyle={{fontWeight:"bold", fontSize: 18}}
                        title={pollData.question}
                        subtitle={pollData.is_ended
                            ? "Khảo sát này đã kết thúc"
                            : `Kết thúc sau ${dayjs(pollData?.end_time).fromNow(true)}`}
                    />
                    <Card.Content>
                        {options.map((option) => (
                            <Checkbox.Item
                                key={option.id}
                                label={option.content}
                                status={selectedOptions.includes(option.id) ? "checked" : "unchecked"}
                                disabled={pollData.is_ended}
                                onPress={() => toggleOption(option.id)}

                            />
                        ))}
                        {(!pollData.is_ended && isDiff) && (
                            <Button 
                            style={{margin: 10}} 
                            mode="contained" 
                            onPress={handleSubmitPollOptions}
                            disabled={loading}
                            loading={loading}
                            >
                                Gửi câu trả lời
                            </Button>
                        )}
                    </Card.Content>
                </Card>
            }
            <View style={[PostStyle.r, PostStyle.stats]}>
                {postData?.interaction_count > 0 ? <TouchableOpacity onPress={() => { }}><Text style={[PostStyle.m_h, PostStyle.date]}>{postData?.interaction_count} tương tác</Text></TouchableOpacity> : <View></View>}
                {postData?.comment_count > 0 ? <Text style={[PostStyle.m_h, PostStyle.date]}>{postData?.comment_count} bình luận</Text> : null}
                {postData?.share_count > 0 ? <Text style={[PostStyle.m_h, PostStyle.date]}>{postData?.share_count} chia sẻ</Text> : null}
            </View>

            <Popover
                isVisible={showReactions}
                from={likeButtonRef}
                onRequestClose={() => setShowReactions(false)}
                placement="auto"
                arrowSize={{ width: 20, height: 10 }}
                backgroundStyle={{ backgroundColor: 'transparent' }}
                popoverStyle={{ borderRadius: 30, backgroundColor: "#eeeeee" }}
            >
                <View style={[PostStyle.reactionBox]}>
                    {reactions.map((r, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => {
                                setShowReactions(false);
                                sendReaction(r.type);
                            }}
                        >
                            <View style={[PostStyle.reactionIcon]}>
                                <Text style={{ fontSize: 28 }}>{r.icon}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </Popover>

            <View style={[PostStyle.r, PostStyle.actions]}>
                <TouchableOpacity
                    ref={likeButtonRef}
                    style={[PostStyle.r, PostStyle.button]}
                    onPress={() => {
                        sendReaction(reactionDisplay.type);
                    }}
                    onLongPress={() => setShowReactions(true)}
                >
                    {reactionDisplay.icon ? (
                        <>
                            <IconButton icon={reactionDisplay.icon} size={20} />
                            <Text style={{ color: reactionDisplay.color }}>{reactionDisplay.label}</Text>
                        </>
                    ) : (
                        <>
                            <Text style={{ fontSize: 20, paddingVertical: 6 }}>{reactionDisplay.emoji}</Text>
                            <Text style={{ marginLeft: 10, color: reactionDisplay.color, fontWeight: "600" }}>{reactionDisplay.label}</Text>
                        </>
                    )}
                </TouchableOpacity>

                {postData?.can_comment ? <TouchableOpacity style={[PostStyle.r, PostStyle.button]} onPress={() => !commentInputRef ? nav.navigate('postDetail', { initialPostData: postData, commenting: true }) : commentInputRef.current.focus()}>
                    <IconButton icon="comment" size={20} />
                    <Text>Bình luận</Text>
                </TouchableOpacity> : null}
            </View>

            <Portal>
                <Dialog visible={visible} onDismiss={hideDialog}>
                    <Dialog.Title>Thông báo</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium">{msg}</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={handleDeletePost}>OK</Button>
                        <Button onPress={hideDialog}>Hủy</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

            <BottomSheetModal
                ref={bottomSheetModalRef}
                snapPoints={["95%"]}
            >
                <BottomSheetView style={{ flex: 1 }}>
                    <UpdatePost
                        postData={postData}
                        modalRef={bottomSheetModalRef}
                        onUpdateSuccess={onUpdateSuccess}
                    />
                </BottomSheetView>
            </BottomSheetModal>
        </View>
    );
};
export default Post;
