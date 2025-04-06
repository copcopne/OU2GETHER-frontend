import React from "react";
import { Text, View, ScrollView, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Post from "../post/Post";
import HomeStyle from "../../styles/Home";
import PostStyle from "../../styles/PostStyle";

const Home: React.FC = () => {
  const [selectedTab, setSelectedTab] = React.useState<"foryou" | "following">("foryou");

  return (
    <SafeAreaView style={HomeStyle.container}>
      <View style={HomeStyle.header}>
        <Text style={HomeStyle.headerText}>OU2GETHER</Text>
      </View>

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
      <ScrollView>
        <View>
          <View>
            <View>
              <Image
                style={PostStyle.avatar}
                source={{ uri: "https://i.pinimg.com/736x/c2/33/46/c23346e32c1543eb57afb7af8b6e53fd.jpg" }}
              />

              <View>
                <Text>copcopne</Text>
                <Text>Có gì mới</Text>
              </View>
            </View>
          </View>
        </View>
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
