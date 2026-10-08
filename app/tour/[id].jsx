import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Modal,
} from "react-native";
import React, { useCallback, useLayoutEffect, useState } from "react";
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { formatDate } from "../../utils/helpers";
import { ActivityIndicator } from "react-native-paper";
import { showError, showSuccess, showWarning } from "../../utils/toastHelper";
import { useTours } from "../../hooks/useTours";
import { fetchAllTours } from "../../redux/slices/toursSlice";

const { width } = Dimensions.get("window");

const TourDetails = () => {
  const { id } = useLocalSearchParams();
  const { tours } = useTours();
  const { user } = useSelector((state) => state.user);

  const [loading, setLoading] = useState(false);
  const [unPublishLoading, setUnPublishLoading] = useState(false);
  const [cloning, setCloning] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const navigation = useNavigation();

  const tourDetail = tours?.find((item) => item._id === id) ?? null;

  const dispatch = useDispatch();

  const handleDeleteTour = async () => {
    if (tourDetail.status === true) {
      showWarning("Published tours cannot be deleted.");
      return;
    }

    if (tourDetail.email !== user.email) {
      showError("You are not authorized to delete this tour.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/tour/delete-tour?id=${id}`,
        {
          method: "DELETE",
          headers: {
            "x-user-email": user.email,
          },
        }
      );
      if (!response.ok) {
        throw new Error(
          "Failed to delete tour. Server responded with an error."
        );
      }
      await getAllTours();
      showSuccess("Tour deleted.");
      router.replace("/(admin)/tours");
    } catch (error) {
      showError(error.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTourStatus = async () => {
    setUnPublishLoading(true);
    try {
      const body = {
        id: id,
        status: tourDetail.status ? false : true,
      };

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/tour/update-tour`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      if (response.status !== 200) {
        throw new Error("Failed to unpublish");
      }

      dispatch(fetchAllTours());
      showSuccess("Tour Status Updated.");
    } catch (error) {
      showError(error.message || "Please try again.");
    } finally {
      setUnPublishLoading(false);
    }
  };

  const onRefresh = () => {
    try {
      dispatch(fetchAllTours());
    } catch (error) {
      showError(error.message || "Please try again.");
    }
  };

  const handleCloneTour = async () => {
    setCloning(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/clone-tour?tourId=${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-user-email": user.email,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to clone tour.");
      }
      showSuccess("Tour cloned successfully.");
      router.back();
    } catch (error) {
      console.log(error);
      showError(error.message || "Failed to clone tour.");
    } finally {
      setModalVisible(false);
      setCloning(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, [])
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons
            name="copy-outline"
            size={24}
            color="green"
            style={{ marginRight: 16 }}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  if (!tourDetail) {
    return (
      <View className="h-full w-full flex justify-center items-center">
        <ActivityIndicator size={"large"} color="#228B22" />
        <Text className="mt-2 text-gray-500">Tour details not found.</Text>
      </View>
    );
  }

  return (
    <View className="flex flex-1 flex-col w-full h-full justify-between items-center">
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-lg p-6 w-4/5">
            <Text className="text-2xl font-semibold">Clone Tour</Text>
            <Text className="mt-2 text-gray-600 text-xl">
              Do you want to clone this tour ?
            </Text>
            <View className="flex-row justify-center mt-10 gap-4">
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="w-1/2 h-12 rounded-lg bg-gray-300 flex justify-center items-center"
              >
                <Text className="font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCloneTour}
                className="w-1/2 h-12 rounded-lg bg-green-600 flex justify-center items-center"
              >
                {cloning ? (
                  <ActivityIndicator size={"small"} color="white" />
                ) : (
                  <Text className="text-white font-semibold">Clone</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <View className="mt-2 w-full px-4">
        <View className="w-full  rounded-lg border border-[#228B22] bg-[#228B22]">
          <View
            className={`flex flex-row justify-between py-3 px-4 rounded-lg `}
          >
            <View className="gap-2">
              <Text className={`font-semibold text-white text-lg`}>
                {tourDetail.name}
              </Text>
              <Text className={`font-semibold text-white`}>
                {formatDate(tourDetail.tour_start)}
              </Text>
            </View>
            <View className="gap-2">
              <Text
                className={`font-semibold text-right text-white`}
              >{`${tourDetail.total_seats} Seats`}</Text>
              <Text className={`font-semibold text-right text-white`}>
                {formatDate(tourDetail.tour_end)}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={{
          marginTop: 5,
          width: "100%",
          paddingBottom: 80,
          paddingHorizontal: 15,
        }}
        refreshControl={
          <RefreshControl
            refreshing={loading || unPublishLoading}
            onRefresh={onRefresh}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View className="flex space-y-5 w-full">
          {DetailTitle.map((detail) => (
            <DetailScreenButton
              key={detail.id}
              title={detail.title}
              href={detail.href}
              id={id}
            />
          ))}
        </View>
      </ScrollView>
      <View className="w-full flex flex-row justify-between items-center h-16 px-4 mb-2">
        <TouchableOpacity
          activeOpacity={0.9}
          disabled={unPublishLoading}
          onPress={handleTourStatus}
          style={{
            width: width * 0.45,
            backgroundColor: tourDetail.status === false ? "#228B22" : "gray",
            height: 44,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 8,
          }}
        >
          {unPublishLoading ? (
            <ActivityIndicator size={"small"} color="white" />
          ) : (
            <Text
              style={{
                textAlign: "center",
                color: "white",
                fontWeight: 500,
                fontSize: 18,
              }}
            >
              {tourDetail.status === false ? "Publish" : "Unpublish"} Tour
            </Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.9}
          disabled={loading}
          onPress={handleDeleteTour}
          style={{
            width: width * 0.45,
            height: 44,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "red",
          }}
        >
          {loading ? (
            <ActivityIndicator size={"small"} color="red" />
          ) : (
            <Text
              style={{
                textAlign: "center",
                color: "red",
                fontWeight: 600,
                fontSize: 18,
              }}
            >
              Delete Tour
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const DetailTitle = [
  {
    id: 1,
    title: "Tour Details",
    href: "/(addTourDetails)/tourDetails",
  },
  {
    id: 2,
    title: "What is included/not-included",
    href: "/(addTourDetails)/includedNotIncluded",
  },
  {
    id: 9,
    title: "Back Pack & Check-in Baggage",
    href: "/(addTourDetails)/luggage",
  },
  {
    id: 3,
    title: "Guests Enrolled",
    href: "/(addTourDetails)/guestsEnrolled",
  },
  {
    id: 4,
    title: "Accomodation/Allocation",
    href: "/(addTourDetails)/accomodation",
  },
  {
    id: 5,
    title: "Transportation Details",
    href: "/(addTourDetails)/transportation",
  },
  {
    id: 6,
    title: "Check Points",
    href: "/(addTourDetails)/checkPoints",
  },
  {
    id: 7,
    title: "Allocated Coordinators",
    href: "/(addTourDetails)/allocatedCoordinators",
  },
  {
    id: 8,
    title: "My Notes",
    href: "/(addTourDetails)/myNotes",
  },
  {
    id: 10,
    title: "Upload FAQ",
    href: "/(addTourDetails)/uploadFaq",
  },
];

const DetailScreenButton = ({ title, href, id }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push(`${href}/${id}`)}
      className="py-4 rounded-lg mt-3 w-full bg-white shadow-xl shadow-black/50"
    >
      <View className="flex flex-row justify-between items-center px-2 w-full">
        <Text>{title}</Text>
        <Ionicons size={20} name="chevron-forward-outline" color={"#228B22"} />
      </View>
    </TouchableOpacity>
  );
};

export default TourDetails;
