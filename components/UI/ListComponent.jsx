import { Ionicons } from "@expo/vector-icons";
import { Text, View, useColorScheme } from "react-native";

const ListComponent = ({ icon, text, color }) => {

  return (
    <View className="flex flex-row space-x-2 mt-0.5 items-center">
      <Ionicons name={icon} size={24} color={color} />
      <Text>{text}</Text>
    </View>
  );
};

export default ListComponent;
