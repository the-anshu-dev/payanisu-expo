import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

const Radar = ({ isChecking = true }) => {
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (isChecking) {
      pulse.value = withRepeat(
        withTiming(1.5, {
          duration: 800,
          easing: Easing.out(Easing.ease),
        }),
        -1,
        true
      );
    } else {
      pulse.value = withTiming(1, { duration: 300 });
    }
  }, [isChecking]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 2 - pulse.value,
  }));

  return (
    <View style={styles.container}>
      {isChecking && <Animated.View style={[styles.pulse, animatedStyle]} />}
      <View style={styles.iconWrapper}>
        <Ionicons name="location-sharp" size={20} color="green" />
      </View>
    </View>
  );
};

const SIZE = 40;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  pulse: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: "rgba(0, 200, 83, 0.3)",
    position: "absolute",
  },
  iconWrapper: {
    width: 30,
    height: 30,
    borderRadius: 40,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    zIndex: 2,
  },
});

export default Radar;
