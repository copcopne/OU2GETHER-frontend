import { Text, View, ScrollView, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Post from "../post/Post";
import HomeStyle from "../../styles/Home";
import PostStyle from "../../styles/PostStyle";
import React from "react";

const Home = () => {
  const [selectedTab, setSelectedTab] = React.useState<"foryou" | "following">("foryou");

  return (
    <SafeAreaView style={HomeStyle.container}>
      {/* Header */}
      <View style={HomeStyle.header}>
        <Text style={HomeStyle.headerText}>OU2GETHER</Text>
      </View>

      {/* Tabs */}
      <View style={HomeStyle.tabContainer}>
        <TouchableOpacity onPress={() => setSelectedTab("foryou")}>
          <Text
            style={[
              HomeStyle.tabText,
              selectedTab === "foryou" && HomeStyle.tabTextActive,
            ]}
          >
            Dành cho bạn
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSelectedTab("following")}>
          <Text
            style={[
              HomeStyle.tabText,
              selectedTab === "following" && HomeStyle.tabTextActive,
            ]}
          >
            Đang theo dõi
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView>
        {/* Story-like section */}
        <View style={HomeStyle.storyContainer}>
          <Image
            style={PostStyle.avatar}
            source={{ uri: "https://i.pinimg.com/736x/c2/33/46/c23346e32c1543eb57afb7af8b6e53fd.jpg" }}
          />
          <View>
            <Text style={PostStyle.username}>copcopne</Text>
            <Text style={PostStyle.caption}>Có gì mới</Text>
          </View>
        </View>

        {/* Feed */}
        <View style={HomeStyle.feed}>
          <Post />
          <Post />
          <Post />
          <Post />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
