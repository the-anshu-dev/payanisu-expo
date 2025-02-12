import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  Linking,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useSelector } from "react-redux";
import { ActivityIndicator } from "react-native-paper";
import * as Location from "expo-location";
import { showWarning, showSuccess, showError } from "../../utils/toastHelper";

const { height, width } = Dimensions.get("window");

const CheckPointElement = ({
  points,
  index,
  handleGetCheckPoints,
  isTourCurrentlyActive,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [scanned, setScanned] = useState(false);

  const [checkInLoading, setCheckInLoading] = useState(false);

  const { user } = useSelector((state) => state.user);

  const [location, setLocation] = useState(null);

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const handleQRCodePress = () => {
    if (!points.activated) {
      showWarning("Checkpoint is not active.");
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

      if (response.ok) {
        throw new Error("Failed to check in");
      }
      showSuccess("You are checked in.");
      handleGetCheckPoints();
    } catch (error) {
      showError(error.message || "Please try again.");
    } finally {
      setCheckInLoading(false);
    }
  };

  useEffect(() => {
    const checkAndRequestPermission = async () => {
      if (!permission?.granted) {
        await requestPermission();
      }
    };
    checkAndRequestPermission();
  }, [permission]);

  useEffect(() => {
    let watchId;

    const startLocationTracking = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          showWarning('Location permission is required for auto check-in');
          return;
        }

        watchId = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 10,
          },
          (location) => {
            setLocation(location);

            if (points.type === "Geo Tagging" && !points.checked) {
              const distance = getDistance(
                location.coords.latitude,
                location.coords.longitude,
                points.latitude,
                points.longitude
              );

              if (distance <= 100) { 
                const body = {
                  email: user?.email,
                  tourId: points.tourId,
                  checkPointId: points._id,
                };
                handleCheckIn(body);
              }
            }
          }
        );
      } catch (error) {
        console.log('Error getting location:', error);
      }
    };

    if (points.type === "Geo Tagging" && !points.checked && isTourCurrentlyActive) {
      startLocationTracking();
    }

    return () => {
      if (watchId) {
        watchId.remove();
      }
    };
  }, [points]);

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
            {checkInLoading && <ActivityIndicator color="green" size="small" />}
            {!checkInLoading &&
              points.type === "Geo Tagging" &&
              (points.checked ? (
                <Ionicons
                  name="checkmark-circle-outline"
                  size={32}
                  color="green"
                />
              ) : (
                <Ionicons name="time-outline" size={28} color="green" />
              ))}
            {!checkInLoading &&
              points.type !== "Geo Tagging" &&
              points.checked && (
                <Ionicons
                  name="checkmark-circle-outline"
                  size={32}
                  color="green"
                />
              )}
            {!checkInLoading &&
              points.type !== "Geo Tagging" &&
              points.activated &&
              !points.checked && (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={handleQRCodePress}
                  className="border-2 border-green-700 rounded-full px-2"
                >
                  <Text className="font-semibold text-green-700 text-xl">
                    Scan QR
                  </Text>
                </TouchableOpacity>
              )}
            {!checkInLoading &&
              !points.checked &&
              !points.activated &&
              points.type !== "Geo Tagging" && (
                <Text className="text-red-400 font-semibold border px-2 py-1 rounded-full border-red-400">
                  In-active
                </Text>
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
                  showWarning("Please scan right Qr.");
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
    width: "70%",
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
    width: "30%",
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
