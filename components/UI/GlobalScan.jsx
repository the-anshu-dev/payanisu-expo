import {
    View,
    Text,
    Dimensions,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    Linking,
    Alert,
  } from "react-native";
  import React, { useState, useEffect } from "react";
  import { StyleSheet } from "react-native";
  import { useSelector } from "react-redux";
  import { Ionicons } from "@expo/vector-icons";
  import { CameraView, useCameraPermissions } from "expo-camera";
  import { showError, showSuccess, showWarning } from "../../utils/toastHelper";
  import { sendLocalNotification } from "../../utils/notification";
  
  const { width, height } = Dimensions.get("window");
  
  const QRScanner = ({ point, onCheckInSuccess, loading, error }) => {
    const { user } = useSelector((state) => state.user);
    const [showCameraModal, setShowCameraModal] = useState(false);
    const [scanned, setScanned] = useState(false);
    const [checkInLoading, setCheckInLoading] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
  
    const handleQRCodePress = async () => {
      if (!permission?.granted) {
        const { granted } = await requestPermission();
        if (!granted) {
          Alert.alert(
            "Permission Needed",
            "Please enable camera permissions from settings.",
            [
              { text: "Go to Settings", onPress: () => Linking.openSettings() },
              { text: "Cancel", style: "cancel" },
            ]
          );
          return;
        }
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
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }
  
        showSuccess("You are checked in.");
        sendLocalNotification(
          "Check-in Successful",
          "You have successfully reached the checkpoint."
        );
        onCheckInSuccess?.();
      } catch (err) {
        showError(err.message || "Check-in failed. Please try again.");
      } finally {
        setCheckInLoading(false);
        setShowCameraModal(false);
        setScanned(false);
      }
    };
  
    const handleBarCodeScanned = ({ data }) => {
      if (data && !scanned) {
        setScanned(true);
        if (!data || typeof data !== "string") {
          showWarning("Invalid QR code scanned.");
          setScanned(false);
          return;
        }
  
        const body = {
          email: user?.email,
          tourId: data,
          checkPointId: point?._id || null,
        };
  
        if (point?.tourId === data) {
          handleCheckIn(body);
        } else {
          showWarning("Please scan the correct QR code.");
          setScanned(false);
        }
      }
    };
  
    useEffect(() => {
      if (permission === null) {
        requestPermission();
      }
    }, []);
  
    // Early returns after hooks
    if (loading) {
      return (
        <View style={styles.container}>
          <Text style={styles.message}>Loading...</Text>
        </View>
      );
    }
  
    if (error) {
      return (
        <View style={styles.container}>
          <Text style={styles.message}>{error.message || "An error occurred"}</Text>
        </View>
      );
    }
  
    if (!permission) {
      return <View style={styles.container} />;
    }
  
    if (!permission.granted) {
      return (
        <View style={styles.container}>
          <Text style={styles.message}>Grant camera permission for QR scanning.</Text>
          <TouchableOpacity style={styles.button} onPress={handleQRCodePress}>
            <Text style={styles.text}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      );
    }
  
    return (
      <>
        <TouchableOpacity
          onPress={handleQRCodePress}
          activeOpacity={0.9}
          style={styles.scanQRButton}
          disabled={checkInLoading}
          accessible={true}
          accessibilityLabel="Scan QR code"
        >
          {checkInLoading ? (
            <ActivityIndicator size="small" color="#228B22" />
          ) : (
            <>
              <Ionicons name="qr-code-outline" size={24} color="#228B22" style={styles.icon} />
              <Text style={styles.scanQRText}>Scan QR</Text>
            </>
          )}
        </TouchableOpacity>
        <Modal
          visible={showCameraModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowCameraModal(false)}
        >
          <View style={styles.modalOverlay}>
            <CameraView style={styles.camera} onBarcodeScanned={handleBarCodeScanned} />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCameraModal(false)}
              accessible={true}
              accessibilityLabel="Close QR scanner"
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
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    message: {
      textAlign: "center",
      fontSize: 16,
      paddingBottom: 10,
      color: "#333",
    },
    button: {
      padding: 10,
      borderRadius: 5,
      backgroundColor: "#228B22",
    },
    text: {
      fontSize: 16,
      color: "white",
      fontWeight: "600",
    },
    scanQRButton: {
      width: width * 0.42,
      height: height * 0.06,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#fff",
      borderWidth: 2,
      borderColor: "#228B22",
      borderRadius: 10,
      marginTop: 10,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.5,
    },
    scanQRText: {
      color: "#228B22",
      fontWeight: "600",
      fontSize: 18,
    },
    icon: {
      marginRight: 10,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.85)",
      justifyContent: "center",
      alignItems: "center",
    },
    camera: {
      width: width * 0.8,
      height: height * 0.5,
      borderRadius: 10,
      overflow: "hidden",
    },
    closeButton: {
      position: "absolute",
      top: 40,
      right: 20,
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
    },
  });
  
  export default QRScanner;