import 'dotenv/config';

export default {
  expo: {
    name: "LogisticMobileApp",
    slug: "logistic-mobile-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.logisticmobile.app"
    },
    android: {
      package: "com.logisticmobile.app",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      }
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      // Example usage of env variables:
      // apiUrl: process.env.API_URL,
    },
    plugins: [
      "expo-font",
      "expo-asset",
      "expo-mail-composer",
      "expo-web-browser",
      [
        "expo-image-picker",
        {
          photosPermission:
            "The app accesses your photos to let you share them with your friends.",
        },
      ],
      [
        "expo-notifications",
        {
          icon: "./assets/images/icon.png",
          color: "#0A66C2",
          sounds: [],
          modes: ["alwaysSendAsAndroidManaged"],
        },
      ],
    ]
  }
};