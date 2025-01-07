import { View, Text, Dimensions } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator } from "react-native-paper";
import Carousel from "react-native-reanimated-carousel";
import { ScrollView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import CarouselImageRender from "../../components/UI/CarouselImageRender";
import { formatDate } from "../../utils/helpers";

const width = Dimensions.get("window").width;

const postdetails = () => {
  const { id } = useLocalSearchParams();
  const [images, setImages] = useState([]);
  const [post, setPost] = useState(null);

  const getPostById = async () => {
    try {
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/Post/get-post?id=${id}`
      );
      if (res.status !== 200) {
        throw new Error("Failed to get post.");
      }

      const postData = await res.json();
      setPost(postData.data[0]);
      const imgs = postData.data[0].images.map((i) => i.url);
      setImages(imgs);
    } catch (error) {
      console.log("Error:", error);
    }
  };

  useEffect(() => {
    getPostById();
  }, []);

  if (!post || !images) {
    return (
      <View className="h-full w-full flex justify-center items-center">
        <ActivityIndicator color="green" size={"large"} />
      </View>
    );
  }

  return (
    <ScrollView className="flex h-full">
      <StatusBar
        style="dark"
        backgroundColor="#fff"
        translucent={true}
        animated
      />
      <Carousel
        loop
        width={width}
        height={288}
        autoPlay={true}
        data={images}
        autoPlayInterval={2000}
        scrollAnimationDuration={1000}
        renderItem={CarouselImageRender}
      />
      <View className="px-3 mt-2">
        <View className="flex flex-row justify-between">
          <Text className="text-gray-500">{post.name}</Text>
          <Text className="text-gray-500">{formatDate(post.createdAt)}</Text>
        </View>
        <Text className="text-base mt-2 text-justify">{post?.content}</Text>
      </View>
    </ScrollView> 
  );
};

export default postdetails;
