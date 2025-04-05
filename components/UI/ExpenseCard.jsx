import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { Text, View } from "react-native";
import { formatDate, shorten } from "../../utils/helpers";

const ExpenseCard = ({ getIconName, item, handleShowExpenseDetails }) => {
  return (
    <View
      className={`flex flex-row w-full justify-between items-center px-2 py-2 bg-white shadow-xl shadow-black/50 rounded-lg mb-2`}
    >
      <View className="flex flex-row w-[40%] justify-start items-center gap-3">
        <Ionicons
          name={getIconName(item.category)}
          size={24}
          color={"#228B22"}
        />
        <View>
          <Text className={`font-semibold`}>{shorten(item.category, 20)}</Text>
          <Text className="text-xs text-gray-500">
            {formatDate(item?.createdAt)}
          </Text>
        </View>
      </View>
      <Text>{shorten(item.name, 12)}</Text>
      <View className="flex flex-row justify-center items-center gap-3">
        <Text className={`w-14 text-right font-medium  `}>₹ {item.amount}</Text>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => handleShowExpenseDetails(item._id)}
        >
          <Ionicons
            name="document-attach-outline"
            size={20}
            color={"#228B22"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ExpenseCard;
