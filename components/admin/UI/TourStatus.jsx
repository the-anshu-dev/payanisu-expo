import { View, Text } from "react-native";
import { isBefore, isAfter, parseISO } from "date-fns";

const TourStatus = ({ status, tourStart, tourEnd }) => {
  const today = new Date();
  const startDate = parseISO(tourStart);
  const endDate = parseISO(tourEnd);

  let statusText = "";
  let bgColor = "";
  let textColor = "";

  if (!status) {
    statusText = "Unpublished";
    bgColor = "bg-gray-700/20";
    textColor = "text-gray-600";
  } else if (isBefore(today, startDate)) {
    statusText = "Pending";
    bgColor = "bg-yellow-700/20";
    textColor = "text-yellow-600";
  } else if (isAfter(today, endDate)) {
    statusText = "Completed";
    bgColor = "bg-[#228B22]/20";
    textColor = "text-[#228B22]";
  } else {
    statusText = "Started";
    bgColor = "bg-blue-700/20";
    textColor = "text-blue-600";
  }

  return (
    <View className={`mt-5 px-4 py-1 rounded-full ${bgColor}`}>
      <Text className={`font-medium capitalize ${textColor}`}>
        {statusText}
      </Text>
    </View>
  );
};

export default TourStatus;
