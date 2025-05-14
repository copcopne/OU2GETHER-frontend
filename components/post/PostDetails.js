import { Image, SafeAreaView, TouchableOpacity, View } from "react-native";
import { IconButton, Text } from "react-native-paper";
import PostStyle from "../../styles/PostStyle";
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const PostDetail = ({ route }) => {
    const { postData } = route.params || {}
    return (<SafeAreaView>
    <View style={PostStyle.header}>
                        <Image 
                            style={PostStyle.avatar} 
                            source={{ uri: postData?.author.avatar }} 
                        />
                        <View>
                            <Text style={PostStyle.name}>{postData?.author.last_name + " " + postData?.author.first_name}</Text>
                            <Text style={PostStyle.date}>{dayjs(postData?.created_at).fromNow()}</Text>
                        </View>
                    </View>
                    
                    <View>
                        <Text style={[PostStyle.content, PostStyle.m_v]} >{postData?.content}</Text>
                        <Image 
                            style={PostStyle.attachment} 
                            source={{ uri: "https://i.pinimg.com/736x/c2/33/46/c23346e32c1543eb57afb7af8b6e53fd.jpg" }} 
                        />
                    </View>
                    <View style={[PostStyle.r, PostStyle.stats]}>
                                <Text style={PostStyle.m_h}>{postData?.interaction_count} tương tác</Text>
                                <Text style={PostStyle.m_h}>{postData?.comment_count} bình luận</Text>
                                <Text style={PostStyle.m_h}>{postData?.share_count} chia sẻ</Text>
                            </View>
    
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
    </SafeAreaView>)
};
export default PostDetail;