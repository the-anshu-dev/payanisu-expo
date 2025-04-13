import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Platform,
  Alert,
} from "react-native";
import React, { useState, useRef } from "react";
import { Checkbox } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import * as Sharing from "expo-sharing";
import ShareIcon from "../assets/share.svg";
import DownloadIcon from "../assets/downloadIcon.svg";
import { useSelector } from "react-redux";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import * as MediaLibrary from "expo-media-library";
import QRCodeGenerator from "../components/admin/components/QRCodeGenerator";
import ViewShot from "react-native-view-shot";
import * as FileSystem from "expo-file-system";
import { Image } from "expo-image";
import { showError, showSuccess, showWarning } from "../utils/toastHelper";

const { width } = Dimensions.get("window");

const Payment = () => {
  const { id } = useLocalSearchParams();
  const { tourMembers, totalCost } = useSelector((state) => state.booking);
  const { tour } = useSelector((state) => state.tour);
  const bookingTour = tour?.find((t) => t._id === id);

  const [image, setImage] = useState(null);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);

  const qrRef = useRef();

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) setImage(result.assets[0]);
  };

  const handleDownloadConsentForm = async () => {
    try {
      const pdfUrl = bookingTour.consentFormUrl;
      const fileName = "consent_form.pdf";
      const fileUri = FileSystem.cacheDirectory + fileName;

      const { uri } = await FileSystem.downloadAsync(pdfUrl, fileUri);

      if (Platform.OS === "android") {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Denied",
            "Permission to access storage is required!"
          );
          return;
        }

        const permissions =
          await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (!permissions.granted) {
          Alert.alert(
            "Permission required",
            "Cannot save file without permission"
          );
          return;
        }

        await FileSystem.StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          fileName,
          "application/pdf"
        ).then(async (uri) => {
          await FileSystem.writeAsStringAsync(
            uri,
            await FileSystem.readAsStringAsync(fileUri, {
              encoding: FileSystem.EncodingType.Base64,
            }),
            {
              encoding: FileSystem.EncodingType.Base64,
            }
          );
          showSuccess("PDF saved successfully!");
        });
      } else {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri);
        } else {
          showError("Sharing is not available on this device.");
        }
      }
    } catch (error) {
      showError("Oops!", "Something went wrong. Please try again.");
    }
  };

  const upiLink = `upi://pay?pa=8090900602@ptyes&pn=Prince%20Chaurasia&am=${totalCost}.00&cu=INR&tn=Payment%20for%20services`;

  const handleDownloadQr = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        showWarning("Permission not granted to save image.");
        return;
      }

      const uri = await qrRef.current.capture();

      const filename = `${bookingTour?.name}_QRCode_${Date.now()}.png`;
      const fileUri = FileSystem.documentDirectory + filename;

      await FileSystem.copyAsync({ from: uri, to: fileUri });

      const asset = await MediaLibrary.createAssetAsync(fileUri);
      const album = await MediaLibrary.getAlbumAsync("Download");

      if (album == null) {
        await MediaLibrary.createAlbumAsync("Download", asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }

      showSuccess(`QR CODE saved as ${filename}`);
    } catch (error) {
      showError(error.message || "Failed to download the image.");
    }
  };

  const handleShareQr = async () => {
    try {
      const uri = await qrRef.current.capture();
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri);
      } else {
        showWarning("Sharing is not available on this device.");
      }
    } catch (error) {
      showError(error.message || "Failed to share the QR code.");
    }
  };

  const handleReserveSeats = async () => {
    if (!image || !agree) {
      showWarning("Required fields empty");
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
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }
        );
        if (res.status !== 201) throw new Error("Failed to book tour.");
      }
      showSuccess("Tour booked successfully for all members.");
      router.replace("/(tabs)/mytours");
    } catch (error) {
      showError(error.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom", "left", "right"]}>
      <View className="h-full w-full flex justify-between px-3">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 50, paddingHorizontal: 15 }}
        >
          <View className="w-full flex justify-center items-center py-6">
            <Text className="text-xl font-semibold">{bookingTour?.name}</Text>
          </View>
          <ViewShot ref={qrRef} options={{ format: "png", quality: 0.9 }}>
            <View className="flex justify-center items-center w-full">
              <QRCodeGenerator upiLink={upiLink} />
            </View>
          </ViewShot>
          <View className="flex flex-row justify-between items-center w-full px-6 mt-4">
            <TouchableOpacity
              onPress={handleShareQr}
              className="flex flex-row items-center"
            >
              <ShareIcon height={20} width={20} />
              <Text className="text-base pl-3">Share QR Code</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDownloadQr}
              className="flex flex-row items-center"
            >
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
            {image ? (
              <View className="w-full flex justify-center items-center mt-2 border border-[#228B22] rounded-lg p-2 relative">
                <Image
                  contentFit="contain"
                  source={{ uri: image.uri }}
                  style={{ width: width - 40, height: 200 }}
                />
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setImage(null)}
                  className="absolute top-2 right-2 flex justify-center items-center"
                >
                  <Ionicons name="close-circle" size={28} color="red" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={pickImage}
                style={{ width: "100%" }}
              >
                <View className="border-2 h-36 rounded-xl mt-3 border-[#228B22] flex justify-center items-center">
                  <Text className="text-[#228B22]">
                    Upload your payment proof
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            onPress={handleDownloadConsentForm}
            className="flex flex-row items-center mt-2 px-3 py-1"
          >
            <DownloadIcon height={25} width={20} />
            <Text className="text-base pl-3">Download Consent Form</Text>
          </TouchableOpacity>
          <View className="flex flex-row w-full mt-2 justify-start gap-5 items-center">
            <Checkbox
              onPress={() => setAgree(!agree)}
              status={agree ? "checked" : "unchecked"}
              color="#228B22"
            />
            <Text className="tracking-wide text-base">
              I agree to all Terms and Conditions
            </Text>
          </View>
        </ScrollView>
        <View className="w-full flex flex-row justify-center gap-5 items-center h-16 bg-white px-4">
          <TouchableOpacity className="w-[50%] bg-gray-700 py-3 rounded-lg">
            <Text className="text-center text-white">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleReserveSeats}
            className="w-[50%] border border-[#228B22] py-3 rounded-lg"
          >
            {loading ? (
              <ActivityIndicator size="small" color="#228B22" />
            ) : (
              <Text className="text-center text-[#228B22">Reserve Seat</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};
export default Payment;
