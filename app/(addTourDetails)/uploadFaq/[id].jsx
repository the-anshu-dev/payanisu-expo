import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { router, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { showError, showSuccess } from "../../../utils/toastHelper";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { uploadFileToS3 } from "../../../utils/uploadFileHelper";
import { useTours } from "../../../hooks/useTours";

const { height } = Dimensions.get("window");

const UploadFaq = () => {
  const { id } = useLocalSearchParams();
  const { tours } = useTours();
  const { user } = useSelector((state) => state.user);

  const [faq, setFaq] = useState(null);

  const [loading, setLoading] = useState(false);

  const tourDetail = tours?.find((item) => item._id === id) ?? null;

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      aspect: [16, 9],
      quality: 1,
    });

    if (!result.canceled) {
      setFaq(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    if (tourDetail.faqUrl && !faq) {
      showError("FAQ already uploaded, please edit it.");
      return;
    }
    if (!faq) {
      showError("Please select a file");
      return;
    }
    setLoading(true);
    try {
      const faqUrl = await uploadFileToS3(faq);

      if (!faqUrl) {
        showError("Failed to upload file");
        return;
      }

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/tour/update-tour`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-email": user?.email,
          },
          body: JSON.stringify({ id, faqUrl }),
        }
      );

      if (!response.ok) {
        showError("Failed to upload file");
        return;
      }
      showSuccess("FAQ uploaded successfully");
      router.back();
    } catch (error) {
      showError("Failed to upload file", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-between p-3">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {faq ? (
          <View className="flex-1 p-1 rounded-lg">
            <Image
              source={{ uri: faq.uri }}
              style={{ width: "100%", height: height * 0.75, borderRadius: 10 }}
            />
          </View>
        ) : tourDetail?.faqUrl ? (
          <View className="flex-1 p-1 rounded-lg">
            <Image
              source={tourDetail.faqUrl}
              style={{ width: "100%", height: height * 0.75, borderRadius: 10 }}
            />
          </View>
        ) : (
          <View className="flex-1 h-full w-full justify-center items-center">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={pickImage}
              className="bg-[#228B22] p-3 rounded-lg flex flex-row justify-center items-center px-4 gap-3"
            >
              <Ionicons name="cloud-upload-outline" size={24} color="white" />
              <Text className="text-white text-center font-semibold py-2">
                Upload FAQs
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      <View className="absolute bottom-0 left-0 right-0 bg-white p-3 flex flex-row justify-between">
        <TouchableOpacity
          onPress={pickImage}
          className="bg-gray-500 p-3 rounded-lg flex-1 mr-2"
        >
          <Text className="text-white text-center font-semibold">Edit FAQ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSubmit}
          activeOpacity={0.8}
          className="bg-[#228B22] p-3 rounded-lg flex-1 ml-2"
        >
          {loading ? (
            <ActivityIndicator color={"white"} size={"small"} />
          ) : (
            <Text className="text-white text-center font-semibold">
              Upload FAQ
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default UploadFaq;
