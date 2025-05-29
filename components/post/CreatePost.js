import { useContext, useLayoutEffect, useState } from "react";
import { SnackbarContext, UserContext } from "../../configs/Contexts";
import { Image, View, Text, TextInput, TouchableOpacity, ScrollView, Keyboard } from "react-native";
import { Chip } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApis, endpoints } from "../../configs/Apis";
import { useNavigation } from "@react-navigation/native";
import CreatePostStyle from "../../styles/CreatePostStyle";

const CreatePost = ({ route }) => {
    const { onGoBack } = route.params || {};
    const { setSnackbar } = useContext(SnackbarContext);
    const [content, setContent] = useState("");
    const currentUser = useContext(UserContext);
    const [loading, setLoading] = useState(false);
    const [isCommentSelected, setIsCommentSelected] = useState(true);
    const nav = useNavigation();

    useLayoutEffect(() => {
        nav.setOptions({
            headerRight: () => (
                <TouchableOpacity onPress={upload}>
                    <Text style={{ color: 'blue', fontWeight: "500" }}>ĐĂNG</Text>
                </TouchableOpacity>
            ),
        });
    }, [nav]);

    const validate = () => {
        if (content.trim().length === 0)
            return false;
        return true;
    }
    const upload = async () => {
        if (!validate()){
            Keyboard.dismiss();
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
            const response = await authApis(token).post(endpoints['posts'], {
                content: content,
                can_comment: isCommentSelected
            });
            setSnackbar({
                visible: true,
                message: 'Đăng thành công!',
                type: "success",
            });
            if (onGoBack) {
                onGoBack(response.data);
            }
            nav.goBack();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }
    return (
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

    )
};
export default CreatePost;