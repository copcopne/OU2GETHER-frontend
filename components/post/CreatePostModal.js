import { useContext, useRef, useState } from "react";
import { SnackbarContext, UserContext } from "../../configs/Contexts";
import { Image, View, TextInput, TouchableOpacity, Keyboard, Text } from "react-native";
import { ActivityIndicator, Button, Chip, Icon } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApis, endpoints } from "../../configs/Apis";
import CreatePostStyle from "../../styles/CreatePostStyle";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { Portal, PortalHost } from '@gorhom/portal';
import PostStyle from "../../styles/PostStyle";

const CreatePostModal = () => {
    const { setSnackbar } = useContext(SnackbarContext);
    const [content, setContent] = useState('');
    const currentUser = useContext(UserContext);
    const [loading, setLoading] = useState(false);
    const [isCommentSelected, setIsCommentSelected] = useState(true);

    const bottomSheetRef = useRef(null);

    const validate = () => {
        let data = content;
        if (data.trim().length === 0)
            return false;
        return true;
    }
    const upload = async () => {
        Keyboard.dismiss();
        if (!validate()) {
            setSnackbar({
                visible: true,
                message: 'Vui lòng nhập nội dung',
                type: "error",
            });
            return;
        }
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token");
            await authApis(token).post(endpoints['posts'], {
                content: content,
                can_comment: isCommentSelected
            });
            setSnackbar({
                visible: true,
                message: 'Đăng thành công!',
                type: "success",
            });
            bottomSheetRef?.current?.close();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }
    const handleAddButtonPress = () => {
        bottomSheetRef?.current?.expand();
    }
    return (<>
        <TouchableOpacity style={{ marginTop: 5, justifyContent: "center", alignItems: "center" }} onPress={handleAddButtonPress}>
            <Icon size={30} source="plus-circle" color="black" />
            <Text style={[PostStyle.date, { fontSize: 12, fontWeight: 700, color: "black" }]}>Tạo bài viết</Text>
        </TouchableOpacity>
        <Portal>
            <BottomSheet
                ref={bottomSheetRef}
                snapPoints={["95%"]}
                index={-1}
                enablePanDownToClose={true}
            >
                <BottomSheetView style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', position: 'relative', paddingVertical: 8 }}>
                        <View style={{ position: 'absolute', right: 16 }}>
                            <Button onPress={() => upload()}>ĐĂNG</Button>
                        </View>
                        <View style={{ position: 'absolute', left: 16 }}>
                            <Button onPress={() => bottomSheetRef?.current?.close()}>HỦY</Button>
                        </View>

                        <View style={{ flex: 1, alignItems: 'center' }}>
                            <Text style={{ fontSize: 20, fontWeight: "800" }}>Tạo bài viết</Text>
                        </View>
                    </View>
                    <View style={[CreatePostStyle.container]}>
                        {loading && <View style={{ zIndex: 999, position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: "rgba(0,0,0,0.1)" }}>
                            <ActivityIndicator size="large" color="black" />
                        </View>}
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
                </BottomSheetView>
            </BottomSheet>
        </Portal>
        <PortalHost name="create_post_host" />
    </>)
};
export default CreatePostModal;