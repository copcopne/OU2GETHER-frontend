import { useContext, useLayoutEffect, useState } from "react";
import { SnackbarContext, UserContext } from "../../configs/Contexts";
import { Image, View, Text, TextInput, TouchableOpacity, Keyboard } from "react-native";
import { ActivityIndicator, Button, Chip, IconButton } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApis, endpoints } from "../../configs/Apis";
import { useNavigation } from "@react-navigation/native";
import CreatePostStyle from "../../styles/CreatePostStyle";
import DateTimePickerModal from "react-native-modal-datetime-picker";

const CreatePost = ({ route }) => {
    const { onGoBack } = route.params || {};
    const { setSnackbar } = useContext(SnackbarContext);
    const [content, setContent] = useState('');
    const currentUser = useContext(UserContext);
    const isAdmin = currentUser.role === 0;
    const [loading, setLoading] = useState(false);
    const [isCommentSelected, setIsCommentSelected] = useState(true);
    const [isPollSelected, setIsPollSelected] = useState(false);
    const [pollQuestion, setPollQuestion] = useState('');
    const [options, setOptions] = useState(['']);
    const [endTime, setEndTime] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const nav = useNavigation();

    useLayoutEffect(() => {
        nav.setOptions({
            headerRight: () => (
                <TouchableOpacity onPress={upload}>
                    <Text style={{ color: 'blue', fontWeight: "500" }}>ĐĂNG</Text>
                </TouchableOpacity>
            ),
        });
    }, [nav, content, pollQuestion, options, endTime]);

    const handleAddOption = () => {
        setOptions([...options, ""]);
    };

    const handleOptionChange = (text, index) => {
        const newOptions = [...options];
        newOptions[index] = text;
        setOptions(newOptions);
    };

    const handleRemoveOption = (index) => {
        if (options.length === 1) {
            setOptions([{ ...options[0], content: "" }]);
        } else {
            const newOptions = [...options];
            newOptions.splice(index, 1);
            setOptions(newOptions);
        }
    };

    const handleAddDate = (date) => {
        const now = new Date();
        if (now.getTime() > date.getTime()) {
            setSnackbar({
                visible: true,
                message: 'Vui lòng chọn thời gian hợp lệ!',
                type: "error",
            });
            setEndTime(null);
            return;
        }
        
        setEndTime(date);
        setShowDatePicker(false);
    }

    const validate = () => {
        let data = content;
        let msg = '';

        if (data.trim().length === 0)
            msg = 'Vui lòng nhập nội dung bài viết!';

        if (isPollSelected) {
            if (pollQuestion === '')
                msg = 'Vui lòng nhập tiêu đề của bài khảo sát!';

            else if (endTime === null)
                msg = 'Vui lòng chọn thời hạn cho bài khảo sát!';

            else {
                const opts = options.filter(opt => opt.trim() !== "")
                if (opts.length === 0)
                    msg = 'Vui lòng nhập các tùy chọn!';
            }
        }
        if (msg !== '') {
            setSnackbar({
                visible: true,
                message: msg,
                type: "error",
            });
            return false;
        }
        return true;
    }

    const upload = async () => {
        Keyboard.dismiss();
        if (!validate()) {
            return;
        }
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token");
            const payload = {
                content: content,
                can_comment: isCommentSelected,
            };

            if (isPollSelected) {
                payload.poll = {
                    question: pollQuestion,
                    options: options.filter(opt => opt.trim() !== ""),
                    end_time: endTime.toISOString(),
                };
            }
            const response = await authApis(token).post(endpoints['posts'], payload);

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
            setSnackbar({
                visible: true,
                message: `Lỗi ${error?.response?.status} khi tạo bài viết!`,
                type: "error",
            });
            console.error(error);
        } finally {
            setLoading(false);
        }
    }
    return (
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
                            {isCommentSelected ? "Bật" : "Tắt"} bình luận
                        </Chip>
                        {isAdmin && <Chip
                                                                style={[
                                                                    CreatePostStyle.chip,
                                                                    isPollSelected && CreatePostStyle.chipActive,
                                                                ]}
                                                                selected={isPollSelected}
                                                                onPress={() => setIsPollSelected(!isPollSelected)}
                                                            >
                                                                Khảo sát
                                                            </Chip>}
                    </View>
                </View>
            </View>

            {isPollSelected &&
                <View style={[CreatePostStyle.createPostCard, { marginTop: "10", flexDirection: "column" }]}>
                    <View style={{ justifyContent: "space-between", flexDirection: "row", alignItems: "center" }}>
                        <Text style={{ fontSize: 20, fontWeight: "500", paddingVertical: 5 }}>Tạo khảo sát</Text>
                        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                            {!endTime ?
                                <Text>Chọn ngày đến hạn</Text> :
                                <Text>Đến hạn: {endTime.toLocaleDateString()} {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                            }
                        </TouchableOpacity>
                        <DateTimePickerModal
                            isVisible={showDatePicker}
                            mode="datetime"
                            onConfirm={handleAddDate}
                            onCancel={() => setShowDatePicker(false)}
                        />
                    </View>
                    <View>
                        <TextInput
                            style={CreatePostStyle.input}
                            multiline
                            placeholder="Tiêu đề khảo sát..."
                            placeholderTextColor="#999"
                            value={pollQuestion}
                            onChangeText={setPollQuestion}
                        />
                        <View style={{ width: "100%", alignItems: "flex-end" }}>
                            {options.map((option, index) => (
                                <View key={index} style={{ flexDirection: "row", width: "80%", justifyContent: "flex-end", alignItems: "center" }}>
                                    <TextInput
                                        style={[CreatePostStyle.input, { width: "100%" }]}
                                        multiline
                                        placeholder={`Tuỳ chọn ${index + 1}`}
                                        placeholderTextColor="#999"
                                        value={option}
                                        onChangeText={(text) => handleOptionChange(text, index)}
                                    />
                                    <IconButton icon="close" onPress={() => handleRemoveOption(index)} />
                                </View>
                            ))}

                        </View>
                        <Button onPress={handleAddOption}>Thêm tùy chọn</Button>
                    </View>
                </View>
            }
        </View>

    )
};
export default CreatePost;