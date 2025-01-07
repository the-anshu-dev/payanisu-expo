import {
  View,
  Text,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  Linking,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useSelector } from "react-redux";
import { ActivityIndicator } from "react-native-paper";

const { height, width } = Dimensions.get("window");

const CheckPointElement = ({ points, index, handleGetCheckPoints }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [scanned, setScanned] = useState(false);

  const [checkInLoading, setCheckInLoading] = useState(false);

  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    const checkAndRequestPermission = async () => {
      if (!permission?.granted) {
        await requestPermission();
      }
    };
    checkAndRequestPermission();
  }, [permission]);

  const handleQRCodePress = () => {
    if (!points.activated) {
      Alert.alert("Inactive", "Checkpoint is not active.");
      return;
    }
    setScanned(false);
    setShowCameraModal(true);
  };

  const handleCheckIn = async (body) => {
    setCheckInLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/checked/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      if (response.status !== 200) {
        throw new Error("Failed to check in");
      }
      Alert.alert("Successful", "You are checked in.");
      handleGetCheckPoints();
    } catch (error) {
      console.log("Error:", error);
      Alert.alert("Failed to check-in", "Please try again.");
    } finally {
      setCheckInLoading(false);
    }
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={async () => {
            const { granted } = await requestPermission();
            if (!granted) {
              Alert.alert(
                "Permission Needed",
                "Please enable camera permissions from settings.",
                [
                  {
                    text: "Go to Settings",
                    onPress: () => Linking.openSettings(),
                  },
                  { text: "Cancel", style: "cancel" },
                ]
              );
            }
          }}
        >
          <Text style={styles.text}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.checkpointInfo}>
            <Text
              style={styles.checkpointText}
            >{`Check Point ${index + 1}`}</Text>
            <Text style={styles.pointName}>{points?.name}</Text>
          </View>
          <View style={styles.qrIconContainer}>
            {checkInLoading ? (
              <ActivityIndicator color="green" size={"small"} />
            ) : (
              <>
                {points.checked ? (
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={32}
                    color={"green"}
                  />
                ) : (
                  <TouchableOpacity
                    activeOpacity={0.6}
                    onPress={handleQRCodePress}
                  >
                    <Ionicons
                      name="qr-code-outline"
                      size={32}
                      color={"green"}
                    />
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText}>{points?.description}</Text>
        </View>
      </View>
      <Modal
        visible={showCameraModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCameraModal(false)}
      >
        <View style={styles.modalOverlay}>
          <CameraView
            style={styles.camera}
            onBarcodeScanned={({ data }) => {
              if (data && !scanned) {
                setScanned(true);
                setShowCameraModal(false);
                const body = {
                  email: user?.email,
                  tourId: points.tourId,
                  checkPointId: points._id,
                };
                if (points.tourId === data) {
                  handleCheckIn(body);
                } else {
                  Alert.alert("Invalid tour id", "Please scan right Qr.");
                }
              }
            }}
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowCameraModal(false)}
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 150,
    padding: 8,
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 8,
    borderRadius: 8,
    backgroundColor: "white",
    shadowColor: "black",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
  },
  checkpointInfo: {
    width: "80%",
  },
  checkpointText: {
    paddingVertical: 4,
    fontSize: 12,
  },
  pointName: {
    fontWeight: "bold",
    fontSize: 18,
  },
  qrIconContainer: {
    width: "20%",
    justifyContent: "center",
    alignItems: "center",
  },
  descriptionContainer: {
    width: "100%",
    marginTop: 8,
  },
  descriptionText: {
    marginTop: 8,
    textAlign: "justify",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  camera: {
    width: width * 0.8,
    height: height * 0.5,
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 16,
    color: "white",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
  button: {
    marginTop: 10,
    padding: 10,
    borderRadius: 5,
    backgroundColor: "green",
  },
});

export default CheckPointElement;
