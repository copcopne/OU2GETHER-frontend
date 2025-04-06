import { Image, ScrollView, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import ProfileStyle from "../../styles/ProfileStyle";
import Post from "../post/Post";
import React from "react";

const Profile: React.FC = () => {
    return (
        <SafeAreaView style={ProfileStyle.container}>
            <ScrollView>
                <View>
                    <View>
                        <Image style={ProfileStyle.cover} source={{ uri: "https://i.pinimg.com/736x/c2/33/46/c23346e32c1543eb57afb7af8b6e53fd.jpg" }} />
                    </View>

                    <View>
                        <Image style={ProfileStyle.avatar} source={{ uri: "https://i.pinimg.com/736x/c2/33/46/c23346e32c1543eb57afb7af8b6e53fd.jpg" }} />
                    </View>
                    <View style={ProfileStyle.m}>
                        <Text style={[ProfileStyle.name, ProfileStyle.m]}>si</Text>
                        <Text style={[ProfileStyle.m, ProfileStyle.username]}>copcopne</Text>
                        <Text style={[ProfileStyle.bio, ProfileStyle.m]}>The right person will stay</Text>

                        <View style={[ProfileStyle.r, ProfileStyle.m]}>
                            <View style={ProfileStyle.followerAvatarContainer}>
                                <Image style={ProfileStyle.followerAvatar} source={{ uri: "https://i.pinimg.com/736x/c2/33/46/c23346e32c1543eb57afb7af8b6e53fd.jpg" }} />
                                <Image style={[ProfileStyle.followerAvatar, ProfileStyle.secondFollowerAvatar]} source={{ uri: "https://i.pinimg.com/736x/c2/33/46/c23346e32c1543eb57afb7af8b6e53fd.jpg" }} />
                            </View>
                            
                            <Text style={[ProfileStyle.username, ProfileStyle.followersText]}>10 người theo dõi</Text>
                        </View>
                    </View>
                    
                    <View style={[ProfileStyle.r, ProfileStyle.actions]}>
                        <TouchableOpacity style={[ProfileStyle.button, { flex: 1, margin: 5 }]}>
                            <Text style={[ProfileStyle.buttonText, ProfileStyle.p]}>Chỉnh sửa trang cá nhân</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[ProfileStyle.button, { flex: 1, margin: 5 }]}>
                            <Text style={[ProfileStyle.buttonText, ProfileStyle.p]}>Chia sẻ trang cá nhân</Text>
                        </TouchableOpacity>
                    </View>
                    
                </View>

                <View style={[ProfileStyle.postContainer]}>
                    <View>
                        
                    </View>
                    <Post />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default Profile;
