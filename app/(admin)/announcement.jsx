import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from "react-native";
import React, { useRef, useState } from "react";
import Announcement from "../../components/UI/Announcement";
import { Ionicons } from "@expo/vector-icons";
import { Modalize } from "react-native-modalize";
import DropDownPicker from "react-native-dropdown-picker";
import { useSelector } from "react-redux";
import { Button } from "react-native";
import { sendNotificaton } from "../../utils/pushNotification";
import { ActivityIndicator } from "react-native-paper";

const { width, height } = Dimensions.get("window");

const AnnouncementScreen = () => {
  const { tour } = useSelector((state) => state.tour);

  const toursData = tour.map((t) => {
    return { label: t.name, value: t._id };
  });

  const addAnnounceMentRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [currentTour, setCurrentTour] = useState(toursData[0]?.value);
  const [tours, setTours] = useState(toursData);
  const [content, setContent] = useState("");
  const [announcementTitle, setAnnouncementTitle] = useState("");

  const [loading, setLoading] = useState(false);

  const handleCreateAnnouncement = async () => {
    setLoading(true);
    const body = {
      id: currentTour,
      title: announcementTitle,
      content: content,
    };

    try {
      const response = await sendNotificaton(body);
      console.log(response);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.dropDownContainer}>
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
          contentContainerStyle={styles.scrollViewContent}
        >
          <View style={styles.announcementContainer}>
            <Announcement />
          </View>
        </ScrollView>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => addAnnounceMentRef?.current?.open()}
          style={styles.newAnnouncementButton}
        >
          <View style={styles.buttonContent}>
            <Ionicons
              name="megaphone-outline"
              size={width * 0.05}
              color="white"
            />
            <Text style={styles.buttonText}>New Announcements</Text>
          </View>
        </TouchableOpacity>
      </View>
      <Modalize ref={addAnnounceMentRef} adjustToContentHeight>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Announcement</Text>
          <TextInput
            placeholder="Enter announcement title..."
            style={styles.textInput}
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
            placeholder="Enter announcement content..."
            style={styles.textInput}
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
              activeOpacity={0.7}
              onPress={handleCreateAnnouncement}
              style={{
                backgroundColor: "green",
                width: width * 0.6,
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
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: height * 0.13,
    paddingHorizontal: width * 0.01,
  },
  dropDownContainer: {
    paddingHorizontal: width * 0.03,
  },
  scrollViewContent: {
    paddingBottom: height * 0.15,
    paddingHorizontal: width * 0.03,
  },
  announcementContainer: {
    marginTop: height * 0.01,
  },
  buttonContainer: {
    position: "absolute",
    bottom: height * 0.009,
    width: "100%",
    paddingHorizontal: width * 0.06,
    justifyContent: "center",
    alignItems: "center",
  },
  newAnnouncementButton: {
    width: "100%",
    height: height * 0.05,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "green",
    borderRadius: 10,
    marginBottom: height * 0.001,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: width * 0.045,
    fontWeight: "600",
    marginLeft: width * 0.02,
  },
  modalContent: {
    padding: width * 0.05,
  },
  modalTitle: {
    fontSize: width * 0.05,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: height * 0.02,
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: width * 0.02,
    fontWeight: "600",
    marginBottom: height * 0.02,
    fontSize: width * 0.04,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: height * 0.02,
  },
  switchText: {
    marginLeft: width * 0.03,
    fontWeight: "600",
    fontSize: width * 0.04,
  },
});

export default AnnouncementScreen;
