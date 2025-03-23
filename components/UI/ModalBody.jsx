import { View, Text, TextInput, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import DropDownPicker from "react-native-dropdown-picker";
import { ActivityIndicator } from "react-native-paper";
import { showError, showSuccess } from "../../utils/toastHelper";

const ModalBody = ({
  guests,
  setModalVisible,
  accommodationId,
  tourId,
  guestsToDisable,
  getAllocationsByGuestHouseId,
  getAllAllocations,
  getBookedUsers,
}) => {
  const allocatedGuestIds = guestsToDisable.map(
    (allocated) => allocated.bookingId
  );

  const guestsDataArray = guests.map((guest, index) => {
    return {
      label: guest.name,
      value: guest._id,
      disabled: allocatedGuestIds.includes(guest._id),
    };
  });

  const [roomNumber, setRoomNumber] = useState("");

  const [occupancyValue, setOccupancyValue] = useState("");
  const [occupancyOptions, setOccupancyOptions] = useState([
    { label: "Single", value: "Single" },
    { label: "Double", value: "Double" },
    { label: "Triple", value: "Triple" },
  ]);

  const [roomTypeValue, setRoomTypeValue] = useState("");
  const [roomTypeOptions, setRoomTypeOptions] = useState([
    { label: "AC", value: "AC" },
    { label: "Non-AC", value: "Non-AC" },
    { label: "Executive", value: "Executive" },
    { label: "Dormitory", value: "Dormitory" },
  ]);

  const [guestsValue, setGuestsValue] = useState([]);
  const [guestsOptions, setGuestsOptions] = useState(guestsDataArray);

  const [openDropdown, setOpenDropdown] = useState(null);

  const [loading, setLoading] = useState(false);

  const toggleOpen = (key) => {
    setOpenDropdown((prev) => (prev === key ? null : key));
  };

  const handleAllocateRoom = async () => {
    setLoading(true);
    try {
      for (let item of guestsValue) {
        const body = {
          bookingId: item,
          accommodationId: accommodationId,
          tourId: tourId,
          roomNumber: roomNumber,
          roomType: roomTypeValue,
          occupancy: occupancyValue,
        };

        const response = await fetch(
          `${process.env.EXPO_PUBLIC_BASE_URL}/api/allocated/create`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          }
        );

        if (response.status !== 201) {
          throw new Error("Failed to allocate room");
        }
      }
      setModalVisible(false);
      showSuccess("Room allocated successfully.");
      getAllocationsByGuestHouseId();
      getAllAllocations();
      getBookedUsers();
    } catch (error) {
      showError(error.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={{
        backgroundColor: "white",
        width: "100%",
      }}
    >
      <View
        style={{ backgroundColor: "white", paddingVertical: 5, zIndex: 1000 }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ fontWeight: "600", fontSize: 16 }}>Room 1</Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 8,
            zIndex: openDropdown === "occupancy" ? 1000 : 1,
          }}
        >
          <View
            style={{
              padding: 8,
              backgroundColor: "white",
              borderRadius: 8,
              width: "48%",
              elevation: 8,
            }}
          >
            <Text style={{ fontSize: 12, color: "gray" }}>Room no</Text>
            <TextInput
              keyboardType="number-pad"
              placeholder="Number"
              onChangeText={(text) => setRoomNumber(text)}
              style={{ marginTop: 4 }}
            />
          </View>
          <View
            style={{
              padding: 8,
              backgroundColor: "white",
              borderRadius: 8,
              width: "48%",
              elevation: 8,
            }}
          >
            <Text style={{ fontSize: 12, color: "gray" }}>Occupancy</Text>
            <DropDownPicker
              open={openDropdown === "occupancy"}
              setOpen={() => toggleOpen("occupancy")}
              value={occupancyValue}
              items={occupancyOptions}
              setItems={setOccupancyOptions}
              setValue={setOccupancyValue}
              style={{ borderWidth: 0, marginTop: 5 }}
              dropDownContainerStyle={{
                borderWidth: 0,
                zIndex: 1000,
              }}
            />
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 8,
            zIndex: openDropdown === "guest" ? 1000 : 1,
          }}
        >
          <View
            style={{
              padding: 8,
              backgroundColor: "white",
              borderRadius: 8,
              width: "48%",
              elevation: 8,
            }}
          >
            <Text style={{ fontSize: 12, color: "gray" }}>Guest</Text>
            <DropDownPicker
              multiple={true}
              min={0}
              max={3}
              autoScroll={true}
              placeholder={"Select guest"}
              open={openDropdown === "guest"}
              setOpen={() => toggleOpen("guest")}
              value={guestsValue}
              items={guestsOptions}
              setItems={setGuestsOptions}
              setValue={setGuestsValue}
              style={{ borderWidth: 0, marginTop: 5 }}
              dropDownContainerStyle={{
                borderWidth: 0,
                zIndex: 1000,
                maxHeight: 200,
              }}
              listMode="SCROLLVIEW"
              scrollViewProps={{
                nestedScrollEnabled: true,
                showsVerticalScrollIndicator: false,
              }}
              disabledItemLabelStyle={{
                color: "#228B22",
              }}
              listItemLabelStyle={{
                color: "black",
              }}
            />
          </View>
          <View
            style={{
              padding: 8,
              backgroundColor: "white",
              borderRadius: 8,
              width: "48%",
              elevation: 8,
            }}
          >
            <Text style={{ fontSize: 12, color: "gray" }}>Room Type</Text>
            <DropDownPicker
              open={openDropdown === "roomType"}
              setOpen={() => toggleOpen("roomType")}
              value={roomTypeValue}
              items={roomTypeOptions}
              setItems={setRoomTypeOptions}
              setValue={setRoomTypeValue}
              style={{ borderWidth: 0, marginTop: 5 }}
              dropDownContainerStyle={{
                borderWidth: 0,
                zIndex: 1000,
              }}
            />
          </View>
        </View>
      </View>
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          display: "flex",
          justifyContent: "center",
          marginTop: 16,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setModalVisible(false)}
          style={{
            backgroundColor: "gray",
            height: 40,
            borderRadius: 8,
            width: 130,
            marginHorizontal: 5,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleAllocateRoom}
          activeOpacity={0.9}
          style={{
            backgroundColor: "#228B22",
            height: 40,
            borderRadius: 8,
            width: 130,
            marginHorizontal: 5,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={{ color: "white", fontWeight: "bold" }}>Save</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ModalBody;
