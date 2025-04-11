import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Dimensions,
  Modal,
  StyleSheet,
} from "react-native";
import ListComponent from "./UI/ListComponent";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { formatDate } from "../utils/helpers.js";
import CarouselImageRender from "./UI/CarouselImageRender.jsx";
import Carousel from "react-native-reanimated-carousel";
import MapScreen from "./MapWithDirection.jsx";
import { showError, showSuccess } from "../utils/toastHelper.js";
import BoardingPointCard from "./UI/BoardingPointCard.jsx";
import { Image } from "expo-image";

const { width, height } = Dimensions.get("window");

const MyTourInfo = ({ tour }) => {
  const {
    _id,
    status,
    tourDetails,
    backpacks,
    notincludeds,
    includeds,
    checkinbagages,
    allocatedAccommodation,
    allocatedTransport,
    Members,
  } = tour;

  const { faqUrl, name, description, tour_start, tour_end, booking_close } =
    tourDetails;

  const images = tourDetails?.images.map((i) => i.url);

  const busImages = tourDetails?.images
    .filter((i) => i.type === "bus")
    .map((i) => i.url);

  const accomodationImages = tourDetails?.images
    .filter((i) => i.type === "accomodation")
    .map((i) => i.url);

  const [refresh, setRefresh] = useState(false);
  const [viewFAQ, setViewFAQ] = useState(false);

  const [transport, setTransport] = useState({});
  const [boardingPoints, setBoardingPoints] = useState([]);
  const [accomodationDetails, setAccomodationDetails] = useState([]);
  const [destination, setDestination] = useState({});

  const [cancelling, setCancelling] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState({
    busImageModal: false,
    directionModal: false,
    accomodationImageModal: false,
  });

  const [accommodationImg, setAccommodationImg] = useState([]);

  const accommodationImages = Array.isArray(accommodationImg)
  ? accommodationImg.map((i) => i.url)
  : [];

  const handleBusModal = () => {
    setIsModalVisible((prev) => ({ ...prev, busImageModal: true }));
  };

  const handleDirectionModal = () => {
    setIsModalVisible((prev) => ({ ...prev, directionModal: true }));
  };

  const handleAccomodationModal = () => {
    setIsModalVisible((prev) => ({ ...prev, accomodationImageModal: true }));
  };

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
      showError(error.message || "Please try again.");
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
      showError(error.message || "Please try again.");
    }
  };

  const getAccomodationDetails = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/accommodation/get?id=${accommodationId}`
      );

      const imageRes = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/image/get-image`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            id: accommodationId,
          },
        }
      );

      if (!imageRes.ok || imageRes.status !== 200) {
        console.log("Failed to load images or no images added.");
      }

      if (response.status !== 200) {
        throw new Error("Failed to fetch guest houses");
      }

      const imageData = await imageRes.json();
      setAccommodationImg(imageData);
      const data = await response.json();
      setAccomodationDetails(data);
    } catch (error) {
      showError(error.message || "Please try again.");
    }
  };

  const { busName, busNumber, driverNumber, driverName } = transport || {};

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

  const handleCancelBooking = async () => {
    setCancelling(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/booking/update?id=${_id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: 3 }),
        }
      );

      if (!response.ok || response.status !== 200) {
        throw new Error("Failed to cancel booking. Please try again later.");
      }

      showSuccess("Booking has been cancelled successfully.");
      router.push("/mytours");
    } catch (error) {
      showError(
        error.message || "Something went wrong. Please try again later."
      );
    } finally {
      setCancelling(false);
    }
  };

  const statusText = {
    0: "Rejected",
    1: "Confirmed",
    2: "Pending",
    3: "Cancelled",
  };

  const cancelCondition = new Date(booking_close) > new Date();

  useEffect(() => {
    onRefresh();
  }, []);

  return (
    <View className={`pb-14`}>
      <ScrollView
        className="flex h-full"
        contentContainerStyle={{
          paddingBottom: 64,
          paddingHorizontal: 10,
          paddingTop: 10,
          gap: 10,
        }}
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
        <View className="flex flex-row justify-between items-center gap-2 bg-[#228B22] rounded-lg p-2 py-4 shadow-lg shadow-black px-4">
          <View className="flex justify-center items-start gap-1">
            <Text className="text-white text-xs font-semibold">
              Booking Status :
            </Text>
            <Text className="text-white font-semibold text-lg">
              {statusText[status]}
            </Text>
          </View>
          <View className="flex justify-center items-end gap-1">
            <Text className="text-white text-xs font-semibold">
              Booking ID :
            </Text>
            <Text className="text-white font-semibold text-lg uppercase">
              {_id.substr(0, 7)}
            </Text>
          </View>
        </View>
        <View className="bg-white p-2 rounded-lg shadow-lg shadow-black">
          <View>
            <Text className={`text-md font-semibold`}>Tour Name</Text>
            <Text className={`text-base mt-1 tracking-wider`}>{name}</Text>
          </View>
          <View className="mt-2">
            <Text className={`text-md font-semibold`}>Description</Text>
            <Text className={`text-base mt-1 tracking-wide text-justify`}>
              {description}
            </Text>
          </View>
          <View className="mt-2">
            <Text className={`text-md font-semibold`}>Date</Text>
            <Text className={`text-base mt-1 tracking-wider`}>{`${formatDate(
              tour_start
            )} - ${formatDate(tour_end)}`}</Text>
          </View>
        </View>
        {Members.length > 0 && (
          <View className="bg-white p-2 rounded-lg shadow-lg shadow-black">
            <Text className="font-semibold text-green-700">Booked Members</Text>
            <View className="gap-2">
              {Members.map((member) => (
                <View
                  key={member._id}
                  className="flex flex-row gap-2 mt-2 justify-between p-2 bg-white rounded-lg shadow-lg shadow-black "
                >
                  <Text className={`text-base mt-1 tracking-wider`}>
                    {member.name}
                  </Text>
                  <Text className={`text-base mt-1 tracking-wider`}>
                    {member.gender.charAt(0)}
                  </Text>
                  <Text className={`text-base mt-1 tracking-wider`}>
                    {member.age}
                  </Text>
                  <Text className={`text-base mt-1 tracking-wider`}>
                    {member.contact}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
        <View className="p-2 shadow-lg shadow-black bg-white rounded-lg">
          <View className="flex flex-row justify-left items-center gap-2 border-b border-gray-300/50 pb-1">
            <Ionicons name="thumbs-up-outline" size={20} color={"#228B22"} />
            <Text className={`text-md font-semibold`}>What is included ?</Text>
          </View>
          <View className="px-1 mt-3 gap-2">
            {includeds.length > 0 ? (
              includeds.map((i) => (
                <ListComponent
                  key={i._id}
                  icon="checkmark-circle"
                  text={i.item}
                  color={"#0e9c02"}
                />
              ))
            ) : (
              <Text className="text-center">No items included</Text>
            )}
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
            {notincludeds.length > 0 ? (
              notincludeds.map((i) => (
                <ListComponent
                  key={i._id}
                  icon="close-circle-outline"
                  text={i.item}
                  color={"red"}
                />
              ))
            ) : (
              <Text className="text-center">No items not included</Text>
            )}
          </View>
        </View>
        <View className="p-2 shadow-lg shadow-black bg-white rounded-lg">
          <View className="flex flex-row justify-left items-center gap-2 border-b border-gray-300/50 pb-1">
            <Ionicons name="bag-check-outline" size={20} color={"#228B22"} />
            <Text className={`text-md font-semibold`}>Bag Pack</Text>
          </View>
          <View className="px-1 mt-3 gap-2">
            {backpacks.length > 0 ? (
              backpacks.map((i) => (
                <ListComponent
                  key={i._id}
                  icon="checkmark-circle-outline"
                  text={i.item}
                  color={"gray"}
                />
              ))
            ) : (
              <Text className="text-center">No items in bag pack</Text>
            )}
          </View>
        </View>
        <View className="p-2 shadow-lg shadow-black bg-white rounded-lg">
          <View className="flex flex-row justify-left items-center gap-2 border-b border-gray-300/50 pb-1">
            <Ionicons
              name="checkmark-done-circle-outline"
              size={20}
              color={"#228B22"}
            />
            <Text className={`text-md font-semibold`}>Check In Baggage</Text>
          </View>
          <View className="px-1 mt-3 gap-2">
            {checkinbagages.length > 0 ? (
              checkinbagages.map((i) => (
                <ListComponent
                  key={i._id}
                  icon="checkmark-circle-outline"
                  text={i.item}
                  color={"gray"}
                />
              ))
            ) : (
              <Text className="text-center">No items in check in baggage</Text>
            )}
          </View>
        </View>
        <View className="p-2 shadow-lg shadow-black bg-white rounded-lg">
          <View className="flex flex-row gap-2 justify-start items-center py-1 border-b border-gray-300/50">
            <Ionicons name="bus" size={20} color={"#228B22"} />
            <Text className={`font-bold`}>Transport Details</Text>
          </View>
          {allocatedTransport && allocatedTransport.length > 0 ? (
            <View className="ml-2 mt-2">
              <View>
                <Text className={` mt-2 font-semibold`}>Name: {busName}</Text>
                <Text
                  className={`mt-1 font-semibold`}
                >{`Bus No : ${busNumber}`}</Text>
              </View>
              <View className="mt-2">
                <Text>Driver</Text>
                <Text className={`mt-1 font-semibold`}>{`${driverName}`}</Text>
              </View>
              <View className="mt-2">
                <Text>Contact Details</Text>
                <Text
                  className={`mt-1 font-semibold`}
                >{`Mob No: ${driverNumber}`}</Text>
              </View>
              <View className="flex flex-row justify-between items-center gap-3">
                <TouchableOpacity
                  onPress={() => router.push(`/bus-mates/${transportId}`)}
                  activeOpacity={0.9}
                  className="mt-3 flex flex-row justify-center items-center gap-2 px-2 py-1 rounded-md"
                >
                  <Ionicons name="compass" size={16} color={"#228B22"} />
                  <Text className={`font-semibold text-sm text-[#228B22]`}>
                    Your Bus Mates
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleBusModal}
                  activeOpacity={0.9}
                  className="mt-3 flex flex-row justify-center items-center gap-2 px-8 py-1 rounded-md"
                >
                  <Ionicons name="images" size={16} color={"#228B22"} />
                  <Text className={`font-semibold text-sm text-[#228B22]`}>
                    View Bus Images
                  </Text>
                </TouchableOpacity>
              </View>
              <View className="mt-2 gap-3">
                {boardingPoints.length > 0 &&
                  boardingPoints.map((point, index) => (
                    <BoardingPointCard
                      key={point._id}
                      point={point}
                      index={index + 1}
                      handleDirectionModal={handleDirectionModal}
                      setDestination={setDestination}
                    />
                  ))}
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
            <Ionicons name="bed" size={20} color={"#228B22"} />
            <Text className={`font-bold`}>Accomodation Details</Text>
          </View>
          {accomodationDetails ? (
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
                <View className="flex flex-row justify-between items-center mt-2">
                  {allocatedAccommodation[0]?.occupancy !== "Single" && (
                    <TouchableOpacity
                      onPress={() =>
                        router.push(
                          `/room-mates/${allocatedAccommodation[0]?.roomNumber}`
                        )
                      }
                      activeOpacity={0.9}
                      className="flex flex-row justify-between items-center py-1 px-2 gap-2"
                    >
                      <View className="flex flex-row justify-start items-center gap-2">
                        <Ionicons name="compass" size={20} color={"#228B22"} />
                        <Text
                          className={`font-semibold text-base text-[#228B22]`}
                        >
                          Your Room Mates
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={handleAccomodationModal}
                    className="flex flex-row justify-center items-center gap-2 px-2 py-1 rounded-md"
                  >
                    <Ionicons name="images" size={16} color={"#228B22"} />
                    <Text className={`font-semibold text-base text-[#228B22]`}>
                      View Images
                    </Text>
                  </TouchableOpacity>
                </View>
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
        {faqUrl && (
          <TouchableOpacity
            onPress={() => setViewFAQ(!viewFAQ)}
            activeOpacity={0.9}
            className="p-2 rounded-lg shadow-lg shadow-black/50 bg-white flex flex-row justify-between"
          >
            <View className="flex flex-row justify-left items-center gap-3 border-gray-300 px-1">
              <Ionicons
                name="help-circle-outline"
                size={24}
                color={"#228B22"}
              />
              <Text className={`text-base font-semibold`}>
                Frequently Asked Questions (FAQs)
              </Text>
            </View>
            <Ionicons
              name={
                viewFAQ ? "chevron-down-outline" : "chevron-forward-outline"
              }
              size={24}
              color={"#228B22"}
            />
          </TouchableOpacity>
        )}
        <View>
          {viewFAQ && (
            <Image
              style={{ height: height * 0.8, borderRadius: 10 }}
              source={{ uri: faqUrl }}
            />
          )}
        </View>
        {cancelCondition && (
          <TouchableOpacity
            onPress={handleCancelBooking}
            activeOpacity={0.9}
            className="flex w-full flex-row justify-center items-center bg-white rounded-lg p-2 py-3 shadow-lg shadow-black"
          >
            <Text className="text-red-700 text-lg font-semibold">
              {cancelling ? "Cancelling.." : "Cancel Booking"}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
      <Modal
        visible={isModalVisible.busImageModal}
        onRequestClose={() =>
          setIsModalVisible((prev) => ({ ...prev, busImageModal: false }))
        }
        transparent={true}
        animationType="fade"
      >
        <View style={styles.overLay}>
          <View style={styles.modal}>
            <View style={{ height: "90%", width: "100%" }}>
              <Carousel
                loop
                width={width * 0.9}
                height={height * 0.45}
                data={busImages}
                renderItem={CarouselImageRender}
              />
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() =>
                setIsModalVisible((prev) => ({
                  ...prev,
                  busImageModal: false,
                }))
              }
            >
              <Text style={{ color: "white", fontWeight: "500" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        visible={isModalVisible.directionModal}
        onRequestClose={() =>
          setIsModalVisible((prev) => ({ ...prev, directionModal: false }))
        }
        transparent={true}
        animationType="fade"
      >
        <View style={styles.overLay}>
          <View style={styles.modal}>
            <View style={{ height: "90%", width: "100%" }}>
              <MapScreen destination={destination} />
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() =>
                setIsModalVisible((prev) => ({
                  ...prev,
                  directionModal: false,
                }))
              }
            >
              <Text style={{ color: "white", fontWeight: "500" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        visible={isModalVisible.accomodationImageModal}
        onRequestClose={() =>
          setIsModalVisible((prev) => ({
            ...prev,
            accomodationImageModal: false,
          }))
        }
        transparent={true}
        animationType="fade"
      >
        <View style={styles.overLay}>
          <View style={styles.modal}>
            <View style={{ height: "90%", width: "100%" }}>
              <Carousel
                loop
                width={width * 0.9}
                height={height * 0.45}
                data={accommodationImages}
                renderItem={CarouselImageRender}
              />
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() =>
                setIsModalVisible((prev) => ({
                  ...prev,
                  accomodationImageModal: false,
                }))
              }
            >
              <Text style={{ color: "white", fontWeight: "500" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  overLay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    height: height * 0.5,
    width: width * 0.9,
    backgroundColor: "white",
    borderRadius: 10,
    zIndex: 100,
    overflow: "hidden",
    display: "flex",
    justifyContent: "start",
    alignItems: "center",
    gap: 8,
  },
  closeButton: {
    backgroundColor: "#228B22",
    borderRadius: 5,
    padding: 5,
    width: "80%",
    marginHorizontal: 10,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MyTourInfo;
