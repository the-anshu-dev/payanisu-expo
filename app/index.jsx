import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setProfile, setRole, setUser } from "../redux/slices/userSlice";
import Loader from "../components/common/Loader";
import { Redirect } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { showWarning } from "../utils/toastHelper";
import { fetchAllTours } from "../redux/slices/toursSlice";
import { fetchBookedTours } from "../redux/slices/bookedToursSlice";
import { Text, View } from "react-native";
import { initializeBackgroundTask } from "../utils/background";

SplashScreen.preventAutoHideAsync();




  let resolver
  const promise = new Promise(resolve =>
    (resolver = resolve)
    );
  initializeBackgroundTask(promise)
  



  useEffect(()=>{
    if(resolver){
      resolver();
      console.log('Resolver Called!');
    }
  },[])


  
const Index = () => {
  const [showLoader, setShowLoader] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const dispatch = useDispatch();

  const fetchUserData = async (email) => {
    try {
      const [roleResponse, profileResponse] = await Promise.all([
        fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/users/signin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }),
        fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/users/getProfile`, {
          method: "GET",
          headers: { "Content-Type": "application/json", email },
        }),
      ]);

      if (roleResponse.ok) {
        const roleData = await roleResponse.json();
        dispatch(setRole(roleData));
      }

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        if (profileData && !profileData.error) {
          dispatch(setProfile(profileData));
        }
      }
      dispatch(fetchBookedTours(email));
    } catch (error) {
      showWarning(
        error.message ||
          "Failed to fetch user data. Please check your network connection."
      );
    }
  };

  const loadUserData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        dispatch(setUser(userData));
        if (userData?.email) {
          await fetchUserData(userData.email);
        }
        setAuthenticated(true);
      }
    } catch (error) {
      showWarning(
        error.message || "Failed to load user data. Please try again."
      );
    } finally {
      await SplashScreen.hideAsync();
      setShowLoader(false);
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      await loadUserData();
      dispatch(fetchAllTours());
    };
    initializeApp();
  }, []);



  if (showLoader) return <Loader />;
  if (authenticated) return <Redirect href="/(tabs)" />;
  return <Redirect href="/login" />;

  // return (
  //   <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
  //     <Text>Hello Bg Tasks</Text>
  //   </View>
  // )
};

export default Index;
