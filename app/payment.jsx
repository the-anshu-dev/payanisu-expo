import {
  View,
  Text,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { Image } from "expo-image";
import { Checkbox } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import qr from "../assets/qr.png";
import share from "../assets/share.svg";
import download from "../assets/downloadIcon.svg";
import { useSelector } from "react-redux";
import { router, useLocalSearchParams } from "expo-router";

const payment = () => {
  const { id } = useLocalSearchParams();
  const { tourMembers, totalCost } = useSelector((state) => state.booking);

  const [image, setImage] = useState(null);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    } else {
      setError("Image not selected! Try again");
    }
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

        const res = await fetch(
          `${process.env.EXPO_PUBLIC_BASE_URL}/api/booking/add`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          }
        );

        if (res.status !== 201) {
          console.log(`Failed to book tour for ${member.name}`);
          throw new Error("Failed to book tour.");
        }
      }
      Alert.alert("Success", "Tour booked successfully for all members.");
      router.push("/(tabs)/mytours");
    } catch (error) {
      console.log("Failed to book tour", error?.message, error);
      Alert.alert("Oops!", "Something went wrong!\nPlease try again...");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="h-full w-full flex justify-between px-3">
      <View className="w-full">
        <View className="flex justify-center items-center mt-4">
          <Text className="text-xl font-semibold">Srishailm Trek</Text>
        </View>
        <View className="flex justify-center items-center">
          <View className="py-5">
            <Image source={qr} className="h-52 w-52" />
          </View>
        </View>
        <View className="flex flex-row justify-between items-center w-full px-6 mt-2">
          <View className="flex flex-row justify-center items-center">
            <Image source={share} className="h-5 w-5" />
            <Text className="text-base pl-3">Share QR Code</Text>
          </View>
          <View className="flex flex-row justify-center items-center">
            <Image source={download} className="h-5 w-5" />
            <Text className="text-base pl-3">Download QR Code</Text>
          </View>
        </View>
        <View className="flex flex-row justify-between items-center mt-4 px-3 py-5">
          <Text>Total Expense</Text>
          <Text>{`x ${tourMembers?.length} seats`}</Text>
          <Text className="font-semibold text-lg">{`₹ ${totalCost}`}</Text>
        </View>
        <View className="flex justify-center items-center mt-4 w-full">
          <Text>Please Upload screenshot post payment</Text>
          {image ? (
            <View className="h-32 w-full py-2 rounded-xl overflow-hidden">
              <Image
                source={{ uri: image.uri }}
                className="h-full w-full rounded-xl"
              />
            </View>
          ) : (
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={pickImage}
              containerStyle={{ flexGrow: 1 }}
              style={{ width: "100%" }}
            >
              <View className="border h-32 w-full rounded-xl mt-1 border-green-600 flex justify-center items-center">
                <Text className="text-green-800">
                  Upload your payment proof
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
        <View className="flex flex-row w-full mt-4 justify-center items-center">
          <View className="w-[10%]">
            <Checkbox
              onPress={() => setAgree(!agree)}
              status={agree ? "checked" : "unchecked"}
              color="green"
            />
          </View>
          <Text className="w-[90%] tracking-wide text-base text-justify">
            I hereby agree to sign digital consent and agrees to all Terms and
            Conditions,
          </Text>
        </View>
        <View className="flex flex-row mt-4 justify-start items-center pl-3">
          <Image source={download} className="h-5 w-5" />
          <Text className="pl-3 text-base text-green-700">
            View and download consent form.
          </Text>
        </View>
      </View>
      <View className="w-full flex flex-row justify-between items-center h-16 bg-transparent">
        <TouchableOpacity
          activeOpacity={0.8}
          style={{
            width: 165,
            backgroundColor: "#414141",
            paddingVertical: 12,
            borderRadius: 8,
          }}
        >
          <Text style={{ textAlign: "center", color: "#fff" }}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleReserveSeats}
          style={{
            width: 165,
            paddingVertical: 12,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "green",
          }}
        >
          {loading ? (
            <ActivityIndicator size={"small"} color={"green"} />
          ) : (
            <Text style={{ textAlign: "center", color: "green" }}>
              Reserve Seat
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default payment;
