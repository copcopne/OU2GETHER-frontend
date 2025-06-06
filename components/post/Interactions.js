import { FlatList, Image, TouchableOpacity, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import SearchStyle from "../../styles/SearchStyle";
import { useContext, useEffect, useState } from "react";
import { authApis, endpoints } from "../../configs/Apis";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoginStyle from "../../styles/LoginStyle";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../../configs/Contexts";
import HomeStyle from "../../styles/Home";

const Interactions = ({ route }) => {
    const { objectId = '', isComment = false, interactionTypes = {} } = route.params || {};
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const currentUser = useContext(UserContext);

    const tabs = [
        { type: 'all', label: 'Tất cả', color: "#1c85fc" },
        { type: 'like', icon: '👍', label: '👍 Thích', color: "#1c85fc" },
        { type: 'love', icon: '💖', label: '💖 Yêu thích', color: "#CC99A2" },
        { type: 'haha', icon: '😆', label: '😆 Haha', color: "#ffb02e" },
        { type: 'wow', icon: '😯', label: '😯 Wow', color: "#ffb02e" },
        { type: 'sad', icon: '😢', label: '😢 Buồn', color: "#ffb02e" },
        { type: 'angry', icon: '😡', label: '😡 Phẫn nộ', color: "#CC0000" },
    ];
    const [filteredTabs, setFilteredTabs] = useState({});
    const [selectedTab, setSelectedTab] = useState({ type: 'all', label: 'Tất cả', color: "#1c85fc" });

    const nav = useNavigation();

    const fetchUsers = async () => {
        if (page === 0) return;

        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token");
            const baseEndpoint = isComment ? endpoints['CommentInteractions'] : endpoints['PostInteractions'];
            let url = `${baseEndpoint(objectId)}?page=${page}`;
            if (selectedTab.type !== "all")
                url = `${url}&type=${selectedTab.type}`;

            const res = await authApis(token).get(url);
            const raw = res.data?.results || [];
            if (page === 1) {
                setData(raw);
            } else {
                setData((prev) => {
                    const unique = data.filter((u) => !prev.some((d) => d.id === u.id));
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

    const handleFollow = async (userId) => {
        try {
            const token = await AsyncStorage.getItem("token");

            const res = await authApis(token).post(endpoints["followUser"](userId));
            const updatedUser = res.data;

            setData((prev) =>
                prev.map((item) => {
                    if (item.user.id === updatedUser.id) {
                        return {
                            ...item,
                            user: {
                                ...item.user,
                                ...updatedUser,
                            },
                        };
                    }
                    return item;
                })
            );
        } catch (error) {
            console.error(error);
        }
    };


    const fetchMore = () => {
        if (loading) return;
        if (page > 0 && data.length > 0) {
            setPage((prev) => prev + 1);
        }
    };

    useEffect(() => {
        const filtered = tabs.filter((tab) => {
            if (tab.type === 'all') return true;

            return interactionTypes[tab.type] > 0;
        });
        setFilteredTabs(filtered);
    }, []);

    useEffect(() => {
        if (page === 0) return;
        fetchUsers();
    }, [page, selectedTab]);

    useEffect(() => {
        setData([]);
        setPage(1);
    }, [selectedTab]);

    const renderItem = ({ item }) => {
        const matchedTab = tabs.find((tab) => tab.type === item.reaction);
        const emoji = matchedTab && matchedTab.icon;

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
                onPress={() => {
                    item.user.id !== currentUser.id ?
                        nav.navigate("profileStack", { userId: item.user.id }) :
                        nav.navigate("profile")
                }
                }
            >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View style={{ position: "relative" }}>
                        <Image
                            source={{ uri: item.user.avatar }}
                            style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }}
                        />
                        <View style={{ position: "absolute", right: 5, bottom: 0, backgroundColor: "white", width: 20, borderRadius: 10, justifyContent: "center", alignItems: "center" }}><Text>{emoji}</Text></View>
                    </View>
                    <Text style={{ fontSize: 16 }}>
                        {item.user.last_name} {item.user.first_name}
                    </Text>
                </View>
                {item.user.id !== currentUser.id &&
                    <TouchableOpacity
                        style={[SearchStyle.button, { paddingVertical: 6 }]}
                        onPress={() => { handleFollow(item.user.id) }
                        }>
                        <Text style={[SearchStyle.buttonText, SearchStyle.p]}>
                            {item.user.is_following ? "Bỏ theo dõi" : "Theo dõi"}
                        </Text>
                    </TouchableOpacity>
                }
            </TouchableOpacity>
        );
    };
    return (
        <View>
            <FlatList
                data={filteredTabs}
                keyExtractor={(item) => item.label}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                style={{ backgroundColor: "white" }}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => setSelectedTab(item)}
                        style={[selectedTab.type === item.type && { borderBottomWidth: 3, borderBottomColor: item.color }
                        ]}
                    >
                        <Text
                            style={[
                                HomeStyle.tabText,
                                selectedTab.type === item.type && HomeStyle.tabTextActive,
                                selectedTab.type === item.type && { color: item.color },
                            ]}
                        >
                            {item.label}
                        </Text>
                    </TouchableOpacity>)}

            />

            <FlatList
                keyExtractor={(item) => `${item.id}`}
                data={data}
                extraData={data}
                renderItem={renderItem}
                onEndReached={fetchMore}
                onEndReachedThreshold={0.7}
                ListEmptyComponent={() => (
                    <View style={{ flex: 1, alignItems: "center", padding: 32 }}>
                        <Text style={LoginStyle.subTitle}>
                            Danh sách trống
                        </Text>
                    </View>
                )}
                ListFooterComponent={loading && <ActivityIndicator style={{ padding: 30 }} />}
                contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
            />
        </View>
    );
};
export default Interactions;