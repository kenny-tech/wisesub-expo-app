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
import { useTheme } from "../theme/ThemeContext";
import { showSuccess } from "../utils/toast";

export default function Referral({ navigation }: { navigation: any }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const modalStyles = makeModalStyles(colors);

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

  useFocusEffect(useCallback(() => { fetchReferrals(); }, [fetchReferrals]));

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(user?.referral_code || "");
    showSuccess("Copied", "Referral code copied to clipboard.");
  };

  const onShare = async () => {
    try {
      await Share.share({ message: `Join me using my referral code: ${user?.referral_code}` });
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const openReferralModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);

  const renderReferralUser = ({ item }: { item: ReferralUser }) => (
    <View style={modalStyles.userItem}>
      <View style={[modalStyles.avatar, { backgroundColor: colors.primaryLight }]}>
        <Text style={[modalStyles.avatarText, { color: colors.primary }]}>{item.name.charAt(0).toUpperCase()}</Text>
      </View>
      <Text style={[modalStyles.userName, { color: colors.textPrimary }]}>{item.name}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="gift" size={64} color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading referral data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: colors.background }}>
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Refer & Earn</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <View style={styles.descriptionContainer}>
            <Ionicons name="people" size={48} color={colors.primary} />
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              You will receive a commission each time the person you refer performs a transaction
            </Text>
          </View>

          {referralCount > 0 && (
            <View style={styles.statsContainer}>
              <TouchableOpacity style={[styles.statCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.divider }]} onPress={openReferralModal} activeOpacity={0.7}>
                <View style={[styles.statIcon, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name="person-add" size={20} color={colors.primary} />
                </View>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>People Referred</Text>
                <Text style={[styles.statCount, { color: colors.primary }]}>{referralCount}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.primary} style={styles.chevron} />
              </TouchableOpacity>
            </View>
          )}

          <View style={[styles.referralSection, { backgroundColor: colors.backgroundSecondary, borderColor: colors.divider }]}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Your Referral Code</Text>
            <View style={styles.referralInputContainer}>
              <View style={[styles.referralInput, { backgroundColor: colors.card, borderColor: colors.divider }]}>
                <Text style={[styles.referralCodeText, { color: colors.textPrimary }]}>{user?.referral_code}</Text>
              </View>
              <TouchableOpacity onPress={copyToClipboard} style={[styles.copyButton, { backgroundColor: colors.card, borderColor: colors.divider }]}>
                <Ionicons name="copy" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={onShare} style={[styles.shareButton, { backgroundColor: colors.primary }]}>
              <Ionicons name="share-social" size={20} color="#FFFFFF" />
              <Text style={styles.shareButtonText}>Share Referral Code</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.howItWorksCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.divider }]}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>How It Works</Text>
            <View style={styles.stepsContainer}>
              {['Share your referral code with friends', 'They sign up using your code', 'Earn commissions on their transactions'].map((text, i) => (
                <View key={i} style={styles.step}>
                  <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                    <Text style={styles.stepNumberText}>{i + 1}</Text>
                  </View>
                  <Text style={[styles.stepText, { color: colors.textSecondary }]}>{text}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>

      <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={closeModal}>
        <TouchableOpacity style={modalStyles.overlay} activeOpacity={1} onPressOut={closeModal}>
          <View style={[modalStyles.modalContainer, { backgroundColor: colors.card }]}>
            <View style={[modalStyles.modalHeader, { borderBottomColor: colors.separator }]}>
              <Text style={[modalStyles.modalTitle, { color: colors.textPrimary }]}>Referred Users</Text>
              <TouchableOpacity onPress={closeModal} style={modalStyles.closeButton}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={referralUsers}
              renderItem={renderReferralUser}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={modalStyles.listContent}
              showsVerticalScrollIndicator
              ListEmptyComponent={
                <View style={modalStyles.emptyContainer}>
                  <Text style={[modalStyles.emptyText, { color: colors.textMuted }]}>No referred users found</Text>
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

const makeStyles = (colors: any) => StyleSheet.create({
  screen: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  loadingText: { marginTop: 16, fontSize: 16, fontFamily: "Poppins-Regular", textAlign: "center" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  backButton: { padding: 4 },
  title: { fontSize: 18, fontFamily: "Poppins-SemiBold" },
  placeholder: { width: 32 },
  content: { flex: 1, paddingHorizontal: 20 },
  descriptionContainer: { alignItems: "center", marginBottom: 32, paddingHorizontal: 20 },
  description: { fontSize: 16, fontFamily: "Poppins-Regular", textAlign: "center", marginTop: 16, lineHeight: 24 },
  statsContainer: { marginBottom: 32 },
  statCard: { borderRadius: 16, padding: 16, alignItems: "center", borderWidth: 1, position: "relative" },
  statIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center", marginBottom: 8 },
  statLabel: { fontSize: 12, fontFamily: "Poppins-Regular", textAlign: "center", marginBottom: 4 },
  statCount: { fontSize: 18, fontFamily: "Poppins-Bold" },
  chevron: { position: "absolute", right: 12, top: "50%", marginTop: -8 },
  referralSection: { borderRadius: 16, padding: 20, marginBottom: 32, borderWidth: 1 },
  howItWorksCard: { borderRadius: 16, padding: 20, marginBottom: 32, borderWidth: 1 },
  sectionTitle: { fontSize: 16, fontFamily: "Poppins-SemiBold", marginBottom: 16 },
  referralInputContainer: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  referralInput: { flex: 1, borderRadius: 12, padding: 16, borderWidth: 1 },
  referralCodeText: { fontSize: 16, fontFamily: "Poppins-Medium", textAlign: "center" },
  copyButton: { width: 48, height: 48, borderRadius: 12, justifyContent: "center", alignItems: "center", marginLeft: 12, borderWidth: 1 },
  shareButton: { borderRadius: 12, padding: 16, flexDirection: "row", justifyContent: "center", alignItems: "center" },
  shareButtonText: { color: "#FFFFFF", fontSize: 16, fontFamily: "Poppins-SemiBold", marginLeft: 8 },
  stepsContainer: { gap: 16 },
  step: { flexDirection: "row", alignItems: "center" },
  stepNumber: { width: 24, height: 24, borderRadius: 12, justifyContent: "center", alignItems: "center", marginRight: 12 },
  stepNumberText: { color: "#FFFFFF", fontSize: 12, fontFamily: "Poppins-Bold" },
  stepText: { flex: 1, fontSize: 14, fontFamily: "Poppins-Regular" },
});

const makeModalStyles = (colors: any) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContainer: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40, maxHeight: "80%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20, borderBottomWidth: 1, paddingBottom: 12 },
  modalTitle: { fontSize: 18, fontFamily: "Poppins-SemiBold" },
  closeButton: { padding: 4 },
  listContent: { paddingBottom: 20 },
  userItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.divider },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center", marginRight: 12 },
  avatarText: { fontSize: 18, fontFamily: "Poppins-SemiBold" },
  userName: { fontSize: 16, fontFamily: "Poppins-Medium" },
  emptyContainer: { paddingVertical: 30, alignItems: "center" },
  emptyText: { fontSize: 14, fontFamily: "Poppins-Regular" },
});