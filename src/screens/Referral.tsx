import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import * as Clipboard from 'expo-clipboard';
import React, { useCallback, useState } from "react";
import {
    Alert,
    FlatList,
    Modal,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useProfile } from "../redux/hooks/useProfile";
import { referralService, ReferralUser } from "../services/referralService";
import { showSuccess } from "../utils/toast";

export default function Referral({ navigation }: { navigation: any }) {
    const [loading, setLoading] = useState<boolean>(false);
    const [referralCount, setReferralCount] = useState<number>(0);
    const [referralUsers, setReferralUsers] = useState<ReferralUser[]>([]);
    const [modalVisible, setModalVisible] = useState<boolean>(false);

    const { user } = useProfile();

    const fetchReferrals = useCallback(async () => {
        setLoading(true);
        try {
            const response = await referralService.getUserReferrals();
            if (response.success) {
                setReferralCount(response.data.count);
                setReferralUsers(response.data.users);
            } else {
                console.warn(response.message);
                setReferralCount(0);
                setReferralUsers([]);
            }
        } catch (error: any) {
            console.error("Failed to fetch referrals:", error);
            Alert.alert("Error", error.message || "Could not load referral data");
            setReferralCount(0);
            setReferralUsers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchReferrals();
        }, [fetchReferrals])
    );

    const copyToClipboard = async () => {
        await Clipboard.setStringAsync(user?.referral_code || "");
        showSuccess("Copied", "Referral code copied to clipboard.");
    };

    const onShare = async () => {
        try {
            await Share.share({
                message: `Join me using my referral code: ${user?.referral_code}`,
            });
        } catch (error: any) {
            Alert.alert("Error", error.message);
        }
    };

    const openReferralModal = () => {
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
    };

    const renderReferralUser = ({ item }: { item: ReferralUser }) => (
        <View style={modalStyles.userItem}>
            <View style={modalStyles.avatar}>
                <Text style={modalStyles.avatarText}>
                    {item.name.charAt(0).toUpperCase()}
                </Text>
            </View>
            <Text style={modalStyles.userName}>{item.name}</Text>
        </View>
    );

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

                    {/* People Referred Card - Only show if user has at least one referral */}
                    {referralCount > 0 && (
                        <View style={styles.statsContainer}>
                            <TouchableOpacity
                                style={styles.statCard}
                                onPress={openReferralModal}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.statIcon, { backgroundColor: '#E0E7FF' }]}>
                                    <Ionicons name="person-add" size={20} color="#1F54DD" />
                                </View>
                                <Text style={styles.statLabel}>People Referred</Text>
                                <Text style={styles.statCount}>{referralCount}</Text>
                                <Ionicons name="chevron-forward" size={16} color="#1F54DD" style={styles.chevron} />
                            </TouchableOpacity>
                        </View>
                    )}

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

                    {/* How it works - Now inside a card */}
                    <View style={styles.howItWorksCard}>
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

            {/* Scrollable Modal for Referred Users */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeModal}
            >
                <TouchableOpacity style={modalStyles.overlay} activeOpacity={1} onPressOut={closeModal}>
                    <View style={modalStyles.modalContainer}>
                        <View style={modalStyles.modalHeader}>
                            <Text style={modalStyles.modalTitle}>Referred Users</Text>
                            <TouchableOpacity onPress={closeModal} style={modalStyles.closeButton}>
                                <Ionicons name="close" size={24} color="#64748B" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={referralUsers}
                            renderItem={renderReferralUser}
                            keyExtractor={(item) => item.id.toString()}
                            contentContainerStyle={modalStyles.listContent}
                            showsVerticalScrollIndicator={true}
                            ListEmptyComponent={
                                <View style={modalStyles.emptyContainer}>
                                    <Text style={modalStyles.emptyText}>No referred users found</Text>
                                </View>
                            }
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
            <View style={{ height: 50 }} />
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
        marginBottom: 32,
    },
    statCard: {
        backgroundColor: "#F8FAFC",
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        position: "relative",
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
    statCount: {
        fontSize: 18,
        fontFamily: "Poppins-Bold",
        color: "#1F54DD",
    },
    chevron: {
        position: "absolute",
        right: 12,
        top: "50%",
        marginTop: -8,
    },
    referralSection: {
        backgroundColor: "#F8FAFC",
        borderRadius: 16,
        padding: 20,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    howItWorksCard: {
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
    stepsContainer: {
        gap: 16,
    },
    step: {
        flexDirection: "row",
        alignItems: "center",
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

// Modal Styles
const modalStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    modalContainer: {
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
        maxHeight: "80%",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontFamily: "Poppins-SemiBold",
        color: "#0F172A",
    },
    closeButton: {
        padding: 4,
    },
    listContent: {
        paddingBottom: 20,
    },
    userItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#E0E7FF",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    avatarText: {
        fontSize: 18,
        fontFamily: "Poppins-SemiBold",
        color: "#1F54DD",
    },
    userName: {
        fontSize: 16,
        fontFamily: "Poppins-Medium",
        color: "#0F172A",
    },
    emptyContainer: {
        paddingVertical: 30,
        alignItems: "center",
    },
    emptyText: {
        fontSize: 14,
        fontFamily: "Poppins-Regular",
        color: "#94A3B8",
    },
});