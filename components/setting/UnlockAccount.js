import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApis, endpoints } from "../../configs/Apis";
import { useContext, useEffect, useState } from "react";
import { FlatList, Image, View } from "react-native";
import { ActivityIndicator, IconButton, Searchbar, Text } from "react-native-paper";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import LoginStyle from "../../styles/LoginStyle";
import { SnackbarContext } from "../../configs/Contexts";

const UnlockAccount = () => {
    const tabBarHeight = useBottomTabBarHeight();
    const [page, setPage] = useState(1);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState();
    const [processing, setProcessing] = useState(false);
    const { setSnackbar } = useContext(SnackbarContext);

    const fetchUsers = async () => {
        if (page > 0) {
            try {
                setLoading(true);
                let url = `${endpoints['getLockedUsers']}?page=${page}`;

                if (searchQuery) {
                    url = `${url}&kw=${searchQuery}`;
                }
                const token = await AsyncStorage.getItem("token");
                const res = await authApis(token).get(url);

                const results = res.data.results;
                if (page === 1)
                    setUsers(results);
                else {
                    const unique = results.filter((r) => !users.some((u) => u.id === r.id));
                    setUsers((prev) => [...prev, ...unique]);
                }

                if (res.data.next === null)
                    setPage(0);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
    };
    const fetchMore = () => {
        if (!loading && !refreshing && page > 0 && users.length > 0)
            setPage(page + 1);
    }
    const handleRefresh = async () => {
        try {
            setRefreshing(true);
            setUsers([]);
            if (page === 1)
                await fetchUsers();
            else setPage(1);
        } catch (error) {

        } finally {
            setRefreshing(false);
        }
    }
    useEffect(() => {
        let timer = setTimeout(() => {
            if (page > 0) {
                fetchUsers();
            }
        }, 500);
        return () => clearTimeout(timer);

    }, [page, searchQuery]);

    useEffect(() => {
        setTimeout(() => {
            setPage(1);
            setUsers([]);
        }, 400);

    }, [searchQuery])


    const renderUserItem = ({ item }) => {
        const verify = async () => {
            try {
                setProcessing(true);
                const token = await AsyncStorage.getItem("token");
                await authApis(token).post(endpoints['resetPasswordDeadline'](item.id));
                setUsers((prev) => prev.filter((u) => u.id !== item.id));
                setSnackbar({
                    visible: true,
                    message: "Mở khóa thành công!",
                    type: "success",
                });
            } catch (error) {
                console.error(error);
            } finally {
                setProcessing(false);
            };
        };

        return (
            <View style={{ position: "relative", padding: 3, marginHorizontal: 5, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View style={{ padding: 6, flexDirection: "row", justifyContent: "flex-start", backgroundColor: "white", borderRadius: 16, width: "100%" }}>
                    <Image style={{ height: 60, width: 60, borderRadius: 30 }} source={{ uri: item.avatar }} />
                    <View style={{ marginLeft: 10 }}>
                        <Text>Họ tên: {item.last_name} {item.first_name}</Text>
                        <Text>Tên người dùng: {item.username}</Text>
                        <Text>Mã sinh viên: {item.member_id}</Text>
                        <Text style={{ flexWrap: "wrap", maxWidth: "95%" }}  >Email: {item.email}</Text>
                    </View>
                </View>
                <IconButton
                    style={{ backgroundColor: "#4CA64C", position: "absolute", right: 5 }}
                    icon={"account-check"}
                    iconColor="white"
                    size={30}
                    onPress={verify}
                />
            </View>
        );
    };

    return (<View style={{flex: 1, position:"relative"}}>
        {processing && <View style={{ zIndex: 999, position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: "rgba(0,0,0,0.05)" }}>
                    <ActivityIndicator size="large" color="black" />
                </View>}
        <Searchbar
            placeholder="Tìm kiếm..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
                marginTop: 10,
                marginHorizontal: 5,
                backgroundColor: 'white',
            }}
            iconColor="#888"
            placeholderTextColor="#aaa"
        />
        <FlatList
            style={{ padding: 0 }}
            ListFooterComponent={loading && <ActivityIndicator style={{ padding: 10 }} />}
            ListEmptyComponent={() =>
                <View style={{ flex: 1, alignItems: 'center', padding: 32 }}>
                    <Text style={LoginStyle.subTitle}>Không có người dùng nào</Text>
                </View>
            }
            data={users}
            onEndReached={fetchMore}
            contentContainerStyle={{ paddingBottom: tabBarHeight + 16 }}
            onEndReachedThreshold={0.7}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            keyExtractor={item => `${item.id}`}
            renderItem={renderUserItem}
        />
    </View>);
};
export default UnlockAccount;