import { useContext, useEffect, useState } from "react";
import { SnackbarContext, UserContext } from "../../configs/Contexts";
import { Image, View, TextInput, Keyboard, BackHandler, TouchableOpacity } from "react-native";
import { Button, Chip, Text, IconButton } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApis, endpoints } from "../../configs/Apis";
import CreatePostStyle from "../../styles/CreatePostStyle";
import DateTimePickerModal from "react-native-modal-datetime-picker";

const UpdatePost = ({ postData, modalRef, onUpdateSuccess }) => {
    const currentUser = useContext(UserContext);
    const { setSnackbar } = useContext(SnackbarContext);
    const [content, setContent] = useState(postData.content);
    const [isCommentSelected, setIsCommentSelected] = useState(postData.can_comment);
    const initialData = postData;
    const [isPoll, setIsPoll] = useState(false);
    const [pollQuestion, setPollQuestion] = useState('');
    const [options, setOptions] = useState([{ id: null, content: '' }]);
    const [deletedOptions, setDeletedOptions] = useState([{ id: null, content: '', to_delete: true }]);
    const [endTime, setEndTime] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);

    useEffect(() => {
        setIsPoll(postData.post_type === "poll");
    }, []);

    useEffect(() => {
        if (isPoll && postData.poll) {
            const poll = postData.poll;
            setPollQuestion(poll.question);
            setEndTime(new Date(poll.end_time));
            const pollOptions = poll.options.map(opt => ({
                id: opt.id,
                content: opt.content,
            }));
            setOptions(pollOptions);
        }
    }, [isPoll]);

    const handleAddOption = () => {
        setOptions([...options, ""]);
    };

    const handleOptionChange = (text, index) => {
        const newOptions = [...options];
        newOptions[index] = {
            ...newOptions[index],
            content: text
        };
        setOptions(newOptions);
    };

    const handleRemoveOption = (index) => {
        const optionToDelete = options[index];

        if (options.length === 1) {
            setOptions([{ ...options[0], content: "", id: null }]);
            return;
        }

        if (optionToDelete?.id) {
            setDeletedOptions(prev => [...prev, optionToDelete]);
        }

        const newOptions = [...options];
        newOptions.splice(index, 1);
        setOptions(newOptions);
    };

    const handleAddDate = (date) => {
        setShowDatePicker(false);
        const now = new Date();
        if (now.getTime() > date.getTime()) {
            setSnackbar({
                visible: true,
                message: 'Vui lòng chọn thời gian hợp lệ!',
                type: "error",
            });
            return;
        }
        
        setEndTime(date);
    }

    const validate = () => {
        let data = content;
        let msg = '';

        if (data.trim().length === 0)
            msg = 'Vui lòng nhập nội dung bài viết!';

        if (isPoll) {
            if (pollQuestion === '')
                msg = 'Vui lòng nhập tiêu đề của bài khảo sát!';

            else if (endTime === null)
                msg = 'Vui lòng chọn thời hạn cho bài khảo sát!';

            else {
                const opts = options.filter(opt => opt.content.trim() !== "")
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

    const isDiff = () => {
        // So sánh content và can_comment trước
        if (initialData.content !== content) return true;
        if (initialData.can_comment !== isCommentSelected) return true;

        // Nếu post không phải poll, không cần kiểm tra tiếp
        if (initialData.post_type !== 'poll') return false;

        // Check poll question
        if ((initialData.poll?.question || '') !== pollQuestion) return true;

        // Check endTime (chuyển về string ISO để so sánh dễ hơn)
        const initialEndTime = initialData.poll?.end_time ? new Date(initialData.poll.end_time).toISOString() : null;
        const currentEndTime = endTime ? endTime.toISOString() : null;
        if (initialEndTime !== currentEndTime) return true;

        // Check options
        // Lọc option content từ initial và hiện tại, so sánh từng phần tử
        const initialOptions = (initialData.poll?.options || []).map(opt => opt.content);
        const currentOptions = options.map(opt => opt.content);

        // So sánh độ dài
        if (initialOptions.length !== currentOptions.length) return true;

        // So sánh nội dung từng option
        for (let i = 0; i < initialOptions.length; i++) {
            if (initialOptions[i] !== currentOptions[i]) return true;
        }

        // Nếu không khác gì
        return false;
    };


    const save = async () => {
        if (!validate()) {
            return;
        }
        try {
            if (!isDiff()) {
                console.info("hi");
                modalRef.current?.dismiss();
                return;
            }
            modalRef.current?.dismiss();
            const token = await AsyncStorage.getItem("token");
            let payload = {
                content: content,
                can_comment: isCommentSelected,
            };
            if (isPoll) {
                const formattedOptions = options.map(opt => {
                    if (opt.id) {
                        return { id: opt.id, content: opt.content };
                    }
                    return { content: opt.content };
                });

                const formattedDeleted = deletedOptions
                    .filter(opt => opt.id)
                    .map(opt => ({ id: opt.id,content: opt.content ,to_delete: true }));

                payload.poll = {
                    question: pollQuestion,
                    end_time: endTime.toISOString(),
                    options: [...formattedOptions, ...formattedDeleted],
                };
            }
            const response = await authApis(token).patch(endpoints['updatePost'](postData.id), payload);

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

    useEffect(() => {
        const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
            modalRef.current?.dismiss();
            return true;
        });

        return () => backHandler.remove();
    }, []);

    return (
        <>
            <View style={{ flexDirection: 'row', alignItems: 'center', position: 'relative', paddingVertical: 8 }}>
                <View style={{ position: 'absolute', right: 16 }}>
                    <Button onPress={save}>XONG</Button>
                </View>
                <View style={{ position: 'absolute', left: 16 }}>
                    <Button onPress={() => modalRef.current?.dismiss()}>HỦY</Button>
                </View>

                <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={{ fontSize: 20, fontWeight: "800" }}>Cập nhật bài viết</Text>
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
                                {isCommentSelected ? "Bật" : "Tắt"} bình luận
                            </Chip>
                            {isPoll &&
                                <Chip
                                    style={[CreatePostStyle.chip, CreatePostStyle.chipActive,]}
                                    selected={isPoll}
                                    onPress={() => { }}
                                >
                                    Khảo sát
                                </Chip>
                            }
                        </View>
                    </View>
                </View>
                {isPoll &&
                    <View style={[CreatePostStyle.createPostCard, { marginTop: "10", flexDirection: "column" }]}>
                        <View style={{ justifyContent: "space-between", flexDirection: "row", alignItems: "center" }}>
                            <Text style={{ fontSize: 20, fontWeight: "500", paddingVertical: 5 }}>Khảo sát</Text>
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
                                            value={option.content}
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
        </>
    )
};
export default UpdatePost;