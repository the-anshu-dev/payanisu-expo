import { SafeAreaView } from "react-native-safe-area-context";
import V1 from "@/assets/welcomeTile.svg";
import { Dimensions, View, Text, TouchableOpacity } from "react-native";
import CarouselComponent from "@/components/CarouselComponent";
import { useCallback, useEffect, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { useIsFocused } from "@react-navigation/native";
import {
  setAdminAccessEnabled,
} from "../../redux/slices/userSlice";
import { checkNetworkStatus } from "../../utils/offlineLocationHelper";
import { router, useFocusEffect } from "expo-router";
import { homeScreenStyles } from "../../constants/Styles";
import { fetchMembers } from "../../redux/slices/membersSlice";
import { fetchAllTours } from "../../redux/slices/toursSlice";
import { useBookedTours } from "../../hooks/useBookedTours";
import { selectGGeoTaggedCheckPoints, setGGeoTaggedCheckPoints } from "../../redux/slices/autoCheckinSlice";
import { sendLocalNotification } from "../../utils/notification";
import * as Location from "expo-location";
import { showError, showSuccess } from "../../utils/toastHelper";

const { width, height } = Dimensions.get("window");

export default function HomeScreen() {
  const [isConnected, setIsConnected] = useState(true);
  // const { user } = useSelector((state) => state.user);
  const { user } = useSelector((state) => state.user);
  const { bookedTours } = useBookedTours(user?.email);
  const [geoCheckPoints, setGeoCheckPoints] = useState([])

  // thunk
  const dispatch = useDispatch();

  const isFocused = useIsFocused();

  const geoTaggedCheckpoints = useSelector(selectGGeoTaggedCheckPoints);

  const checkNetworkConnection = async () => {
    const status = await checkNetworkStatus();
    setIsConnected(status);
  };

  useEffect(() => {
    dispatch(setAdminAccessEnabled(false));
  }, [isFocused]);

  useEffect(() => {
    checkNetworkStatus();
    dispatch(fetchAllTours());
    dispatch(fetchMembers(user?.email));
    const interval = setInterval(() => {
      checkNetworkConnection();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!isConnected) {
    return (
      <SafeAreaView
        style={homeScreenStyles.safeArea}
        edges={["left", "right", "bottom"]}
      >
        <View style={homeScreenStyles.offlineContainer}>
          <View style={homeScreenStyles.modalContent}>
            <MaterialIcons name="wifi-off" size={60} color="red" />
            <Text style={homeScreenStyles.modalText}>You are offline</Text>
            <Text style={homeScreenStyles.modalSubText}>
              Please check your network connection
            </Text>
            <View className="flex flex-row items-center justify-between w-full gap-4 mt-4">
              <TouchableOpacity
                activeOpacity={0.9}
                style={homeScreenStyles.retryButton}
                onPress={checkNetworkConnection}
              >
                <Text style={homeScreenStyles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.9}
                style={homeScreenStyles.retryButton}
                onPress={() => router.push("/(offlinemode)/mytours")}
              >
                <Text style={homeScreenStyles.retryButtonText}>
                  Offline Mode
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }















  // Anshu COde 
  // console.log("bookedTours==>",bookedTours)

  const now = new Date();

  // GET CHECKPOINTS 


  //   const handleGetCheckPoints = async (ID) => {
  //   try {
  //     const response = await fetch(
  //       `${process.env.EXPO_PUBLIC_BASE_URL}/api/checked/get?email=${user?.email}&tourId=${ID}`
  //     );

  //     if (response.status !== 200) {
  //       throw new Error("Failed to get checkpoints.");
  //     }

  //     const result = await response.json();
  //     const geoTaggedData = result.filter(
  //       (i) => i.type === "Geo Tagging" && i.checked === false
  //     );

  //     return geoTaggedData;
  //   } catch (error) {
  //     showError(error.message || "Please try again.");
  //     return []; // fallback
  //   } finally {
  //     setLoading(false);
  //   }
  // };



  //  const handleGetCheckPoints = async (ID) => {
  //   try {
  //     const response = await fetch(
  //       `${process.env.EXPO_PUBLIC_BASE_URL}/api/checked/get?email=${user?.email}&tourId=${ID}`
  //     );

  //     // console.log('RESPONSE ===>', ID, await response?.json())
  //     if (response.status !== 200) {
  //       throw new Error("Failed to get checkpoints.");
  //     }
  //     const result = await response.json();
  //     console.log('RESPONSE ===>', result)
  //     // setGeoCheckPoints(result);
  //     const geoTaggedData = result.filter(
  //       (i) => i.type === "Geo Tagging" && i.checked === false
  //     );
  //     console.log('geoTaggedData ===>', ID, geoTaggedData)

  //     dispatch(setGGeoTaggedCheckPoints(data));

  //     return geoTaggedData
  //     // setGeoCheckPoints(geoTaggedData);
  //     // await AsyncStorage.setItem(
  //     //   "geoTaggedCheckPoints",
  //     //   JSON.stringify(geoTaggedData)
  //     // );
  //     // setGeoTaggedCheckPoints(geoTaggedData);
  //   } catch (error) {
  //     showError(error.message || "Please try again.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };



  const handleGetCheckPoints = async (ID) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/checked/get?email=${user?.email}&tourId=${ID}`
      );

      if (response.status !== 200) {
        throw new Error("Failed to get checkpoints.");
      }

      const result = await response.json();
      console.log('RESPONSE ===>', result);

      const geoTaggedData = result.filter(
        (i) => i.type === "Geo Tagging" && i.checked === false
      );
      console.log('geoTaggedData ===>', ID, geoTaggedData);

      dispatch(setGGeoTaggedCheckPoints(geoTaggedData)); // ✅ corrected here

      return geoTaggedData;
    } catch (error) {
      showError(error.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  };



  const handleCheckIn = async (body) => {
    console.log("============ Home CheckedIn run... ===============");
    try {
      console.log("============ Home CheckedIn Try Block... ===============");
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
      console.log("============ Home CheckedIn Response... ===============", response);

      if (!response.ok) {
        throw new Error("Failed to check in");
      }
      showSuccess("You are checked in.");
      sendLocalNotification(
        "Check-in Successful",
        `You have reached the checkpoint ${runningTours[0]?.tourDetails?._id}`
      );

      handleGetCheckPoints(runningTours?.[0]?.tourDetails?._id);
    } catch (error) {
      showError(error.message || "Please try again.");
    } finally {
      // setCheckInLoading(false);
    }
  };



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

  const runningTours = bookedTours.filter(
    (tour) =>
      tour.status === 1 &&
      tour.tourDetails?.status === true &&
      tour.email === user?.email &&
      new Date(tour.tourDetails?.tour_start) <= now &&
      new Date(tour.tourDetails?.tour_end) >= now
  );

  const runningTourIds = runningTours.map((tour) => tour._id);




  console.log("runningTours===>", runningTours)



  // useFocusEffect(
  // useEffect(() => {
  //   if(runningTours.length>0){
  //     const data = handleGetCheckPoints(runningTours?.[0]?.tourDetails?._id);
  //     console.log('DATA ===> ', data)
  //     if(data?.length>0){
  //       setGeoCheckPoints(data)
  //     }
  //   }
  // }, [runningTours, setGeoCheckPoints])
  // );



  // useEffect(() => {
  //   const fetchCheckPoints = async () => {
  //     if (runningTours.length > 0) {
  //       const data = await handleGetCheckPoints(runningTours?.[0]?.tourDetails?._id);
  //       console.log('DATA ===>', data);
  //       if (data?.length > 0) {
  //         setGeoCheckPoints(data);
  //       }
  //     }
  //   };

  //   fetchCheckPoints(); // run async logic
  // }, [runningTours, setGeoCheckPoints]);





  useEffect(() => {
    const fetchCheckPoints = async () => {
      // Prevent re-fetch if already fetched
      if (
        runningTours.length > 0 &&
        geoTaggedCheckpoints === null // or geoTaggedCheckpoints?.length === 0
      ) {
        const data = await handleGetCheckPoints(runningTours?.[0]?.tourDetails?._id);
        console.log('DATA ===>', data);
        if (data?.length > 0) {
          setGeoCheckPoints(data);
        }
      }
    };

    fetchCheckPoints();
  }, [runningTours]);



  console.log('FINAL GEOLOCATION NOT TRACKED ===>', geoTaggedCheckpoints)




  // console.log("geoCheckPoints==>", geoCheckPoints)
  useEffect(() => {


    console.log('========     Auto Checkin Runs....   ================')





    // // ✅ Track user’s location
    // const startLocationTracking = async (points) => {
    //   console.log('========     Start Location Tracking....   ================')
    //   let watchId;
    //   try {
    //     console.log('========     Location Permission Tracking....   ================')
    //     const { status } = await Location.requestForegroundPermissionsAsync();
    //     console.log('========     Location Permission Status....   ================', status)
    //     if (status !== "granted") {
    //       showWarning("Location permission is required for auto check-in");
    //       return;
    //     }
    //     console.log('========     Location Permission Grandted....   ================')

    //     watchId = await Location.watchPositionAsync(
    //       {
    //         accuracy: Location.Accuracy.High,
    //         distanceInterval: 100,
    //       },
    //       (location) => {
    //         const { latitude, longitude } = location.coords;
    //         points.forEach((point) => {
    //           if (point.type === "Geo Tagging" && !point.checked) {
    //             const distance = getDistance(
    //               latitude,
    //               longitude,
    //               point.latitude,
    //               point.longitude
    //             );

    //             if (distance <= 100) {
    //               const body = {
    //                 email: user?.email,
    //                 tourId: point.tourId,
    //                 checkPointId: point._id,
    //               };


    //               handleCheckIn(body);
    //             }
    //           }
    //         });
    //       }
    //     );
    //   } catch (error) {
    //     showError("Error getting location: " + error.message);
    //   }

    //   // Cleanup on unmount
    //   return () => {
    //     if (watchId) watchId.remove();
    //   };
    // };


    const startLocationTracking = async (points) => {
      console.log('========     Start Location Tracking....   ================');
      let watchId;
      try {
        console.log('========     Location Permission Tracking....   ================');

        const permission = await Location.requestForegroundPermissionsAsync();
        const status = permission.status;

        console.log('========     Location Permission Status....   ================', status);

        if (status !== "granted") {
          showWarning("Location permission is required for auto check-in");
          return;
        }

        console.log('========     Location Permission Granted....   ================');

        watchId = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 100,
          },
          (location) => {
            const { latitude, longitude } = location.coords;
            console.log('========     Location Fetching....   ================');

            points?.forEach((point) => {
              if (point.type === "Geo Tagging" && !point.checked) {
                const distance = getDistance(
                  latitude,
                  longitude,
                  point.latitude,
                  point.longitude
                );
                console.log('========     Calculating Distance....   ================');

                if (distance <= 100) {
                  console.log('========     Checking Under Distance....   ================');
                  const body = {
                    email: user?.email,
                    tourId: point.tourId,
                    checkPointId: point._id,
                  };

                  console.log('========     Handle Auto-Checkin Started....   ================');
                  handleCheckIn(body);
                  console.log('========     Handle Auto-Checkin Finishes....   ================');
                }
              }
            });
          }
        );
      } catch (error) {
        showError("Error getting location: " + error.message);
      }

      // Cleanup on unmount
      return () => {
        if (watchId) watchId.remove();
      };
    };

    // // ✅ Fire everything here
    startLocationTracking(geoTaggedCheckpoints);
  }, [geoTaggedCheckpoints]);


  // ...


  return (
    <SafeAreaView
      style={homeScreenStyles.safeArea}
      edges={["left", "right", "bottom"]}
    >
      <View style={homeScreenStyles.container}>
        <View style={homeScreenStyles.imageContainer}>
          <View style={{ width: width * 1.8, height: height * 0.7, backgroundColor: '#ddd' }} />
          {/* <V1 width={width * 1.8} height={height * 0.7} /> */}
        </View>
        <View style={homeScreenStyles.carouselContainer}>
          <CarouselComponent />
        </View>
      </View>
    </SafeAreaView>
  );
}
