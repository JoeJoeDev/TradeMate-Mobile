// Load environment variables
require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'development'}` });
require('dotenv').config(); // Load .env as fallback

module.exports = {
  expo: {
    name: "TradeMate",
    slug: "trademate",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "trademate",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#1e3a5f"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.joejoehackr.trademate",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router"
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      router: {},
      eas: {
        projectId: "21bbcb91-69c9-4256-9f89-55ab471854f3"
      },
      // Expose environment variables to the app
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
    }
  }
};

