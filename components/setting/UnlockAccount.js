import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApis, endpoints } from "../../configs/Apis";
import { useEffect, useState } from "react";
import { FlatList, Image, View } from "react-native";
import { ActivityIndicator, IconButton, Searchbar, Text } from "react-native-paper";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import LoginStyle from "../../styles/LoginStyle";

const UnlockAccount = () => {
    const tabBarHeight = useBottomTabBarHeight();
    const [page, setPage] = useState(1);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState();

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

                if (page === 1)
                    setUsers(res.data.results);
                else setUsers([...users, res.data.results]);

                if (res.data.next === 'null')
                    setPage(0);
            } catch (error) {
                console.error(error.data);
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
        let timer = setTimeout(() => {

            setPage(1);
            setUsers([]);
        }, 400);
    }, [searchQuery])


    const renderUserItem = ({ item }) => {
        const verify = async () => {
            try {
                const token = await AsyncStorage.getItem("token");
                await authApis(token).post(endpoints['resetPasswordDeadline'](item.id));
                console.info('done');
            } catch (error) {
                console.error(error.respone.data);
            } finally {
                console.log("pressed");
            };
        };

        return (
            <View style={{ position: "relative", padding: 3, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
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

    return (<>
        <Searchbar
            placeholder="Tìm kiếm..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
                marginTop: 10,
                marginHorizontal: 10,
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
    </>);
};
export default UnlockAccount;