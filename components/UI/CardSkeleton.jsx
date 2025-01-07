import { View, Animated } from "react-native";
import React, { useEffect, useRef } from "react";

const CardSkeleton = () => {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [opacity]);
  return (
    <View className="bg-white h-[430px] w-72 ml-9 rounded-xl shadow-xl shadow-black/70">
      <Animated.View
        style={{
          opacity,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          className={`h-full w-full relative rounded-xl  space-y-2 bg-white`}
        >
          <View className="h-44 bg-slate-300 rounded-t-xl flex justify-center items-center " />
          <View className="h-16 rounded-xl bg-slate-300 mx-2" />
          <View className="h-8 rounded-xl bg-slate-300 mx-2" />
          <View className="h-6 rounded-xl bg-slate-300 mx-2" />
          <View className="h-5 rounded-xl bg-slate-300 mx-2" />
          <View className="h-5 rounded-xl bg-slate-300 mx-2" />
          <View className="h-12 bg-slate-300 mx-10 rounded-2xl absolute -bottom-6 z-50 left-0 right-0 " />
        </View>
      </Animated.View>
    </View>
  );
};

export default CardSkeleton;
