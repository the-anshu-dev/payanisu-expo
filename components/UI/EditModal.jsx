import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import React, { useState } from "react";
import DropDownPicker from "react-native-dropdown-picker";
import { ActivityIndicator } from "react-native-paper";

const EditModal = ({
  guests,
  accommodationId,
  tourId,
  allocations,
  getAllocationsByGuestHouseId,
  getAllAllocations,
  getBookedUsers,
  setEditModalVisible,
}) => {
  const guestsDataArray = guests.map((guest, index) => {
    return {
      label: guest.name,
      value: guest._id,
    };
  });

  const [roomNumber, setRoomNumber] = useState(allocations[0].roomNo);

  const [occupancyValue, setOccupancyValue] = useState(
    allocations[0].occupancy
  );

  const [occupancyOptions, setOccupancyOptions] = useState([
    { label: "Single", value: "Single" },
    { label: "Double", value: "Double" },
    { label: "Triple", value: "Triple" },
  ]);

  const [roomTypeValue, setRoomTypeValue] = useState(allocations[0].roomType);
  const [roomTypeOptions, setRoomTypeOptions] = useState([
    { label: "AC", value: "AC" },
    { label: "Non-AC", value: "Non-AC" },
    { label: "Executive", value: "Executive" },
    { label: "Dormitory", value: "Dormitory" },
  ]);

  const [guestsValue, setGuestsValue] = useState(allocations[0].bookingIds);
  const [guestsOptions, setGuestsOptions] = useState(guestsDataArray);

  const [openDropdown, setOpenDropdown] = useState(null);

  const [loading, setLoading] = useState(false);

  const toggleOpen = (key) => {
    setOpenDropdown((prev) => (prev === key ? null : key));
  };

  const handleUpdateAllocation = async () => {
    setLoading(true);
    try {
      const idsToDelete = allocations[0].bookingIds.filter(
        (value) => !guestsValue.includes(value)
      );

      const idsToUpdate = guestsValue.filter(
        (value) => !allocations[0].bookingIds.includes(value)
      );

      for (let id of idsToDelete) {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_BASE_URL}/api/allocated/delete?id=${id}`,
          {
            method: "DELETE",
          }
        );

        if (response.status !== 200) {
          throw new Error("Failed to delete allocation");
        }
      }

      for (let item of idsToUpdate) {
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

      setEditModalVisible(false);
      Alert.alert("Success", "Room allocation updated successfully.");
      getAllocationsByGuestHouseId();
      getAllAllocations();
      getBookedUsers();
    } catch (error) {
      console.log("error", error);
      Alert.alert("Error", "Failed to allocate room.Please try again.");
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
            <Text className="py-2 text-base font-medium">{roomNumber}</Text>
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
              disabled={true}
              setItems={setOccupancyOptions}
              setValue={(value) => setOccupancyValue(value)}
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
                color: "green",
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
              disabled={true}
              setItems={setRoomTypeOptions}
              setValue={(value) => setRoomTypeValue(value)}
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
          activeOpacity={0.7}
          onPress={() => setEditModalVisible(false)}
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
          onPress={handleUpdateAllocation}
          activeOpacity={0.7}
          style={{
            backgroundColor: "green",
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
            <Text style={{ color: "white", fontWeight: "bold" }}>Update</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EditModal;
