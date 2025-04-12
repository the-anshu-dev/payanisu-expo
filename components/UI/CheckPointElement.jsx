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
import { sendLocalNotification } from "../../utils/notification";
import Radar from "./Radar";
import {
  requestBackgroundLocation,
  requestForegroundLocation,
} from "../../utils/locationHelper";

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

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
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
    console.log("CheckedIn run...");
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

      if (!response.ok) {
        throw new Error("Failed to check in");
      }
      showSuccess("You are checked in.");
      sendLocalNotification(
        "Check-in Successful",
        "You have successfully reached the checkpoint."
      );

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
    const checkLocationPermission = async () => {
      const fgLocPermission = await requestForegroundLocation();
      if (!fgLocPermission) {
        await requestForegroundLocation();
      }

      const bgLocPermission = await requestBackgroundLocation();
      if (!bgLocPermission) {
        await requestBackgroundLocation();
      }
    };

    checkLocationPermission();
  }, []);

  useEffect(() => {
    let watchId;

    const startLocationTracking = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          showWarning("Location permission is required for auto check-in");
          return;
        }

        console.log("STATUS x==>", status);

        watchId = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 150,
          },
          (location) => {
            const { latitude, longitude } = location.coords;

            const safePoints = Array.isArray(points) ? points : [points];

            safePoints.forEach((point) => {
              if (point.type === "Geo Tagging" && !point.checked) {
                const distance = getDistance(
                  latitude,
                  longitude,
                  point.latitude,
                  point.longitude
                );

                if (distance <= 150) {
                  const body = {
                    email: user?.email,
                    tourId: point.tourId,
                    checkPointId: point._id,
                  };
                  handleCheckIn(body);
                }
              }
            });
          }
        );

        console.log("watchId x==>", watchId);
      } catch (error) {
        showError("Error getting location:", error);
      }
    };

    if (
      isTourCurrentlyActive &&
      points?.type === "Geo Tagging" &&
      points?.checked === false
    ) {
      startLocationTracking();
    }

    return () => {
      if (watchId) {
        watchId.remove();
      }
    };
  }, [points, isTourCurrentlyActive]);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Grant camera permission for QR.</Text>
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
        <View style={styles.tag}>
          <Text
            style={{
              color: "white",
              fontSize: 12,
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            {points?.type}
          </Text>
        </View>
        <View style={styles.header}>
          <View style={styles.checkpointInfo}>
            <Text style={styles.checkpointText}>{`Check Point ${
              index + 1
            }`}</Text>
            <Text style={styles.pointName}>{points?.name}</Text>
          </View>
          <View style={styles.qrIconContainer}>
            {checkInLoading && (
              <ActivityIndicator color="#228B22" size="small" />
            )}
            {!checkInLoading &&
              points.type === "Geo Tagging" &&
              (points.checked ? (
                <Ionicons
                  name="checkmark-circle-outline"
                  size={32}
                  color="#228B22"
                />
              ) : (
                <Radar isChecking={true} />
              ))}
            {!checkInLoading &&
              points.type !== "Geo Tagging" &&
              points.checked && (
                <Ionicons
                  name="checkmark-circle-outline"
                  size={32}
                  color="#228B22"
                />
              )}
            {!checkInLoading &&
              points.type !== "Geo Tagging" &&
              points.activated &&
              !points.checked && (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={handleQRCodePress}
                  className="border-2 border-[#228B22] rounded-full px-2"
                >
                  <Text className="font-semibold text-[#228B22] text-xl">
                    Scan QR
                  </Text>
                </TouchableOpacity>
              )}
            {!checkInLoading &&
              !points.checked &&
              !points.activated &&
              points.type !== "Geo Tagging" && (
                <Text className="text-red-400 font-semibold border px-2 py-1 rounded-full border-red-400">
                  Inactive
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
    marginTop: 20,
    borderRadius: 8,
    backgroundColor: "white",
    shadowColor: "black",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 8,
    position: "relative",
  },
  tag: {
    position: "absolute",
    top: -20,
    right: 10,
    width: "30%",
    height: 20,
    backgroundColor: "#228B22",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  tagText: {
    color: "white",
    fontSize: 12,
    textAlign: "center",
    fontWeight: "bold",
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
    backgroundColor: "#228B22",
  },
});

export default CheckPointElement;
