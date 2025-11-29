import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface ForgotPasswordProps {
    navigation: any;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [emailError, setEmailError] = useState("");

    const validateEmail = () => {
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/;
        if (!email.trim()) {
            setEmailError("Email is required");
            return false;
        } else if (!emailRegex.test(email.trim())) {
            setEmailError("Invalid email address");
            return false;
        }
        setEmailError("");
        return true;
    };

    const handleSendOtp = async () => {
        if (!validateEmail()) return;

        setLoading(true);

        // Simulate API call to send OTP
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            setLoading(false);

            // Navigate to OTP screen with email
            navigation.navigate("ForgotPasswordOtp", { email: email.toLowerCase() });
        } catch (error) {
            setLoading(false);
            Alert.alert("Error", "Failed to send OTP. Please try again.");
        }
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#0F172A" />
                </TouchableOpacity>
                <Text style={styles.title}>Forgot Password</Text>
                <View style={styles.placeholder} />
            </View>

            <View style={styles.content}>
                <Image
                    source={require("../../../assets/images/logo.png")}
                    style={styles.logo}
                />

                <Text style={styles.subtitle}>
                    Enter your email address and we'll send you an OTP to reset your password.
                </Text>

                {/* Email Input */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email Address</Text>
                    <TextInput
                        style={[styles.input, emailError ? styles.inputError : null]}
                        placeholder="Enter your email"
                        value={email}
                        onChangeText={(text) => {
                            setEmail(text);
                            setEmailError("");
                        }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholderTextColor="#94A3B8"
                    />
                    {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
                </View>

                {/* Send OTP Button */}
                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleSendOtp}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <Text style={styles.buttonText}>Send OTP</Text>
                    )}
                </TouchableOpacity>

                {/* Back to Login */}
                <TouchableOpacity
                    onPress={() => navigation.navigate("Signin")}
                    style={styles.backToLoginContainer}
                >
                    <Text style={styles.backToLoginText}>
                        Remember your password? <Text style={styles.backToLoginLink}>Sign In</Text>
                    </Text>
                </TouchableOpacity>
                <View style={{ height: 400 }} />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    contentContainer: {
        flexGrow: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: "#FFFFFF",
    },
    backButton: {
        padding: 4,
    },
    title: {
        fontSize: 18,
        fontFamily: "Poppins-SemiBold",
        color: "#0F172A",
    },
    placeholder: {
        width: 32,
    },
    content: {
        flex: 1,
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 40,
    },
    logo: {
        width: 120,
        height: 120,
        resizeMode: "contain",
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        fontFamily: "Poppins-Regular",
        color: "#64748B",
        textAlign: "center",
        marginBottom: 40,
        lineHeight: 24,
    },
    inputContainer: {
        width: "100%",
        maxWidth: 320,
        marginBottom: 30,
    },
    label: {
        fontSize: 14,
        fontFamily: "Poppins-Medium",
        color: "#374151",
        marginBottom: 8,
    },
    input: {
        width: "100%",
        height: 50,
        borderWidth: 1,
        borderColor: "#D9D9D9",
        borderRadius: 10,
        paddingHorizontal: 12,
        fontFamily: "Poppins-Regular",
        fontSize: 14,
        backgroundColor: "#FFFFFF",
    },
    inputError: {
        borderColor: "#DC2626",
    },
    errorText: {
        color: "#DC2626",
        fontSize: 12,
        fontFamily: "Poppins-Regular",
        marginTop: 4,
    },
    button: {
        width: 320,
        height: 48,
        backgroundColor: "#1F54DD",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 6,
        marginTop: 10,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontFamily: "Poppins-Regular",
    },
    backToLoginContainer: {
        marginTop: 30,
    },
    backToLoginText: {
        fontSize: 14,
        color: "#3C3E3E",
        fontFamily: "Poppins-Regular",
    },
    backToLoginLink: {
        color: "#1F54DD",
    },
});

export default ForgotPassword;