import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { formatAmount, formatDate } from "../helper/util";

const { width } = Dimensions.get("window");
const SERVICE_COLS = 4;
const SERVICE_SIZE = (width - 40 - (SERVICE_COLS - 1) * 12) / SERVICE_COLS;

type Service = {
  id: number;
  name: string;
  icon: React.ReactNode;
  screen: string;
  color: string;
  comingSoon?: boolean;
};

type Transaction = {
  id: number;
  type: string;
  created_at: string;
  amount: string;
};

const servicesData: Service[] = [
  { id: 1, name: "Data", icon: <Ionicons name="wifi" size={20} />, screen: "Data", color: "#6366F1" },
  { id: 2, name: "Airtime", icon: <Ionicons name="call" size={20} />, screen: "Airtime", color: "#10B981" },
  { id: 3, name: "Cable", icon: <MaterialIcons name="live-tv" size={20} />, screen: "CableTv", color: "#F59E0B" },
  { id: 4, name: "Electricity", icon: <Ionicons name="flash" size={20} />, screen: "Electricity", color: "#EF4444" },
  { id: 5, name: "Rewards", icon: <Ionicons name="gift" size={20} />, screen: "Rewards", color: "#8B5CF6" },
  { id: 6, name: "Refer & Earn", icon: <Ionicons name="people" size={20} />, screen: "Referral", color: "#06B6D4" },
  { id: 7, name: "Insurance", icon: <Ionicons name="shield-checkmark" size={20} />, screen: "Insurance", color: "#84CC16", comingSoon: true },
  { id: 8, name: "Education", icon: <Ionicons name="school" size={20} />, screen: "Education", color: "#F97316", comingSoon: true },
];

// Fund Wallet Modal Component
function FundWalletModal({
  isVisible,
  onClose,
  onSelectMethod
}: {
  isVisible: boolean;
  onClose: () => void;
  onSelectMethod: (method: 'bank' | 'card') => void;
}) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={modalStyles.overlay}
        activeOpacity={1}
        onPressOut={onClose} // Close when clicking outside
      >
        <View style={modalStyles.container}>
          {/* Header */}
          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>Fund Wallet</Text>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Subtitle */}
          <Text style={modalStyles.subtitle}>Choose your preferred payment method</Text>

          {/* Options */}
          <TouchableOpacity
            style={modalStyles.option}
            onPress={() => onSelectMethod('bank')}
          >
            <View style={[modalStyles.optionIcon, { backgroundColor: '#E0E7FF' }]}>
              <Ionicons name="business" size={24} color="#1F54DD" />
            </View>
            <View style={modalStyles.optionText}>
              <Text style={modalStyles.optionTitle}>Bank Transfer</Text>
              <Text style={modalStyles.optionDescription}>
                Transfer directly from your bank account
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#64748B" />
          </TouchableOpacity>

          <TouchableOpacity
            style={modalStyles.option}
            onPress={() => onSelectMethod('card')}
          >
            <View style={[modalStyles.optionIcon, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="card" size={24} color="#16A34A" />
            </View>
            <View style={modalStyles.optionText}>
              <Text style={modalStyles.optionTitle}>Card Payment</Text>
              <Text style={modalStyles.optionDescription}>
                Pay instantly with your debit/credit card
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#64748B" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

export default function Home({ navigation }: { navigation: any }) {
  const [loading, setLoading] = useState<boolean>(false);
  const [walletBalance, setWalletBalance] = useState<string>("15250");
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 1, type: "Wallet Top-up", created_at: new Date().toISOString(), amount: "5000.00" },
    { id: 2, type: "Data Purchase", created_at: new Date().toISOString(), amount: "1000.00" },
  ]);
  const [showBalance, setShowBalance] = useState<boolean>(true);
  const [unreadCount, setUnreadCount] = useState<number>(2);
  const [showFundModal, setShowFundModal] = useState<boolean>(false); // Changed from showFundSheet

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      const t = setTimeout(() => {
        setWalletBalance("152500");
        setLoading(false);
      }, 800);
      return () => clearTimeout(t);
    }, [])
  );

  const handleFundWalletPress = () => {
    setShowFundModal(true);
  };

  const handleSelectPaymentMethod = (method: 'bank' | 'card') => {
    setShowFundModal(false);
    navigation.navigate('FundAmount', { method });
  };

  const renderService = ({ item }: { item: Service }) => {
    const tint = `${item.color}20`;
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => !item.comingSoon && navigation.navigate(item.screen)}
        style={styles.serviceCard}
        disabled={item.comingSoon}
      >
        <View style={[styles.serviceIconContainer, { backgroundColor: tint, borderColor: `${item.color}40` }]}>
          <Text style={[styles.iconInner, { color: item.color }]}>{item.icon}</Text>
          {item.comingSoon && (
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>Soon</Text>
            </View>
          )}
        </View>
        <Text style={[styles.serviceName, item.comingSoon && styles.comingSoonServiceName]} numberOfLines={1}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isCredit = item.type === "Wallet Top-up";
    return (
      <View style={styles.transactionItem}>
        <View style={styles.transactionLeft}>
          <View style={[styles.transactionIcon, isCredit ? styles.creditIcon : styles.debitIcon]}>
            <Text style={styles.transactionIconText}>{isCredit ? "↑" : "↓"}</Text>
          </View>
          <View style={styles.transactionDetails}>
            <Text style={styles.transactionTitle}>{isCredit ? "Wallet Funded" : item.type}</Text>
            <Text style={styles.transactionDate}>{formatDate(item.created_at)}</Text>
          </View>
        </View>
        <Text style={[styles.transactionAmount, isCredit ? styles.amountCredit : styles.amountDebit]}>
          {isCredit ? "+" : "-"}₦{formatAmount(item.amount)}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <FlatList
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>Hi, John!</Text>
                <Text style={styles.subtitle}>Welcome back to WiseSub</Text>
              </View>

              <View style={styles.headerIcons}>
                <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate("Support")}>
                  <MaterialIcons name="chat-bubble-outline" size={18} color="#374151" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate("Notification")}>
                  <Ionicons name="notifications-outline" size={18} color="#374151" />
                  {unreadCount > 0 && (
                    <View style={styles.notificationBadge}>
                      <Text style={styles.badgeText}>{unreadCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Compact Wallet Card */}
            <View style={styles.walletContainer}>
              <View style={styles.walletCard}>
                <View style={styles.walletRow}>
                  <View>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Text style={styles.walletLabel}>Wallet balance </Text>

                      <TouchableOpacity
                        onPress={() => setShowBalance(!showBalance)}
                        style={styles.eyeBtn}
                      >
                        <Ionicons
                          name={showBalance ? "eye-outline" : "eye-off-outline"}
                          size={18}
                          color="#fff"
                        />
                      </TouchableOpacity>
                    </View>

                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <View style={styles.balanceRow}>
                        <Text style={styles.currency}>₦</Text>
                        <Text style={styles.balanceText}>
                          {showBalance ? formatAmount(walletBalance) : "••••••"}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Fund button - Updated to show modal */}
                  <TouchableOpacity
                    style={styles.fundBtn}
                    onPress={handleFundWalletPress}
                  >
                    <Text style={styles.fundBtnText}>+ Fund Wallet</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Quick Services */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Services</Text>
              <FlatList
                data={servicesData}
                renderItem={renderService}
                keyExtractor={(s) => s.id.toString()}
                numColumns={SERVICE_COLS}
                scrollEnabled={false}
                contentContainerStyle={styles.servicesGrid}
              />
            </View>

            {/* Transactions header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Transactions</Text>
              <TouchableOpacity onPress={() => navigation.navigate("History")}>
                <Text style={styles.seeMore}>See more</Text>
              </TouchableOpacity>
            </View>
          </>
        }
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(t) => t.id.toString()}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No recent transactions</Text>
          </View>
        }
      />

      {/* Fund Wallet Modal */}
      <FundWalletModal
        isVisible={showFundModal}
        onClose={() => setShowFundModal(false)}
        onSelectMethod={handleSelectPaymentMethod}
      />
    </View>
  );
}

// Modal Styles
const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    minHeight: 300,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F172A',
  },
  closeButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
    marginBottom: 24,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F172A',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
    lineHeight: 16,
  },
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FFFFFF", paddingTop: 15 },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  header: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  greeting: { fontSize: 22, fontFamily: "Poppins-Bold", color: "#0F172A" },
  subtitle: { marginTop: 4, color: "#667085", fontSize: 13, fontFamily: "Poppins-Regular" },
  headerIcons: { flexDirection: "row", gap: 10 },
  iconButton: {
    width: 44,
    height: 44,
    backgroundColor: "#fff",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationBadge: {
    position: "absolute",
    top: -2,
    right: -3,
    width: 18,
    height: 18,
    borderRadius: 18,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: { color: "#fff", fontSize: 10, fontFamily: "Poppins-SemiBold" },

  // wallet
  walletContainer: { marginBottom: 18 },
  walletCard: {
    backgroundColor: "#1F54DD",
    borderRadius: 16,
    padding: 14,
    shadowColor: "#1F54DD",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    overflow: "hidden",
  },
  walletRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  walletLabel: { color: "rgba(255,255,255,0.9)", fontSize: 13, marginBottom: 6, fontFamily: "Poppins-Medium" },
  balanceRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  currency: { color: "#fff", fontSize: 14, marginBottom: 4, fontFamily: "Poppins-Medium" },
  balanceText: { color: "#fff", fontSize: 22, fontFamily: "Poppins-Bold" },
  eyeBtn: { marginLeft: 1, marginBottom: 5, padding: 6, borderRadius: 8 },
  fundBtn: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  fundBtnText: { color: "#1F54DD", fontSize: 14, fontFamily: "Poppins-Medium" },

  // services
  section: { marginTop: 6, marginBottom: 18 },
  sectionTitle: { fontSize: 16, fontFamily: "Poppins-Medium", color: "#0F172A", marginBottom: 12 },
  servicesGrid: { paddingBottom: 6 },
  serviceCard: {
    width: SERVICE_SIZE,
    marginRight: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  serviceIconContainer: {
    width: SERVICE_SIZE - 14,
    height: SERVICE_SIZE - 14,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "rgba(15,23,42,0.06)",
    position: "relative",
  },
  iconInner: { color: "#000" },
  serviceName: { marginTop: 8, fontSize: 12, fontFamily: "Poppins-Medium", color: "#0F172A", textAlign: "center" },

  // Coming soon styles
  comingSoonBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#1F54DD",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  comingSoonText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontFamily: "Poppins-Bold",
  },
  comingSoonServiceName: {
    opacity: 0.7,
  },

  // transactions
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
  seeMore: { color: "#1F54DD", fontSize: 13, fontFamily: "Poppins-Medium" },

  transactionItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  transactionLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  transactionIcon: { width: 42, height: 42, borderRadius: 10, justifyContent: "center", alignItems: "center", marginRight: 10 },
  creditIcon: { backgroundColor: "#ECFDF5" },
  debitIcon: { backgroundColor: "#FEF3F2" },
  transactionIconText: { fontSize: 16, fontFamily: "Poppins-SemiBold" },
  transactionDetails: { flex: 1 },
  transactionTitle: { fontSize: 14, fontFamily: "Poppins-Medium", color: "#0F172A", marginBottom: 2 },
  transactionDate: { fontSize: 12, color: "#94A3B8", fontFamily: "Poppins-Regular" },
  transactionAmount: { fontSize: 14, fontFamily: "Poppins-SemiBold" },
  amountCredit: { color: "#10B981" },
  amountDebit: { color: "#EF4444" },

  // empty
  empty: { padding: 12, alignItems: "center" },
  emptyText: { color: "#94A3B8" },
});