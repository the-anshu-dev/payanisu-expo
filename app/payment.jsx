import {
  View,
  Text,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Modal,
} from "react-native";
import React, { useState } from "react";
import { Image } from "expo-image";
import { Checkbox } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import qr from "../assets/qr.png";
import ShareIcon from "../assets/share.svg";
import DownloadIcon from "../assets/downloadIcon.svg";
import { useSelector } from "react-redux";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";

const { height, width } = Dimensions.get("window");

const Payment = () => {
  const { id } = useLocalSearchParams();
  const { tourMembers, totalCost } = useSelector((state) => state.booking);

  const { tour } = useSelector((state) => state.tour);

  const bookingTour = tour?.find((t) => t._id === id);

  const [image, setImage] = useState(null);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) setImage(result.assets[0]);
  };

  const handleReserveSeats = async () => {
    if (!image || !agree) {
      Alert.alert(
        "Required fields empty",
        "1. Add payment proof.\n2. Agree to terms & conditions"
      );
      return;
    }
    setLoading(true);
    try {
      for (let member of tourMembers) {
        const body = {
          name: member.name,
          age: member.age,
          gender: member.gender,
          email: member.email,
          tourId: member.tourId,
          isTrekker: member.isTrekker,
          accommodation: member.noAccommodation,
        };
        const res = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/booking/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (res.status !== 201) throw new Error("Failed to book tour.");
      }
      Alert.alert("Success", "Tour booked successfully for all members.");
      router.push("/(tabs)/mytours");
    } catch (error) {
      Alert.alert("Oops!", "Something went wrong!\nPlease try again...");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadQR = async () => {
    return
    // const fileUri = FileSystem.documentDirectory + "qr_code.png";
    // await FileSystem.downloadAsync(qr, fileUri);
    // Alert.alert("Downloaded!", "QR Code saved to your device.");
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom", "left", "right"]}>
      <View className="h-full w-full flex justify-between px-3">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 15 }}>
          <View className="w-full flex justify-center items-center py-6">
            <Text className="text-xl font-semibold">{bookingTour?.name}</Text>
          </View>
          <View className="flex justify-center items-center p-2">
            <Image source={qr} style={{ width: width * 0.7, height: height * 0.3 }} contentFit="contain" />
          </View>
          <View className="flex flex-row justify-between items-center w-full px-6 mt-4">
            <TouchableOpacity onPress={() => setModalVisible(true)} className="flex flex-row items-center">
              <ShareIcon height={20} width={20} />
              <Text className="text-base pl-3">Share QR Code</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDownloadQR} className="flex flex-row items-center">
              <DownloadIcon height={25} width={20} />
              <Text className="text-base pl-3">Download QR Code</Text>
            </TouchableOpacity>
          </View>
          <View className="flex flex-row justify-between items-center mt-4 px-3 py-5">
            <Text>Total Expense</Text>
            <Text>{`x ${tourMembers?.length} seats`}</Text>
            <Text className="font-semibold text-lg">₹ {totalCost}</Text>
          </View>
          <View className="flex justify-center items-center mt-4 w-full">
            <Text>Please Upload screenshot post payment</Text>
            <TouchableOpacity activeOpacity={0.6} onPress={pickImage} style={{ width: "100%" }}>
              <View className="border-2 h-32 rounded-xl mt-3 border-green-600 flex justify-center items-center">
                <Text className="text-green-800">Upload your payment proof</Text>
              </View>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={handleDownloadQR} className="flex flex-row items-center mt-2 px-3 py-1">
            <DownloadIcon height={25} width={20} />
            <Text className="text-base pl-3">Download Consent Form</Text>
          </TouchableOpacity>
          <View className="flex flex-row w-full mt-2 justify-start gap-5 items-center">
            <Checkbox onPress={() => setAgree(!agree)} status={agree ? "checked" : "unchecked"} color="green" />
            <Text className="tracking-wide text-base">I agree to all Terms and Conditions</Text>
          </View>
        </ScrollView>
        <View className="w-full flex flex-row justify-center gap-5 items-center h-16 bg-transparent px-4">
          <TouchableOpacity className="w-[50%] bg-gray-700 py-3 rounded-lg">
            <Text className="text-center text-white">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleReserveSeats} className="w-[50%] border border-green-600 py-3 rounded-lg">
            {loading ? <ActivityIndicator size="small" color="green" /> : <Text className="text-center text-green-700">Reserve Seat</Text>}
          </TouchableOpacity>
        </View>
      </View>
      <Modal visible={modalVisible} transparent animationType="slide">
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white w-[80%] p-5 rounded-lg">
            <Text className="text-lg font-semibold">Share QR Code</Text>
            <View className="w-full flex flex-row justify-center items-center gap-12 mt-4">
              <TouchableOpacity className="py-2 mt-4 flex justify-center items-center gap-2 p-2 rounded-lg w-[30%] shadow-md shadow-black/50 bg-white" onPress={() => { }}>
                <Ionicons name="logo-whatsapp" color={"green"} size={28} />
                <Text className="text-green-700 font-semibold text-base">WhatsApp</Text>
              </TouchableOpacity>
              <TouchableOpacity className="py-2 mt-4 flex justify-center items-center gap-2 p-2 rounded-lg w-[30%] shadow-md shadow-black/50 bg-white" onPress={() => { }}>
                <Ionicons name="mail-outline" color={"green"} size={28} />
                <Text className="text-green-700 font-semibold text-base">Email</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity className="mt-4 flex justify-end items-end px-2 mt-8" onPress={() => setModalVisible(false)}>
              <Text className="text-red-600 text-center text-base">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
export default Payment;
