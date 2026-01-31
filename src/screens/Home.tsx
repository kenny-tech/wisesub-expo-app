import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Modal,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Toast from 'react-native-toast-message';
import { formatAmount, formatDate } from "../helper/util";
import { useNotifications } from "../redux/hooks/useNotifications";
import { useProfile } from "../redux/hooks/useProfile";
import { Transaction, walletService } from "../services/walletService";

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

const servicesData: Service[] = [
  { id: 1, name: "Data", icon: <Ionicons name="wifi" size={20} />, screen: "Data", color: "#1F54DD" },
  { id: 2, name: "Airtime", icon: <Ionicons name="call" size={20} />, screen: "Airtime", color: "#1F54DD" },
  { id: 3, name: "Cable", icon: <MaterialIcons name="live-tv" size={20} />, screen: "CableTv", color: "#1F54DD" },
  { id: 4, name: "Electricity", icon: <Ionicons name="flash" size={20} />, screen: "Electricity", color: "#1F54DD" },
  { id: 5, name: "Rewards", icon: <Ionicons name="gift" size={20} />, screen: "Rewards", color: "#1F54DD" },
  { id: 6, name: "Refer & Earn", icon: <Ionicons name="people" size={20} />, screen: "Referral", color: "#1F54DD" },
  { id: 7, name: "Help", icon: <Ionicons name="help-circle" size={20} />, screen: "Support", color: "#1F54DD" },
  { id: 7, name: "History", icon: <Ionicons name="receipt" size={20} />, screen: "History", color: "#1F54DD" },
  // { id: 7, name: "Insurance", icon: <Ionicons name="shield-checkmark" size={20} />, screen: "Insurance", color: "#1F54DD", comingSoon: true },
  // { id: 8, name: "Education", icon: <Ionicons name="school" size={20} />, screen: "Education", color: "#1F54DD", comingSoon: true },
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
        onPressOut={onClose}
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
  const [walletBalance, setWalletBalance] = useState<string>("0");
  const [commissionBalance, setCommissionBalance] = useState<string>("0");
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState<boolean>(false);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);
  const [showBalance, setShowBalance] = useState<boolean>(true);
  const [showFundModal, setShowFundModal] = useState<boolean>(false);

  const { stats, fetchNotifications, markAllAsRead } = useNotifications();

  const { user } = useProfile();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchWalletBalance = async () => {
    try {
      setLoading(true);
      setWalletError(null);

      const response = await walletService.getWalletBalance();

      if (response.success) {
        setWalletBalance(response.data.wallet_balance);
        setCommissionBalance(response.data.commission_balance);
      } else {
        setWalletError(response.message || 'Failed to fetch balance');
      }
    } catch (error: any) {
      console.error('Wallet balance error:', error);
      setWalletError(error.message || 'Failed to fetch wallet balance');

      if (error.message?.includes('Session expired') || error.message?.includes('Unauthorized')) {
        Toast.show({
          type: 'error',
          text1: 'Session Expired',
          text2: 'Please login again to continue.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setTransactionsLoading(true);
      setTransactionsError(null);

      const response = await walletService.getTransactions({ limit: 4 });

      if (response.success) {
        setTransactions(response.data);
      } else {
        setTransactionsError(response.message || 'Failed to fetch transactions');
      }
    } catch (error: any) {
      console.error('Transactions error:', error);
      setTransactionsError(error.message || 'Failed to fetch transactions');
    } finally {
      setTransactionsLoading(false);
    }
  };

  const fetchAllData = async () => {
    await Promise.all([fetchWalletBalance(), fetchTransactions()]);
  };

  useFocusEffect(
    useCallback(() => {
      fetchAllData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  };

  const handleFundWalletPress = () => {
    setShowFundModal(true);
  };

  const handleSelectPaymentMethod = (method: 'bank' | 'card') => {
    setShowFundModal(false);
    navigation.navigate('FundAmount', { method });
  };

  const handleViewRewards = () => {
    navigation.navigate('Rewards');
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

  const getTransactionIcon = (transaction: Transaction) => {
    const isCredit = [
      'Fund Wallet',
      'Commission',
      'Referral Commission',
      'Refund'
    ].includes(transaction.name);

    if (isCredit) {
      return (
        <View style={[styles.transactionIcon, styles.creditIcon]}>
          <Ionicons name="arrow-down" size={20} color="#10B981" />
        </View>
      );
    } else {
      return (
        <View style={[styles.transactionIcon, styles.debitIcon]}>
          <Ionicons name="arrow-up" size={20} color="#EF4444" />
        </View>
      );
    }
  };

  const getTransactionDescription = (transaction: Transaction) => {
    if (transaction.name === "Commission") {
      return `Bonus from ${transaction.type} purchase`;
    } else if (transaction.name === "Fund Wallet") {
      return "Wallet Funded";
    } else {
      let description = transaction.name;
      if (transaction.type) description += ` ${transaction.type}`;
      // if (transaction.customer) description += ` — ${transaction.customer}`;
      if (transaction.customer) description;

      return description;
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isCredit = [
      'Fund Wallet',
      'Commission',
      'Referral Commission',
      'Refund'
    ].includes(item.name);

    return (
      <TouchableOpacity
        style={styles.transactionItem}
        onPress={() => navigation.navigate('TransactionDetail', { transaction: item })}
      >
        <View style={styles.transactionLeft}>
          {getTransactionIcon(item)}
          <View style={styles.transactionDetails}>
            <Text style={styles.transactionTitle} numberOfLines={1}>
              {getTransactionDescription(item)}
            </Text>
            <Text style={styles.transactionDate}>
              {formatDate(item.created_at)}
            </Text>
            {/* {item.type === "Electricity" && item.electricity_token && (
              <Text style={styles.electricityToken}>
                Token: {item.electricity_token}
              </Text>
            )} */}
          </View>
        </View>
        <Text style={[
          styles.transactionAmount,
          isCredit ? styles.amountCredit : styles.amountDebit
        ]}>
          {isCredit ? '+' : '-'}₦{formatAmount(item.amount)}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderEmptyTransactions = () => {
    if (transactionsLoading) {
      return (
        <View style={styles.empty}>
          <ActivityIndicator size="large" color="#1F54DD" />
          <Text style={styles.emptyText}>Loading transactions...</Text>
        </View>
      );
    }

    if (transactionsError) {
      return (
        <View style={styles.empty}>
          <Ionicons name="alert-circle" size={48} color="#EF4444" />
          <Text style={[styles.emptyText, { color: '#EF4444' }]}>
            {transactionsError}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchTransactions}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.empty}>
        <Ionicons name="receipt-outline" size={48} color="#94A3B8" />
        <Text style={styles.emptyTitle}>No transactions yet</Text>
        <Text style={styles.emptyDescription}>
          Your transaction history will appear here once you start using our services.
        </Text>
      </View>
    );
  };

  // Check if user has earned commission (balance > 0)
  const hasCommission = parseFloat(commissionBalance) > 0;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <FlatList
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#1F54DD"]}
            tintColor="#1F54DD"
          />
        }
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>Hi {user?.name?.split(' ')[0]}!</Text>
                <Text style={styles.subtitle}>Welcome back to WiseSub</Text>
              </View>

              <View style={styles.headerIcons}>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={async () => {
                    // Only mark as read if there are unread notifications (readAt === null)
                    if (stats.unread > 0) {
                      try {
                        // await markAllAsRead();
                        await fetchNotifications(); // Refresh to update badge immediately
                      } catch (error) {
                        console.error('Failed to mark notifications as read:', error);
                      }
                    }
                    navigation.navigate("Notification");
                  }}
                >
                  <Ionicons name="notifications-outline" size={18} color="#374151" />
                  {/* {stats.unread > 0 && (
                    <View style={styles.notificationBadge}>
                      <Text style={styles.badgeText}>
                        {stats.unread > 9 ? '9+' : stats.unread}
                      </Text>
                    </View>
                  )} */}
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
                      <ActivityIndicator color="#fff" size="small" />
                    ) : walletError ? (
                      <TouchableOpacity onPress={fetchWalletBalance}>
                        <Text style={[styles.balanceText, { fontSize: 14, opacity: 0.8 }]}>
                          Tap to retry
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.balanceRow}>
                        <Text style={styles.currency}>₦</Text>
                        <Text style={styles.balanceText}>
                          {showBalance ? formatAmount(walletBalance) : "••••••"}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Fund button */}
                  <TouchableOpacity
                    style={styles.fundBtn}
                    onPress={handleFundWalletPress}
                    disabled={loading}
                  >
                    <Text style={styles.fundBtnText}>+ Fund Wallet</Text>
                  </TouchableOpacity>
                </View>

                {/* Commission Balance Display - Only show if user has commission */}
                {hasCommission && (
                  <View style={styles.commissionContainer}>
                    <View style={styles.commissionRow}>
                      <View style={styles.commissionIconContainer}>
                        <Ionicons name="gift" size={14} color="#10B981" />
                      </View>
                      <Text style={styles.commissionLabel}>You have bonus balance:</Text>
                      <Text style={styles.commissionAmount}>
                        ₦{formatAmount(commissionBalance)}
                      </Text>
                      {/* <TouchableOpacity 
                        style={styles.viewRewardsBtn}
                        onPress={handleViewRewards}
                      >
                        <Text style={styles.viewRewardsText}>View Rewards</Text>
                        <Ionicons name="arrow-forward" size={12} color="#10B981" />
                      </TouchableOpacity> */}
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Services */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Services</Text>
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
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListEmptyComponent={renderEmptyTransactions()}
        ListFooterComponent={<View style={{ height: 20 }} />}
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
  currency: { color: "#fff", fontSize: 22, marginBottom: 8, fontFamily: "Poppins-Medium" },
  balanceText: { color: "#fff", fontSize: 22, fontFamily: "Poppins-Bold", marginBottom: 7 },
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

  // Commission display
  commissionContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
  },
  commissionRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  commissionIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  commissionLabel: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    marginRight: 6,
  },
  commissionAmount: {
    color: "#10B981",
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    marginRight: 12,
  },
  viewRewardsBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: "auto",
  },
  viewRewardsText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Poppins-Medium",
    marginRight: 4,
  },

  // services
  section: { marginTop: 18, marginBottom: 18 },
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
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  transactionLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  transactionIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10
  },
  creditIcon: { backgroundColor: "#ECFDF5" },
  debitIcon: { backgroundColor: "#FEF3F2" },
  transactionDetails: { flex: 1 },
  transactionTitle: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#0F172A",
    marginBottom: 2
  },
  transactionDate: {
    fontSize: 12,
    color: "#94A3B8",
    fontFamily: "Poppins-Regular"
  },
  electricityToken: {
    fontSize: 11,
    color: "#64748B",
    fontFamily: "Poppins-Regular",
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold"
  },
  amountCredit: { color: "#10B981" },
  amountDebit: { color: "#EF4444" },

  // empty state
  empty: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center"
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: "#0F172A",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },
  emptyText: {
    color: "#94A3B8",
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    marginTop: 8,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#1F54DD",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
  },
});