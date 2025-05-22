import { Image, Text, TouchableOpacity, View } from 'react-native';
import PostStyle from '../../styles/PostStyle';
import dayjs from 'dayjs';
const Comment = ({commentData}) => {
    return (
        <View style={[PostStyle.r, PostStyle.p]}>
            <View>
                <Image 
                    style={PostStyle.avatar}
                    source={{ uri: commentData?.author.avatar }} 
                />
            </View>

            <View>
                <View>
                    <Text style={PostStyle.name}>{`${commentData?.author.last_name} ${commentData?.author.first_name} ${commentData?.is_edited === true ? '(đã chỉnh sửa)' : ''}`}</Text>
                    <Text style={[PostStyle.content, PostStyle.m_v]} >{commentData?.content}</Text>
                    </View>
                    <View style ={{flexDirection: "row"}}>
                    <Text style={PostStyle.date}>{`${dayjs(commentData?.created_at).fromNow(true)}`}</Text>
                    <TouchableOpacity><Text>Thích</Text></TouchableOpacity>
                    </View>
            </View>
        </View>
        
    );
}
export default Comment;