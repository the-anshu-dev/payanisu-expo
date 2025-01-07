import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { Modalize } from "react-native-modalize";
import {  Checkbox } from "react-native-paper";

const { width, height } = Dimensions.get("window");

const TransportDetails = () => {
  const { id, tourId } = useLocalSearchParams();

  const [boardingPoints, setBoardingPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [bookedGuests, setAllBookedGuests] = useState([]);

  const [selectedGuests, setSelectedGuests] = useState([]);

  const [addingGuests, setAddingGuests] = useState(false);

  const [transportAllocatedGuests, setTransportAllocatedGuests] = useState([]);

  const alreadyTransportAllocatedGuests = transportAllocatedGuests.map(
    (item) => item.bookingId
  );

  const addGuestsRef = useRef();

  const toggleGuestSelection = (bookingId) => {
    if (alreadyTransportAllocatedGuests.includes(bookingId)) {
      Alert.alert("Oops", "Guest already added to transport.");
      return;
    }
    setSelectedGuests((prevSelected) => {
      if (prevSelected.includes(bookingId)) {
        return prevSelected.filter((id) => id !== bookingId);
      } else {
        return [...prevSelected, bookingId];
      }
    });
  };

  const handleGetBoardingPoints = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/board/get?transportId=${id}`
      );
      if (response.status !== 200) {
        throw new Error("Failed to get boarding points");
      }
      const result = await response.json();
      setBoardingPoints(result);
    } catch (error) {
      console.log("error:", error);
      Alert.alert("Oops", "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const getBookedGuests = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/booking/get?id=${tourId}`
      );

      if (response.status !== 200) {
        throw new Error("Failed to fetch booked users");
      }

      const result = await response.json();
      setAllBookedGuests(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddGuests = async () => {
    if (selectedGuests.length === 0) {
      Alert.alert("Oops", "Please select guests to add.");
      return;
    }

    setAddingGuests(true);
    try {
      for (let bookingId of selectedGuests) {
        const body = {
          bookingId: bookingId,
          transportId: id,
          tourId: tourId,
        };

        const response = await fetch(
          `${process.env.EXPO_PUBLIC_BASE_URL}/api/allocatedTransport/create`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          }
        );
        if (response.status !== 201) {
          throw new Error("Failed to add guests.");
        }
      }
      Alert.alert("Success", "Guests added successfully.");
      addGuestsRef.current?.close();
      onRefresh();
    } catch (error) {
      console.log("Error:", error);
      Alert.alert("Oops", "Something went wrong.\nPlease try again.");
    } finally {
      setAddingGuests(false);
    }
  };

  const handleGetAllocatedGuests = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/allocatedTransport/get?tourId=${tourId}`
      );
      if (response.status !== 200) {
        throw new Error("Failed to get allocated guests.");
      }
      const result = await response.json();
      setTransportAllocatedGuests(result);
    } catch (error) {
      console.log("Error:", error);
      Alert.alert("Oops", "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  console.log("boarding points--<", boardingPoints);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await handleGetBoardingPoints();
      await handleGetAllocatedGuests();
      await getBookedGuests();
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    onRefresh();
  }, []);

  return (
    <>
      <View style={styles.screenContainer}>
        <ScrollView
          style={{ width: "100%", height: "100%", paddingBottom: 120 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["green", "red"]}
            />
          }
        >
          <View style={{ paddingHorizontal: 5, paddingBottom: 10 }}>
            {boardingPoints.length > 0 ? (
              <>
                {boardingPoints.map(
                  ({
                    boardingPointName,
                    boardingPointTime,
                    boardingPointDate,
                    location,
                    _id,
                  }) => (
                    <BoardingPointCard
                      key={_id+boardingPointName}
                      name={boardingPointName}
                      date={boardingPointDate}
                      time={boardingPointTime}
                      location={location}
                      id={_id}
                      onRefresh={onRefresh}
                      setRefreshing={setRefreshing}
                    />
                  )
                )}
              </>
            ) : (
              <View style={styles.noBoardingContainer}>
                <Ionicons name="trash-bin-outline" color={"green"} size={28} />
                <Text
                  style={{
                    marginTop: 20,
                    fontSize: 16,
                    fontWeight: "600",
                    color: "green",
                  }}
                >
                  No Boarding Points Added Yet
                </Text>
              </View>
            )}
          </View>
          {/* <View>
            <Text
              style={{
                fontSize: 18,
                color: "green",
                fontWeight: "600",
                paddingBottom: 10,
                width: "100%",
                textAlign: "center",
              }}
            >
              Allocated Guests
            </Text>
          </View> */}
          {/* <View style={{ paddingHorizontal: 6 }}>
            {alreadyAllocatedGuestDetails.map((item) => (
              <TransportAllocatedGuests item={item} key={item._id} />
            ))}
          </View> */}
        </ScrollView>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[
              styles.buttons,
              { backgroundColor: "white", borderWidth: 1 },
            ]}
            activeOpacity={0.6}
            onPress={() => addGuestsRef.current?.open()}
          >
            <Text style={styles.buttonText}>Add Guests</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.buttons, { backgroundColor: "green" }]}
            activeOpacity={0.6}
            onPress={() =>
              router.push(`/(addTourDetails)/addBoardingPoint/${id}`)
            }
          >
            <Text style={[styles.buttonText, { color: "white" }]}>
              Add Boarding Point
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <Modalize
        ref={addGuestsRef}
        adjustToContentHeight
        modalStyle={{ borderTopEndRadius: 10 }}
        onClose={() => setSelectedGuests([])}
      >
        <View style={{ height: 300 }}>
          <Text
            style={{
              width: "100%",
              textAlign: "center",
              paddingVertical: 10,
              fontWeight: "600",
              fontSize: 18,
            }}
          >
            Guests
          </Text>
          <ScrollView nestedScrollEnabled={false} contentContainerStyle={{}}>
            {bookedGuests.map((item) => (
              <View style={styles.guestCardContainer} key={item.bookingId}>
                <Checkbox
                  status={
                    selectedGuests.includes(item._id) ||
                    alreadyTransportAllocatedGuests.includes(item._id)
                      ? "checked"
                      : "unchecked"
                  }
                  onPress={() => toggleGuestSelection(item._id)}
                  color={
                    alreadyTransportAllocatedGuests.includes(item._id)
                      ? "gray"
                      : "green"
                  }
                />
                <View
                  style={{
                    backgroundColor:
                      item?.ProfileData[0]?.gender.toLowerCase() == "male"
                        ? "red"
                        : "green",
                    height: 20,
                    width: 20,
                    borderRadius: 20,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "white", fontSize: 12 }}>
                    {item?.ProfileData[0]?.gender?.charAt(0)}
                  </Text>
                </View>
                <Text style={{width:width*0.4}}>{item?.ProfileData[0]?.name}</Text>
                <Text>{item?.ProfileData[0]?.age} Yrs</Text>
              </View>
            ))}
          </ScrollView>
          <View style={styles.modalizeButtonContainer}>
            <TouchableOpacity
              onPress={handleAddGuests}
              activeOpacity={0.7}
              style={styles.modalizeButton}
            >
              {addingGuests ? (
                <ActivityIndicator color="white" size={"small"} />
              ) : (
                <Text
                  style={{ color: "white", fontSize: 16, fontWeight: "600" }}
                >
                  Add
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modalize>
    </>
  );
};

const BoardingPointCard = ({
  name,
  location,
  time,
  date,
  id,
  onRefresh,
  setRefreshing,
}) => {
  const handleDelete = async () => {
    setRefreshing(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/board/delete?id=${id}`,
        {
          method: "DELETE",
        }
      );
      if (response.status !== 200) {
        throw new Error("Failed to delete boarding point.");
      }
      Alert.alert("Deleted", "Boarding point successfully deleted.");
      onRefresh();
    } catch (error) {
      console.log("Error:", error);
      Alert.alert("Oops", "Something went wrong.\nPlease try again.");
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={styles.boardingPointContainer}>
      <View
        style={{
          width: "100%",
          justifyContent: "space-between",
          alignItems: "center",
          display: "flex",
          flexDirection: "row",
          paddingBottom: 8,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "600" }}>Boading Point</Text>
        <TouchableOpacity onPress={handleDelete} activeOpacity={0.5}>
          <Ionicons name="trash-outline" color={"red"} size={18} />
        </TouchableOpacity>
      </View>
      <View style={styles.boardingPointFieldBox}>
        <View style={styles.fieldContainer}>
          <Text style={styles.boardingPointFieldPlaceHolderText}>
            Boarding Point Name
          </Text>
          <Text style={styles.boardingPointFieldValueText}>{name}</Text>
        </View>
        <View style={styles.fieldContainer}>
          <Text style={styles.boardingPointFieldPlaceHolderText}>
            Boarding Point Location
          </Text>
          <Text style={styles.boardingPointFieldValueText}>{location}</Text>
        </View>
      </View>
      <View style={styles.boardingPointFieldBox}>
        <View style={styles.fieldContainer}>
          <Text style={styles.boardingPointFieldPlaceHolderText}>
            Boarding Date
          </Text>
          <Text style={styles.boardingPointFieldValueText}>
            {format(date, "yy-MM-dd")}
          </Text>
        </View>
        <View style={styles.fieldContainer}>
          <Text style={styles.boardingPointFieldPlaceHolderText}>
            Boarding time
          </Text>
          <Text style={styles.boardingPointFieldValueText}>
            {format(time, "HH:mm")}
          </Text>
        </View>
      </View>
    </View>
  );
};

const TransportAllocatedGuests = ({ item }) => {
  return (
    <View
      style={[
        styles.guestCardContainer,
        {
          marginBottom: 8,
          paddingVertical: 5,
          borderRadius: 6,
        },
      ]}
      key={item._id}
    >
      <View
        style={{
          backgroundColor:
            item?.bookingData?.gender.toLowerCase() === "male"
              ? "red"
              : "green",
          height: 20,
          width: 20,
          borderRadius: 20,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontSize: 12 }}>
          {item?.bookingData?.gender?.charAt(0)}
        </Text>
      </View>
      <Text>{item?.bookingData?.name}</Text>
      <Text>{item?.bookingData?.age} Yrs</Text>
      <TouchableOpacity onPress={() => {}} activeOpacity={0.5}>
        <Ionicons name="trash-outline" color={"red"} size={18} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    height: "100%",
    width: "100%",
    position: "relative",
    paddingHorizontal: 14,
    paddingTop: 16,
  },
  buttonsContainer: {
    position: "absolute",
    bottom: 0,
    width: width,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 30,
    paddingVertical: 20,
  },
  buttons: {
    width: width * 0.4,
    height: height * 0.05,
    borderRadius: 6,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontWeight: "600",
  },
  images: {
    width: width * 0.24,
    height: height * 0.12,
    borderRadius: 6,
    marginRight: 8,
  },
  boardingPointContainer: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: "white",
    elevation: 8,
    marginBottom: 8,
  },
  boardingPointFieldBox: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  boardingPointFieldPlaceHolderText: {
    fontSize: 12,
    color: "gray",
  },
  boardingPointFieldValueText: {
    fontWeight: "500",
    paddingTop: 5,
  },
  fieldContainer: {
    width: "50%",
    marginBottom: 14,
  },
  modalizeButton: {
    backgroundColor: "green",
    width: width * 0.5,
    height: height * 0.05,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  modalizeButtonContainer: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: height * 0.08,
  },
  guestCardContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    backgroundColor: "white",
    elevation: 8,
  },
  noBoardingContainer: {
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
    backgroundColor: "white",
  },
});

export default TransportDetails;
