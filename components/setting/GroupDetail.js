import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useContext, useEffect, useLayoutEffect, useState } from "react";
import { FlatList, TouchableOpacity, View } from "react-native";
import { ActivityIndicator, Checkbox, Dialog, Portal, Searchbar, Text, TextInput } from "react-native-paper";
import { authApis, endpoints } from "../../configs/Apis";
import { Image } from "react-native";
import { SnackbarContext } from "../../configs/Contexts";
import PostStyle from "../../styles/PostStyle";
import LoginStyle from "../../styles/LoginStyle";

const GroupDetail = ({ route }) => {
    const { groupId = 0, groupName = '' } = route.params;
    const [name, setName] = useState(groupName);

    const [members, setMembers] = useState([]);
    const [originalMembers, setOriginalMembers] = useState([]);
    const [newMembers, setNewMembers] = useState([]);

    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [editing, setEditing] = useState(false);
    const [visible, setVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const hideDialog = () => setVisible(false);
    const nav = useNavigation();
    const { setSnackbar } = useContext(SnackbarContext);

    useLayoutEffect(() => {
        nav.setOptions({
            headerRight: () => {
                if (!editing) {
                    return (
                        <TouchableOpacity onPress={() => setEditing(true)}>
                            <Text style={{ color: 'blue', fontWeight: "500" }}>Chỉnh sửa</Text>
                        </TouchableOpacity>
                    );
                }
                return (
                    <>
                        <TouchableOpacity onPress={() => setVisible(true)} style={{ marginRight: 15 }}>
                            <Text style={{ color: 'red', fontWeight: "500" }}>Xóa</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleUpdateGroup}>
                            <Text style={{ color: 'blue', fontWeight: "500" }}>Lưu</Text>
                        </TouchableOpacity>
                    </>
                );
            },
            title: `Chi tiết nhóm #${groupId}`
        });
    }, [nav, editing, name, members, originalMembers, newMembers]);

    useEffect(() => {
        if (editing) {
            setMembers([]);
            setPage(1);
        } else {
            setNewMembers([]);
            setMembers([]);
            setPage(1);
        }
    }, [editing]);

    useEffect(() => {
        if (page === 0) return;

        let timer = setTimeout(() => {
            fetchMembers();
        }, 500);

        return () => clearTimeout(timer);
    }, [page, editing, searchQuery]);

    useEffect(() => {
        let timer = setTimeout(() => {
            setMembers([]);
            setPage(1);
        }, 400);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchMembers = async () => {
        if (page === 0) return;
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token");

            let url = `${endpoints['users']}?page=${page}&verifed=true`;
            if (!editing) {
                url += `&groupId=${groupId}`;
            }

            if (searchQuery)
                url += `&kw=${searchQuery}`;

            const res = await authApis(token).get(url);
            const results = res.data.results;

            if (!editing) {
                if (page === 1) {
                    setOriginalMembers(results);
                } else {
                    setOriginalMembers(prev => {
                        const unique = results.filter(r => !prev.some(d => d.id === r.id));
                        return [...prev, ...unique];
                    });
                }
            } else {
                if (page === 1) {
                    setMembers(results);
                } else {
                    setMembers(prev => {
                        const unique = results.filter(r => !prev.some(d => d.id === r.id));
                        return [...prev, ...unique];
                    });
                }
            }

            if (res.data.next === null) {
                setPage(0);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMore = () => {
        // Nếu đang loading hoặc đã hết page thì không làm gì
        if (loading || page === 0) return;

        // Nếu đang edit mà members rỗng → không fetch thêm
        // Nếu không edit mà originalMembers rỗng → không fetch thêm
        if (editing ? members.length === 0 : originalMembers.length === 0) return;

        setPage(prev => prev + 1);
    };

    const handleRefresh = async () => {
        try {
            setRefreshing(true);
            setPage(1);
            await fetchMembers();
        } catch (error) {
            console.error(error);
        } finally {
            setRefreshing(false);
        }
    };

    const renderItem = ({ item }) => {
        // Kiểm tra xem item.id có nằm trong danh sách thành viên gốc (originalMembers) hay không
        const isOriginal = originalMembers.some(u => u.id === item.id);
        // Kiểm tra xem item.id có nằm trong newMembers (đã toggle) hay không
        const isToggled = newMembers.includes(item.id);

        // Nếu là thành viên gốc && chưa toggle (không trong newMembers) → checked
        // Nếu không phải thành viên gốc && đã toggle (có trong newMembers) → checked
        // Ngược lại → unchecked
        const isChecked = (isOriginal && !isToggled) || (!isOriginal && isToggled);

        const toggleMember = () => {
            if (isToggled) {
                setNewMembers(prev => prev.filter(id => id !== item.id));
            } else {
                setNewMembers(prev => [...prev, item.id]);
            }
        };

        return (
            <TouchableOpacity
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 12,
                    paddingHorizontal: 12,
                    backgroundColor: "#fff",
                    borderBottomWidth: 1,
                    borderColor: "#eee",
                }}
                onPress={editing ? toggleMember : null}
            >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Image
                        source={{ uri: item.avatar }}
                        style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }}
                    />
                    <Text style={{ fontSize: 16 }}>
                        {item.last_name} {item.first_name}
                    </Text>
                </View>
                {editing && <Checkbox status={isChecked ? "checked" : "unchecked"} onPress={toggleMember} />}
            </TouchableOpacity>
        );
    };

    const validate = () => {
        if (name.trim().length === 0) {
            setSnackbar({
                visible: true,
                message: `Tên nhóm không được trống!`,
                type: "error",
            });
            return false;
        }
        return true;

    }

    const handleUpdateGroup = async () => {
        if (!validate()) return;

        if (newMembers.length === 0 && groupName === name) {
            setSnackbar({
                visible: true,
                message: `Không cập nhật do không có thay đổi!`,
                type: "success",
            });

            setEditing(false);

            setNewMembers([]);
            setOriginalMembers([]);
            setPage(1);
            return;
        }

        try {
            setProcessing(true);
            const token = await AsyncStorage.getItem("token");
            let payload = { members: newMembers };
            if (name !== groupName)
                payload.name = name;

            await authApis(token).patch(endpoints['group'](groupId), payload);

            setSnackbar({
                visible: true,
                message: `Cập nhật thành công!`,
                type: "success",
            });
            setEditing(false);

            setNewMembers([]);
            setOriginalMembers([]);
            setPage(1);
        } catch (error) {
            console.error(error);
            setSnackbar({
                visible: true,
                message: `Có lỗi xảy ra!`,
                type: "error",
            });
        } finally {
            setProcessing(false);
        }
    };

    const handleDeleteGroup = async () => {
        setVisible(false);
        try {
            setProcessing(true);
            const token = await AsyncStorage.getItem("token");
            await authApis(token).delete(endpoints['group'](groupId));
            setSnackbar({
                visible: true,
                message: `Xóa thành công!`,
                type: "success",
            });
            nav.goBack();
        } catch (error) {
            console.error(error);
            setSnackbar({
                visible: true,
                message: `Xóa thất bại!`,
                type: "error",
            });
        } finally {
            setProcessing(false);
        }
    };

    return (
        <View style={{ flex: 1, margin: 5, position: "relative" }}>
            {processing && <View style={{ zIndex: 999, position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: "rgba(0,0,0,0.01)" }}>
                <ActivityIndicator size="large" color="black" />
            </View>}
            <View style={{ backgroundColor: "white", padding: 8 }}>
                <Text variant="labelLarge">Tên nhóm</Text>
                {!editing ? (
                    <Text style={[PostStyle.content, PostStyle.m_v, { margin: 5 }]}>
                        {name}
                    </Text>
                ) : (
                    <TextInput
                        ref={null}
                        style={[PostStyle.content, { backgroundColor: "#efefef", marginVertical: 5 }]}
                        value={name}
                        onChangeText={setName}
                        mode="outlined"
                        placeholder="Nhập tên nhóm..."
                    />
                )}
            </View>

            {editing && (
                <View style={{ backgroundColor: "white", padding: 8 }}>
                    <Text variant="labelLarge">Tìm thành viên</Text>
                    <Searchbar
                        placeholder="Tìm kiếm..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        style={{
                            marginVertical: 5,
                            backgroundColor: "white",
                            borderWidth: 1,
                            borderRadius: 5,
                            borderColor: "#969199",
                        }}
                        iconColor="#888"
                        placeholderTextColor="#aaa"
                    />
                </View>
            )}

            <FlatList
                data={editing ? members : originalMembers}
                keyExtractor={item => item.id.toString()}
                renderItem={renderItem}
                onEndReached={fetchMore}
                onEndReachedThreshold={0.7}
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 150, marginTop: 5 }}
                ListEmptyComponent={() => (
                    <View style={{ flex: 1, alignItems: "center", padding: 32 }}>
                        <Text style={LoginStyle.subTitle}>
                            {searchQuery ? "Không có dữ liệu" : "Nhập từ khóa để tìm kiếm"}
                        </Text>
                    </View>
                )}
                ListFooterComponent={loading && <ActivityIndicator style={{ padding: 30 }} />}
                refreshing={refreshing}
                onRefresh={handleRefresh}
            />

            <Portal>
                <Dialog visible={visible} onDismiss={hideDialog} style={{ backgroundColor: "white" }}>
                    <Dialog.Title>Thông báo</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium">Bạn có chắc muốn xóa nhóm này không?</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <TouchableOpacity onPress={handleDeleteGroup}>
                            <Text style={{ color: 'red', marginRight: 20 }}>OK</Text>
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

export default GroupDetail;
