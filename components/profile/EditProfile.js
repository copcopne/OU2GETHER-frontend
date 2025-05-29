import { useContext, useMemo, useState } from "react";
import { Keyboard, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import LoginStyle from "../../styles/LoginStyle";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApis, endpoints } from "../../configs/Apis";
import { DispatchContext, SnackbarContext } from "../../configs/Contexts";

const EditProfile = ({ profileData, modalRef }) => {
    const { setSnackbar } = useContext(SnackbarContext);
    const info = [
        { label: "Họ và tên lót", field: "last_name" },
        { label: "Tên", field: "first_name" },
        { label: "Tiểu sử", field: "bio" },
    ];
    const initialData = useMemo(() => {
        return info.reduce((acc, item) => {
            if (profileData.hasOwnProperty(item.field)) {
                acc[item.field] = profileData[item.field];
            }
            return acc;
        }, {});
    }, [profileData]);

    const filteredData = info.reduce((acc, item) => {
        if (profileData.hasOwnProperty(item.field)) {
            acc[item.field] = profileData[item.field];
        }
        return acc;
    }, {});

    const [data, setData] = useState(filteredData);
    const dispatch = useContext(DispatchContext);

    const setState = (value, field) =>
        setData({ ...data, [field]: value });

    const validate = () => {
        if (Object.values(data).length === 0) {
            setSnackbar({
                visible: true,
                message: "Vui lòng nhập thông tin!",
                type: "error",
            });
            return false;
        }
        for (let i of info) {
            data[i.field] = data[i.field].trim();
            if (data[i.field] === "") {
                setSnackbar({
                    visible: true,
                    message: `Vui lòng nhập ${i.label}!`,
                    type: "error",
                });
                return false;
            }
        }
        return true;
    };

    const save = async () => {
        if (validate() !== true) {
            Keyboard.dismiss();
            return;
        }

        if (JSON.stringify(data) === JSON.stringify(initialData)) {
            modalRef.current?.dismiss();
            return;
        }

        modalRef.current?.dismiss();
        try {
            const token = await AsyncStorage.getItem("token");
            const res = await authApis(token).patch(endpoints['currentUser'], data);

            if (res.status === 200) {
                dispatch({
                    type: 'update',
                    payload: res.data
                });

                setSnackbar({
                    visible: true,
                    message: 'Cập nhật thành công!',
                    type: 'success'
                });
            } else {
                setSnackbar({
                    visible: true,
                    message: 'Lỗi cập nhật!',
                    type: 'error'
                });
            }
        } catch (err) {
            setSnackbar({
                visible: true,
                message: 'Đã xảy ra lỗi kết nối!',
                type: 'error'
            });
            console.error("Lỗi update:", err.response?.status, err.response?.data || err.message);
        }
    };

    return (
        <>
            <View style={{ flexDirection: 'row', alignItems: 'center', position: 'relative', paddingVertical: 8 }}>
                <View style={{ position: 'absolute', right: 16 }}>
                    <Button onPress={() => save()}>Xong</Button>
                </View>

                <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text variant="titleMedium">Chỉnh sửa thông tin</Text>
                </View>
            </View>
            <View style={{ margin: 32 }}>
                {info.map((i) =>
                    <TextInput
                        key={i.field}
                        mode="outlined"
                        {...(i.field === "bio" ? { multiline: true, numberOfLines: 4 } : {})}
                        value={data[i.field] || ""}
                        onChangeText={(t) => setState(t, i.field)}
                        style={[LoginStyle.input, i.field === "bio" ? { textAlignVertical: 'top' } : {}]}
                        label={i.label}
                        secureTextEntry={false}
                    />
                )}
            </View>

        </>
    )
};
export default EditProfile;