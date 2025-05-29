import { Image, InteractionManager, Keyboard, Text, TextInput, TouchableOpacity, View } from 'react-native';
import PostStyle from '../../styles/PostStyle';
import dayjs from 'dayjs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApis, endpoints } from '../../configs/Apis';
import { useContext, useEffect, useRef, useState } from 'react';
import Popover from 'react-native-popover-view';
import LoginStyle from '../../styles/LoginStyle';
import { SnackbarContext, UserContext } from '../../configs/Contexts';
import { Dialog, Portal, Button } from 'react-native-paper';
const Comment = ({ postAuthor, initialCommentData, commentInputRef, onDeleteSuccess }) => {

    const [commentData, setCommentData] = useState(initialCommentData);
    console.info(commentData);

    const reactions = [
        { type: 'like', icon: '👍', label: 'Đã Thích', color: "#3C3CCC" },
        { type: 'love', icon: '💖', label: 'Yêu thích', color: "#CC99A2" },
        { type: 'haha', icon: '😆', label: 'Haha', color: "#ffb02e" },
        { type: 'wow', icon: '😯', label: 'Wow', color: "#ffb02e" },
        { type: 'sad', icon: '😢', label: 'Buồn', color: "#ffb02e" },
        { type: 'angry', icon: '😡', label: 'Phẫn nộ', color: "#CC0000" },
    ];
    const likeButtonRef = useRef(null);
    const [showReactions, setShowReactions] = useState(false);
    const [currentReaction, setCurrentReaction] = useState(commentData.my_interaction ? reactions.find(r => r.type === commentData.my_interaction) : null);

    const optionsRef = useRef(null);
    const [showOptions, setShowOptions] = useState(false);

    const [editing, setEditing] = useState(false);
    const [editedComment, setEditedComment] = useState('');
    const editCommentRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const { setSnackbar } = useContext(SnackbarContext);
    const [visible, setVisible] = useState(false);
    const currentUser = useContext(UserContext);
    const isMySelf = currentUser.id === commentData.author.id;
    const canOpenOptions = isMySelf || currentUser.role === 0 || currentUser.id === postAuthor.id;

    const showDialog = () => setVisible(true);
    const hideDialog = () => setVisible(false);
    const [msg, setMsg] = useState('');

    const sendReaction = async (type) => {
        try {
            const token = await AsyncStorage.getItem("token");
            const url = endpoints['interactComment'](commentData.id, type);
            const res = await authApis(token).post(url);
            
            const selected = reactions.find(r => r.type === type);
            if (currentReaction && currentReaction.type === type)
                setCurrentReaction(null);
            else
                setCurrentReaction(selected);
            
            setCommentData(res.data);
        } catch (error) {
            console.error('not ok: ', error);
        }
    };

    const getReactionDisplay = () => {
        if (!currentReaction) {
            return {
                label: "Thích",
                type: "like",
                color: "black"
            };
        }
        return {
            label: currentReaction.label,
            type: currentReaction.type,
            color: currentReaction.color
        };
    };

    const reactionDisplay = getReactionDisplay();

    const validateComment = () => {
        if (editedComment.trim().length === 0)
            return false;
        return true;
    };

    const handleEditComment = async () => {
        Keyboard.dismiss();
        if (!validateComment()) {
            setSnackbar({
                visible: true,
                message: `Bình luận không được để trống!`,
                type: "error",
            });
            return;
        }
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token");
            const res = await authApis(token).patch(endpoints['updateComment'](commentData.id), {
                content: editedComment,
            });
            setCommentData(res.data);
            setEditing(false);
            setSnackbar({
                visible: true,
                message: "Chỉnh sửa thành công!",
                type: "success",
            });
            commentInputRef?.current.enable();
        } catch (error) {
            let msg;
            if (error.response?.status === 403)
                msg = "Bạn không có quyền chỉnh sửa bình luận này!";
            else if (error.response?.status >= 500) {
                msg = "Lỗi máy chủ khi thực hiện chỉnh sửa bình luận!";
            } else {
                msg = "Lỗi không xác định khi chỉnh sửa bình luận!";
                console.error(error);
            }

            setSnackbar({
                visible: true,
                message: msg,
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (editing) {
            setTimeout(() => {
                editCommentRef.current?.focus();
            }, 100);
        }
    }, [editing]);

    const handleDeleteComment = async () => {
        hideDialog();
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token");
            await authApis(token).delete(endpoints['comment'](commentData.id));
            setSnackbar({
                visible: true,
                message: "Xóa thành công!",
                type: "success",
            });
            
            onDeleteSuccess(commentData.id);
        } catch (error) {
            let msg;
            if (error.response?.status === 403)
                msg = "Bạn không có quyền xóa bình luận này!";
            else if (error.response?.status >= 500) {
                msg = "Lỗi máy chủ khi thực hiện xóa bình luận này!";
            } else {
                msg = "Lỗi không xác định khi xóa bình luận này!";
                console.error(error);
            }
            setSnackbar({
                visible: true,
                message: msg,
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <TouchableOpacity style={[PostStyle.r, PostStyle.p, { alignItems: "flex-start" }, editing ? { backgroundColor: "#eeeeee", paddingVertical: 12 } : null]}
            ref={optionsRef}
            onLongPress={() => (!editing && canOpenOptions) ? setShowOptions(true) : null}
        >
            <View>
                <Image
                    style={PostStyle.avatar}
                    source={{ uri: commentData?.author.avatar }}
                />
            </View>

            <View style={{ flex: 1 }}>
                <View>
                    <View>
                        <Text style={PostStyle.name}>{`${commentData?.author.last_name} ${commentData?.author.first_name}`}</Text>
                        {(!editing && commentData?.is_edited === true) && <Text style={PostStyle.date}>Chỉnh sửa {dayjs(commentData?.updated_at).fromNow()}</Text>}
                    </View>
                    {!editing ? <Text style={[PostStyle.content, PostStyle.m_v]} >{commentData?.content}</Text> : <TextInput ref={editCommentRef} style={[PostStyle.content, { backgroundColor: "white", borderRadius: 16, padding: 10, marginVertical: 5 }]} multiline value={editedComment} onChangeText={setEditedComment} placeholder='Nhập bình luận...' />}
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    {!editing ? <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Text style={PostStyle.commentDate}>{`${dayjs(commentData?.created_at).fromNow(true)}`}</Text>
                        <TouchableOpacity
                            ref={likeButtonRef}
                            onPress={() => {
                                sendReaction(reactionDisplay.type);
                                setShowReactions(false);
                            }}
                            onLongPress={() => setShowReactions(true)}
                        >
                            <Text style={{ fontSize: 16, color: reactionDisplay.color, fontWeight: "500", marginLeft: 10 }}>{reactionDisplay.label}</Text>
                        </TouchableOpacity>
                    </View>
                        : <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                            <Text style={PostStyle.date}>Đang chỉnh sửa</Text>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <TouchableOpacity onPress={handleEditComment}><Text style={{ fontSize: 16, color: "blue", fontWeight: "600", marginLeft: 30 }}>Cập nhật</Text></TouchableOpacity>
                                <TouchableOpacity onPress={() => setEditing(false)}><Text style={{ fontSize: 16, color: "red", fontWeight: "600", marginLeft: 35, marginRight: 15 }}>Hủy</Text></TouchableOpacity></View>
                        </View>}
                    {(!editing && commentData?.interaction_count > 0) && <TouchableOpacity onPress={() => { }}><Text style={[PostStyle.m_h, PostStyle.commentDate]}>{commentData?.interaction_count} tương tác</Text></TouchableOpacity>}
                </View>
            </View>

            <Popover
                isVisible={showReactions}
                from={likeButtonRef}
                onRequestClose={() => setShowReactions(false)}
                placement="top"
                arrowSize={{ width: 0, height: 0 }}
                backgroundStyle={{ backgroundColor: 'transparent' }}
            >
                <View style={[PostStyle.reactionBox]}>
                    {reactions.map((r, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => {
                                sendReaction(r.type);
                                setShowReactions(false);
                            }}
                        >
                            <View style={[PostStyle.reactionIcon]}>
                                <Text style={{ fontSize: 28 }}>{r.icon}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </Popover>

            <Popover
                isVisible={showOptions}
                from={optionsRef}
                onRequestClose={() => setShowOptions(false)}
                placement="top"
                arrowSize={{ width: 0, height: 0 }}
                backgroundStyle={{ backgroundColor: 'transparent' }}
            >
                <View style={{ backgroundColor: "#eeeeee", borderColor:"#ccc", borderWidth: 1, width: "100%", alignItems: "center" }}>
                    { isMySelf && 
                        <> 
                            <TouchableOpacity
                                style={{ padding: 20, width: '100%', alignItems: 'center' }}
                                onPress={() => {
                                    setShowOptions(false);
                                    setEditing(true);
                                    setEditedComment(commentData.content);
                                }}
                            >
                                <Text style={[LoginStyle.buttonText, { color: "black" }]}>Chỉnh sửa</Text>
                            </TouchableOpacity>
                            <View style={{ height: 1, backgroundColor: "#ccc", width: "90%" }} /> 
                        </>
                    }
                    <TouchableOpacity
                        style={{ padding: 20, width: '100%', alignItems: 'center' }}
                        onPress={() => {
                            setShowOptions(false);
                            setMsg("Bạn có chắc muốn xóa bình luận này không?");
                            showDialog();
                        }}
                    >
                        <Text style={[LoginStyle.buttonText, { color: "black" }]}>Xóa bình luận</Text>
                    </TouchableOpacity>
                </View>
            </Popover>

            <Portal>
                <Dialog visible={visible} onDismiss={hideDialog}>
                    <Dialog.Title>Thông báo</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium">{msg}</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={handleDeleteComment}>OK</Button>
                        <Button onPress={hideDialog}>Hủy</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </TouchableOpacity>
    );
}
export default Comment;