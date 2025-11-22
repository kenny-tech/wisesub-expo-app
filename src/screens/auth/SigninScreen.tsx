import { BASE_API, LOGIN } from "@/src/routes";
import axios from "axios";
import React, { useState } from "react";
import {
  ActivityIndicator,
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

  // Get Device ID
  //   useEffect(() => {
  //     const loadDeviceId = async () => {
  //       const id =
  //         (await Application.getIosIdForVendorAsync()) ||
  //         Application.machineId ||
  //         "";
  //       setDeviceId(id);
  //     };

  //     loadDeviceId();
  //   }, []);

  const handleLogin = async () => {
    if (!email.trim()) return setEmailError("Email is required");
    setEmailError(null);

    if (!password.trim()) return setPasswordError("Password is required");
    setPasswordError(null);

    setLoading(true);

    try {
      const response = await axios.post(`${BASE_API}${LOGIN}`, {
        email: email.toLowerCase(),
        password,
        device_id: deviceId,
      });

      setLoading(false);

      if (response.data.success) {
        navigation.replace("Dashboard");
      }
    } catch (err: any) {
      setLoading(false);

      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <ScrollView keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        <View style={{ alignItems: "center" }}>
          <Text style={styles.title}>Welcome Back</Text>

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
          <TextInput
            placeholder="Password"
            style={styles.input}
            secureTextEntry
            onChangeText={setPassword}
            value={password}
          />
          {passwordError && <Text style={styles.error}>{passwordError}</Text>}

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
    paddingVertical: 100,
  },
  title: {
    color: "#1F2937",
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    marginTop: 20,
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
