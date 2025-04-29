import { Text, View } from "react-native";
import PostStyle from "../../styles/PostStyle";
const Interactions = () => {
    return (
        <View style={[PostStyle.r, PostStyle.stats]}>
                            <Text style={PostStyle.m_h}>69 lượt thích</Text>
                            <Text style={PostStyle.m_h}>69 bình luận</Text>
                            <Text style={PostStyle.m_h}>69 chia sẻ</Text>
                        </View>
    );
}
export default Interactions;