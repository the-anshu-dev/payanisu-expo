export default {
  expo: {
    name: "trekies",
    slug: "trekies",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "trekies",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/splash.png",
      contentFit: "contain",
      backgroundColor: "#ffffff",
    },
    androidStatusBar: {
      backgroundColor: "#6200EE",
      barStyle: "light-content",
      translucent: false,
    },
    android: {
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_API_KEY,
        },
      },
      jsEngine: "hermes",
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      usesCleartextTraffic: true,
      package: "com.anonymous.trekies",
      googleServicesFile: "./google-services.json",
      permissions: [
        "android.permission.CAMERA",
        "android.permission.RECORD_AUDIO",
      ],
      intentFilters: [
        {
          action: "VIEW",
          data: {
            scheme: "trekies",
            host: "trekies",
            pathPrefix: "/",
          },
          category: ["BROWSABLE", "DEFAULT"],
        },
      ],
    },
    web: {
      bundler: "metro",
      output: "static",
    },
    plugins: [
      [
        "expo-notifications",
        {
          color: "#ffffff",
          defaultChannel: "default",
          enableBackgroundRemoteNotifications: true,
        },
      ],
      "expo-secure-store",
      "expo-router",
      [
        "expo-camera",
        {
          cameraPermission: "Allow $(PRODUCT_NAME) to access your camera",
          microphonePermission:
            "Allow $(PRODUCT_NAME) to access your microphone",
          recordAudioAndroid: true,
        },
      ],
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission:
            "Allow $(PRODUCT_NAME) to use your location.",
        },
      ],
    ],
    extra: {
      eas: {
        projectId: "492d9093-8144-4155-b019-962b57ee71b0",
      },
      EXPO_PUBLIC_ANDROID_CLIENT_ID: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID,
      EXPO_PUBLIC_BASE_URL: process.env.EXPO_PUBLIC_BASE_URL,
      EXPO_PUBLIC_GOOGLE_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_API_KEY,
    },
    ios: {
      bundleIdentifier: "com.anonymous.trekies",
      infoPlist: {
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: true,
        },
      },
    },
    owner: "prince_24",
  },
};
