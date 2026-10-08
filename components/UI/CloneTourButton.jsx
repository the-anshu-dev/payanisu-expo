import { Ionicons } from "@expo/vector-icons";
import { Alert, TouchableOpacity } from "react-native";

export const CloneTourButton = () => (
  <TouchableOpacity onPress={() => Alert.alert("Copy")}>
    <Ionicons
      name="copy-outline"
      size={24}
      color="green"
      style={{ marginRight: 16 }}
    />
  </TouchableOpacity>
);
