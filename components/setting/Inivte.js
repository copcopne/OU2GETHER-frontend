import { useNavigation } from "@react-navigation/native";
import { useContext, useEffect, useLayoutEffect, useState } from "react";
import { FlatList, Image, Touchable, TouchableOpacity, View } from "react-native";
import { ActivityIndicator, Button, Checkbox, Menu, Searchbar, Text, TextInput } from "react-native-paper";
import { authApis, endpoints } from "../../configs/Apis";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoginStyle from "../../styles/LoginStyle";
import { SnackbarContext } from "../../configs/Contexts";

const Invite = () => {
    const [subject, setSubject] = useState("");
    const [content, setContent] = useState("");
    const [menuVisible, setMenuVisible] = useState(false);
    const [recipientType, setRecipientType] = useState("");
    const [fetchedDatas, setFetchedDatas] = useState([]);
    const [recipients, setRecipients] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [refreshing, setRefreshing] = useState(false);
    const [processing, setProcessing] = useState(false);

    const { setSnackbar } = useContext(SnackbarContext);

    const nav = useNavigation();

    const recipientTypes = [
        { label: "Nhóm", type: "group" },
        { label: "Cá nhân", type: "user" },
        { label: "Mọi người", type: "all" },
    ];

    useLayoutEffect(() => {
        nav.setOptions({
            headerRight: () => (
                <TouchableOpacity onPress={handleCreateInvite} disabled={processing}>
                    <Text style={{ color: "blue", fontWeight: "500" }}>TẠO</Text>
                </TouchableOpacity>
            ),
        });
    }, [nav, content, subject, recipients]);

    useEffect(() => {
        setRecipients([]);
    }, [recipientType]);

    useEffect(() => {
        let timer = setTimeout(() => {
            setFetchedDatas([]);
            setPage(1);
        }, 400);

        return () => clearTimeout(timer);
    }, [searchQuery, recipientType]);

    useEffect(() => {
        if (!(recipientType === "user" || recipientType === "group") || page === 0) return;

        let timer = setTimeout(() => {
            fetchParticipants();
        }, 500);

        return () => clearTimeout(timer);
    }, [page, recipientType, searchQuery]);

    const fetchParticipants = async () => {
        if (!(recipientType === "user" || recipientType === "group") || page === 0) return;

        try {
            setLoading(true);

            const baseEndpoint = recipientType === "user" ? endpoints["users"] : endpoints["groups"];
            let url = `${baseEndpoint}?page=${page}${searchQuery ? `&kw=${searchQuery}` : ""}`;
            if (recipientType === "user") url += "&verified=true";

            const token = await AsyncStorage.getItem("token");
            const res = await authApis(token).get(url);
            const results = res.data?.results || [];

            if (page === 1) {
                setFetchedDatas(results);
            } else {
                setFetchedDatas((prev) => {
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

    const fetchMore = () => {
        if (loading || refreshing) return;
        if (page > 0 && fetchedDatas.length > 0) {
            setPage((prev) => prev + 1);
        }
    };

    const handleRefresh = async () => {
        try {
            setRefreshing(true);
            setPage(1);
            await fetchParticipants();
        } catch (error) {
            console.error(error);
        } finally {
            setRefreshing(false);
        }
    };

    const handleOncreatedSuccess = (groupData) => {
        if (recipientType === "group") {
            setRecipients(prev => [groupData.id, ...prev]);
            setFetchedDatas(prev => [groupData, ...prev]);
        }
    }

    const validate = () => {
        if (subject === "") {
            setSnackbar({
                visible: true,
                message: `Chủ đề thư mời là bắt buộc!`,
                type: "error",
            });
            return false;
        }
        if (content === "") {
            setSnackbar({
                visible: true,
                message: `Nội dung là bắt buộc!`,
                type: "error",
            });
            return false;
        }
        if (recipientType === "") {
            setSnackbar({
                visible: true,
                message: `Loại người nhận là bắt buộc!`,
                type: "error",
            });
            return false;
        }
        if (recipientType !== "all" && recipients.length === 0) {
            setSnackbar({
                visible: true,
                message: `Phải chọn ít nhất 1 đối tượng người nhận!`,
                type: "error",
            });
            return false;
        }
        return true;
    };

    const handleCreateInvite = async () => {
        if (!validate()) return;

        try {
            setProcessing(true);
            const token = await AsyncStorage.getItem("token");
            let payload = {
                subject: subject,
                content: content,
                recipient_type: recipientType
            }
            if (recipientType !== "all")
                payload = {
                    ...payload,
                    recipients: recipients
                }
            console.log(payload);
            await authApis(token).post(endpoints['sendMail'], payload);
            await authApis(token).post(endpoints['posts'], {
                content: `${subject}\n\n\t${content}`
            })

            setRecipients([]);
            setSubject("");
            setContent("");
            setRecipientType("");

            setSnackbar({
                visible: true,
                message: `Tạo thành công!`,
                type: "success",
            });
        } catch (error) {
            console.error(error);
        } finally {
            setProcessing(false);
        };
    };

    const shouldShowList = recipientType === "user" || recipientType === "group";

    const renderItem = ({ item }) => {
        const isChecked = recipients.includes(item.id);
        const toggleParticipant = () => {
            if (isChecked) {
                setRecipients((prev) => prev.filter((id) => id !== item.id));
            } else {
                setRecipients((prev) => [...prev, item.id]);
            }
        };

        if (recipientType === "user") {
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
                    <Checkbox status={isChecked ? "checked" : "unchecked"} onPress={toggleParticipant} />
                </View>
            );
        }
        return (
            <TouchableOpacity
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    backgroundColor: "#fff",
                    borderBottomWidth: 1,
                    borderColor: "#eee",
                }}
                onPress={() => nav.navigate("groupDetail",{ groupId: item.id, groupName: item.name })}
            >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={{ fontSize: 16 }}>{item.name} (ID: {item.id}, {item.member_count} thành viên)</Text>
                </View>
                <Checkbox status={isChecked ? "checked" : "unchecked"} onPress={toggleParticipant} />
            </TouchableOpacity>
        );
    };

    return (
        <View style={{ flex: 1, padding: 10, position: "relative" }}>
            {processing && <View style={{ zIndex: 999, position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: "rgba(0,0,0,0.01)" }}>
                <ActivityIndicator size="large" color="black" />
            </View>}
            <TextInput
                activeOutlineColor="#1c85fc"
                style={{ marginVertical: 5 }}
                mode="outlined"
                label="Chủ đề"
                value={subject}
                onChangeText={setSubject}
            />
            <TextInput
                activeOutlineColor="#1c85fc"
                style={{ minHeight: 100, maxHeight: 300 }}
                multiline
                mode="outlined"
                label="Nội dung"
                value={content}
                onChangeText={setContent}
            />

            <View style={{ marginTop: 5 }}>
                <Text variant="labelLarge">Chọn loại người nhận thông báo qua mail:</Text>
                <View style={{ width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "space-around" }}>
                    <View
                        style={[
                            { marginVertical: 5 },
                            recipientType !== "group" ? { width: "100%" } : { width: "75%" },
                        ]}
                    >
                        <Menu
                            visible={menuVisible}
                            onDismiss={() => setMenuVisible(false)}
                            anchor={
                                <TextInput
                                    activeOutlineColor="#1c85fc"
                                    mode="outlined"
                                    value={recipientTypes.find((p) => p.type === recipientType)?.label || ""}
                                    editable={false}
                                    label="Loại người nhận"
                                    right={<TextInput.Icon icon="menu-down" onPress={() => setMenuVisible(true)} />}
                                />
                            }
                        >
                            {recipientTypes.map((p) => (
                                <Menu.Item
                                    key={p.type}
                                    onPress={() => {
                                        setRecipientType(p.type);
                                        setMenuVisible(false);
                                    }}
                                    title={p.label}
                                />
                            ))}
                        </Menu>
                    </View>
                    {recipientType === "group" && (
                        <Button mode="contained" buttonColor="#1c85fc" onPress={() => nav.navigate("createGroup", { onCreatedSuccess: handleOncreatedSuccess })}>
                            Tạo
                        </Button>
                    )}
                </View>

                {shouldShowList && (
                    <>
                        <Searchbar
                            placeholder="Tìm kiếm..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            style={{
                                marginVertical: 5,
                                backgroundColor: "#fffbff",
                                borderWidth: 1,
                                borderRadius: 5,
                                borderColor: "#969199",
                            }}
                            iconColor="#888"
                            placeholderTextColor="#aaa"
                        />

                        <FlatList
                            keyExtractor={(item) => `${recipientType}.${item.id}`}
                            data={fetchedDatas}
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
                            contentContainerStyle={{ paddingBottom: 400, flexGrow: 1 }}
                        />
                    </>
                )}
            </View>
        </View>
    );
};

export default Invite;
