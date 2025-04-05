import { Image, View } from "react-native";
import { Text } from "react-native-paper";
import PostStyle from "../../styles/PostStyle";
import { SafeAreaView } from "react-native-safe-area-context";

const Post = (post) => {
    return (
        <View style ={PostStyle.container}>
            <View style = {PostStyle.r}>
                <View>
                    <View style={PostStyle.r}>
                        <Image style = {PostStyle.avatar} source = {{uri: "https://i.pinimg.com/736x/c2/33/46/c23346e32c1543eb57afb7af8b6e53fd.jpg"}} />
                        <View>
                            <Text style={PostStyle.name}>Nguyễn Văn A</Text>
                            <Text style={[PostStyle.date, PostStyle.m_h]}>3 giờ trước</Text>
                        </View>
                    </View>

                    <View style={PostStyle.p}>
                        <Text >Nội dung bài viết</Text>
                        
                        <Image style = {[PostStyle.attachment, PostStyle.m_v]} source = {{uri: "https://i.pinimg.com/736x/c2/33/46/c23346e32c1543eb57afb7af8b6e53fd.jpg"}} />
                    </View>
                    <View style={[PostStyle.r, PostStyle.m]}>
                        <Text style={PostStyle.m_h}>69 lượt thích</Text>
                        <Text style={PostStyle.m_h}>69 bình luận</Text>
                        <Text style={PostStyle.m_h}>69 chia sẻ</Text>
                    </View>
                    <View style={[PostStyle.r, PostStyle.m_v]}>
                        <Text style={PostStyle.m_h}>Thích</Text>
                        <Text style={PostStyle.m_h}>Bình luận</Text>
                        <Text style={PostStyle.m_h}>Chia sẻ</Text>
                    </View>
                </View>

            </View>
        </View>
        
    );
}
export default Post;