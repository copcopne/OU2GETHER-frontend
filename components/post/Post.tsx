import { Image, ScrollView, TouchableOpacity, View } from "react-native";
import { Icon, IconButton, Text } from "react-native-paper";
import PostStyle from "../../styles/PostStyle";
import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import Comment from "./Comment";
import Stats from "./Stats";

const Post: React.FC = () => {
    return (
        <View style={[PostStyle.container,  PostStyle.p]}>
                <View style={PostStyle.header}>
                    <Image 
                        style={PostStyle.avatar} 
                        source={{ uri: "https://i.pinimg.com/736x/c2/33/46/c23346e32c1543eb57afb7af8b6e53fd.jpg" }} 
                    />
                    <View>
                        <Text style={PostStyle.name}>Nguyễn Văn A</Text>
                        <Text style={PostStyle.date}>3 giờ trước</Text>
                    </View>
                </View>
                
                <View>
                    <Text style={[PostStyle.content, PostStyle.m_v]} >Tôi chỉ là 1 con mèo</Text>
                    <Image 
                        style={PostStyle.attachment} 
                        source={{ uri: "https://i.pinimg.com/736x/c2/33/46/c23346e32c1543eb57afb7af8b6e53fd.jpg" }} 
                    />
                </View>
                <Stats/>

                <View style={[PostStyle.r, PostStyle.actions]}>
                    <TouchableOpacity style={[PostStyle.r, PostStyle.button]}>
                        <IconButton icon="thumb-up" size={20}/>
                        <Text>Thích</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[PostStyle.r, PostStyle.button]}>
                    <IconButton icon="comment" size={20}/>
                        <Text>Bình luận</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[PostStyle.r, PostStyle.button]}>
                    <IconButton icon="share" size={20}/>
                        <Text>Chia sẻ</Text>
                    </TouchableOpacity>
                </View>
                <Comment />
        </View>
    );
}
export default Post;
