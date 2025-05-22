import { useContext, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { SnackbarContext, UserContext } from "../../configs/Contexts";
import { Image, View, Text, TextInput } from "react-native";
import PostStyle from "../../styles/PostStyle";
import { Button } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApis, endpoints } from "../../configs/Apis";
import { useNavigation } from "@react-navigation/native";

const CreatePost = ({ route }) => {
    const { onGoBack } = route.params;
    const { setSnackbar } = useContext(SnackbarContext);
    const [content, setContent] = useState("");
    const currentUser = useContext(UserContext);
    const [loading, setLoading] = useState(false);
    const nav = useNavigation();
    const validate = () => {
        if (content === null)
            return false;
        return true;
    }
    const upload = async () => {
        if(!validate)
            return;
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token");
            const response = await authApis(token).post(endpoints['posts'], {
                content: content
            });
            const createdPost = response.data;
            setSnackbar({
                visible: true,
                message: 'Đăng thành công!',
                type: "success",
            });
            if (onGoBack) {
                onGoBack(createdPost);
            }
            nav.goBack();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }
    return (
        <SafeAreaView>
            <View
                style={[PostStyle.createPostButton, PostStyle.p]}
            >
                <Image
                    style={PostStyle.avatar}
                    source={{ uri: currentUser?.avatar }}
                />
                <View>
                    <Text style={PostStyle.name}>{currentUser?.last_name + " " + currentUser?.first_name}</Text>
                    <TextInput
                        multiline
                        placeholder="Có gì mới?"
                        value={content}
                        onChangeText={setContent}
                    />
                </View>
            </View>
            <Button
                mode="contained-tonal"
                onPress={upload}
                loading={loading}
                style={{ marginTop: 15, marginHorizontal: 5 }}
            >Đăng</Button>
        </SafeAreaView>
    )
};
export default CreatePost;