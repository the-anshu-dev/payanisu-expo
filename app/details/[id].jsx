import {
  View,
  Text,
  Dimensions,
  Alert,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import LinearGradient from "react-native-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import ListComponent from "../../components/UI/ListComponent.jsx";
import { Modalize } from "react-native-modalize";
import approve from "../../assets/approve.png";
import { Checkbox } from "react-native-paper";
import Carousel from "react-native-reanimated-carousel";
import CarouselImageRender from "../../components/UI/CarouselImageRender.jsx";
import { formatDate } from "../../utils/helpers.js";
import { StatusBar } from "expo-status-bar";
import { useDispatch, useSelector } from "react-redux";
import {
  setTotalCost,
  setTourMembers,
} from "../../redux/slices/bookingSlice.js";

const width = Dimensions.get("window").width;

const DetailsScreen = () => {
  const { id } = useLocalSearchParams();
  const { tour } = useSelector((state) => state.tour);
  const { user, profile, members } = useSelector((state) => state.user);

  const [loading, setLoading] = useState(false);

  const tourData = tour.find((tourData) => tourData._id === id);

  const { backpacks, checkinbagages, includeds, notincludeds } = tourData;

  const [curatedMembers, setCuratedMembers] = useState(() => {
    if (profile && user && id) {
      return [
        {
          id: profile._id,
          name: user?.given_name,
          age: profile?.age,
          gender: profile?.gender,
          email: user.email,
          tourId: id,
          isTrekker: false,
          noAccommodation: false,
        },
      ];
    }
    return [];
  });

  const reserveRef = useRef(null);
  const interestedRef = useRef(null);

  const dispatch = useDispatch();

  const handleCheckboxChange = (id, field) => {
    setCuratedMembers((prevData) =>
      prevData.map((member) =>
        member.id === id ? { ...member, [field]: !member[field] } : member
      )
    );
  };

  const handleInterested = async () => {
    const body = {
      tourId: id,
      email: user?.email,
    };
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/interested/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      if (response.status !== 201) {
        throw new Error("Failed to post interest");
      }

      interestedRef.current?.open();
    } catch (error) {
      console.log("Error:", error);
      Alert.alert("Something went wrong.", "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (members?.length > 0) {
      const initialData = members.map((member) => ({
        id: member._id,
        name: member.name,
        age: member.age,
        gender: member.gender,
        email: member.email,
        tourId: id,
        isTrekker: false,
        noAccommodation: false,
      }));
      setCuratedMembers((prevMembers) => [...prevMembers, ...initialData]);
    }
  }, [members, id]);

  const handlePayNow = async () => {
    if (!tourData) return;

    const totalCost = curatedMembers.length * tourData.tour_cost;

    dispatch(setTourMembers(curatedMembers));
    dispatch(setTotalCost(totalCost));

    router.push(`/payment?${id}`);
  };

  const handleReserveButton = () => {
    if (!profile) {
      Alert.alert(
        "Profile not found!",
        "Create your profile first",
        [
          {
            text: "Go to Profile",
            onPress: () => router.push("/profile"),
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ],
        { cancelable: true }
      );
      return;
    }

    reserveRef.current.open();
  };

  const handleRemoveMembers = (id) => {
    if (id === profile?._id) {
      Alert.alert("Cannot remove!", "You cannot remove yourself");
      return;
    }
    setCuratedMembers((prevData) =>
      prevData.filter((member) => member.id !== id)
    );
  };

  const images = useMemo(
    () => tourData?.images.filter((i) => !i.type).map((i) => i.url),
    [tourData]
  );

  return (
    <>
      <ScrollView className="flex h-full">
        <StatusBar
          style="dark"
          backgroundColor="#fff"
          translucent={true}
          animated
        />
        <Carousel
          loop
          width={width}
          height={288}
          autoPlay={true}
          data={images}
          autoPlayInterval={2000}
          scrollAnimationDuration={1000}
          renderItem={CarouselImageRender}
        />
        <View className="px-4 mt-4 pb-8 relative">
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            colors={["rgba(240, 101, 2, 0.2)", "rgba(0, 174, 255, 0.2)"]}
            className="rounded-xl"
          >
            <View
              className={`flex flex-row justify-between py-3 px-4 rounded-xl`}
            >
              <View className="space-y-2">
                <Text className={`font-medium `}>Price</Text>
                <Text
                  className={`text-lg font-semibold `}
                >{`₹ ${tourData?.tour_cost}`}</Text>
              </View>
              <View className="space-y-2">
                <Text className={`font-medium`}>Seats Available</Text>
                <Text className={`text-lg font-semibold  text-right`}>
                  {`${tourData?.total_seats} seats`}
                </Text>
              </View>
            </View>
          </LinearGradient>
          <View
            className={`flex flex-row justify-between py-3 px-4 rounded-xl mt-4`}
          >
            <View className="space-y-2">
              <Text className={`font-medium `}>Tour Name</Text>
              <Text
                className={`text-lg font-semibold `}
              >{`${tourData?.name}`}</Text>
            </View>
            <View className="space-y-2">
              <Text className={`font-medium `}>Booking Close</Text>
              <Text className={`text-lg font-semibold  text-right`}>
                {`${formatDate(tourData?.booking_close)}`}
              </Text>
            </View>
          </View>
          <View className={`px-4 space-y-2 mt-3 `}>
            <Text className={`font-semibold text-md `}>Description</Text>
            <Text className={`text-justify tracking-wider text-md `}>
              {tourData?.description}
            </Text>
          </View>
          <View className={`px-4 space-y-2 mt-3 `}>
            <Text className={`font-semibold text-md `}>Dates</Text>
            <Text
              className={`text-justify tracking-wider text-md font-semibold `}
            >
              {`${formatDate(tourData?.tour_start)} to ${formatDate(
                tourData?.tour_end
              )}`}
            </Text>
          </View>
          <View className="px-4 mt-5">
            <View className="flex flex-row justify-left items-center space-x-3">
              <Ionicons name="thumbs-up-outline" size={24} color={"green"} />
              <Text className={`text-base  font-semibold`}>
                What is included ?
              </Text>
            </View>
            <View className="px-1 mt-3 space-y-2">
              {includeds?.map((i, idx) => {
                return (
                  <ListComponent
                    icon="checkmark-circle"
                    text={i.item}
                    key={idx}
                    color={"#0e9c02"}
                  />
                );
              })}
            </View>
          </View>
          <View className="px-4 mt-6">
            <View className="flex flex-row justify-left items-center space-x-3">
              <Ionicons name="thumbs-down-outline" size={24} color={"red"} />
              <Text className={`text-base  font-semibold`}>
                What is not included ?
              </Text>
            </View>
            <View className="px-1 mt-3 space-y-2">
              {notincludeds?.map((i, idx) => {
                return (
                  <ListComponent
                    icon="close-circle-outline"
                    text={i.item}
                    key={idx}
                    color={"#f00"}
                  />
                );
              })}
            </View>
          </View>
          <View className="px-4 mt-6">
            <View className="flex flex-row justify-left items-center space-x-3">
              <Ionicons name="bag-check-outline" size={24} color={"green"} />
              <Text className={`text-base  font-semibold`}>Bag Pack</Text>
            </View>
            <View className="px-1 mt-3 space-y-2">
              {backpacks?.map((i, idx) => {
                return (
                  <ListComponent
                    icon="checkmark-circle-outline"
                    text={i.item}
                    color={"gray"}
                    key={idx}
                  />
                );
              })}
            </View>
          </View>
          <View className="px-4 mt-6">
            <View className="flex flex-row justify-left items-center space-x-3">
              <Ionicons
                name="checkmark-done-circle-outline"
                size={24}
                color={"green"}
              />
              <Text className={`text-base  font-semibold`}>
                Check In Baggage
              </Text>
            </View>
            <View className="px-1 mt-3 space-y-2">
              {checkinbagages?.map((i, idx) => {
                return (
                  <ListComponent
                    icon="checkmark-circle-outline"
                    text={i.item}
                    color={"gray"}
                    key={idx}
                  />
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>
      <View className="h-fit mb-2 flex flex-row justify-center items-center w-full px-6 space-x-6 bg-transparent">
        <TouchableOpacity onPress={handleInterested} activeOpacity={0.8}>
          <View className=" bg-slate-500 w-[170px] rounded-lg h-12 flex justify-center items-center ">
            {loading ? (
              <ActivityIndicator color="white" size={"small"} />
            ) : (
              <Text className="text-white text-center text-md font-semibold">
                Interested
              </Text>
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleReserveButton} activeOpacity={0.8}>
          <View className="py-3 bg-green-700 w-[170px] rounded-lg h-12 flex justify-center items-center">
            <Text className="text-center text-white font-semibold">
              Reserve Seat
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      <Modalize
        ref={interestedRef}
        handleStyle={{ backgroundColor: "green" }}
        handlePosition="inside"
        adjustToContentHeight
      >
        <View
          className={`flex justify-center items-center h-[350px] rounded-t-lg `}
        >
          <Text className={`text-xl font-semibold mt-6 px-5 text-center`}>
            Thanks for showing interest for the tour.
          </Text>
          <Image source={approve} className=" h-40 w-40 mt-2" />
          <Text className={`mt-2 text-lg `}>
            Our team will reach out to you.
          </Text>
        </View>
      </Modalize>
      <Modalize
        ref={reserveRef}
        handlePosition="inside"
        handleStyle={{ backgroundColor: "green" }}
        adjustToContentHeight
      >
        <View className="h-full relative">
          <View className={`flex px-4 h-[600px] rounded-t-lg `}>
            <View>
              <Text className={`text-lg font-semibold mt-6 `}>
                Select Number of Seats
              </Text>
              <Text className={`text-sm tracking-wider `}>
                You can add family members in my profile.
              </Text>
            </View>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingBottom: 150,
                backgroundColor: "#f9f9f9",
              }}
              style={{ backgroundColor: "#f9f9f9" }}
            >
              <View className="mt-6 space-y-5">
                {curatedMembers.map((member) => (
                  <BookingMembers
                    key={member.id}
                    member={member}
                    handleCheckboxChange={handleCheckboxChange}
                    handleRemoveMembers={handleRemoveMembers}
                  />
                ))}
              </View>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push("/addMember")}
                className="bg-green-600 w-40 h-10 flex flex-row justify-center items-center rounded-sm mt-5"
              >
                <Ionicons name="add-circle-outline" color="white" size={20} />
                <Text className="font-semibold ml-1 text-white">
                  Add New Member
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
          <View className={`px-4 absolute bottom-0 pb-4 pt-1 bg-white`}>
            <View className="flex flex-row w-full justify-between items-center">
              <View>
                <Text className={`text-xs `}>Total Payable</Text>
                <Text className={`text-xl font-semibold `}>{`₹ ${
                  curatedMembers.length * tourData?.tour_cost
                }`}</Text>
              </View>
              <TouchableOpacity activeOpacity={0.8} onPress={handlePayNow}>
                <View className="h-10 w-40 flex justify-center items-center rounded-lg bg-green-700">
                  <Text className="text-white font-semibold tracking-wider">
                    Pay Now
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modalize>
    </>
  );
};

const BookingMembers = ({
  member,
  handleCheckboxChange,
  handleRemoveMembers,
}) => {
  return (
    <View style={styles.memberCardStyle}>
      <View className="w-full flex flex-row justify-between items-center">
        <Text className={`text-lg font-semibold `}>{member.name}</Text>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleRemoveMembers(member.id)}
        >
          <Ionicons name="close-circle-outline" size={20} color={"red"} />
        </TouchableOpacity>
      </View>
      <View className="flex flex-row w-full justify-between mt-2">
        <View className="flex flex-row space-x-2 justify-center items-center">
          <Checkbox
            status={member.isTrekker ? "checked" : "unchecked"}
            onPress={() => handleCheckboxChange(member.id, "isTrekker")}
            style={{ height: 16, width: 16 }}
            color={"green"}
          />
          <Text className={``}>I am a Trekker</Text>
        </View>
        <View className="flex flex-row space-x-2 justify-center items-center">
          <Checkbox
            status={member.noAccommodation ? "checked" : "unchecked"}
            onPress={() => handleCheckboxChange(member.id, "noAccommodation")}
            style={{ height: 16, width: 16 }}
            color={"green"}
          />
          <Text className={``}>No Accommodation</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  memberCardStyle: {
    padding: 10,
    marginVertical: 10,
    borderRadius: 10,
    backgroundColor: "#fff",
    elevation: 5,
  },
});

export default DetailsScreen;
