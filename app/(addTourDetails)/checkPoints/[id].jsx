import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import MarkerIcon from "../../../assets/marker-pin.svg";
import EditIcon from "../../../assets/edit.svg";
import UserIcon from "../../../assets/user.svg";
import { Modalize } from "react-native-modalize";
import MapView, { Marker } from "react-native-maps";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { shorten } from "../../../components/UI/PostComponent";
import { ActivityIndicator } from "react-native-paper";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { useDispatch } from "react-redux";
import { setCheckPoints } from "../../../redux/slices/tourSlice";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import {
  showError,
  showSuccess,
  showWarning,
} from "../../../utils/toastHelper";

const { height, width } = Dimensions.get("window");

const Checkpoints = () => {
  const { id } = useLocalSearchParams();
  const dispatch = useDispatch();

  const [qrUrl, setQrUrl] = useState();
  const [allCheckPoints, setAllCheckPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [editingCheckPointData, setEditingCheckPointData] = useState({});
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const editCheckPointRef = useRef(null);
  const viewMapRef = useRef(null);
  const downloadQRref = useRef(null);

  const [region, setRegion] = useState({
    latitude: 12.9716,
    longitude: 77.5946,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const fetchAPI = useCallback(async (url, options = {}) => {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error("Request failed");
      }
      return await response.json();
    } catch (error) {
      showError(error.message || "Something went wrong.");
    }
  }, []);

  const handleOpenEditSheet = (id) => {
    setEditingCheckPointData(allCheckPoints.find((point) => point._id === id));
    editCheckPointRef.current?.open();
  };

  const handleQr = useCallback(async () => {
    setQrLoading(true);
    try {
      const qr = await fetch(
        `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
          id
        )}&size=200x200`
      );
      setQrUrl(qr.url);
      downloadQRref.current?.open();
    } catch (error) {
      showError(error.message || "Please try again.");
    } finally {
      setQrLoading(false);
    }
  }, [id]);

  const handleDownloadQr = async () => {
    if (!qrUrl) return;

    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        return showWarning("We need access to save the QR code.");
      }

      const fileUri = FileSystem.documentDirectory + "qrcode.png";
      const { uri } = await FileSystem.downloadAsync(qrUrl, fileUri);
      const asset = await MediaLibrary.createAssetAsync(uri);
      const album = await MediaLibrary.getAlbumAsync("Download");

      album
        ? await MediaLibrary.addAssetsToAlbumAsync([asset], album, false)
        : await MediaLibrary.createAlbumAsync("Download", asset, false);

      showSuccess("QR code saved to your gallery!");
    } catch (error) {
      showError(error.message || "Failed to download QR code.");
    }
  };

  const handleGetAllCheckPoints = useCallback(async () => {
    setLoading(true);
    const data = await fetchAPI(
      `${process.env.EXPO_PUBLIC_BASE_URL}/api/get-points?tourId=${id}`
    );
    if (data) {
      setAllCheckPoints(data);
      dispatch(setCheckPoints(data));
    }
    setLoading(false);
  }, [id, dispatch, fetchAPI]);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        return showWarning("Location permission is required.");
      }

      const { coords } = await Location.getCurrentPositionAsync({});
      setRegion((prev) => ({
        ...prev,
        latitude: coords.latitude,
        longitude: coords.longitude,
      }));
    } catch (error) {
      showError(error.message || "Failed to get location.");
    }
  };

  const handleCheckpointActive = async (id) => {
    const response = await fetchAPI(
      `${process.env.EXPO_PUBLIC_BASE_URL}/api/update-point?id=${id}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activated: true }),
      }
    );
    if (response) showSuccess("Checkpoint Activated.");
  };

  const handleEditCheckpoint = async (id) => {
    const response = await fetchAPI(
      `${process.env.EXPO_PUBLIC_BASE_URL}/api/update-point?id=${id}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      }
    );
    if (response) {
      showSuccess("Checkpoint Updated.");
      onRefresh();
      editCheckPointRef.current?.close();
    }
  };

  const onRefresh = useCallback(() => {
    handleGetAllCheckPoints();
  }, [handleGetAllCheckPoints]);

  useEffect(() => {
    handleGetAllCheckPoints();
    getUserLocation();
  }, []);

  useFocusEffect(useCallback(() => onRefresh(), [onRefresh]));

  if (loading) {
    return (
      <View className="w-full h-full flex justify-center items-center">
        <ActivityIndicator color="green" size={"large"} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom", "left", "right"]}>
      <View className="px-4 relative h-full w-full flex justify-start items-center">
        {allCheckPoints.length === 0 ? (
          <View className="h-full w-full flex justify-center items-center -mt-10">
            <Ionicons name="navigate-circle-outline" size={48} color={"gray"} />
            <Text className="text-xl font-semibold mt-4 text-gray-400">
              No checkpoints added yet
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120 }}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={onRefresh}
                colors={["red", "green", "blue"]}
              />
            }
            style={{ width: "100%" }}
          >
            {allCheckPoints?.map((point, index) => (
              <CheckPointCard
                point={point}
                key={index}
                idx={index}
                editRef={editCheckPointRef}
                mapRef={viewMapRef}
                handleCheckpointActive={handleCheckpointActive}
                handleOpenEditSheet={handleOpenEditSheet}
                onRefresh={onRefresh}
              />
            ))}
          </ScrollView>
        )}
        <View
          style={{ width: width }}
          className="w-full absolute bottom-0 flex flex-row justify-between items-center h-16 bg-white px-4"
        >
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleQr}
            style={{
              width: width * 0.43,
              backgroundColor: "gray",
              paddingVertical: 12,
              borderRadius: 8,
            }}
          >
            {qrLoading ? (
              <ActivityIndicator color="white" size={20} />
            ) : (
              <Text style={{ textAlign: "center", color: "#fff" }}>
                Download QR code
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push(`/createCheckpoints/${id}`)}
            style={{
              width: width * 0.43,
              backgroundColor: "green",
              paddingVertical: 12,
              borderRadius: 8,
            }}
          >
            <Text style={{ textAlign: "center", color: "#fff" }}>
              Add Check Point
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <Modalize ref={editCheckPointRef} adjustToContentHeight snapPoint={500}>
        <View className="h-fit px-6 py-4 flex justify-center gap-3 items-center">
          <View className="w-full flex justify-start items-center">
            <Text className="mt-1 text-2xl font-semibold">
              Edit Check Point
            </Text>
            <View className="border mt-3 border-gray-500/50 p-1 px-2 rounded-lg w-full">
              <Text className="text-xs text-gray-500/70">Title</Text>
              <TextInput
                onChangeText={(text) => setName(text)}
                placeholder={editingCheckPointData?.name}
                className="text-black text-base mt-1"
              />
            </View>
            <View className="border mt-3 border-gray-500/50 p-1 px-2 rounded-lg w-full">
              <Text className="text-xs text-gray-500/70">Description</Text>
              <TextInput
                multiline={true}
                onChangeText={(text) => setDescription(text)}
                numberOfLines={5}
                textAlignVertical="top"
                placeholder={editingCheckPointData?.description}
                className="text-black text-base mt-1"
              />
            </View>
          </View>
          <View className="w-full flex justify-center items-center mt-2">
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => handleEditCheckpoint(editingCheckPointData._id)}
              style={{
                width: width * 0.9,
                backgroundColor: "green",
                paddingVertical: 12,
                borderRadius: 8,
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  color: "#fff",
                  fontWeight: "600",
                }}
              >
                Save
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modalize>
      <Modalize
        ref={viewMapRef}
        adjustToContentHeight
        snapPoint={500}
        scrollViewProps={{
          nestedScrollEnabled: true,
        }}
      >
        <View className="px-3 py-4 flex justify-between items-center">
          <View className="w-full flex justify-start items-center">
            <View className="h-[500px] w-full rounded-xl overflow-hidden mt-2 border border-gray-500/50 ">
              <MapView
                style={{ height: "100%", width: "100%" }}
                region={region}
                showsUserLocation={true}
                showsMyLocationButton={true}
              >
                <Marker
                  coordinate={{
                    latitude: region.latitude,
                    longitude: region.longitude,
                  }}
                />
              </MapView>
            </View>
          </View>
        </View>
      </Modalize>
      <Modalize
        ref={downloadQRref}
        adjustToContentHeight
        scrollViewProps={{
          nestedScrollEnabled: true,
        }}
      >
        <View className="px-3 pb-5 flex justify-between items-center h-fit ">
          <View className="w-full py-6 flex justify-center items-center">
            <Text className="text-base font-semibold">QR Code</Text>
          </View>
          <View className="p-1 border border-green-700 rounded-xl">
            <Image
              source={qrUrl}
              style={{
                height: height * 0.2,
                width: width * 0.4,
                borderRadius: 6,
              }}
            />
          </View>
          <View className="mt-6">
            <TouchableOpacity
              onPress={handleDownloadQr}
              activeOpacity={0.9}
              className="h-10 w-56 bg-green-700 flex justify-center items-center rounded-lg"
            >
              <Text className="text-white font-semibold">Download</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modalize>
    </SafeAreaView>
  );
};

const CheckPointCard = ({
  mapRef,
  idx,
  point,
  handleCheckpointActive,
  handleOpenEditSheet,
  onRefresh,
}) => {
  const [loading, setLoading] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const handleActivation = async () => {
    setLoading(true);
    try {
      await handleCheckpointActive(point._id);
    } catch (error) {
      console.log("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCheckpoint = async (id) => {
    setDeleting(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/delete-point?id=${id}`,
        {
          method: "DELETE",
        }
      );
      console.log(await response.json());
      if (!response.ok) {
        throw new Error("Failed to delete checkpoint");
      }
      onRefresh();
      showSuccess("Checkpoint deleted successfully.");
    } catch (error) {
      showError(error.message || "Please try again.");
      console.log("Error:", error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <View className="border border-gray-500/50 rounded-lg py-3 px-2 mt-3 w-full bg-white">
      <View className="flex flex-row justify-between items-center ">
        <View>
          <Text className="text-xs">{`Check Point ${idx + 1}`}</Text>
          <Text className="text-lg font-medium">{point.name}</Text>
        </View>
        <View className=" h-10 w-10 flex justify-center items-center">
          <TouchableOpacity
            onPress={() => handleDeleteCheckpoint(point._id)}
            activeOpacity={0.9}
          >
            {deleting ? (
              <ActivityIndicator color="red" size={"small"} />
            ) : (
              <FontAwesome6 name="trash" size={14} color="red" />
            )}
          </TouchableOpacity>
        </View>
      </View>
      <View className="flex flex-row justify-between  mt-2 py-1">
        <View className="w-[80%]">
          <Text className="text-gray-500 tracking-wide text-justify">
            {shorten(point.description, 100)}
          </Text>
        </View>
        <View className="w-[20%] flex justify-center items-center">
          {loading ? (
            <ActivityIndicator color="green" size={"small"} />
          ) : (
            <>
              {point.activated || point.type === "Geo Tagging" ? (
                <Text className="text-xl font-semibold text-green-700">
                  {point.allCheckedCount}
                </Text>
              ) : (
                <TouchableOpacity
                  onPress={handleActivation}
                  activeOpacity={0.9}
                  className=" flex justify-center items-center border px-2 py-0.5 rounded-full border-green-700"
                >
                  <Text className="text-sm font-semibold text-green-700">
                    Activate
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
      <View className="flex flex-row justify-between items-center mt-2 px-2">
        <TouchableOpacity onPress={() => mapRef.current?.open()}>
          <View className="flex flex-row gap-2 justify-center items-center">
            <MarkerIcon height={20} width={12} />
            <Text className="text-xs text-green-700">Show On Map</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleOpenEditSheet(point._id)}>
          <View className="flex flex-row gap-2 justify-center items-center">
            <EditIcon height={20} width={12} />
            <Text className="text-xs text-green-700">Edit</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            router.push(`(addTourDetails)/viewCheckIns/${point._id}`)
          }
        >
          <View className="flex flex-row gap-2 justify-center items-center">
            <UserIcon height={20} width={12} />
            <Text className="text-xs text-green-700">View Check-Ins</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Checkpoints;
