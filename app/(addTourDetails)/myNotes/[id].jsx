import { View, Text, Alert, ScrollView,
  TextInput,
  TouchableOpacity, } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import trash from "../../../assets/trash-04.svg";
import { ActivityIndicator, Checkbox } from "react-native-paper";
import { Modalize } from "react-native-modalize";
import { Ionicons } from "@expo/vector-icons";

const Mynotes = () => {
  const { id } = useLocalSearchParams();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);

  const handleAddNotes = async () => {
    if (!title || !description) {
      Alert.alert("Fields empty", "Please enter Title and Description");
      return;
    }
    setLoading(true);
    const body = {
      tourId: id,
      title,
      description,
    };
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/notes/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      if (response.status !== 201) {
        throw new Error("Faild to add notes");
      }
      Alert.alert("Success", "Note Added.");
      addNotesRef.current?.close();
      handleGetNotes();
    } catch (error) {
      Alert.alert("Oops!", "Notes not added. \n\n Please try again..");
      console.log("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotes = async (noteId) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/notes/delete?id=${noteId}`,
        {
          method: "DELETE",
        }
      );

      if (response.status !== 200) {
        throw new Error("Failed to delete note");
      }
      Alert.alert("Deleted", "Note deleted successfully.");
      handleGetNotes();
    } catch (error) {
      Alert.alert("Oops!", "Note not deleted. Please try again.");
      console.log("Error:", error);
    }
  };

  const handleOnCheck = async (noteId, checked) => {
    try {
      const body = {
        checked: !checked,
      };
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/notes/update?id=${noteId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      if (response.status !== 201) {
        throw new Error("Failed to update note");
      }
      handleGetNotes();
    } catch (error) {
      Alert.alert("Oops!", "Note status not updated.\n\nPlease try again.");
      console.log("Error:", error);
    }
  };

  const handleGetNotes = async () => {
    setNotesLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/notes/get?tourId=${id}`
      );

      if (response.status !== 200) {
        throw new Error("Failed to fetch notes");
      }
      const result = await response.json();

      setNotes(result);
    } catch (error) {
      Alert.alert("Oops!", "Something went wrong\n\n Please try again...");
      console.log("Error:", error);
    } finally {
      setNotesLoading(false);
    }
  };

  const addNotesRef = useRef(null);

  useEffect(() => {
    handleGetNotes();
  }, []);

  if (notesLoading) {
    return (
      <View className="w-full h-full flex justify-center items-center">
        <ActivityIndicator color="green" size={"large"} />
      </View>
    );
  }

  return (
    <>
      <View className="px-3 py-2 flex justify-start items-center w-full h-full relative">
        <View className="w-full">
          {notes.length === 0 ? (
            <View className="h-full w-full flex justify-center items-center -mt-10">
              <Ionicons name="document-outline" size={48} color={"green"} />
              <Text className="text-xl font-semibold mt-4">
                No notes added yet
              </Text>
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={{ width: "100%", paddingBottom: 80 }}
              showsVerticalScrollIndicator={false}
            >
              {notes.map((i) => (
                <NotesCard
                  key={i._id}
                  id={i._id}
                  title={i.title}
                  description={i.description}
                  handleDeleteNotes={() => handleDeleteNotes(i._id)}
                  handleOnCheck={() => handleOnCheck(i._id, i.checked)}
                  checked={i.checked}
                />
              ))}
            </ScrollView>
          )}
        </View>
        <View className="w-full absolute bottom-0 flex flex-row justify-center items-center h-16">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => addNotesRef.current?.open()}
            style={{
              width: 350,
              backgroundColor: "green",
              paddingVertical: 12,
              borderRadius: 8,
            }}
          >
            <Text style={{ textAlign: "center", color: "#fff" }}>
              Add Notes
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <Modalize ref={addNotesRef} adjustToContentHeight snapPoint={500}>
        <View className="h-96 px-3 py-4 flex justify-between items-center">
          <View className="w-full flex justify-start items-center">
            <Text className="mt-3 text-xl font-semibold">Add Note</Text>
            <View className="border mt-3 border-gray-500/50 p-1 px-2 rounded-lg w-full">
              <Text className="text-xs text-gray-500/70">Title</Text>
              <TextInput
                placeholder="Enter Title"
                onChangeText={setTitle}
                className="text-black text-base mt-1"
              />
            </View>
            <View className="border mt-3 border-gray-500/50 p-1 px-2 rounded-lg w-full">
              <Text className="text-xs text-gray-500/70">Description</Text>
              <TextInput
                multiline={true}
                numberOfLines={5}
                onChangeText={setDescription}
                textAlignVertical="top"
                placeholder="Enter description"
                className="text-black text-base mt-1"
              />
            </View>
          </View>
          <View className="w-full flex justify-center items-center mt-4">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleAddNotes}
              style={{
                width: 350,
                backgroundColor: "green",
                paddingVertical: 12,
                borderRadius: 8,
              }}
            >
              {loading ? (
                <ActivityIndicator size={"small"} color="white" />
              ) : (
                <Text style={{ textAlign: "center", color: "#fff" }}>
                  Submit
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modalize>
    </>
  );
};

const NotesCard = ({
  title,
  description,
  checked,
  handleDeleteNotes,
  handleOnCheck,
}) => {
  return (
    <View className="h-fit w-full border border-gray-500/50 rounded-xl p-2 py-2 mt-2">
      <View className="flex flex-row justify-between items-center">
        <View className="flex flex-row justify-start items-center">
          <Checkbox
            status={checked ? "checked" : "unchecked"}
            onPress={handleOnCheck}
            color={checked ? "green" : "#000"}
          />
          <Text className="text-base font-semibold">{title}</Text>
        </View>
        <TouchableOpacity activeOpacity={0.5} onPress={handleDeleteNotes}>
          <Image source={trash} className="h-4 w-4" />
        </TouchableOpacity>
      </View>
      <View className="px-2">
        <Text className="mt-1">{description}</Text>
      </View>
    </View>
  );
};

export default Mynotes;
