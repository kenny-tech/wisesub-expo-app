// DeleteAccount.tsx
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useProfile } from '../redux/hooks/useProfile';
import { profileService } from '../services/profileService';
import { sharedStyles as styles } from '../styles/sharedStyles';
import { showError, showSuccess } from '../utils/toast';

interface DeleteFormData {
    email: string;
    password: string;
}

interface DeleteFormErrors {
    email?: string;
    password?: string;
}

export default function DeleteAccount({ navigation }: { navigation: any }) {
    const { user } = useProfile();
    const userEmail = user?.email || '';

    const [formData, setFormData] = useState<DeleteFormData>({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState<DeleteFormErrors>({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const validateForm = (): boolean => {
        const newErrors: DeleteFormErrors = {};
        let isValid = true;

        if (!formData.password.trim()) {
            newErrors.password = "Password is required";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleDeleteAccount = async () => {
        if (!validateForm()) return;
        
        formData.email = userEmail;

        // Show confirmation alert
        Alert.alert(
            "Permanently Delete Account",
            "This action cannot be undone. All your data including wallet balance and transaction history will be permanently deleted. Are you sure you want to proceed?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setLoading(true);

                            const response = await profileService.deleteAccount(formData);

                            if (response.success) {
                                showSuccess('Account Deleted', response.message || 'Your account has been successfully deleted.');

                                // Clear local storage
                                await AsyncStorage.clear();

                                // Navigate to login screen after successful deletion
                                setTimeout(() => {
                                    navigation.reset({
                                        index: 0,
                                        routes: [{ name: 'Signin' }],
                                    });
                                }, 1500);
                            } else {
                                showError('Error', response.message || 'Failed to delete account');
                            }
                        } catch (error: any) {
                            console.error('Delete account error:', error);

                            if (error.errors) {
                                const apiErrors: DeleteFormErrors = {};
                                Object.keys(error.errors).forEach(key => {
                                    apiErrors[key as keyof DeleteFormErrors] = error.errors[key][0];
                                });
                                setErrors(apiErrors);

                                // Show first error as toast
                                const firstError = Object.values(apiErrors)[0];
                                if (firstError) {
                                    showError('Error', firstError);
                                }
                            } else {
                                showError('Error', error.message || 'Failed to delete account. Please try again.');
                            }
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const clearFieldError = (field: keyof DeleteFormErrors) => {
        setErrors(prev => ({
            ...prev,
            [field]: undefined
        }));
    };

    const toggleShowPassword = () => {
        setShowPassword(prev => !prev);
    };

    return (
        <View style={styles.screen}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#0F172A" />
                </TouchableOpacity>
                <Text style={styles.title}>Delete Account</Text>
                <View style={styles.placeholder} />
            </View>

            <KeyboardAvoidingView
                style={deleteStyles.keyboardAvoidingView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <ScrollView
                    style={deleteStyles.scrollView}
                    contentContainerStyle={deleteStyles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Warning Section */}
                    <View style={[styles.card, deleteStyles.warningCard]}>
                        <View style={deleteStyles.warningHeader}>
                            <View style={deleteStyles.warningIcon}>
                                <Ionicons name="warning" size={32} color="#DC2626" />
                            </View>
                            <Text style={deleteStyles.warningTitle}>We're sad to see you go!</Text>
                        </View>

                        <Text style={deleteStyles.warningText}>
                            Are you sure you want to delete your account? This action is permanent and cannot be undone.
                        </Text>

                        <View style={deleteStyles.consequences}>
                            <Text style={deleteStyles.consequencesTitle}>You will lose:</Text>
                            <View style={deleteStyles.consequenceItem}>
                                <Ionicons name="close-circle" size={16} color="#DC2626" />
                                <Text style={deleteStyles.consequenceText}>All your personal data</Text>
                            </View>
                            <View style={deleteStyles.consequenceItem}>
                                <Ionicons name="close-circle" size={16} color="#DC2626" />
                                <Text style={deleteStyles.consequenceText}>Transaction history</Text>
                            </View>
                            <View style={deleteStyles.consequenceItem}>
                                <Ionicons name="close-circle" size={16} color="#DC2626" />
                                <Text style={deleteStyles.consequenceText}>Wallet balance and rewards</Text>
                            </View>
                            <View style={deleteStyles.consequenceItem}>
                                <Ionicons name="close-circle" size={16} color="#DC2626" />
                                <Text style={deleteStyles.consequenceText}>All purchased services</Text>
                            </View>
                        </View>
                    </View>

                    {/* Confirmation Section */}
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Confirm Deletion</Text>
                        <Text style={deleteStyles.confirmationText}>
                            To confirm account deletion, please enter your account email and password below.
                        </Text>


                        {/* Password Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password</Text>
                            <View style={[styles.inputContainer, errors.password && deleteStyles.inputError]}>
                                <Ionicons name="lock-closed" size={20} color="#64748B" />
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    placeholderTextColor="#94A3B8"
                                    onChangeText={(text) => {
                                        setFormData({ ...formData, password: text });
                                        clearFieldError('password');
                                    }}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity
                                    onPress={toggleShowPassword}
                                    style={styles.eyeButton}
                                >
                                    <Ionicons
                                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                                        size={20}
                                        color="#64748B"
                                    />
                                </TouchableOpacity>
                            </View>
                            {errors.password && (
                                <Text style={deleteStyles.errorText}>{errors.password}</Text>
                            )}
                            <Text style={deleteStyles.helperText}>
                                Enter your password to confirm account deletion
                            </Text>
                        </View>

                        {/* Delete Button */}
                        <TouchableOpacity
                            onPress={handleDeleteAccount}
                            style={[deleteStyles.deleteButton, loading && deleteStyles.buttonDisabled]}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Text style={deleteStyles.deleteButtonText}>Delete Account</Text>
                            )}
                        </TouchableOpacity>

                        {/* Cancel Button */}
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={deleteStyles.cancelButton}
                            disabled={loading}
                        >
                            <Text style={deleteStyles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Extra padding at bottom to ensure content is scrollable */}
                    <View style={deleteStyles.bottomPadding} />
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

// Delete Account specific styles
const deleteStyles = StyleSheet.create({
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    bottomPadding: {
        height: 40,
    },
    warningCard: {
        borderColor: '#FECACA',
        backgroundColor: '#FEF2F2',
        marginTop: 10,
        marginBottom: 20,
    },
    warningHeader: {
        alignItems: 'center',
        marginBottom: 16,
    },
    warningIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#FECACA',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    warningTitle: {
        fontSize: 20,
        fontFamily: 'Poppins-Bold',
        color: '#DC2626',
        textAlign: 'center',
    },
    warningText: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#374151',
        lineHeight: 20,
        marginBottom: 16,
        textAlign: 'center',
    },
    consequences: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    consequencesTitle: {
        fontSize: 14,
        fontFamily: 'Poppins-SemiBold',
        color: '#374151',
        marginBottom: 12,
    },
    consequenceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    consequenceText: {
        fontSize: 12,
        fontFamily: 'Poppins-Regular',
        color: '#64748B',
        marginLeft: 8,
    },
    confirmationText: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#64748B',
        lineHeight: 20,
        marginBottom: 16,
    },
    currentEmailContainer: {
        backgroundColor: '#F1F5F9',
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    currentEmailLabel: {
        fontSize: 12,
        fontFamily: 'Poppins-Medium',
        color: '#64748B',
        marginBottom: 4,
    },
    currentEmailValue: {
        fontSize: 14,
        fontFamily: 'Poppins-SemiBold',
        color: '#0F172A',
    },
    helperText: {
        fontSize: 12,
        fontFamily: 'Poppins-Regular',
        color: '#64748B',
        marginTop: 4,
        marginLeft: 4,
        fontStyle: 'italic',
    },
    inputError: {
        borderColor: '#DC2626',
    },
    errorText: {
        color: '#DC2626',
        fontSize: 12,
        fontFamily: 'Poppins-Regular',
        marginTop: 4,
        marginLeft: 4,
    },
    deleteButton: {
        backgroundColor: '#DC2626',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        marginBottom: 12,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    deleteButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
    },
    cancelButton: {
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        backgroundColor: '#F8FAFC',
    },
    cancelButtonText: {
        color: '#64748B',
        fontSize: 16,
        fontFamily: 'Poppins-Medium',
    },
});