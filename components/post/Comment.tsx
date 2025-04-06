import React from 'react';
import { Image, Text, View } from 'react-native';
import PostStyle from '../../styles/PostStyle';
import Stats from './Stats';
const Comment: React.FC = () => {
    return (
        <View style={[PostStyle.container, PostStyle.r, PostStyle.p]}>
            <View>
                <Image 
                    style={PostStyle.avatar}
                    source={{ uri: "https://i.pinimg.com/736x/c2/33/46/c23346e32c1543eb57afb7af8b6e53fd.jpg" }} 
                />
            </View>

            <View>
                <View style={PostStyle.r}>
                    <Text style={PostStyle.name}>Nguyễn Văn A</Text>
                    <Text style={PostStyle.date}>3 giờ trước</Text>
                </View>
                <View>
                    <Text style={[PostStyle.content, PostStyle.m_v]} >Tôi chỉ là 1 con mèo đang bình luận.</Text>
                </View>
                <Stats/>
            </View>
        </View>
    );
}
export default Comment;