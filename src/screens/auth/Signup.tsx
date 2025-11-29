import { BASE_API, REGISTER } from "@/src/routes";
import axios, { AxiosError } from "axios";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface ApiErrorResponse {
  message?: string;
  errors?: {
    name?: string[];
    email?: string[];
    phone?: string[];
    password?: string[];
  };
}

interface SignupProps {
  navigation: {
    navigate: (screen: string, params?: Record<string, unknown>) => void;
  };
}

const Signup: React.FC<SignupProps> = ({ navigation }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
  });

  const [deviceId, setDeviceId] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  // Get Device ID
  //   useEffect(() => {
  //     const getDeviceId = async () => {
  //       if (Application.androidId) {
  //         setDeviceId(Application.androidId);
  //       } else {
  //         const iosId = await Application.getIosIdForVendorAsync();
  //         setDeviceId(iosId || "");
  //       }
  //     };
  //     getDeviceId();
  //   }, []);

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof typeof form, string>> = {};

    if (!form.name.trim()) newErrors.name = "Name is required";

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/;
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!emailRegex.test(form.email.trim())) newErrors.email = "Invalid email address";

    if (!form.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^\d{11}$/.test(form.phone.trim()))
      newErrors.phone = "Phone must be an 11-digit number";

    const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!form.password.trim()) newErrors.password = "Password is required";
    else if (!passRegex.test(form.password))
      newErrors.password =
        "Must be 8+ chars including upper, lower, number & special character";

    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);

    const payload = {
      name: form.name,
      email: form.email.toLowerCase(),
      phone: form.phone,
      password: form.password,
      confirm_password: form.confirmPassword,
      referral_code: form.referralCode,
      channel: "mobile",
      device_id: deviceId,
    };

    try {
      const response = await axios.post(`${BASE_API}${REGISTER}`, payload);
      setLoading(false);

      if (response.data.success) {
        navigation.navigate("Verification", {
          email: form.email.toLowerCase(),
          name: form.name,
          otpType: "signup_otp",
        });
      }
    } catch (error: unknown) {
      setLoading(false);

      const axiosErr = error as AxiosError<ApiErrorResponse>;

      if (axiosErr.response?.data?.errors) {
        const apiErrors = axiosErr.response.data.errors;

        setErrors({
          email: apiErrors.email?.[0],
          phone: apiErrors.phone?.[0],
          password: apiErrors.password?.[0],
        });
      }

      setGeneralError(axiosErr.response?.data?.message || "Something went wrong");
    }
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
          
          <Text style={styles.title}>Create an Account</Text>
          {/* <Text style={styles.subtitle}>Join WiseSub to get started</Text> */}

          {/* FORM INPUTS */}
          {/** NAME */}
          <TextInput
            placeholder="Enter your name"
            style={styles.input}
            onChangeText={(text) => updateField("name", text)}
            value={form.name}
          />
          {errors.name && <Text style={styles.error}>{errors.name}</Text>}

          {/** EMAIL */}
          <TextInput
            placeholder="Enter your email"
            style={styles.input}
            onChangeText={(text) => updateField("email", text)}
            value={form.email}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email && <Text style={styles.error}>{errors.email}</Text>}

          {/** PHONE */}
          <TextInput
            placeholder="Enter your phone number"
            style={styles.input}
            onChangeText={(text) => updateField("phone", text)}
            value={form.phone}
            keyboardType="numeric"
          />
          {errors.phone && <Text style={styles.error}>{errors.phone}</Text>}

          {/** PASSWORD */}
          <TextInput
            placeholder="Enter your password"
            style={styles.input}
            secureTextEntry
            onChangeText={(text) => updateField("password", text)}
            value={form.password}
            onFocus={() => setIsPasswordFocused(true)}
            onBlur={() => setIsPasswordFocused(false)}
          />
          {errors.password && <Text style={styles.error}>{errors.password}</Text>}

          {isPasswordFocused && (
            <Text style={styles.passwordHint}>
              Must include uppercase, lowercase, number & special character.
            </Text>
          )}

          {/** CONFIRM PASSWORD */}
          <TextInput
            placeholder="Confirm your password"
            style={styles.input}
            secureTextEntry
            onChangeText={(text) => updateField("confirmPassword", text)}
            value={form.confirmPassword}
          />
          {errors.confirmPassword && (
            <Text style={styles.error}>{errors.confirmPassword}</Text>
          )}

          {/** REFERRAL */}
          <TextInput
            placeholder="Referral Code (Optional)"
            style={styles.input}
            onChangeText={(text) => updateField("referralCode", text)}
            value={form.referralCode}
          />

          {generalError && <Text style={styles.error}>{generalError}</Text>}

          {/* TERMS */}
          <Text style={styles.terms}>
            By continuing you agree to our{" "}
            <Text
              style={styles.link}
              onPress={() => navigation.navigate("TermsAndConditions")}
            >
              terms and conditions
            </Text>{" "}
            and{" "}
            <Text
              style={styles.link}
              onPress={() => navigation.navigate("PrivacyPolicy")}
            >
              privacy policy
            </Text>
            .
          </Text>

          {/* BUTTONS */}
          {loading ? (
            <View style={[styles.button, { opacity: 0.5 }]}>
              <ActivityIndicator color="#fff" />
            </View>
          ) : (
            <TouchableOpacity onPress={handleRegister}>
              <View style={styles.button}>
                <Text style={styles.buttonText}>Sign Up</Text>
              </View>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => navigation.navigate("Signin")}
            style={{ marginTop: 15 }}
          >
            <Text style={styles.loginText}>
              Already have an account?{" "}
              <Text style={styles.loginLink}>Sign In</Text>
            </Text>
          </TouchableOpacity>

          <View style={{ height: 300 }} />
        </View>
      </View>
    </ScrollView>
  );
};

export default Signup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "space-between",
    paddingVertical: 40,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: "contain",
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
    marginBottom: 10,
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
    fontSize: 14,
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
    color: "#FF0000",
    alignSelf: "flex-start",
    marginTop: 5,
    marginLeft: 20,
    fontFamily: "Poppins-Regular",
    fontSize: 12,
  },
  loginText: {
    fontSize: 14,
    color: "#3C3E3E",
    fontFamily: "Poppins-Regular",
  },
  loginLink: {
    color: "#1F54DD",
    fontFamily: "Poppins-Regular",
  },
  terms: {
    width: 320,
    textAlign: "center",
    marginTop: 15,
    fontSize: 12,
    color: "#3C3E3E",
    fontFamily: "Poppins-Regular",
  },
  link: {
    color: "#1F54DD",
  },
  passwordHint: {
    width: 320,
    fontSize: 11,
    marginTop: 5,
    color: "#666",
    fontFamily: "Poppins-Regular",
  },
});