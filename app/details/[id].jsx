import {
  View,
  Text,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Alert,
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
import { SafeAreaView } from "react-native-safe-area-context";
import { showError, showWarning } from "../../utils/toastHelper";
const { width, height } = Dimensions.get("window");

const DetailsScreen = () => {
  const { id } = useLocalSearchParams();
  const { tour } = useSelector((state) => state.tour);
  const { user, profile, members } = useSelector((state) => state.user);

  const [loading, setLoading] = useState(false);

  const [filteredMembers, setFilteredMembers] = useState([]);

  const tourData = tour.find((tourData) => tourData._id === id) || {};
  const {
    backpacks = [],
    checkinbagages = [],
    includeds = [],
    notincludeds = [],
  } = tourData;

  const [memberPreferences, setMemberPreferences] = useState({});

  const handleCheckboxChange = (id, field) => {
    setMemberPreferences((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: !prev[id]?.[field] },
    }));
  };

  const curatedMembers = useMemo(() => {
    const existingMembers =
      members?.map((member) => ({
        id: member._id,
        name: member.name,
        age: member.age,
        gender: member.gender,
        email: member.email,
        tourId: id,
        isTrekker: memberPreferences[member._id]?.isTrekker || false,
        noAccommodation:
          memberPreferences[member._id]?.noAccommodation || false,
        isSelected: true,
      })) || [];

    const selfMember =
      profile && user && id
        ? [
            {
              id: profile._id,
              name: user?.given_name,
              age: profile?.age,
              gender: profile?.gender,
              email: user.email,
              tourId: id,
              isTrekker: memberPreferences[profile._id]?.isTrekker || false,
              noAccommodation:
                memberPreferences[profile._id]?.noAccommodation || false,
              isSelected: true,
            },
          ]
        : [];

    const uniqueMembers = [
      ...new Map(
        [...selfMember, ...existingMembers].map((m) => [m.id, m])
      ).values(),
    ];

    return uniqueMembers;
  }, [members, profile, user, id, memberPreferences]);

  const reserveRef = useRef(null);
  const interestedRef = useRef(null);

  const dispatch = useDispatch();

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

      if (!response.ok) {
        throw new Error(`Failed to post interest: ${response.status}`);
      }

      interestedRef.current?.open();
    } catch (error) {
      showError(error.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async () => {
    if (!tourData) return;
    const bookingMembers = filteredMembers.filter((m) => m.isSelected);
    if (bookingMembers.length === 0) {
      showWarning("Please select at least one member.");
      return;
    }
    const totalCost = bookingMembers.length * tourData.tour_cost;
    dispatch(setTourMembers(bookingMembers));
    dispatch(setTotalCost(totalCost));
    router.replace(`/payment?id=${id}`);
  };

  const handleReserveButton = () => {
    if (!profile) {
      Alert.alert(
        "Create Profile",
        "Create your profile and book the tour.",
        [
          {
            text: "Create Profile",
            onPress: () => router.push("/editProfile"),
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

  const handleSelectMember = (id) => {
    // if (id === profile?._id) {
    //  showWarning("You cannot remove yourself");
    //   return;
    // }

    setFilteredMembers((prev) =>
      prev.map((member) =>
        member.id === id
          ? { ...member, isSelected: !member.isSelected }
          : member
      )
    );
  };

  useEffect(() => {
    setFilteredMembers([...curatedMembers]);
  }, [curatedMembers]);

  const images = useMemo(
    () => tourData?.images.filter((i) => !i.type).map((i) => i.url),
    [tourData]
  );

  return (
    <>
      <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
        <ScrollView
          className="flex h-full"
          showsVerticalScrollIndicator={false}
        >
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
          <View className="px-4 mt-4 pb-8 relative flex gap-4">
            <LinearGradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              colors={["rgba(240, 101, 2, 0.2)", "rgba(0, 174, 255, 0.2)"]}
              style={{ borderRadius: 10 }}
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
            <View className="p-2 rounded-lg shadow-lg shadow-black/50 bg-white py-4">
              <View
                className={`flex flex-row justify-between py-3 px-2 rounded-xl`}
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
              <View className={`px-2 space-y-2 mt-3 `}>
                <Text className={`font-semibold text-md `}>Description</Text>
                <Text className={`text-justify tracking-wider text-md `}>
                  {tourData?.description}
                </Text>
              </View>
              <View className={`px-2 space-y-2 mt-3`}>
                <Text className={`font-semibold text-md `}>Dates</Text>
                <Text
                  className={`text-justify tracking-wider text-md font-semibold `}
                >
                  {`${formatDate(tourData?.tour_start)} to ${formatDate(
                    tourData?.tour_end
                  )}`}
                </Text>
              </View>
            </View>
            <View className="p-2 rounded-lg shadow-lg shadow-black/50 bg-white">
              <View className="flex flex-row justify-left items-center gap-3 border-b border-gray-300 pb-1 px-1">
                <Ionicons name="thumbs-up-outline" size={24} color={"#228B22"} />
                <Text className={`text-base  font-semibold`}>
                  What is included ?
                </Text>
              </View>
              <View className="px-1 mt-3 gap-2">
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
            <View className="p-2 rounded-lg shadow-lg shadow-black/50 bg-white">
              <View className="flex flex-row justify-left items-center gap-3 border-b border-gray-300 pb-1 px-1">
                <Ionicons name="thumbs-down-outline" size={24} color={"red"} />
                <Text className={`text-base  font-semibold`}>
                  What is not included ?
                </Text>
              </View>
              <View className="px-1 mt-3 gap-2">
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
            <View className="p-2 rounded-lg shadow-lg shadow-black/50 bg-white">
              <View className="flex flex-row justify-left items-center gap-3 border-b border-gray-300 pb-1 px-1">
                <Ionicons name="bag-check-outline" size={24} color={"#228B22"} />
                <Text className={`text-base  font-semibold`}>Bag Pack</Text>
              </View>
              <View className="px-1 mt-3 gap-2">
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
            <View className="p-2 rounded-lg shadow-lg shadow-black/50 bg-white">
              <View className="flex flex-row justify-left items-center gap-3 border-b border-gray-300 pb-1 px-1">
                <Ionicons
                  name="checkmark-done-circle-outline"
                  size={24}
                  color={"#228B22"}
                />
                <Text className={`text-base font-semibold`}>
                  Check In Baggage
                </Text>
              </View>
              <View className="px-1 mt-3 gap-2">
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
        <View
          style={{ backgroundColor: "transparent" }}
          className="h-fit py-2 flex flex-row justify-center items-center w-full gap-5"
        >
          <TouchableOpacity onPress={handleInterested} activeOpacity={0.9}>
            <View
              style={{ width: width * 0.45 }}
              className="bg-slate-500 rounded-lg h-14 flex justify-center items-center "
            >
              {loading ? (
                <ActivityIndicator color="white" size={"small"} />
              ) : (
                <Text className="text-white text-center text-md font-semibold text-lg">
                  Interested
                </Text>
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleReserveButton} activeOpacity={0.9}>
            <View
              style={{ width: width * 0.45 }}
              className="py-3 bg-[#228B22] rounded-lg h-14 flex justify-center items-center"
            >
              <Text className="text-center text-white font-semibold text-lg">
                Reserve Seat
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      <Modalize
        ref={interestedRef}
        handleStyle={{ backgroundColor: "#228B22" }}
        handlePosition="inside"
        adjustToContentHeight
      >
        <View
          style={{ height: height * 0.35 }}
          className={`flex justify-center items-center rounded-t-lg `}
        >
          <Text className={`text-xl font-semibold px-5 text-center`}>
            Thanks for showing interest for the tour.
          </Text>
          <Image
            source={approve}
            style={{ height: height * 0.2, width: width * 0.5 }}
            className="mt-2"
          />
          <Text className={`mt-2 text-lg `}>
            Our team will reach out to you.
          </Text>
        </View>
      </Modalize>
      <Modalize
        ref={reserveRef}
        handlePosition="inside"
        handleStyle={{ backgroundColor: "#228B22" }}
        adjustToContentHeight
      >
        <View className="h-full relative">
          <View className={`flex h-[600px] rounded-t-lg `}>
            <View className={`px-4 pt-4`}>
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
                paddingTop: 10,
              }}
              style={{ backgroundColor: "#f9f9f9" }}
            >
              <View className="mt-2 gap-3 px-4">
                {filteredMembers?.map((member) => (
                  <BookingMembers
                    key={member.id}
                    member={member}
                    handleCheckboxChange={handleCheckboxChange}
                    handleSelectMember={handleSelectMember}
                    isSelected={member.isSelected}
                  />
                ))}
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => router.push("/addMember")}
                  className="bg-[#228B22] py-3 flex flex-row justify-center items-center rounded-lg mt-3"
                >
                  <Ionicons name="add-circle-outline" color="white" size={20} />
                  <Text className="font-semibold ml-1 text-white">
                    Add New Member
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
          <View className={`px-4 absolute bottom-0 py-3 bg-white flex justify-center items-center`}>
            <View className="flex flex-row w-full justify-between items-center">
              <View>
                <Text className={`text-xs `}>Total Payable</Text>
                <Text className={`text-xl font-semibold `}>{`₹ ${
                  filteredMembers.filter((m) => m.isSelected).length *
                  tourData?.tour_cost
                }`}</Text>
              </View>
              <TouchableOpacity activeOpacity={0.9} onPress={handlePayNow}>
                <View className="h-12 w-40 flex justify-center items-center rounded-lg bg-[#228B22]">
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
  handleSelectMember,
  isSelected,
}) => {
  return (
    <View style={styles.memberCardStyle}>
      <View className="w-full flex flex-row justify-between items-center">
        <Text className={`text-xl font-semibold `}>{member.name}</Text>
        <Checkbox
          onPress={() => handleSelectMember(member.id)}
          status={isSelected && "checked"}
          color="#228B22"
        />
      </View>
      <View className="flex flex-row w-full justify-between mt-2">
        <View className="flex flex-row space-x-2 justify-center items-center">
          <Checkbox
            status={member.isTrekker ? "checked" : "unchecked"}
            onPress={() => handleCheckboxChange(member.id, "isTrekker")}
            style={{ height: 16, width: 16 }}
            color={"#228B22"}
          />
          <Text className={``}>I am a Trekker</Text>
        </View>
        <View className="flex flex-row space-x-2 justify-center items-center">
          <Checkbox
            status={member.noAccommodation ? "checked" : "unchecked"}
            onPress={() => handleCheckboxChange(member.id, "noAccommodation")}
            style={{ height: 16, width: 16 }}
            color={"#228B22"}
          />
          <Text className={``}>No Accommodation</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  memberCardStyle: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#fff",
    elevation: 5,
  },
});

export default DetailsScreen;
