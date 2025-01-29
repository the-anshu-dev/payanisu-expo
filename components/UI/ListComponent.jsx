import { Ionicons } from "@expo/vector-icons";
import { Text, View, useColorScheme } from "react-native";

const ListComponent = ({ icon, text, color }) => {

  return (
    <View className="flex flex-row gap-2 items-center">
      <Ionicons name={icon} size={20} color={color} />
      <Text>{text}</Text>
    </View>
  );
};

export default ListComponent;
