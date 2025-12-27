import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import * as Clipboard from 'expo-clipboard';
import React, { useCallback, useState } from "react";
import {
    Alert,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useProfile } from "../redux/hooks/useProfile";
import { showSuccess } from "../utils/toast";

// Mock data - replace with your actual API calls and user context
const mockReferralData = {
    earnings: "450.00",
    referralCount: 3,
    referralCode: "FRIEND2024"
};

export default function Referral({ navigation }: { navigation: any }) {
    const [loading, setLoading] = useState<boolean>(false);
    const [referralEarnings, setReferralEarnings] = useState<string>("0.00");
    const [referralCount, setReferralCount] = useState<number>(0);
    const [referralCode, setReferralCode] = useState<string>("");

    const { user } = useProfile();

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            // Simulate API fetch
            const t = setTimeout(() => {
                setReferralEarnings(mockReferralData.earnings);
                setReferralCount(mockReferralData.referralCount);
                setReferralCode(mockReferralData.referralCode);
                setLoading(false);
            }, 1000);
            return () => clearTimeout(t);
        }, [])
    );

    const copyToClipboard = async () => {
        await Clipboard.setStringAsync(user?.referral_code);
        showSuccess(
            'Copied',
            'Referral code copied to clipboard.'
        );
    };

    const onShare = async () => {
        try {
            await Share.share({
                message: `Join me using my referral code: ${user?.referral_code}`,
            });
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <Ionicons name="gift" size={64} color="#1F54DD" />
                <Text style={styles.loadingText}>Loading referral data...</Text>
            </View>
        );
    }

    return (
        <ScrollView>
            <View style={styles.screen}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#0F172A" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Refer & Earn</Text>
                    <View style={styles.placeholder} />
                </View>

                <View style={styles.content}>
                    {/* Description */}
                    <View style={styles.descriptionContainer}>
                        <Ionicons name="people" size={48} color="#1F54DD" />
                        <Text style={styles.description}>
                            You will receive a commission each time the person you refer performs a transaction
                        </Text>
                    </View>

                    {/* Stats Cards */}
                    <View style={styles.statsContainer}>
                        <View style={styles.statCard}>
                            <View style={[styles.statIcon, { backgroundColor: '#ECFDF5' }]}>
                                <Ionicons name="cash" size={20} color="#10B981" />
                            </View>
                            <Text style={styles.statLabel}>Referral Earnings</Text>
                            <Text style={styles.statAmount}>₦{referralEarnings}</Text>
                        </View>

                        <View style={styles.statCard}>
                            <View style={[styles.statIcon, { backgroundColor: '#E0E7FF' }]}>
                                <Ionicons name="person-add" size={20} color="#1F54DD" />
                            </View>
                            <Text style={styles.statLabel}>People Referred</Text>
                            <Text style={styles.statCount}>{referralCount}</Text>
                        </View>
                    </View>

                    {/* Referral Code Section */}
                    <View style={styles.referralSection}>
                        <Text style={styles.sectionTitle}>Your Referral Code</Text>

                        <View style={styles.referralInputContainer}>
                            <View style={styles.referralInput}>
                                <Text style={styles.referralCodeText}>{user?.referral_code}</Text>
                            </View>
                            <TouchableOpacity onPress={copyToClipboard} style={styles.copyButton}>
                                <Ionicons name="copy" size={20} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity onPress={onShare} style={styles.shareButton}>
                            <Ionicons name="share-social" size={20} color="#FFFFFF" />
                            <Text style={styles.shareButtonText}>Share Referral Code</Text>
                        </TouchableOpacity>
                    </View>

                    {/* How it works */}
                    <View style={styles.howItWorks}>
                        <Text style={styles.sectionTitle}>How It Works</Text>
                        <View style={styles.stepsContainer}>
                            <View style={styles.step}>
                                <View style={styles.stepNumber}>
                                    <Text style={styles.stepNumberText}>1</Text>
                                </View>
                                <Text style={styles.stepText}>Share your referral code with friends</Text>
                            </View>
                            <View style={styles.step}>
                                <View style={styles.stepNumber}>
                                    <Text style={styles.stepNumberText}>2</Text>
                                </View>
                                <Text style={styles.stepText}>They sign up using your code</Text>
                            </View>
                            <View style={styles.step}>
                                <View style={styles.stepNumber}>
                                    <Text style={styles.stepNumberText}>3</Text>
                                </View>
                                <Text style={styles.stepText}>Earn commissions on their transactions</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#FFFFFF"
    },
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        padding: 20,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        fontFamily: "Poppins-Regular",
        color: "#64748B",
        textAlign: "center",
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
        paddingHorizontal: 20,
    },
    descriptionContainer: {
        alignItems: "center",
        marginBottom: 32,
        paddingHorizontal: 20,
    },
    description: {
        fontSize: 16,
        fontFamily: "Poppins-Regular",
        color: "#64748B",
        textAlign: "center",
        marginTop: 16,
        lineHeight: 24,
    },
    statsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 32,
    },
    statCard: {
        flex: 1,
        backgroundColor: "#F8FAFC",
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 4,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    statIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },
    statLabel: {
        fontSize: 12,
        fontFamily: "Poppins-Regular",
        color: "#64748B",
        textAlign: "center",
        marginBottom: 4,
    },
    statAmount: {
        fontSize: 18,
        fontFamily: "Poppins-Bold",
        color: "#10B981",
    },
    statCount: {
        fontSize: 18,
        fontFamily: "Poppins-Bold",
        color: "#1F54DD",
    },
    referralSection: {
        backgroundColor: "#F8FAFC",
        borderRadius: 16,
        padding: 20,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: "Poppins-SemiBold",
        color: "#0F172A",
        marginBottom: 16,
    },
    referralInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    referralInput: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    referralCodeText: {
        fontSize: 16,
        fontFamily: "Poppins-Medium",
        color: "#0F172A",
        textAlign: "center",
    },
    copyButton: {
        width: 48,
        height: 48,
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 12,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    shareButton: {
        backgroundColor: "#1F54DD",
        borderRadius: 12,
        padding: 16,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    shareButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontFamily: "Poppins-SemiBold",
        marginLeft: 8,
    },
    howItWorks: {
        marginBottom: 32,
    },
    stepsContainer: {
        backgroundColor: "#F8FAFC",
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    step: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    stepNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "#1F54DD",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    stepNumberText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontFamily: "Poppins-Bold",
    },
    stepText: {
        flex: 1,
        fontSize: 14,
        fontFamily: "Poppins-Regular",
        color: "#64748B",
    },
});