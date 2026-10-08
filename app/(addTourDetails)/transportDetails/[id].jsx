import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { TouchableOpacity } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { Modalize } from "react-native-modalize";
import { Checkbox } from "react-native-paper";
import {
  showError,
  showSuccess,
  showWarning,
} from "../../../utils/toastHelper";

const { width, height } = Dimensions.get("window");

const TransportDetails = () => {
  const { id, tourId } = useLocalSearchParams();

  const [boardingPoints, setBoardingPoints] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [bookedGuests, setAllBookedGuests] = useState([]);
  const [selectedGuests, setSelectedGuests] = useState([]);
  const [addingGuests, setAddingGuests] = useState(false);
  const [transportAllocatedGuests, setTransportAllocatedGuests] = useState([]);
  const [boardingPointId, setBoardingPointId] = useState(null);
  const alreadyTransportAllocatedGuests = transportAllocatedGuests.map(
    (item) => item.bookingId
  );

  const addGuestsRef = useRef();

  const toggleGuestSelection = (bookingId) => {
    if (alreadyTransportAllocatedGuests.includes(bookingId)) {
      showWarning("Guest already added to transport.");
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
      showError(error.message || "Please try again.");
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
      showError(error.message || "Please try again.");
    }
  };

  const handleAddGuests = async () => {
    if (selectedGuests.length === 0) {
      showWarning("Please select guests to add.");
      return;
    }

    setAddingGuests(true);
    try {
      for (let bookingId of selectedGuests) {
        const body = {
          bookingId: bookingId,
          transportId: id,
          tourId: tourId,
          boardingPointId:boardingPointId
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
      showSuccess("Guests added successfully.");
      addGuestsRef.current?.close();
      onRefresh();
    } catch (error) {
      showError(error.message || "Please try again.");
    } finally {
      setAddingGuests(false);
    }
  };

  const handleGetAllocatedGuests = async () => {
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
      showError(error.message || "Please try again.");
    }
  };

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

  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, [])
  );


  const handleOpenGuestList = () => {
    addGuestsRef.current?.open()
  }


  return (
    <SafeAreaView
      style={{ height: "100%", width: "100%" }}
      edges={["right", "bottom", "left"]}
    >
      <View style={styles.screenContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 80 }}
          style={{ width: "100%" }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#228B22", "red"]}
            />
          }
        >
          <View style={{ paddingVertical: 10, paddingHorizontal: 20, gap: 5 }}>
            {boardingPoints.length > 0 ? (
              <>
                {boardingPoints.map((boardingPoint, index) => (
                  <BoardingPointCard
                    key={index}
                    boardingPoint={boardingPoint}
                    onRefresh={onRefresh}
                    setRefreshing={setRefreshing}
                    openGuestList={handleOpenGuestList}
                    setBoardingPointId={setBoardingPointId}
                  />
                ))}
              </>
            ) : (
              <View style={styles.noBoardingContainer}>
                <Ionicons name="trash-bin-outline" color={"#228B22"} size={28} />
                <Text
                  style={{
                    marginTop: 20,
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#228B22",
                  }}
                >
                  No Boarding Points Added Yet
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
        <View className="flex justify-center items-center mb-4">
         
          <TouchableOpacity
            style={[styles.buttons, { backgroundColor: "#228B22" }]}
            activeOpacity={0.9}
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
              <View style={styles.guestCardContainer} key={item._id}>
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
                      : "#228B22"
                  }
                  style={{ marginRight: 10, marginLeft: 10 }}
                />
                <View
                  style={{
                    backgroundColor:
                      item?.gender.toLowerCase() === "male" ? "red" : "#228B22",
                    height: 20,
                    width: 20,
                    borderRadius: 20,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "white", fontSize: 12 }}>
                    {item?.gender?.charAt(0)}
                  </Text>
                </View>
                <Text style={{ width: width * 0.4 }}>{item?.name}</Text>
                <Text>{item?.age} Yrs</Text>
              </View>
            ))}
          </ScrollView>
          <View style={styles.modalizeButtonContainer}>
            <TouchableOpacity
              onPress={handleAddGuests}
              activeOpacity={0.9}
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
    </SafeAreaView>
  );
};

const BoardingPointCard = ({ boardingPoint, onRefresh, setRefreshing, openGuestList, setBoardingPointId }) => {
  const {
    _id: id,
    boardingPointName: name,
    location,
    boardingPointDate: date,
    boardingPointTime: time,
  } = boardingPoint;

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
      showSuccess("Boarding point deleted successfully.");
      onRefresh();
    } catch (error) {
      showError(error.message || "Please try again.");
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
        {/* <Text style={{ fontSize: 16, fontWeight: "600" }}>Boarding Point</Text> */}
        <TouchableOpacity onPress={handleDelete} activeOpacity={0.9}>
          <Ionicons name="trash-outline" color={"red"} size={18} />
        </TouchableOpacity>

        <TouchableOpacity style={[
          styles.buttons,
          { backgroundColor: "white", borderWidth: 1 },
        ]} onPress={() => {

          setBoardingPointId(id)
          openGuestList()
        }
        } activeOpacity={0.9}>
          <Text style={styles.buttonText}>Add Guests</Text>
          {/* <Text>Add Guest</Text> */}
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
            {date
              ? (() => {
                try {
                  return format(new Date(date), "dd MMM yyyy");
                } catch (error) {
                  return "Invalid Date";
                }
              })()
              : "N/A"}
          </Text>
        </View>
        <View style={styles.fieldContainer}>
          <Text style={styles.boardingPointFieldPlaceHolderText}>
            Boarding Time
          </Text>
          <Text style={styles.boardingPointFieldValueText}>
            {time
              ? (() => {
                try {
                  return format(new Date(time), "hh:mm a");
                } catch (error) {
                  return "Invalid Time";
                }
              })()
              : "N/A"}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    height: "100%",
    width: "100%",
    display: "relative",
  },
  buttonsContainer: {
    position: "absolute",
    bottom: 0,
    width: width,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    backgroundColor: "white",
    paddingVertical: 10,
  },
  buttons: {
    width: width * 0.42,
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
    backgroundColor: "#228B22",
    width: width * 0.9,
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
    paddingHorizontal: 16,
    backgroundColor: "white",
    elevation: 8,
    gap: 10,
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