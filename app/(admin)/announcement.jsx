import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import React, { useCallback, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Modalize } from "react-native-modalize";
import DropDownPicker from "react-native-dropdown-picker";
import { useSelector } from "react-redux";
import { ActivityIndicator } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { showError, showSuccess } from "../../utils/toastHelper";
import { useFocusEffect } from "expo-router";
import Notifications from "../../components/UI/Notifications";
import { announcementScreenStyles } from "../../constants/Styles";

const { width, height } = Dimensions.get("window");

const AnnouncementScreen = () => {
  const { tour } = useSelector((state) => state.tour);
  const { user } = useSelector((state) => state.user);

  const toursData = tour.map((t) => {
    return { label: t.name, value: t._id };
  });

  const addAnnounceMentRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [currentTour, setCurrentTour] = useState(toursData[0]?.value);
  const [tours, setTours] = useState(toursData);
  const [content, setContent] = useState("");
  const [announcementTitle, setAnnouncementTitle] = useState("");

  const [announcements, setAnnouncements] = useState([]);

  const [loading, setLoading] = useState(false);

  const handleCreateAnnouncement = async () => {
    setLoading(true);
    const body = {
      notificationType: "announcement",
      title: announcementTitle,
      content: content,
      id: currentTour,
    };

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/notification/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to send announcement.");
      }
      setContent("");
      setAnnouncementTitle("");
      addAnnounceMentRef.current.close();
      showSuccess("Announcement sent successfully.");
    } catch (error) {
      showError(error.message || "Failed to send announcement.");
    } finally {
      setLoading(false);
    }
  };

  const handleGetAnnouncement = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/notification/get?email=${user?.email}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch announcements.");
      }
      const data = await response.json();
      const filteredData = data.filter((item) => item.id === currentTour);
      setAnnouncements(filteredData);
    } catch (error) {
      showError(error.message || "Failed to fetch announcements.");
    }
  };

  const onRefresh = async () => {
    try {
      await handleGetAnnouncement();
    } catch (error) {
      showError(error.message || "Failed to refresh announcements.");
    }
  };

  useFocusEffect(
    useCallback(() => {
      handleGetAnnouncement();
    }, [currentTour])
  );

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["left", "right", "bottom"]}>
      <View style={announcementScreenStyles.container}>
        <View style={announcementScreenStyles.dropDownContainer}>
          <DropDownPicker
            open={open}
            value={currentTour}
            items={tours}
            setOpen={setOpen}
            setValue={setCurrentTour}
            setItems={setTours}
            closeOnBackPressed={true}
            placeholder="Select Tour"
            zIndex={1000}
            textStyle={{
              color: "white",
              fontWeight: "bold",
              fontSize: width * 0.04,
            }}
            arrowIconStyle={{ tintColor: "white" }}
            tickIconStyle={{ tintColor: "white" }}
            style={{ backgroundColor: "#117004", borderColor: "#117004" }}
            dropDownContainerStyle={{
              backgroundColor: "#117004",
              borderColor: "#117004",
            }}
          />
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={announcementScreenStyles.scrollViewContent}
        >
          <View style={announcementScreenStyles.announcementContainer}>
            {announcements.length > 0 ? (
              announcements.map((announcement, index) => (
                <Notifications
                  key={announcement._id}
                  id={announcement._id}
                  title={announcement.title}
                  content={announcement?.content}
                  seen={announcement.seen}
                  createdAt={announcement?.createdAt}
                  onRefresh={onRefresh}
                />
              ))
            ) : (
              <Text style={{ fontSize: width * 0.04, textAlign: "center" }}>
                No Announcements
              </Text>
            )}
          </View>
        </ScrollView>
      </View>
      <View style={announcementScreenStyles.buttonContainer}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => addAnnounceMentRef?.current?.open()}
          style={announcementScreenStyles.newAnnouncementButton}
        >
          <View style={announcementScreenStyles.buttonContent}>
            <Ionicons
              name="megaphone-outline"
              size={width * 0.05}
              color="white"
            />
            <Text style={announcementScreenStyles.buttonText}>
              New Announcements
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      <Modalize ref={addAnnounceMentRef} adjustToContentHeight>
        <View style={announcementScreenStyles.modalContent}>
          <Text style={announcementScreenStyles.modalTitle}>Announcement</Text>
          <TextInput
            placeholder="Announcement Title"
            style={announcementScreenStyles.textInput}
            onChangeText={setAnnouncementTitle}
            value={announcementTitle}
          />
          <TextInput
            value={content}
            multiline
            numberOfLines={6}
            textAlign="left"
            textAlignVertical="top"
            onChangeText={setContent}
            placeholder="Announcement Content"
            style={announcementScreenStyles.textInput}
          />
          <View
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleCreateAnnouncement}
              style={{
                backgroundColor: "#228B22",
                width: width * 0.9,
                height: height * 0.05,
                borderRadius: 10,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {loading ? (
                <ActivityIndicator size={"small"} color="white" />
              ) : (
                <Text
                  style={{ color: "white", fontSize: 16, fontWeight: "600" }}
                >
                  Send
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modalize>
    </SafeAreaView>
  );
};

export default AnnouncementScreen;
