import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Image } from "expo-image";
import trash from "../../assets/trash-04.svg";

const MemberCard = ({ data }) => {
  const id = data._id;

  const handleDeleteMember = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/member/delete-member?id=${id}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        console.log("Member deleted successfully !");
      } else {
        console.log("Failed to delete member");
      }
    } catch (error) {
      console.log("Some error occured!");
    }
  };

  
  return (
    <View className="h-48 w-full mt-4 bg-white shadow-xl shadow-black/70 rounded-lg justify-start items-center ">
      <View className="flex flex-row w-full justify-between items-center pr-3 ">
        <View className="shadow-sm rounded-md py-2 px-2 space-y-1 ">
          <Text className=" text-xs text-gray-600  ">Name</Text>
          <Text className="text-lg">{data.name}</Text>
        </View>
        <TouchableOpacity activeOpacity={0.8} onPress={handleDeleteMember}>
          <Image source={trash} className="h-5 w-5" />
        </TouchableOpacity>
      </View>
      <View className="w-full px-2 mt-2">
        <View className="flex flex-row justify-between items-center">
          <View className="w-[50%] ">
            <Text className="font-semibold text-sm text-slate-500/70">
              Age(Yr)
            </Text>
            <Text className="font-semibold text-base">{data.age}</Text>
          </View>
          <View className=" w-[50%]">
            <Text className="font-semibold text-sm text-slate-500/70">
              Gender
            </Text>
            <Text className="font-semibold text-base">{data.gender}</Text>
          </View>
        </View>
        <View className="flex flex-row justify-between items-center mt-2">
          <View className="w-[50%] ">
            <Text className="font-semibold text-sm text-slate-500/70">
              Relation
            </Text>
            <Text className="font-semibold text-base">{data.relation}</Text>
          </View>
          <View className="w-[50%] ">
            <Text className="font-semibold text-sm text-slate-500/70">
              Contact No.
            </Text>
            <Text className="font-semibold text-base">{data.contact}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default MemberCard;
