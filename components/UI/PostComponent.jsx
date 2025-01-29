import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ScrollView } from "react-native-gesture-handler";
import { formatDate } from "../../utils/helpers";

const PostComponent = ({ post }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(`/postdetails/${post._id}`)}
    >
      <View
        className={`h-fit p-2 border border-gray-500/50 rounded-lg gap-2 w-full `}
      >
        <Text className={`h-fit`}>{shorten(post?.content, 100)}</Text>
        <View className="flex flex-row w-full justify-center">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex flex-row gap-2">
              {post?.images.map((image, index) => (
                <Image
                  key={index}
                  source={{ uri: image.url }}
                  style={{ height: 80, width: 80, borderRadius: 5 }}
                />
              ))}
            </View>
          </ScrollView>
        </View>
        <View className="mt-2 flex flex-row justify-start items-center gap-2">
          <Text className={`text-xs font-semibold tracking-wider `}>
            {post.name}
          </Text>
          <View className="h-1.5 w-1.5 bg-gray-400 rounded-full" />
          <Text className={`text-xs font-semibold tracking-wider`}>
            {formatDate(post.createdAt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const shorten = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + "...";
};

export default PostComponent;
