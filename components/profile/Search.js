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

                let url = `${endpoints['users']}?page=${page}&kw=${searchQuery}`;
                const token = await AsyncStorage.getItem("token");
                const res = await authApis(token).get(url);


                if (page === 1)
                    setUsers(res.data.results);
                else setUsers([...users, ...res.data.results]);

                if (res.data.next === null)
                    setPage(0);
            } catch (error) {
                console.error('Fetch users error:', error);
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
            console.error(error);
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
        return () => clearTimeout(timer);
    }, [searchQuery])

    const renderUserItem = ({ item }) => {
        return (
            <View style={SearchStyle.userContainter}>
                <View style={SearchStyle.card}>
                    <Image
                        style={{ height: 80, width: 80, borderRadius: 40 }}
                        source={{ uri: item.avatar }}
                    />
                    <View style={{ marginHorizontal: 15, width: "75%" }}>
                        <Text style={[SearchStyle.name, { fontSize: 18, marginBottom: 5 }]}>
                            {item.last_name} {item.first_name}
                        </Text>
                        {item.number_of_followers > 0 &&
                            <Text style={{ marginBottom: 10, color: '#666' }}>
                                Có {item.number_of_followers} người theo dõi
                            </Text>
                        }
                        <TouchableOpacity
                            style={[SearchStyle.button, { paddingVertical: 10 }]}
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

    return (
        <View style={{
            flex: 1,
            paddingBottom: tabBarHeight
        }}>
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
            <View style={[
                {
                    marginTop: 10,
                    flex: 1
                },
                users.length !== 0 && { backgroundColor: "white" }
            ]}>
                {users.length !== 0 &&
                    <Text style={SearchStyle.label}>
                        Người dùng
                    </Text>
                }
                <FlatList
                    style={{ padding: 0 }}
                    contentContainerStyle={{
                        flexGrow: 1,
                        paddingBottom: 20
                    }}
                    ListFooterComponent={loading && <ActivityIndicator style={{ padding: 20 }} />}
                    ListEmptyComponent={() =>
                        <View style={{ flex: 1, alignItems: 'center', padding: 32 }}>
                            <Text style={LoginStyle.subTitle}>
                                {(searchQuery) ? "Không có người dùng nào" : "Vui lòng nhập từ khóa để tìm kiếm"}
                            </Text>
                        </View>
                    }
                    data={users}
                    onEndReached={fetchMore}
                    onEndReachedThreshold={0.7}
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    keyExtractor={item => `${item.id}`}
                    renderItem={renderUserItem}
                />
            </View>
        </View>
    );
};

export default Search;