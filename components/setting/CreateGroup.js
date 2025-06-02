import { useContext, useEffect, useLayoutEffect, useState } from "react";
import { FlatList, Image, TouchableOpacity, View } from "react-native";
import { ActivityIndicator, Button, Checkbox, Searchbar, Text, TextInput } from "react-native-paper";
import LoginStyle from "../../styles/LoginStyle";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApis, endpoints } from "../../configs/Apis";
import { useNavigation } from "@react-navigation/native";
import { SnackbarContext } from "../../configs/Contexts";

const CreateGroup = ({ route }) => {

    const [name, setName] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [users, setUsers] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const { setSnackbar } = useContext(SnackbarContext);
    const [processing, setProcessing] = useState(false);
    const {onCreatedSuccess} = route.params || null;

    const nav = useNavigation();

    useLayoutEffect(() => {
            nav.setOptions({
                headerRight: () => (
                    <TouchableOpacity onPress={handleCreateGroup} disabled={processing}>
                        <Text style={{ color: "blue", fontWeight: "500" }}>XONG</Text>
                    </TouchableOpacity>
                ),
            });
        }, [nav, name, members]);

    useEffect(() => {
        let timer = setTimeout(() => {
            setUsers([]);
            setPage(1);
        }, 400);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        if (page === 0) return;

        let timer = setTimeout(() => {
            fetchMembers();
        }, 500);

        return () => clearTimeout(timer);
    }, [page, searchQuery]);

    const fetchMembers = async () => {
        if (page === 0) return;

        try {
            setLoading(true);

            let url = `${endpoints["users"]}?page=${page}&verified=true${searchQuery ? `&kw=${searchQuery}` : ""}`;

            const token = await AsyncStorage.getItem("token");
            const res = await authApis(token).get(url);
            const results = res.data?.results || [];

            if (page === 1) {
                setUsers(results);
            } else {
                setUsers((prev) => {
                    const unique = results.filter((r) => !prev.some((d) => d.id === r.id));
                    return [...prev, ...unique];
                });
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

    const validate = () => {
        if (name === "") {
            setSnackbar({
                visible: true,
                message: `Tên nhóm là bắt buộc!`,
                type: "error",
            });
            return false;
        }
        if(members.length === 0) {
            setSnackbar({
                visible: true,
                message: `Nhóm phải có tối thiểu 1 thành viên!`,
                type: "error",
            });
            return false;
        }
        return true;
    };

    const handleCreateGroup = async () => {
        if(!validate()) return;
        try {
            setProcessing(true);
            const token = await AsyncStorage.getItem("token");
            const result = await authApis(token).post(endpoints['groups'], {
                name: name,
                members: members
            });

            setSnackbar({
                visible: true,
                message: `Tạo thành công!`,
                type: "success",
            });
            if(onCreatedSuccess)
                onCreatedSuccess(result.data);
            nav.goBack();
        } catch (error) {
            console.error(error);
        } finally {
            setProcessing(false);
        };
    };

    const fetchMore = () => {
        if (loading || refreshing) return;
        if (page > 0 && users.length > 0) {
            setPage((prev) => prev + 1);
        }
    };

    const handleRefresh = async () => {
        try {
            setRefreshing(true);
            if(page === 1) await fetchMembers();
            else setPage(1);
        } catch (error) {
            console.error(error);
        } finally {
            setRefreshing(false);
        }
    };

    const renderItem = ({ item }) => {
        const isChecked = members.includes(item.id);
        const toggleMember = () => {
            if (isChecked) {
                setMembers((prev) => prev.filter((id) => id !== item.id));
            } else {
                setMembers((prev) => [...prev, item.id]);
            }
        };

        return (
            <View
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
                <Checkbox status={isChecked ? "checked" : "unchecked"} onPress={toggleMember} />
            </View>
        );
    };

    return (<>
        <View style={{ flex: 1, paddingHorizontal: "20", position: "relative" }}>
            {processing && <View style={{ zIndex: 999, position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: "rgba(0,0,0,0.01)" }}>
                            <ActivityIndicator size="large" color="black" />
                        </View>}
            <TextInput activeOutlineColor="#1c85fc" style={{ marginVertical: 5 }} mode="outlined" label="Tên nhóm" value={name} onChangeText={setName} />
            <Searchbar
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={{
                    marginVertical: 5,
                    backgroundColor: '#fffbff',
                    borderWidth: 1, borderRadius: 5, borderColor: "#969199"
                }}
                iconColor="#888"
                placeholderTextColor="#aaa"
            />
            <FlatList
                keyExtractor={(item) => `${item.id}`}
                data={users}
                renderItem={renderItem}
                onEndReached={fetchMore}
                onEndReachedThreshold={0.7}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                ListEmptyComponent={() => (
                    <View style={{ flex: 1, alignItems: "center", padding: 32 }}>
                        <Text style={LoginStyle.subTitle}>
                            {searchQuery ? "Không có dữ liệu" : "Nhập từ khóa để tìm kiếm"}
                        </Text>
                    </View>
                )}
                ListFooterComponent={loading && <ActivityIndicator style={{ padding: 30 }} />}
                contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
            />

        </View>
    </>);
};
export default CreateGroup;