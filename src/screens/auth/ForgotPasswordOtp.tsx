import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
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

interface ForgotPasswordOtpProps {
    navigation: any;
    route: any;
}

const ForgotPasswordOtp: React.FC<ForgotPasswordOtpProps> = ({ navigation, route }) => {
    const { email } = route.params;
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [timer, setTimer] = useState(60);
    const inputRefs = useRef<Array<TextInput | null>>([]);

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const handleOtpChange = (text: string, index: number) => {
        if (text.length <= 1) {
            const newOtp = [...otp];
            newOtp[index] = text;
            setOtp(newOtp);

            // Auto-focus next input
            if (text && index < 5) {
                inputRefs.current[index + 1]?.focus();
            }

            // Auto-submit when all digits are entered
            if (text && index === 5) {
                const fullOtp = newOtp.join("");
                if (fullOtp.length === 6) {
                    handleVerifyOtp(fullOtp);
                }
            }
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerifyOtp = async (otpCode?: string) => {
        const otpValue = otpCode || otp.join("");

        if (otpValue.length !== 6) {
            Alert.alert("Error", "Please enter the complete 6-digit OTP");
            return;
        }

        setLoading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            setLoading(false);

            // Navigate to reset password screen
            navigation.navigate("ResetPassword", { email, otp: otpValue });
        } catch (error) {
            setLoading(false);
            Alert.alert("Error", "Invalid OTP. Please try again.");
        }
    };

    const handleResendOtp = async () => {
        if (timer > 0) return;

        setResendLoading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            setResendLoading(false);
            setTimer(60);
            setOtp(["", "", "", "", "", ""]);
            inputRefs.current[0]?.focus();
            Alert.alert("Success", "OTP has been resent to your email");
        } catch (error) {
            setResendLoading(false);
            Alert.alert("Error", "Failed to resend OTP. Please try again.");
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
                <Text style={styles.title}>Enter OTP</Text>
                <View style={styles.placeholder} />
            </View>

            <View style={styles.content}>
                <Image
                    source={require("../../../assets/images/logo.png")}
                    style={styles.logo}
                />

                <Text style={styles.subtitle}>
                    We've sent a 6-digit OTP to{"\n"}
                    <Text style={styles.emailText}>{email}</Text>
                </Text>

                {/* OTP Input Boxes */}
                <View style={styles.otpContainer}>
                    {otp.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => (inputRefs.current[index] = ref)}
                            style={[styles.otpInput, digit ? styles.otpInputFilled : null]}
                            value={digit}
                            onChangeText={(text) => handleOtpChange(text, index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                            keyboardType="numeric"
                            maxLength={1}
                            selectTextOnFocus
                        />
                    ))}
                </View>

                {/* Verify Button */}
                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={() => handleVerifyOtp()}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <Text style={styles.buttonText}>Verify OTP</Text>
                    )}
                </TouchableOpacity>

                {/* Resend OTP */}
                <View style={styles.resendContainer}>
                    <Text style={styles.resendText}>
                        Didn't receive the code?{" "}
                    </Text>
                    <TouchableOpacity onPress={handleResendOtp} disabled={timer > 0 || resendLoading}>
                        <Text style={[
                            styles.resendLink,
                            (timer > 0 || resendLoading) && styles.resendLinkDisabled
                        ]}>
                            {resendLoading ? "Sending..." : timer > 0 ? `Resend in ${timer}s` : "Resend OTP"}
                        </Text>
                    </TouchableOpacity>
                </View>
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
    emailText: {
        fontFamily: "Poppins-SemiBold",
        color: "#1F54DD",
    },
    otpContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        maxWidth: 320,
        marginBottom: 40,
    },
    otpInput: {
        width: 45,
        height: 55,
        borderWidth: 1,
        borderColor: "#D9D9D9",
        borderRadius: 10,
        textAlign: "center",
        fontSize: 20,
        fontFamily: "Poppins-SemiBold",
        backgroundColor: "#FFFFFF",
    },
    otpInputFilled: {
        borderColor: "#1F54DD",
        backgroundColor: "#F8FAFC",
    },
    button: {
        width: 320,
        height: 48,
        backgroundColor: "#1F54DD",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 6,
        marginBottom: 30,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontFamily: "Poppins-Regular",
    },
    resendContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    resendText: {
        fontSize: 14,
        color: "#3C3E3E",
        fontFamily: "Poppins-Regular",
    },
    resendLink: {
        color: "#1F54DD",
        fontFamily: "Poppins-Regular",
    },
    resendLinkDisabled: {
        color: "#94A3B8",
    },
});

export default ForgotPasswordOtp;