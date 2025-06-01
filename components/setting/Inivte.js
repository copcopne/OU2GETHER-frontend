import { useNavigation } from "@react-navigation/native";
import { useLayoutEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { Text, TextInput } from "react-native-paper";

const Invite = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const nav = useNavigation();

    useLayoutEffect(() => {
        nav.setOptions({
            headerRight: () => (
                <TouchableOpacity onPress={() => { }}>
                    <Text style={{ color: 'blue', fontWeight: "500" }}>GỬI</Text>
                </TouchableOpacity>
            ),
        });
    }, [nav, content, title]);

    return (<View style={{ flex: 1, padding: 10 }}>
        <TextInput activeOutlineColor="#1c85fc" style={{ marginVertical: 5 }} mode="outlined" label="Tiêu đề" value={title} onChangeText={setTitle} />
        <TextInput activeOutlineColor="#1c85fc" style={{ marginVertical: 5, minHeight: 100, maxHeight: 300 }} multiline mode="outlined" label="Nội dung" value={content} onChangeText={setContent} />
        <View>
            <Text variant="labelLarge">Chọn người nhận</Text>
        </View>
    </View>)
};
export default Invite;