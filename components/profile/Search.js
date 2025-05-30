import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApis, endpoints } from "../../configs/Apis";
import { useContext, useEffect, useState } from "react";
import { FlatList, Image, TouchableOpacity, View } from "react-native";
import { ActivityIndicator, Searchbar, Text } from "react-native-paper";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import SearchStyle from "../../styles/SearchStyle";
import LoginStyle from "../../styles/LoginStyle";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../../configs/Contexts";

const Search = () => {
    const tabBarHeight = useBottomTabBarHeight();
    const [page, setPage] = useState(1);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState();

    const currentUser = useContext(UserContext);
    const nav = useNavigation();

    const fetchUsers = async () => {
        if (page > 0 && searchQuery) {
            try {
                setLoading(true);
                let url = `${endpoints['users']}?page=${page}`;

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
        let timer = setTimeout(() => {
            setPage(1);
            setUsers([]);
        }, 400);
    }, [searchQuery])


    const renderUserItem = ({ item }) => {

        return (
            <View style={{ position: "relative", padding: 3, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View style={{ padding: 6, flexDirection: "row", justifyContent: "flex-start", backgroundColor: "white", borderRadius: 16, width: "100%" }}>
                    <Image style={{ height: 70, width: "70", borderRadius: 35 }} source={{ uri: item.avatar }} />
                    <View style={{ marginHorizontal: 10, width: "80%" }}>
                        <Text style={SearchStyle.name}>{item.last_name} {item.first_name}</Text>
                        {item.number_of_followers > 0 && <Text>Có {item.number_of_followers} người theo dõi</Text>}
                        <TouchableOpacity
                            style={SearchStyle.button}
                            onPress={() => {
                                if (item.id === currentUser.id) {
                                    nav.navigate('profile');
                                } else {
                                    nav.navigate('profileStack', { userId: item.id });
                                }
                            }}>
                            <Text style={[SearchStyle.buttonText, SearchStyle.p]}>
                                Xem trang cá nhân
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    return (<>
        <Searchbar
            placeholder="Tìm kiếm..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
                marginTop: 40,
                marginHorizontal: 10,
                backgroundColor: 'white',
            }}
            iconColor="#888"
            placeholderTextColor="#aaa"
        />
        <View
            style={[
                { width: "100%", height: "100%", marginTop: 10 },
                users.length !== 0 && { backgroundColor: "white" }
            ]}
        >
            {users.length !== 0 && <Text style={{ fontSize: 22, marginLeft: 10, fontWeight: "700", marginTop: 5 }}>Người dùng</Text>}
            <FlatList
                style={{ padding: 0 }}
                ListFooterComponent={loading && <ActivityIndicator style={{ padding: 10 }} />}
                ListEmptyComponent={() =>
                    <View style={{ flex: 1, alignItems: 'center', padding: 32 }}>
                        <Text style={LoginStyle.subTitle}>{(searchQuery) ? "Không có người dùng nào" : "Vui lòng nhập từ khóa để tìm kiếm"}</Text>
                    </View>
                }
                data={users}
                onEndReached={fetchMore}
                contentContainerStyle={{ marginBottom: tabBarHeight + 16 }}
                onEndReachedThreshold={0.7}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                keyExtractor={item => `${item.id}`}
                renderItem={renderUserItem}
            />
        </View>
    </>);
};
export default Search;