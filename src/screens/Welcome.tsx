import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View, Dimensions } from "react-native";

interface Props {
  navigation: any;
}

const { width, height } = Dimensions.get("window");

const Welcome: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Background Decorative Elements */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />
      <View style={styles.circle3} />

      <View style={styles.topSection}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
          />
        </View>

        <Text style={styles.title}>Welcome to WiseSub</Text>
        <Text style={styles.subtitle}>
          Get cheap data, airtime, cable TV subscriptions, and electricity tokens the wisest way, with rewards on WiseSub.
        </Text>

      </View>

      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate("Signup")}
          activeOpacity={0.9}
        >
          <Text style={styles.primaryText}>Create Account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate("Signin")}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryText}>Already have an account? Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "space-between",
    paddingVertical: 50,
    paddingHorizontal: 24,
  },
  // Background Circles
  circle1: {
    position: "absolute",
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: "rgba(31, 84, 221, 0.05)",
    top: -width * 0.2,
    right: -width * 0.2,
  },
  circle2: {
    position: "absolute",
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    backgroundColor: "rgba(31, 84, 221, 0.03)",
    bottom: height * 0.15,
    left: -width * 0.15,
  },
  circle3: {
    position: "absolute",
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: width * 0.15,
    backgroundColor: "rgba(31, 84, 221, 0.04)",
    top: height * 0.3,
    right: width * 0.1,
  },
  topSection: {
    alignItems: "center",
    marginTop: 40,
  },
  logoContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(31, 84, 221, 0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#1F54DD",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
  title: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    marginTop: 16,
    color: "#1A1A1A",
    textAlign: "center",
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 12,
    color: "#666",
    fontFamily: "Poppins-Regular",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: "90%",
  },
  featuresContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 40,
    width: "100%",
    maxWidth: 300,
  },
  featureItem: {
    alignItems: "center",
    flex: 1,
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(31, 84, 221, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  featureIconText: {
    fontSize: 20,
  },
  featureText: {
    fontSize: 12,
    color: "#666",
    fontFamily: "Poppins-Medium",
    textAlign: "center",
  },
  bottomSection: {
    alignItems: "center",
    width: "100%",
  },
  primaryBtn: {
    width: "100%",
    height: 56,
    backgroundColor: "#1F54DD",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#1F54DD",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 16,
  },
  primaryText: {
    color: "#FFF",
    fontSize: 16,
    fontFamily: "Poppins-Bold",
  },
  secondaryBtn: {
    width: "100%",
    height: 56,
    borderWidth: 2,
    borderColor: "#1F54DD",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(31, 84, 221, 0.05)",
    marginBottom: 24,
  },
  secondaryText: {
    color: "#1F54DD",
    fontSize: 16,
    fontFamily: "Poppins-Bold",
  },
  footerText: {
    fontSize: 12,
    color: "#999",
    fontFamily: "Poppins-Regular",
    textAlign: "center",
    lineHeight: 18,
    maxWidth: "80%",
  },
});