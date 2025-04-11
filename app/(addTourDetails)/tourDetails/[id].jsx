import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { router, useLocalSearchParams } from "expo-router";
import { useSelector } from "react-redux";
import LabelValue from "../../../components/UI/LabelValue";
import { formatDate } from "../../../utils/helpers";
import { ScrollView } from "react-native-gesture-handler";
import { showError } from "../../../utils/toastHelper";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

const TourDetails = () => {
  const { id } = useLocalSearchParams();
  const { tour } = useSelector((state) => state.tour);
  const { user } = useSelector((state) => state.user);

  const tourData = tour.find((item) => item._id === id);

  const handleEditTour = () => {
    if (tourData.email !== user.email) {
      showError("You are not authorized to edit this tour");
      return;
    }
    router.push(`/(addTourDetails)/editTourDetails/${id}`);
  };

  return (
    <View className="px-3 h-full justify-between items-center">
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="w-full"
        contentContainerStyle={{ alignItems: "center", paddingBottom: 50 }}
      >
        <LabelValue label={"Tour Name"} value={tourData?.name} />
        <LabelValue label={"Location"} value={tourData?.location} />
        <LabelValue label={"Description"} value={tourData?.description} />
        <LabelValue label={"Allowed Persons"} value={tourData?.total_seats} />
        <LabelValue
          label={"Tour Date"}
          value={`${formatDate(tourData?.tour_start)} - ${formatDate(
            tourData?.tour_end
          )}`}
        />
        <LabelValue
          label={"Booking Close Before"}
          value={formatDate(tourData?.booking_close)}
        />
        <LabelValue
          label={"Tour Cost Per Seat (INR)"}
          value={tourData?.tour_cost}
        />
        <LabelValue
          label={"Admin can reject ?"}
          value={tourData?.can_admin_reject ? "Yes" : "No"}
        />
        <LabelValue
          label={"Payment gateway enabled ?"}
          value={tourData?.enable_payment_getway ? "Yes" : "No"}
        />
        <View className="w-full">
          {tourData.consentFormUrl && (
            <View className="flex flex-row justify-between item-center border border-slate-500/50 w-full rounded-lg px-4 py-2 mt-4 bg-white">
              <View className="flex flex-row justify-center items-center gap-5">
                <Ionicons
                  name="document-text-outline"
                  color={"#228B22"}
                  size={24}
                />
                <Text style={{ color: "#228B22", fontWeight: "400" }}>
                  Consent Form
                </Text>
              </View>
            </View>
          )}
        </View>
        {tourData.images &&
          tourData.images.map((image, index) => (
            <Image
              key={index}
              source={image.url}
              alt="tour"
              style={{
                height: 200,
                width: "100%",
                borderRadius: 10,
                marginVertical: 10,
              }}
            />
          ))}
      </ScrollView>
      <View className="w-full px-3 py-2">
        <TouchableOpacity
          onPress={handleEditTour}
          activeOpacity={0.9}
          className="w-full py-2 flex flex-row justify-center items-center bg-[#228B22] h-14 gap-2 rounded-lg"
        >
          <Text className="text-white text-xl font-semibold">Edit Tour</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TourDetails;
