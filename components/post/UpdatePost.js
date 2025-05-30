import { useContext, useState } from "react";
import { SnackbarContext, UserContext } from "../../configs/Contexts";
import { Image, View, TextInput, Keyboard } from "react-native";
import { Button, Chip, Text } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApis, endpoints } from "../../configs/Apis";
import CreatePostStyle from "../../styles/CreatePostStyle";

const UpdatePost = ({ postData, modalRef, onUpdateSuccess }) => {
    const currentUser = useContext(UserContext);
    const { setSnackbar } = useContext(SnackbarContext);
    const [content, setContent] = useState(postData.content);
    const [isCommentSelected, setIsCommentSelected] = useState(postData.can_comment);
    const initialData = postData;

    const validate = () => {
        let data = content;
        if (data.trim().length === 0)
            return false;
        return true;
    }
    const isDiff = () => {
        if (initialData.content === content && initialData.can_comment === isCommentSelected)
            return false;
        return true;
    }
    const save = async () => {
        if (!validate()) {
            Keyboard.dismiss();
            setSnackbar({
                visible: true,
                message: 'Nội dung không được trống!',
                type: "error",
            });
            return;
        }
        try {
            if (!isDiff()) {
                modalRef.current?.dismiss();
                return;
            }
            modalRef.current?.dismiss();
            const token = await AsyncStorage.getItem("token");
            const response = await authApis(token).patch(endpoints['updatePost'](postData.id), {
                content: content,
                can_comment: isCommentSelected
            });

            if (onUpdateSuccess)
                onUpdateSuccess(response.data);
            setSnackbar({
                visible: true,
                message: 'Cập nhật thành công!',
                type: "success",
            });
        } catch (error) {
            setSnackbar({
                visible: true,
                message: 'Lỗi xảy ra khi cập nhật bài viết!',
                type: "error",
            });
            console.error(error);
        }
    }
    return (
        <>
            <View style={{ flexDirection: 'row', alignItems: 'center', position: 'relative', paddingVertical: 8 }}>
                <View style={{ position: 'absolute', right: 16 }}>
                    <Button onPress={() => save()}>Xong</Button>
                </View>

                <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text variant="titleMedium">Cập nhật bài viết</Text>
                </View>
            </View>
            <View style={[CreatePostStyle.container]}>
                <View style={CreatePostStyle.createPostCard}>
                    <Image style={CreatePostStyle.avatar} source={{ uri: currentUser?.avatar }} />
                    <View style={CreatePostStyle.inputSection}>
                        <Text style={CreatePostStyle.name}>
                            {currentUser?.last_name} {currentUser?.first_name}
                        </Text>
                        <TextInput
                            style={CreatePostStyle.input}
                            multiline
                            placeholder="Có gì mới?"
                            placeholderTextColor="#999"
                            value={content}
                            onChangeText={setContent}
                        />

                        <View style={CreatePostStyle.chipRow}>
                            <Chip
                                style={[
                                    CreatePostStyle.chip,
                                    isCommentSelected && CreatePostStyle.chipActive,
                                ]}
                                selected={isCommentSelected}
                                onPress={() => setIsCommentSelected(!isCommentSelected)}
                            >
                                Đang {isCommentSelected ? "bật" : "tắt"} bình luận
                            </Chip>
                        </View>
                    </View>
                </View>
            </View>
        </>
    )
};
export default UpdatePost;