import { Ionicons } from '@expo/vector-icons';
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
import Toast from 'react-native-toast-message';
import { sharedStyles as styles } from '../styles/sharedStyles';

// Mock user data - replace with your actual user data from Redux
const mockUser = {
    email: "john.doe@example.com",
};

export default function DeleteAccount({ navigation }: { navigation: any }) {
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleDeleteAccount = async () => {
        if (!password.trim()) {
            setPasswordError('Password is required');
            return;
        } else {
            setPasswordError('');
        }

        try {
            setLoading(true);

            // Simulate API call - replace with your actual DELETE_ACCOUNT API
            await new Promise(resolve => setTimeout(resolve, 2000));

            setLoading(false);

            Toast.show({
                type: 'success',
                text1: 'Account Deleted',
                text2: 'Your account has been successfully deleted.',
            });

            // Navigate to login screen after successful deletion
            navigation.navigate('Signin');

        } catch (error: any) {
            setLoading(false);
            Alert.alert('Error', error.message || 'Failed to delete account. Please try again.');
        }
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
                        </View>
                    </View>

                    {/* Confirmation Section */}
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Confirm Deletion</Text>
                        <Text style={deleteStyles.confirmationText}>
                            To confirm account deletion, please enter your password below.
                        </Text>

                        {/* Password Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password</Text>
                            <TextInput
                                style={[styles.inputContainer, passwordError && deleteStyles.inputError]}
                                placeholder="Enter your password"
                                value={password}
                                placeholderTextColor="#94A3B8"
                                onChangeText={(text) => {
                                    setPassword(text);
                                    setPasswordError('');
                                }}
                                secureTextEntry
                                autoCapitalize="none"
                            />
                            {passwordError && <Text style={deleteStyles.errorText}>{passwordError}</Text>}
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
                                <Text style={deleteStyles.deleteButtonText}>Permanently Delete Account</Text>
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
        paddingBottom: 20,
    },
    bottomPadding: {
        height: 40,
    },
    warningCard: {
        borderColor: '#FECACA',
        backgroundColor: '#FEF2F2',
        marginTop: 10,
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
        marginBottom: 20,
    },
    inputError: {
        borderColor: '#DC2626',
    },
    errorText: {
        color: '#DC2626',
        fontSize: 12,
        fontFamily: 'Poppins-Regular',
        marginTop: 4,
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