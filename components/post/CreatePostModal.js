import { useContext, useEffect, useRef, useState } from "react";
import { SnackbarContext, UserContext } from "../../configs/Contexts";
import { BackHandler, Image, View, TextInput, TouchableOpacity, Keyboard, Text } from "react-native";
import { ActivityIndicator, Button, Chip, Icon, IconButton } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApis, endpoints } from "../../configs/Apis";
import CreatePostStyle from "../../styles/CreatePostStyle";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { Portal, PortalHost } from '@gorhom/portal';
import PostStyle from "../../styles/PostStyle";
import DateTimePickerModal from "react-native-modal-datetime-picker";

const CreatePostModal = () => {
    const { setSnackbar } = useContext(SnackbarContext);
    const [content, setContent] = useState('');
    const currentUser = useContext(UserContext);
    const [loading, setLoading] = useState(false);
    const [isCommentSelected, setIsCommentSelected] = useState(true);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isPollSelected, setIsPollSelected] = useState(false);
    const [pollQuestion, setPollQuestion] = useState('');
    const [options, setOptions] = useState(['']);
    const [endTime, setEndTime] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const bottomSheetRef = useRef(null);

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
        const miniumTime = new Date(now.getTime() + 12 * 60 * 60 * 1000); // 12 tieng
        if (miniumTime.getTime() > date.getTime()) {
            setSnackbar({
                visible: true,
                message: 'Thời gian tối thiểu cho khảo sát là 12 tiếng!',
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
            await authApis(token).post(endpoints['posts'], payload);

            setSnackbar({
                visible: true,
                message: 'Đăng thành công!',
                type: "success",
            });
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
    const handleAddButtonPress = () => {
        bottomSheetRef?.current?.expand();
    }
    
    useEffect(() => {
        const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
            if (isSheetOpen) {
                bottomSheetRef.current?.close();
                return true;
            }
            return false;
        });

        return () => backHandler.remove();
    }, [isSheetOpen]);

    return (<View style={{ position: "relative" }}>
        <View style={{ backgroundColor: "#f2f2f2", position: "absolute", left: "7%", top: -15, borderRadius: 100 }}>
            <TouchableOpacity style={{ marginTop: 5, justifyContent: "center", alignItems: "center" }} onPress={handleAddButtonPress}>
                <Icon size={30} source="plus-circle" color="#2F2F2F" />
                <Text style={{ fontSize: 12, fontWeight: 700, color: "#2F2F2F" }}>Tạo bài viết</Text>
            </TouchableOpacity>
        </View>
        <Portal>
            <BottomSheet
                ref={bottomSheetRef}
                snapPoints={["95%"]}
                index={-1}
                enablePanDownToClose={true}
                onChange={(index) => {
                    setIsSheetOpen(index !== -1);
                }}
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
                                        {isCommentSelected ? "Bật" : "Tắt"} bình luận
                                    </Chip>
                                    <Chip
                                        style={[
                                            CreatePostStyle.chip,
                                            isPollSelected && CreatePostStyle.chipActive,
                                        ]}
                                        selected={isPollSelected}
                                        onPress={() => setIsPollSelected(!isPollSelected)}
                                    >
                                        Khảo sát
                                    </Chip>
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
                </BottomSheetView>
            </BottomSheet>
        </Portal>
        <PortalHost name="create_post_host" />
    </View>)
};
export default CreatePostModal;