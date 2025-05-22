import { Image, TouchableOpacity, View } from "react-native";
import { IconButton, Text } from "react-native-paper";
import PostStyle from "../../styles/PostStyle";
import React from "react";
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { useNavigation } from "@react-navigation/native";

dayjs.extend(relativeTime);
dayjs.locale('vi');

const Post = React.memo(({ postData, isDetail=false }) => {
    const nav = useNavigation();
    return (
        <TouchableOpacity 
            style={[PostStyle.p, PostStyle.container]}
            onPress={() => nav.navigate("postDetail",{ postData })}
        >
            <View style={PostStyle.header}>
                <Image
                    style={PostStyle.avatar}
                    source={{ uri: postData?.author.avatar }}
                />
                <View>
                    <Text style={PostStyle.name}>{postData?.author.last_name + " " + postData?.author.first_name}</Text>
                    <Text style={PostStyle.date}>{`${dayjs(postData?.created_at).fromNow(true)} ${postData?.is_edited === true ? "(đã chỉnh sửa)" : ""}`}</Text>
                </View>
                {postData?.author.is_myself?<View style={PostStyle.stats}><Text>...</Text></View>:null}
            </View>

            <View>
                <Text style={[PostStyle.content, PostStyle.m_v]} >{postData?.content}</Text>
                
            </View>
            <View style={[PostStyle.r, PostStyle.stats]}>
                { postData?.interaction_count > 0 ? <Text style={PostStyle.m_h}>{postData?.interaction_count} tương tác</Text> : null}
                { postData?.comment_count > 0 ? <Text style={PostStyle.m_h}>{postData?.comment_count} bình luận</Text> : null}
                { postData?.share_count > 0 ? <Text style={PostStyle.m_h}>{postData?.share_count} chia sẻ</Text> : null}
            </View>

            <View style={[PostStyle.r, PostStyle.actions]}>
                <TouchableOpacity style={[PostStyle.r, PostStyle.button]}>
                    <IconButton icon="thumb-up" size={20} />
                    <Text>Thích</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[PostStyle.r, PostStyle.button]}>
                    <IconButton icon="comment" size={20} />
                    <Text>Bình luận</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
})
export default Post;
