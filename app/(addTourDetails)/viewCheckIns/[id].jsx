import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { useSelector } from "react-redux";
import LinearGradient from "react-native-linear-gradient";
import { Modalize } from "react-native-modalize";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { ActivityIndicator } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { showError, showSuccess } from "../../../utils/toastHelper";

const { width, height } = Dimensions.get("window");

const ViewCheckIns = () => {
  const { id } = useLocalSearchParams();
  const { checkPoints } = useSelector((state) => state.tour);
  const checkPointData = checkPoints?.find((i) => i._id === id);
  const tourId = checkPoints[0].tourId;

  const [refreshing, setRefreshing] = useState(false);
  const [allReadyCheckedIn, setAlreadyCheckedIn] = useState(false);
  const [checkedInId, setCheckedInId] = useState("");
  const [modalDetails, setModalDetails] = useState({
    name: "",
    age: "",
    gender: "",
    contact: "",
    emergency_contact: "",
    email: "",
  });
  const [allMembers, setAllMembers] = useState([]);
  const [checkedInMembers, setCheckedInMembers] = useState([]);
  const [checkedInMembersLoading, setCheckedInMembersLoading] = useState([]);
  const manualCheckInRef = useRef(null);
  const resetAllRef = useRef(null);

  const [checkingIn, setCheckingIn] = useState(false);
  const [absenting, setAbsenting] = useState(false);
  const [reseting, setReseting] = useState(false);

  const checkedInEmails = checkedInMembers?.map((i) => i.email);

  const getCheckedInMember = (email) =>
    checkedInMembers.find((member) => member.email === email);

  const getMembersWithPlaceholders = (members) => {
    const remainder = members.length % 4;
    const placeholdersNeeded = remainder > 0 ? 4 - remainder : 0;

    const timestamp = Date.now();
    const placeholders = Array.from({ length: placeholdersNeeded }, (_, i) => ({
      _id: `placeholder-${timestamp}-${i}`,
      placeholder: true,
    }));

    return [...members, ...placeholders];
  };

  const getBookedUsers = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/booking/get?id=${tourId}`
      );

      if (response.status !== 200) {
        throw new Error("Failed to fetch booked users");
      }

      const result = await response.json();
      setAllMembers(result.data);
    } catch (error) {
      showError(error.message || "Please try again.");
    }
  };

  const handleGetCheckedInMembers = async () => {
    setCheckedInMembersLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/checked/getUserById?id=${id}`
      );

      if (response.status !== 200) {
        throw new Error("Failed to fetch checkedIn members");
      }

      const data = await response.json();
      setCheckedInMembers(data);
    } catch (error) {
      showError(error.message || "Please try again.");
    } finally {
      setCheckedInMembersLoading(false);
    }
  };
 
  const handleCheckIn = async (email) => {
    setCheckingIn(true);
    try {
      const body = {
        email: email,
        checkPointId: id,
        tourId: tourId,
      };
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/checked/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to check in");
      }

      showSuccess("Member successfully checked in.");
      handleGetCheckedInMembers();
      manualCheckInRef.current?.close();
    } catch (error) {
      showError(error.message || "Please try again.");
    } finally {
      setCheckingIn(false);
    }
  };

  const handleMarkAbsent = async () => {
    setAbsenting(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/checked/delete?id=${checkedInId}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to mark absent.");
      }
      showSuccess("Member absented successfully.");
      handleGetCheckedInMembers();
      manualCheckInRef?.current?.close();
    } catch (error) {
      showError(error.message || "Please try again.");
    } finally {
      setAbsenting(false);
    }
  };

  const handleResetCheckIn = async () => {
    setReseting(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/checked/reset?id=${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to reset.");
      }

      showSuccess("All checked ins deleted.");
      handleGetCheckedInMembers();
      resetAllRef.current?.close();
    } catch (error) {
      showError(error.message || "Please try again.");
    } finally {
      setReseting(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await handleGetCheckedInMembers();
      await getBookedUsers();
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    onRefresh();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom", "left", "right"]}>
      {checkedInMembersLoading ? (
        <View className="h-full w-full flex justify-center items-center">
          <ActivityIndicator size={"large"} color="#228B22" />
        </View>
      ) : (
        <View className="p-2 mt-2 h-full relative flex justify-center items-center">
          <View className="mb-3 w-full px-2">
            <LinearGradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              colors={["rgba(240, 101, 2, 0.2)", "rgba(0, 174, 255, 0.2)"]}
              style={{ borderRadius: 10 }}
            >
              <View
                className={`flex flex-row justify-between py-3 px-4 rounded-xl`}
              >
                <View className="gap-2">
                  <Text className="text-sm">Check Point</Text>
                  <Text
                    className={`text-lg font-medium `}
                  >{`${checkPointData.name}`}</Text>
                </View>
                <View className="gap-2">
                  <Text>Checked In Members</Text>
                  <Text
                    className={`text-xl text-[#228B22] font-medium text-right`}
                  >
                    {checkedInMembers?.length}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: 120,
              paddingHorizontal: 10,
              paddingTop: 10,
              flexGrow: 1,
            }}
            style={{ width: "100%", borderRadius: 10 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <View style={styles.cardContainer}>
              {getMembersWithPlaceholders(allMembers).map((member) => {
                if (member.placeholder) {
                  return (
                    <View
                      key={member._id}
                      style={[styles.card, { opacity: 0 }]}
                    />
                  );
                }

                const profile = member?.ProfileData?.[0] || {};
                const checkedInMember = getCheckedInMember(profile.email);

                return (
                  <CheckedInUserCard
                    key={member._id}
                    name={member.name}
                    email={member.email}
                    age={member.age}
                    gender={member.gender}
                    contact={profile.contact}
                    emergency_contact={profile.emergency_contact}
                    checkInTime={checkedInMember?.createdAt}
                    checkInId={checkedInMember?._id}
                    checkedInEmails={checkedInEmails}
                    manualCheckInRef={manualCheckInRef}
                    setAlreadyCheckedIn={setAlreadyCheckedIn}
                    setCheckedInId={setCheckedInId}
                    setModalDetails={setModalDetails}
                  />
                );
              })}
            </View>
          </ScrollView>
          <View className="absolute bottom-6 h-16 flex justify-center items-center w-full px-5">
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => resetAllRef.current?.open()}
              className="w-full py-4 flex justify-center items-center rounded-lg border border-red-700"
            >
              <Text>Reset All Check-Ins</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <Modalize ref={resetAllRef} adjustToContentHeight>
        <View style={{ padding: 20, alignItems: "center", paddingBottom: 20 }}>
          <Ionicons name="warning" size={48} color="red" />
          <Text
            style={{ fontSize: 18, fontWeight: "bold", marginVertical: 10 }}
          >
            Are you sure?
          </Text>
          <Text
            style={{
              textAlign: "center",
              color: "#555",
              paddingHorizontal: 30,
              fontWeight: "500",
            }}
          >
            Once you reset this, all your current data will be lost and cannot
            be recovered.
          </Text>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              marginTop: 20,
              width: "100%",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 10,
            }}
          >
            <TouchableOpacity
              onPress={() => resetAllRef.current?.close()}
              style={{
                backgroundColor: "#ccc",
                height: height * 0.05,
                width: width * 0.42,
                borderRadius: 5,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "black", fontWeight: "bold" }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleResetCheckIn}
              style={{
                backgroundColor: "red",
                height: height * 0.05,
                width: width * 0.42,
                borderRadius: 5,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {reseting ? (
                <ActivityIndicator color="white" size={"small"} />
              ) : (
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  Confirm
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modalize>
      <Modalize
        ref={manualCheckInRef}
        adjustToContentHeight
        onClose={() => {
          setAlreadyCheckedIn(false);
          setCheckedInId("");
        }}
      >
        <View className="w-full justify-center items-center pt-4">
          <Text className="text-2xl font-bold">Guest Check-in</Text>
        </View>
        <View className="h-48 w-full justify-start items-center px-2">
          <View className="flex flex-row w-full justify-between items-center pr-3 ">
            <View className="py-2 px-2 gap-1">
              <Text className=" text-xs text-gray-600  ">Name</Text>
              <Text className="text-lg">{modalDetails?.name}</Text>
            </View>
          </View>
          <View className="w-full px-2 mt-2">
            <View className="flex flex-row justify-between items-center">
              <View className="w-[50%] ">
                <Text className=" text-sm text-slate-500/70">Age(Yr)</Text>
                <Text className="text-base">{modalDetails?.age}</Text>
              </View>
              <View className=" w-[50%]">
                <Text className="text-sm text-slate-500/70">Gender</Text>
                <Text className=" text-base">{modalDetails?.gender}</Text>
              </View>
            </View>
            <View className="flex flex-row justify-between items-center mt-2">
              <View className="w-[50%] ">
                <Text className=" text-sm text-slate-500/70">Contact No.</Text>
                <Text className=" text-base">{modalDetails?.contact}</Text>
              </View>
              <View className="w-[50%] ">
                <Text className=" text-sm text-slate-500/70">
                  Emergency Contact
                </Text>
                <Text className="text-base">
                  {modalDetails?.emergency_contact}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            marginTop: 20,
            width: "100%",
            paddingHorizontal: 10,
            paddingBottom: 20,
            justifyContent: "space-between",
          }}
        >
          <TouchableOpacity
            onPress={handleMarkAbsent}
            disabled={!allReadyCheckedIn}
            style={{
              backgroundColor: "#ccc",
              height: height * 0.05,
              width: width * 0.45,
              borderRadius: 5,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {absenting ? (
              <ActivityIndicator color="#228B22" size={"small"} />
            ) : (
              <Text style={{ color: "black", fontWeight: "500" }}>
                Mark as absent
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            disabled={allReadyCheckedIn}
            onPress={() => handleCheckIn(modalDetails?.email)}
            style={{
              backgroundColor: allReadyCheckedIn ? "gray" : "#228B22",
              height: height * 0.05,
              width: width * 0.45,
              borderRadius: 5,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {checkingIn ? (
              <ActivityIndicator color="white" size={"small"} />
            ) : (
              <Text style={{ color: "white", fontWeight: "500" }}>
                Check-in
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </Modalize>
    </SafeAreaView>
  );
};

const CheckedInUserCard = ({
  name,
  age,
  email,
  gender,
  contact,
  emergency_contact,
  checkInTime,
  checkInId,
  checkedInEmails,
  manualCheckInRef,
  setAlreadyCheckedIn,
  setCheckedInId,
  setModalDetails,
}) => {
  const handleOpenModal = () => {
    setModalDetails({
      name: name,
      age: age,
      gender: gender,
      contact: contact,
      emergency_contact: emergency_contact,
      email: email,
    });
    if (checkInId) {
      setAlreadyCheckedIn(true);
      setCheckedInId(checkInId);
    }
    manualCheckInRef.current?.open();
  };
  return (
    <TouchableOpacity onPress={handleOpenModal} activeOpacity={0.9}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: checkedInEmails.includes(email)
              ? "#59d97d"
              : "#eba4a8",
          },
        ]}
      >
        <Text
          style={[
            styles.text,
            {
              color: checkedInEmails.includes(email) ? "#228B22" : "red",
              fontWeight: 600,
            },
          ]}
        >
          {name?.split(" ")[0]}
        </Text>
        <View className="flex justify-center items-center flex-row gap-1 mt-2 mb-1">
          <Text style={styles.text}>{age} Yrs</Text>
          <Text style={styles.text}>({gender?.charAt(0)})</Text>
        </View>
        <Text style={styles.text}>
          {checkInTime ? format(new Date(checkInTime), "HH:mm") : "--"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: width * 0.2,
    height: 80,
    borderRadius: 5,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "white",
    textAlign: "center",
  },
  cardContainer: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "start",
    gap: 15,
  },
});

export default ViewCheckIns;
