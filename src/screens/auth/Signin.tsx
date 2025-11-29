import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

interface SigninProps {
  navigation: any;
}

const Signin: React.FC<SigninProps> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [deviceId, setDeviceId] = useState("");

  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    navigation.replace('Tabs')
  };

  return (
    <ScrollView keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        <View style={{ alignItems: "center" }}>
          {/* Logo */}
          <Image
            source={require("../../../assets/images/logo.png")}
            style={styles.logo}
          />

          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Kindly login to access your account</Text>

          {/* EMAIL */}
          <TextInput
            placeholder="Email Address"
            style={styles.input}
            onChangeText={setEmail}
            value={email}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          {emailError && <Text style={styles.error}>{emailError}</Text>}

          {/* PASSWORD */}
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Password"
              style={styles.passwordInput}
              secureTextEntry={!showPassword}
              onChangeText={setPassword}
              value={password}
              autoCapitalize="none"
            />
            <TouchableOpacity 
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons 
                name={showPassword ? "eye-off" : "eye"} 
                size={20} 
                color="#64748B" 
              />
            </TouchableOpacity>
          </View>
          {passwordError && <Text style={styles.error}>{passwordError}</Text>}

          {/* Forgot Password Link */}
          <TouchableOpacity 
            style={styles.forgotPasswordContainer}
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          {error && <Text style={styles.error}>{error}</Text>}

          {/* BUTTON */}
          {loading ? (
            <View style={[styles.button, { opacity: 0.5 }]}>
              <ActivityIndicator color="#fff" />
            </View>
          ) : (
            <TouchableOpacity onPress={handleLogin}>
              <View style={styles.button}>
                <Text style={styles.buttonText}>Sign In</Text>
              </View>
            </TouchableOpacity>
          )}

          {/* SIGNUP LINK */}
          <TouchableOpacity
            onPress={() => navigation.navigate("Signup")}
            style={{ marginTop: 15 }}
          >
            <Text style={styles.loginText}>
              Don't have an account?{" "}
              <Text style={styles.loginLink}>Sign Up</Text>
            </Text>
          </TouchableOpacity>

          <View style={{ height: 400 }} />
        </View>
      </View>
    </ScrollView>
  );
};

export default Signin;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "space-between",
    paddingVertical: 60,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    marginBottom: 10,
  },
  title: {
    color: "#1F2937",
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    marginTop: 10,
    marginBottom: 8,
  },
  subtitle: {
    color: "#64748B",
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    width: 320,
    height: 50,
    borderWidth: 1,
    borderColor: "#D9D9D9",
    borderRadius: 10,
    marginTop: 20,
    paddingHorizontal: 12,
    fontFamily: "Poppins-Regular",
  },
  passwordContainer: {
    width: 320,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "#D9D9D9",
    borderRadius: 10,
    marginTop: 20,
    backgroundColor: '#FFFFFF',
  },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 12,
    fontFamily: "Poppins-Regular",
  },
  eyeIcon: {
    padding: 10,
  },
  forgotPasswordContainer: {
    width: 320,
    alignItems: 'flex-end',
    marginTop: 8,
  },
  forgotPasswordText: {
    color: "#1F54DD",
    fontSize: 14,
    fontFamily: "Poppins-Regular",
  },
  button: {
    width: 320,
    height: 48,
    backgroundColor: "#1F54DD",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    marginTop: 30,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Poppins-Regular",
  },
  error: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
  loginText: {
    fontSize: 14,
    color: "#3C3E3E",
    fontFamily: "Poppins-Regular",
  },
  loginLink: {
    color: "#1F54DD",
  },
});