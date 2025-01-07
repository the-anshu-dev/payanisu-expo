import { View, Text, ActivityIndicator,TextInput, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import DropDownPicker from "react-native-dropdown-picker";

const form = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [roles, setRoles] = useState([
    { label: "Admin", value: "admin" },
    { label: "Coordinator", value: "coordinator" },
  ]);

  const handleLogin = () => {
    if (value == null) {
      setError("Please select a role");
      return;
    }
  };

  return (
    <View className="h-full w-full">
      <View className="absolute top-0 left-0 h-full w-full">
        <Image
          className="h-full w-full"
          source="https://images.pexels.com/photos/27377328/pexels-photo-27377328/free-photo-of-people-walking-down-a-steep-hill-in-the-jungle.jpeg?auto=compress&cs=tinysrgb&w=600"
        />
      </View>
      <View className="w-full h-full bg-black/60 flex justify-center items-center space-y-10">
        <View>
          <Text className="text-white text-5xl font-bold text-center mt-10">
            Trekies.
          </Text>
        </View>
        <View className="z-50 w-full px-12">
          <View className="h-12">
            {error && (
              <View className="flex justify-center items-center space-x-5">
                <Ionicons name="warning-outline" size={24} color="red" />
                <Text className="text-lg font-bold text-red-600 text-center">
                  {error}
                </Text>
              </View>
            )}
          </View>
          <View className="mt-5">
            <DropDownPicker
              open={open}
              value={value}
              items={roles}
              setOpen={setOpen}
              setValue={setValue}
              setItems={setRoles}
              className="bg-[#228B22] text-white"
            />
            <TextInput
              type="email"
              className="w-full h-[50px] p-2 text-lg rounded-[10px] border-2 border-[#228B22] mt-5 text-white lowercase"
              placeholder="Email"
              placeholderTextColor={"#8c92ac"}
              keyboardAppearance="light"
              keyboardType="email-address"
              cursorColor={"green"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextInput
              type="password"
              className="w-full h-[50px] p-2 rounded-[10px] text-lg border-2 border-[#228B22] mt-5 text-white lowercase"
              placeholder="Password"
              cursorColor={"green"}
              placeholderTextColor={"#8c92ac"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <TouchableOpacity>
              <Text className="text-white text-right mt-3">
                Forgot Password ?
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={handleLogin}
            className="py-3 flex justify-center items-center mt-10 bg-[#228B22] w-full rounded-[10px]"
          >
            {loading ? (
              <ActivityIndicator size={24} color="#00ff00" />
            ) : (
              <Text className="text-white text-center font-bold text-lg">
                Proceed
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/login")}
            className="w-full py-2 px-2 rounded-[10px] border-2 border-[#228B22] mt-5 text-white"
          >
            <Text className="text-white text-center font-bold text-lg">
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default form;

