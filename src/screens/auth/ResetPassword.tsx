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

interface ResetPasswordProps {
    navigation: any;
    route: any;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ navigation, route }) => {
    const { email, otp } = route.params;
    const [form, setForm] = useState({
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({
        password: "",
        confirmPassword: "",
    });

    const validateForm = () => {
        const newErrors = {
            password: "",
            confirmPassword: "",
        };

        const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

        if (!form.password.trim()) {
            newErrors.password = "Password is required";
        } else if (!passRegex.test(form.password)) {
            newErrors.password = "Must be 8+ chars including upper, lower, number & special character";
        }

        if (!form.confirmPassword.trim()) {
            newErrors.confirmPassword = "Please confirm your password";
        } else if (form.password !== form.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return !newErrors.password && !newErrors.confirmPassword;
    };

    const handleResetPassword = async () => {
        if (!validateForm()) return;

        setLoading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            setLoading(false);

            Alert.alert(
                "Success",
                "Your password has been reset successfully!",
                [
                    {
                        text: "OK",
                        onPress: () => navigation.navigate("Signin")
                    }
                ]
            );
        } catch (error) {
            setLoading(false);
            Alert.alert("Error", "Failed to reset password. Please try again.");
        }
    };

    const updateField = (field: string, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
        setErrors(prev => ({ ...prev, [field]: "" }));
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
                <Text style={styles.title}>Reset Password</Text>
                <View style={styles.placeholder} />
            </View>

            <View style={styles.content}>
                <Image
                    source={require("../../../assets/images/logo.png")}
                    style={styles.logo}
                />

                <Text style={styles.subtitle}>
                    Create a new password for your account
                </Text>

                {/* New Password */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>New Password</Text>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={[styles.passwordInput, errors.password ? styles.inputError : null]}
                            placeholder="Enter new password"
                            value={form.password}
                            onChangeText={(text) => updateField("password", text)}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            placeholderTextColor="#94A3B8"
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
                    {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
                </View>

                {/* Confirm Password */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Confirm New Password</Text>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={[styles.passwordInput, errors.confirmPassword ? styles.inputError : null]}
                            placeholder="Confirm new password"
                            value={form.confirmPassword}
                            onChangeText={(text) => updateField("confirmPassword", text)}
                            secureTextEntry={!showConfirmPassword}
                            autoCapitalize="none"
                            placeholderTextColor="#94A3B8"
                        />
                        <TouchableOpacity
                            style={styles.eyeIcon}
                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            <Ionicons
                                name={showConfirmPassword ? "eye-off" : "eye"}
                                size={20}
                                color="#64748B"
                            />
                        </TouchableOpacity>
                    </View>
                    {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
                </View>

                {/* Reset Password Button */}
                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleResetPassword}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <Text style={styles.buttonText}>Reset Password</Text>
                    )}
                </TouchableOpacity>

                {/* Back to Login */}
                <TouchableOpacity
                    onPress={() => navigation.navigate("Signin")}
                    style={styles.backToLoginContainer}
                >
                    <Text style={styles.backToLoginText}>
                        Back to <Text style={styles.backToLoginLink}>Sign In</Text>
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
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontFamily: "Poppins-Medium",
        color: "#374151",
        marginBottom: 8,
    },
    passwordContainer: {
        width: "100%",
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: "#D9D9D9",
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
    },
    passwordInput: {
        flex: 1,
        height: 50,
        paddingHorizontal: 12,
        fontFamily: "Poppins-Regular",
        fontSize: 14,
    },
    inputError: {
        borderColor: "#DC2626",
    },
    eyeIcon: {
        padding: 10,
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
        marginTop: 20,
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
    backToLoginContainer: {
        marginTop: 10,
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

export default ResetPassword;