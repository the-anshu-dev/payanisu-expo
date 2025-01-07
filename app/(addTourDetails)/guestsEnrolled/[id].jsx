import {
  View,
  Text,
  Pressable,
  Alert,
  TouchableOpacity,
  ScrollView,
  Switch,
  TextInput,
  RefreshControl,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useLocalSearchParams } from "expo-router";
import { Modalize } from "react-native-modalize";
import { useSelector } from "react-redux";
import { formatDate } from "../../../utils/helpers";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Checkbox } from "react-native-paper";

const GuestsEnrolled = () => {
  const { id } = useLocalSearchParams();

  const { tour } = useSelector((state) => state.tour);

  const currentTour = tour?.find((i) => i._id === id);

  const [refreshing, setRefreshing] = useState(false);

  const [pendingApproval, setPendingApproval] = useState([]);
  const [getPendingApprovalLoading, setGetPendingApprovalLoading] =
    useState(false);

  const [activeTab, setActiveTab] = useState("interested");
  const translateX = useSharedValue(-200);

  const [interestedMembers, setInterestedMembers] = useState(null);
  const [loading, setLoading] = useState(false);

  const enrollRef = useRef(null);

  const [enrollingId, setEnrollingId] = useState("");
  const [enrolling, setEnrolling] = useState(false);
  const [enrollingDetails, setEnrollingDetails] = useState("");

  const [isPaymentRecieved, setIsPaymentRecieved] = useState(false);
  const [isTrekker, setIsTrekker] = useState(false);
  const [isAccommodationTrue, setIsAccommodationTrue] = useState(false);
  const [amount, setAmount] = useState("");

  const [reserving, setReserving] = useState(false);

  useEffect(() => {
    const enrollingUser = interestedMembers?.find((i) => i._id === enrollingId);
    setEnrollingDetails(enrollingUser);
  }, [enrollingId]);

  const handleTabPress = (tab) => {
    setActiveTab(tab);
    translateX.value = tab === "interested" ? -200 : 0;
  };

  const springConfig = {
    damping: 20,
    stiffness: 100,
    mass: 1,
    overshootClamping: true,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  };

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ translateX: withSpring(translateX.value, springConfig) }],
  }));

  const handleGetInterestedMembers = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/interested/get?tourId=${id}`
      );

      if (response.status !== 200) {
        throw new Error("Failed to get interested members.");
      }

      const data = await response.json();

      setInterestedMembers(data);
    } catch (error) {
      console.log("Error:", error);
      Alert.alert("Something went wrong.", "Please try again");
    } finally {
      setLoading(false);
    }
  };

  const getPendingApprovals = async () => {
    setGetPendingApprovalLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/booking/get?id=${id}`
      );

      if (response.status !== 200) {
        throw new Error("Failed to fetch pendingApprovals");
      }

      const result = await response.json();
      const data = result.data?.filter((i) => i.status === 2);
      setPendingApproval(data);
    } catch (error) {
      console.log("Error", error);
      Alert.alert("Oops", "Something went wrong");
    } finally {
      setGetPendingApprovalLoading(false);
    }
  };

  const handleReserveMembers = async (bookingId, type) => {
    setReserving(true);
    try {
      const body = {
        status: type === "accept" ? 1 : 0,
      };
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/booking/update?id=${bookingId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      if (response.status !== 200) {
        throw new Error("Failed to update.");
      }

      Alert.alert(
        "Reserved",
        `Member has been ${type === "accept" ? "accepted" : "rejected"}`
      );
      getPendingApprovals();
    } catch (error) {
      console.log("Error:", error);
      Alert.alert("Oops", "Something went wrong.\nPlease try again.");
    } finally {
      setReserving(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (activeTab === "interested") {
        await handleGetInterestedMembers();
      } else {
        await getPendingApprovals();
      }
    } finally {
      setRefreshing(false);
    }
  };

  const handleEnrollMembers = async () => {
    setEnrolling(true);
    try {
      const body = {
        name: enrollingDetails.profileData.name,
        age: enrollingDetails.profileData.age,
        gender: enrollingDetails.profileData.gender,
        email: enrollingDetails.profileData.email,
        tourId: id,
        status: 1,
        isTrekker: isTrekker,
        accommodation: isAccommodationTrue,
        receivedAmount: amount || 0,
      };

      const updateEnrolled = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/interested/update?id=${enrollingDetails._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ enrolled: true }),
        }
      );

      if (updateEnrolled.status !== 200) {
        throw new Error("Failed to update enrolled status");
      }

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/booking/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      console.log("response status", response.status);

      if (response.status !== 201) {
        await fetch(
          `${process.env.EXPO_PUBLIC_BASE_URL}/api/interested/update?id=${enrollingDetails._id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ enrolled: false }),
          }
        );
        throw new Error("Failed to enrol.");
      }

      handleGetInterestedMembers();
      Alert.alert("Enrolled", "Member enrolled successfully.");
      enrollRef.current?.close();
    } catch (error) {
      console.log("Error:", error);
      Alert.alert("Oops", "Something went wrong.\nPlease try again.");
      enrollRef.current?.close();
    } finally {
      setEnrolling(false);
    }
  };

  useEffect(() => {
    handleGetInterestedMembers();
    getPendingApprovals();
  }, []);

  return (
    <>
      <View className={`px-3 h-full flex items-center`}>
        <View className={`px-5 w-full flex justify-center items-center`}>
          <View className={`flex flex-row justify-between`}>
            <Pressable onPress={() => handleTabPress("interested")}>
              <View className={`w-[200px] py-2`}>
                <Text className={`text-center text-base font-semibold`}>
                  Interest Requests
                </Text>
              </View>
            </Pressable>
            <Pressable onPress={() => handleTabPress("requested")}>
              <View className={`w-[200px] py-2`}>
                <Text className={`text-center text-base font-semibold`}>
                  Reserve Requests
                </Text>
              </View>
            </Pressable>
          </View>
          <Animated.View style={[animatedStyles]}>
            <View
              className={`bg-green-600 w-[160px] h-1.5 rounded-t-xl absolute bottom-0 left-5`}
            />
          </Animated.View>
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View className={`w-full mt-1`}>
            {activeTab === "interested" ? (
              <>
                {interestedMembers?.length > 0 ? (
                  <View className={`p-2`}>
                    {interestedMembers?.map((i) => (
                      <ReqCard
                        key={i._id}
                        enrollId={i._id}
                        name={i?.profileData?.name}
                        age={i?.profileData?.age}
                        gender={i?.profileData?.gender}
                        interest={true}
                        reserve={false}
                        enrollRef={enrollRef}
                        tourId={i.tourId}
                        bookingId={i._id}
                        enrollingId={setEnrollingId}
                        setEnrollingId={setEnrollingId}
                      />
                    ))}
                  </View>
                ) : (
                  <View className="h-full w-full flex justify-center items-center py-24">
                    <Ionicons
                      size={28}
                      color={"green"}
                      name="trash-bin-outline"
                    />
                    <Text className="py-4 text-base font-medium text-green-700">
                      No Interested Members
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <>
                {pendingApproval.length > 0 ? (
                  <View className={`p-2`}>
                    {pendingApproval?.map((i) => (
                      <ReqCard
                        key={i._id}
                        bookingId={i._id}
                        name={`${i.name}`}
                        age={`${i.age}`}
                        gender={`${i.gender}`}
                        interest={false}
                        reserve={true}
                        tourId={i.tourId}
                        handleReserveMembers={handleReserveMembers}
                      />
                    ))}
                  </View>
                ) : (
                  <View className="h-full w-full flex justify-center items-center py-24">
                    <Ionicons
                      size={28}
                      color={"green"}
                      name="trash-bin-outline"
                    />
                    <Text className="py-4 text-base font-medium text-green-700">
                      No Reserve Requests
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
        </ScrollView>
      </View>
      <Modalize
        ref={enrollRef}
        adjustToContentHeight
        onClose={() => {
          setIsPaymentRecieved(false);
          setIsTrekker(false);
          setIsAccommodationTrue(false);
        }}
      >
        <View className="flex justify-center items-center px-4">
          <Text className="text-lg font-medium py-3">Onboarding Trekkers</Text>
          <View className="w-full border border-gray-500 p-1 rounded-lg">
            <Text className="text-sm text-gray-600">Tour</Text>
            <Text className="text-base">
              {currentTour?.name}--[ {formatDate(currentTour.tour_start)} -{" "}
              {formatDate(currentTour.tour_end)} ]
            </Text>
          </View>
          <View className="w-full border border-gray-500 p-1 rounded-lg mt-3">
            <Text className="text-sm text-gray-600">Name</Text>
            <Text className="text-base">
              {enrollingDetails?.profileData?.name}
            </Text>
          </View>
          <View className="w-full border border-gray-500 p-1 rounded-lg mt-3">
            <Text className="text-sm text-gray-600">Age</Text>
            <Text className="text-base">
              {enrollingDetails?.profileData?.age}
            </Text>
          </View>
          <View className="w-full border border-gray-500 p-1 rounded-lg mt-3">
            <Text className="text-sm text-gray-600">Gender</Text>
            <Text className="text-base">
              {enrollingDetails?.profileData?.gender}
            </Text>
          </View>
          <View className="w-full border border-gray-500 p-1 rounded-lg mt-3">
            <Text className="text-sm text-gray-600">Contact</Text>
            <Text className="text-base">
              {enrollingDetails?.profileData?.contact}
            </Text>
          </View>
          <View className="flex flex-row w-full justify-between border py-2 mt-3 rounded-lg border-gray-500 px-3">
            <View className="flex flex-row space-x-2 justify-center items-center">
              <Checkbox
                status={isTrekker ? "checked" : "unchecked"}
                onPress={() => setIsTrekker(!isTrekker)}
                style={{ height: 16, width: 16 }}
                color={"green"}
              />
              <Text className={``}>Is Trekker</Text>
            </View>
            <View className="flex flex-row space-x-2 justify-center items-center">
              <Checkbox
                status={isAccommodationTrue ? "checked" : "unchecked"}
                onPress={() => setIsAccommodationTrue(!isAccommodationTrue)}
                style={{ height: 16, width: 16 }}
                color={"green"}
              />
              <Text className={``}>Need Accommodation</Text>
            </View>
          </View>
          <View className="flex flex-row justify-between w-full border mt-3 p-2 rounded-lg border-gray-500 py-3">
            <Text className="text-base">Payment Recieved</Text>
            <Switch
              value={isPaymentRecieved}
              onValueChange={() => setIsPaymentRecieved(!isPaymentRecieved)}
            />
          </View>
          {isPaymentRecieved && (
            <View className="w-full border border-gray-500 p-1 rounded-lg mt-3">
              <Text className="text-sm text-gray-600">Amount</Text>
              <TextInput
                onChangeText={setAmount}
                className="text-base"
                placeholder="Enter recieved amount"
              />
            </View>
          )}
          <View className="w-full flex flex-row justify-between px-3 h-12 my-3">
            <TouchableOpacity
              onPress={() => enrollRef.current?.close()}
              className="w-[48%] border flex justify-center items-center rounded-lg"
            >
              <Text className="text-base font-medium">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleEnrollMembers}
              className="w-[48%] flex justify-center items-center rounded-lg bg-green-700"
            >
              {enrolling ? (
                <ActivityIndicator size={"small"} color="white" />
              ) : (
                <Text className="text-white text-base font-medium">Add</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modalize>
    </>
  );
};

const ReqCard = ({
  enrollId,
  bookingId,
  name,
  age,
  gender,
  interest,
  reserve,
  enrollRef,
  tourId,
  setEnrollingId,
  handleReserveMembers,
}) => {
  const handleEnrolling = () => {
    setEnrollingId(enrollId);
    enrollRef.current?.open();
  };

  return (
    <View className="flex flex-row w-full justify-between items-center bg-white p-1 rounded-lg px-3 shadow-xl shadow-black/50 mt-2 py-2">
      <Text className="w-[35%]">{name}</Text>
      <Text>
        {age} Yrs, {gender.charAt(0)}
      </Text>
      <>
        {reserve && (
          <View className="flex flex-row items-center justify-center space-x-5">
            <TouchableOpacity
              onPress={() => handleReserveMembers(bookingId, "accept")}
              activeOpacity={0.5}
            >
              <Text className="text-green-700">Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleReserveMembers(bookingId, "reject")}
              activeOpacity={0.5}
            >
              <Text className="text-red-700">Reject</Text>
            </TouchableOpacity>
          </View>
        )}
        {interest && (
          <TouchableOpacity
            onPress={handleEnrolling}
            activeOpacity={0.5}
            style={{ marginRight: 10 }}
          >
            <Text className="text-green-700">Enrol</Text>
          </TouchableOpacity>
        )}
      </>
    </View>
  );
};

export default GuestsEnrolled;
