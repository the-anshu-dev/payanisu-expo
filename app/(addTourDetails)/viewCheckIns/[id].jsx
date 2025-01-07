import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  RefreshControl,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { useSelector } from "react-redux";
import LinearGradient from "react-native-linear-gradient";
import { Modalize } from "react-native-modalize";
import { MaterialIcons } from "@expo/vector-icons";
import { format } from "date-fns";
import { ActivityIndicator } from "react-native-paper";

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
      console.log(error);
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
      console.log("Error:", error);
      Alert.alert("Something went wrong", "Please try again.");
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
      console.log(body);

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

      Alert.alert("Checked-In", "Member successfully logged in.");
      handleGetCheckedInMembers();
      manualCheckInRef.current?.close();
    } catch (error) {
      console.log("Error:", error);
      Alert.alert("Failed", "Failed to check-in Member.\nPlease try again.");
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
      Alert.alert("Absented", "Member absented successfully.");
      handleGetCheckedInMembers();
      manualCheckInRef?.current?.close();
    } catch (error) {
      console.log("Error:", error);
      Alert.alert("Oops", "Something went wrong.\nPlease try again.");
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

      Alert.alert("Reset", "All checked ins deleted.");
      handleGetCheckedInMembers();
      resetAllRef.current?.close();
    } catch (error) {
      console.log("Error:", error);
      Alert.alert("Oops", "Something went wrong.\nPlease try again.");
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
    <>
      <View className="p-2 mt-2 h-full relative flex justify-center items-center">
        <View className="mb-3 w-full">
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            colors={["rgba(240, 101, 2, 0.2)", "rgba(0, 174, 255, 0.2)"]}
            className="rounded-lg"
          >
            <View
              className={`flex flex-row justify-between py-3 px-4 rounded-xl`}
            >
              <View className="space-y-2">
                <Text>Check Point</Text>
                <Text
                  className={`text-base font-medium `}
                >{`${checkPointData.name}`}</Text>
              </View>
              <View className="space-y-2">
                <Text>Checked In Members</Text>
                <Text
                  className={`text-xl text-green-700 font-medium text-right`}
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
            flexGrow: 1,
            display: "flex",
            justifyContent: "start",
            alignItems: "center",
          }}
          style={{ width: "100%" }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.cardContainer}>
            {allMembers.map((i) => (
              <CheckedInUserCard
                key={i._id}
                name={i?.ProfileData[0]?.name}
                email={i?.ProfileData[0]?.email}
                age={i?.ProfileData[0]?.age}
                gender={i?.ProfileData[0]?.gender}
                contact={i?.ProfileData[0]?.contact}
                emergency_contact={i?.ProfileData[0]?.emergency_contact}
                checkInTime={
                  checkedInMembers.find(
                    (member) => member.email === i?.ProfileData[0]?.email
                  )?.createdAt
                }
                checkInId={
                  checkedInMembers.find(
                    (member) => member.email === i?.ProfileData[0]?.email
                  )?._id
                }
                checkedIn={true}
                checkedInEmails={checkedInEmails}
                manualCheckInRef={manualCheckInRef}
                setAlreadyCheckedIn={setAlreadyCheckedIn}
                setCheckedInId={setCheckedInId}
                setModalDetails={setModalDetails}
              />
            ))}
          </View>
        </ScrollView>
        <View className="absolute bottom-6 h-16 flex justify-center items-center w-full ">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => resetAllRef.current?.open()}
            className="w-[300px] py-4 flex justify-center items-center rounded-lg border border-red-700"
          >
            <Text>Reset All Check-Ins</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Modalize ref={resetAllRef} adjustToContentHeight>
        <View style={{ padding: 20, alignItems: "center", paddingBottom: 30 }}>
          <MaterialIcons name="warning" size={48} color="red" />
          <Text
            style={{ fontSize: 18, fontWeight: "bold", marginVertical: 10 }}
          >
            Are you sure?
          </Text>
          <Text style={{ textAlign: "center", color: "#555" }}>
            Once you reset this, all your current data will be lost and cannot
            be recovered.
          </Text>
          <View
            style={{
              flexDirection: "row",
              marginTop: 20,
              width: "100%",
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity
              onPress={() => resetAllRef.current?.close()}
              style={{
                backgroundColor: "#ccc",
                height: height * 0.05,
                width: width * 0.4,
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
                width: width * 0.4,
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
        <View className="w-full justify-center items-center py-4">
          <Text className="text-lg">Guest Check-in</Text>
        </View>
        <View className="h-48 w-full justify-start items-center px-2">
          <View className="flex flex-row w-full justify-between items-center pr-3 ">
            <View className="shadow-sm rounded-md py-2 px-2 space-y-1 ">
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
              <ActivityIndicator color="green" size={"small"} />
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
              backgroundColor: allReadyCheckedIn ? "gray" : "green",
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
    </>
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
    <TouchableOpacity onPress={handleOpenModal} activeOpacity={0.6}>
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
              color: checkedInEmails.includes(email) ? "green" : "red",
              fontWeight: 600,
            },
          ]}
        >
          {name.split(" ")[0]}
        </Text>
        <View className="flex justify-center items-center flex-row space-x-1 mt-2 mb-1">
          <Text style={styles.text}>{age} Yrs</Text>
          <Text style={styles.text}>({gender.charAt(0)})</Text>
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
    width: width * 0.21,
    height: 80,
    borderRadius: 10,
    padding: 10,
    justifyContent: "center",
    marginBottom: 10,
    marginRight: 10,
    alignItems: "center",
  },
  text: {
    color: "white",
    textAlign: "center",
  },
  cardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    alignItems: "center",
  },
});

export default ViewCheckIns;
