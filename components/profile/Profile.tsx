import { Image, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import ProfileStyle from "../../styles/ProfileStyle";
import Post from "../post/Post";
import React from "react";

const Profile: React.FC = () => {
    return (
        <SafeAreaView style = {ProfileStyle.container}>
            <View>
                <View>
                    <Image style = {ProfileStyle.cover} source = {{uri: "https://i.pinimg.com/736x/c2/33/46/c23346e32c1543eb57afb7af8b6e53fd.jpg"}} />
                </View>

                <View>
                    <Image style = {ProfileStyle.avatar} source = {{uri: "https://i.pinimg.com/736x/c2/33/46/c23346e32c1543eb57afb7af8b6e53fd.jpg"}} />
                </View>

                <Text style = {[ProfileStyle.name, ProfileStyle.m]}>Nguyễn Văn A</Text>
                <Text style = {[ProfileStyle.m, ProfileStyle.username]}>nguyenvana</Text>
                <Text style = {[ProfileStyle.bio, ProfileStyle.m]}>Tiểu sử nè</Text>

                <View style={[ProfileStyle.r, ProfileStyle.m]}>
                    <Image style = {ProfileStyle.followerAvatar} source = {{uri: "https://i.pinimg.com/736x/c2/33/46/c23346e32c1543eb57afb7af8b6e53fd.jpg"}} />
                    <Image style = {ProfileStyle.followerAvatar} source = {{uri: "https://i.pinimg.com/736x/c2/33/46/c23346e32c1543eb57afb7af8b6e53fd.jpg"}}  />
                    <Text style = {ProfileStyle.username}>69 người theo dõi</Text>
                </View>
                <TouchableOpacity style={[ProfileStyle.button, ProfileStyle.m]}>
                    <Text style = {ProfileStyle.buttonText}>Chỉnh sửa thông tin cá nhân</Text>
                </TouchableOpacity>
                
            </View>
            <View style={ProfileStyle.m}>
                <Post />
            </View>
        </SafeAreaView>
    );
};
export default Profile;