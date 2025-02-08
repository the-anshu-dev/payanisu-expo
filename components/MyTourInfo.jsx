import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  Dimensions,
} from "react-native";
import ListComponent from "./UI/ListComponent";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { formatDate } from "../utils/helpers.js";
import { format } from "date-fns";
import CarouselImageRender from "./UI/CarouselImageRender.jsx";
import Carousel from "react-native-reanimated-carousel";

const { width, height } = Dimensions.get("window");

const MyTourInfo = ({ tour }) => {

  const {
    _id,
    tourDetails,
    backpacks,
    notincludeds,
    includeds,
    checkinbagages,
    allocatedAccommodation,
    allocatedTransport,
  } = tour;

  const images = tourDetails?.images.map((i) => i.url);

  const [refresh, setRefresh] = useState(false);

  const [transport, setTransport] = useState({});
  const [boardingPoints, setBoardingPoints] = useState([]);
  const [accomodationDetails, setAccomodationDetails] = useState([]);

  const { transportId } = allocatedTransport[0] || {};
  const { accommodationId } = allocatedAccommodation[0] || [];

  const getTransportDetails = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/transport/get?id=${transportId}`
      );

      if (!response.ok || response.status !== 200) {
        throw new Error("Failed to get transportation details.");
      }

      const result = await response.json();
      setTransport(result);
    } catch (error) {
      Alert.alert("Oops!", "Something went wrong. Please try again later.");
      console.log("Error:", error);
    }
  };

  const getBoardingPoints = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/board/get?transportId=${transportId}`
      );
      if (!response.ok || response.status !== 200) {
        throw new Error("Failed to get boarding points.");
      }
      const result = await response.json();
      setBoardingPoints(result);
    } catch (error) {
      Alert.alert("Oops!", "Something went wrong. Please try again later.");
      console.log("Error:", error);
    }
  };

  const getAccomodationDetails = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/accommodation/get?id=${accommodationId}`
      );

      if (response.status !== 200) {
        throw new Error("Failed to fetch guest houses");
      }

      const data = await response.json();
      setAccomodationDetails(data);
    } catch (error) {
      console.log(error);
      Alert.alert("Oops", "Something went wrong. Please try again later.");
    }
  };

  const { busName, busNumber, driverNumber } = transport || {};
  const { boardingPointDate, boardingPointName, boardingPointTime, location } =
    boardingPoints[0] || {};

  const onRefresh = async () => {
    setRefresh(true);

    try {
      if (transportId) {
        await getBoardingPoints();
      }
      if (allocatedTransport && allocatedTransport.length > 0) {
        await getTransportDetails();
      }
      if (allocatedAccommodation && allocatedAccommodation.length > 0) {
        await getAccomodationDetails();
      }
    } finally {
      setRefresh(false);
    }
  };

  useEffect(() => {
    onRefresh();
  }, []);

  return (
    <View className={`pb-14`}>
      <ScrollView
        className="flex h-full"
        contentContainerStyle={{ paddingBottom: 64, paddingHorizontal: 10, paddingTop: 10, gap: 10 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refresh} onRefresh={onRefresh} />
        }
      >
        <View className="bg-white rounded-lg shadow-lg shadow-black overflow-hidden">
          <Carousel
            loop
            width={width}
            height={200}
            autoPlay={true}
            data={images}
            autoPlayInterval={2000}
            scrollAnimationDuration={1000}
            renderItem={CarouselImageRender}
          />
        </View>
        <View className="flex flex-row justify-between items-center gap-2 bg-green-700 rounded-lg p-2 py-4 shadow-lg shadow-black px-4">
          <View className="flex justify-center items-start gap-1">
            <Text className="text-white text-xs font-semibold">Booking Status :</Text>
            <Text className="text-white font-semibold text-lg">Confirmed</Text>
          </View>
          <View className="flex justify-center items-end gap-1">
            <Text className="text-white text-xs font-semibold">Booking ID :</Text>
            <Text className="text-white font-semibold text-lg uppercase">{_id.substr(0, 7)}</Text>
          </View>
        </View>
        <View className="bg-white p-2 rounded-lg shadow-lg shadow-black">
          <View>
            <Text className={`text-md font-semibold`}>Tour Name</Text>
            <Text className={`text-base mt-1 tracking-wider`}>
              {tourDetails.name}
            </Text>
          </View>
          <View className="mt-2">
            <Text className={`text-md font-semibold`}>Description</Text>
            <Text className={`text-base mt-1 tracking-wide text-justify`}>
              {tourDetails.description}
            </Text>
          </View>
          <View className="mt-2">
            <Text className={`text-md font-semibold`}>Date</Text>
            <Text className={`text-base mt-1 tracking-wider`}>{`${formatDate(
              tourDetails.tour_start
            )} - ${formatDate(tourDetails.tour_start)}`}</Text>
          </View>
        </View>
        <View className="p-2 shadow-lg shadow-black bg-white rounded-lg">
          <View className="flex flex-row justify-left items-center gap-2 border-b border-gray-300/50 pb-1">
            <Ionicons name="thumbs-up-outline" size={20} color={"green"} />
            <Text className={`text-md font-semibold`}>What is included ?</Text>
          </View>
          <View className="px-1 mt-3 gap-2">
            {includeds.length > 0 ?
              includeds.map((i) => (
                <ListComponent
                  key={i._id}
                  icon="checkmark-circle"
                  text={i.item}
                  color={"#0e9c02"}
                />
              )) : <Text className="text-center">No items included</Text>
            }
          </View>
        </View>
        <View className="p-2 shadow-lg shadow-black bg-white rounded-lg">
          <View className="flex flex-row justify-left items-center gap-2 border-b border-gray-300/50 pb-1">
            <Ionicons name="thumbs-down-outline" size={20} color={"red"} />
            <Text className={`text-md font-semibold`}>
              What is not included ?
            </Text>
          </View>
          <View className="px-1 mt-3 gap-2">
            {notincludeds.length > 0 ?
              notincludeds.map((i) => (
                <ListComponent
                  key={i._id}
                  icon="close-circle-outline"
                  text={i.item}
                  color={"red"}
                />
              )) : <Text className="text-center">No items not included</Text>}
          </View>
        </View>
        <View className="p-2 shadow-lg shadow-black bg-white rounded-lg">
          <View className="flex flex-row justify-left items-center gap-2 border-b border-gray-300/50 pb-1">
            <Ionicons name="bag-check-outline" size={20} color={"green"} />
            <Text className={`text-md font-semibold`}>Bag Pack</Text>
          </View>
          <View className="px-1 mt-3 gap-2">
            {backpacks.length > 0 ?
              backpacks.map((i) => (
                <ListComponent
                  key={i._id}
                  icon="checkmark-circle-outline"
                  text={i.item}
                  color={"gray"}
                />
              )) : <Text className="text-center">No items in bag pack</Text>}
          </View>
        </View>
        <View className="p-2 shadow-lg shadow-black bg-white rounded-lg">
          <View className="flex flex-row justify-left items-center gap-2 border-b border-gray-300/50 pb-1">
            <Ionicons
              name="checkmark-done-circle-outline"
              size={20}
              color={"green"}
            />
            <Text className={`text-md font-semibold`}>Check In Baggage</Text>
          </View>
          <View className="px-1 mt-3 gap-2">
            {checkinbagages.length > 0 ?
              checkinbagages.map((i) => (
                <ListComponent
                  key={i._id}
                  icon="checkmark-circle-outline"
                  text={i.item}
                  color={"gray"}
                />
              )) : <Text className="text-center">No items in check in baggage</Text>}
          </View>
        </View>
        <View className="p-2 shadow-lg shadow-black bg-white rounded-lg">
          <View className="flex flex-row gap-2 justify-start items-center py-1 border-b border-gray-300/50">
            <Ionicons name="bus" size={20} color={"green"} />
            <Text className={`font-bold`}>Transport Details</Text>
          </View>
          {allocatedTransport && allocatedTransport.length > 0 ? (
            <View className="ml-2 mt-2">
              <View>
                <Text className={` mt-2 font-semibold`}>{busName}</Text>
                <Text
                  className={`mt-1 font-semibold`}
                >{`Bus No : ${busNumber}`}</Text>
              </View>
              <View className="mt-2">
                <Text>Contact Details</Text>
                <Text
                  className={`mt-1 font-semibold`}
                >{`Mob No: ${driverNumber}`}</Text>
              </View>
              <View className="mt-2">
                <Text>Boarding Point</Text>
                <Text
                  className={`mt-1 font-semibold`}
                >{`${boardingPointName}`}</Text>
              </View>
              <View className="mt-2">
                <Text>Boarding Location</Text>
                <Text className={`mt-1 font-semibold`}>{`${location}`}</Text>
              </View>
              <View className="mt-2">
                <Text>Boarding Time</Text>
                <Text
                  className={`mt-1 font-semibold`}
                >{`${boardingPointDate && format(new Date(boardingPointDate), "dd MMM yyyy")} - ${boardingPointTime && format(new Date(boardingPointTime), "hh:mm a")}`}</Text>
              </View>
              <View className="flex flex-row justify-between items-center mt-2">
                <TouchableOpacity
                  activeOpacity={0.7}
                  className="mt-3 flex flex-row justify-start items-center gap-2"
                >
                  <Ionicons name="images" size={12} color={"green"} />
                  <Text className={`font-semibold text-xs text-green-600`}>
                    View Bus Images
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.7}
                  className="mt-3 flex flex-row justify-start items-center gap-2"
                >
                  <Ionicons name="compass" size={12} color={"green"} />
                  <Text className={`font-semibold text-xs text-green-600`}>
                    View Direction
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push(`/bus-mates/${transportId}`)}
                  activeOpacity={0.7}
                  className="mt-3 flex flex-row justify-start items-center gap-2"
                >
                  <Ionicons name="compass" size={12} color={"green"} />
                  <Text className={`font-semibold text-xs text-green-600`}>
                    Your Bus Mates
                  </Text>
                </TouchableOpacity>
              </View>
              <View className="w-full h-[1px] mt-2" />
            </View>
          ) : (
            <View
              style={{
                width: "100%",
                height: 40,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text>Tranport not allocated</Text>
            </View>
          )}
        </View>
        <View className="p-2 shadow-lg shadow-black bg-white rounded-lg">
          <View className="flex flex-row gap-2 justify-start items-center py-1 border-b border-gray-300/50">
            <Ionicons name="bed" size={20} color={"green"} />
            <Text className={`font-bold`}>Accomodation Details</Text>
          </View>
          {Object.keys(accomodationDetails).length > 0 ? (
            <View className="mt-2">
              <View className="gap-2 pl-2">
                <View>
                  <Text>Place</Text>
                  <Text
                    className={`font-semibold `}
                  >{`${accomodationDetails?.location}`}</Text>
                </View>
                <View>
                  <Text>{`Hotel Name`}</Text>
                  <Text
                    className={`font-semibold `}
                  >{`${accomodationDetails?.guestHouseName}`}</Text>
                </View>
                <View>
                  <Text>Room</Text>
                  <Text
                    className={`font-bold `}
                  >{`${allocatedAccommodation[0]?.roomNumber} (${allocatedAccommodation[0]?.roomType})`}</Text>
                </View>
                <View>
                  <Text>Occupancy</Text>
                  <Text
                    className={`font-bold `}
                  >{`${allocatedAccommodation[0]?.occupancy}`}</Text>
                </View>
                {allocatedAccommodation[0]?.occupancy !== "Single" && (
                  <View className="flex flex-row justify-start items-center mt-2 border rounded-lg w-full border-green-600/50">
                    <TouchableOpacity
                      onPress={() =>
                        router.push(
                          `/room-mates/${allocatedAccommodation[0]?.roomNumber}`
                        )
                      }
                      activeOpacity={0.7}
                      className="flex flex-row justify-between items-center py-1 px-2 gap-2 w-full"
                    >
                      <View className="flex flex-row justify-start items-center gap-2">
                        <Ionicons name="compass" size={20} color={"green"} />
                        <Text className={`font-semibold text-base text-green-600`}>
                          Your Room Mates
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" color={"green"} size={20} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          ) : (
            <View
              style={{
                width: "100%",
                height: 40,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text>Accommodation not allocated. </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default MyTourInfo;
