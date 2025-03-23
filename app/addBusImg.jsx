import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { uploadFilesToS3 } from "../utils/uploadFileHelper";

const { width: deviceWidth } = Dimensions.get("window");

const addBusImg = () => {
  const [image, setImage] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { id } = useLocalSearchParams();

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets);
    } else {
      setError("Image not selected! Try again");
    }
  };

  const handleBusImageUpload = async () => {
    if (!image || image.length === 0) {
      setError("Select an Image...");
      return;
    }
    setLoading(true);
    try {
      const res = await uploadFilesToS3(image, id, "bus");
      router.replace(`/addHotelImg?id=${id}`);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="px-6 pt-6 relative h-full">
      <View className="w-full flex justify-center items-center">
        {error && (
          <Text className="text-base text-red-500 font-semibold">{error}</Text>
        )}
      </View>
      <View className="flex justify-center items-center h-[80%] w-full border-2 border-[#228B22] rounded-xl">
        {image.length > 0 ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 50, width: "100%" }}
            style={{ padding: 5, width: "100%" }}
          >
            {image.map((img, idx) => (
              <Image
                key={idx}
                source={{ uri: img.uri }}
                style={{
                  width: "100%",
                  height: 200,
                  borderRadius: 10,
                  marginBottom: 14,
                }}
              />
            ))}
          </ScrollView>
        ) : (
          <Text>Select Bus Images</Text>
        )}
      </View>
      <View
        style={{
          width: deviceWidth,
          bottom: 32,
          position: "absolute",
          paddingHorizontal: 24,
        }}
      >
        <TouchableOpacity activeOpacity={0.9} onPress={pickImage}>
          <View className="h-12 flex justify-center items-center border-2 border-dashed rounded-lg mb-3 border-[#228B22]">
            <View className="flex flex-row justify-center items-center space-x-3">
              <Ionicons name="add-circle" size={20} color={"#228B22"} />
              <Text className="text-base font-semibold text-[#228B22]">
                Add Bus Images
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.9}
          containerStyle={{ height: "100%" }}
          onPress={handleBusImageUpload}
        >
          <View className="h-12 flex justify-center items-center bg-[#228B22] rounded-lg">
            <Text className="text-base font-semibold text-white">
              {loading ? "Uploading..." : "Proceed"}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default addBusImg;
