import { FlatList, TouchableOpacity, View, StyleSheet } from "react-native";
import { Dialog, Icon, Portal, Text } from "react-native-paper";
import { useContext, useState } from "react";
import { DispatchContext, UserContext } from "../../configs/Contexts";
import { useNavigation } from "@react-navigation/native";
import SettingStyle from "../../styles/SettingStyle";

const Setting = () => {
    const dispatch = useContext(DispatchContext);
    const currentUser = useContext(UserContext);
    const nav = useNavigation();
    const [visible, setVisible] = useState(false);

    const showDialog = () => setVisible(true);
    const hideDialog = () => setVisible(false);

    const menuItems = [
        { title: 'Tạo người dùng', icon: 'account-plus', screen: 'createUser', adminOnly: true },
        { title: 'Gia hạn đổi mật khẩu', icon: 'account-alert', screen: 'unlockAccount', adminOnly: true },
        { title: 'Xác nhận người dùng', icon: 'account-arrow-up', screen: 'verifyUser', adminOnly: true },
        { title: 'Tạo thư mời', icon: 'email-edit', screen: 'invite', adminOnly: true },
        { title: 'Thống kê hệ thống', icon: 'chart-arc', screen: 'stats', adminOnly: true },
        { title: 'Đổi mật khẩu', icon: 'form-textbox-password', screen: 'changePassword' },
        { title: 'Đăng xuất', icon: 'logout', isLogout: true },
    ];

    const renderItem = ({ item }) => {
        if (item.adminOnly && currentUser.role !== 0) return null;

        const onPress = () => {
            if (item.isLogout) {
                showDialog();
            } else if (item.screen === 'changePassword') {
                nav.navigate(item.screen, { userdata: currentUser });
            } else {
                nav.navigate(item.screen);
            }
        };

        return (
            <TouchableOpacity
                style={SettingStyle.tile}
                onPress={onPress}
            >
                <Icon size={32} source={item.icon} color="#3b5998" />
                <Text style={SettingStyle.tileText}>{item.title}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={SettingStyle.container}>
            <FlatList
                data={menuItems}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                numColumns={2}
                contentContainerStyle={SettingStyle.grid}
            />

            <Portal>
                <Dialog visible={visible} onDismiss={hideDialog} style={{backgroundColor:"white"}}>
                    <Dialog.Title>Thông báo</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium">Bạn có muốn đăng xuất không?</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <TouchableOpacity onPress={() => {
                            hideDialog();
                            dispatch({ type: "logout" });
                        }}>
                            <Text style={{ color: '#1976D2', marginRight: 20 }}>OK</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={hideDialog}>
                            <Text style={{ color: '#1976D2' }}>Hủy</Text>
                        </TouchableOpacity>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View>
    );
};

const styles = StyleSheet.create({
});

export default Setting;
