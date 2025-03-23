import { View, Text } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import EditIcon from "../../assets/edit.svg";
import { ActivityIndicator } from "react-native-paper";
import { showError, showSuccess } from "../../utils/toastHelper";

const AllocatedRoomCard = ({
  allocation,
  getAllocationsByGuestHouseId,
  getBookedUsers,
  getAllAllocations,
  setEditModalVisible,
}) => {
  const [deleting, setDeleting] = React.useState(false);

  const handleDeleteAllocation = async () => {
    setDeleting(true);
    try {
      const idsToDelete = allocation.bookingIds;
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
      showSuccess("Allocations deleted.");
      getAllocationsByGuestHouseId();
      getBookedUsers();
      getAllAllocations();
    } catch (error) {
      showError(error.message || "Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: "gray",
        padding: 8,
        borderRadius: 8,
        marginTop: 16,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text>Room 1</Text>
        <View className="flex flex-row justify-center items-center gap-5 pr-2">
          <TouchableOpacity
            onPress={() => setEditModalVisible(true)}
            activeOpacity={0.9}
          >
            <EditIcon height={20} width={20} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDeleteAllocation}
            activeOpacity={0.9}
          >
            {deleting ? (
              <ActivityIndicator
                size={"small"}
                color="#228B22"
                style={{ transform: [{ scale: 0.5 }] }}
              />
            ) : (
              <Ionicons name="trash-outline" color={"red"} size={16} />
            )}
          </TouchableOpacity>
        </View>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 8,
        }}
      >
        <View
          style={{
            padding: 8,
            backgroundColor: "white",
            borderRadius: 8,
            width: "48%",
            shadowColor: "black",
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 8,
          }}
        >
          <Text style={{ fontSize: 12, color: "gray" }}>Room no</Text>
          <Text style={{ marginTop: 4, fontSize: 14, color: "black" }}>
            {allocation?.roomNo}
          </Text>
        </View>
        <View
          style={{
            padding: 8,
            backgroundColor: "white",
            borderRadius: 8,
            width: "48%",
            shadowColor: "black",
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 8,
          }}
        >
          <Text style={{ fontSize: 12, color: "gray" }}>Occupancy</Text>
          <Text style={{ marginTop: 4, fontSize: 14, color: "black" }}>
            {allocation?.occupancy}
          </Text>
        </View>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 8,
        }}
      >
        <View
          style={{
            padding: 8,
            backgroundColor: "white",
            borderRadius: 8,
            width: "48%",
            shadowColor: "black",
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 8,
          }}
        >
          <Text style={{ fontSize: 12, color: "gray" }}>Guest</Text>
          <Text style={{ marginTop: 4, fontSize: 14, color: "black" }}>
            {allocation?.guestNames
              .map((guest) => guest.split(" ")[0])
              .join(",  ")}
          </Text>
        </View>
        <View
          style={{
            padding: 8,
            backgroundColor: "white",
            borderRadius: 8,
            width: "48%",
            shadowColor: "black",
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 8,
          }}
        >
          <Text style={{ fontSize: 12, color: "gray" }}>Room Type</Text>
          <Text style={{ marginTop: 4, fontSize: 14, color: "black" }}>
            {allocation?.roomType}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default AllocatedRoomCard;
