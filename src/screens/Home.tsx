import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import * as Device from 'expo-device';
import { Image } from "expo-image";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from 'react-native-toast-message';
import { formatAmount, formatDate } from "../helper/util";
import { useAppDispatch } from "../redux/hooks";
import { useNotifications } from "../redux/hooks/useNotifications";
import { useProfile } from "../redux/hooks/useProfile";
import { setUser } from "../redux/slices/authSlice";
import { profileService } from "../services/profileService";
import { pushNotificationService } from '../services/pushNotificationService';
import { Transaction, walletService } from "../services/walletService";
import { useTheme } from '../theme/ThemeContext';
import { APP_CONSTANTS } from "../utils/constants";
import { showSuccess } from "../utils/toast";

const { width } = Dimensions.get("window");
const SERVICE_COLS = 4;
const SERVICE_SIZE = (width - 40 - (SERVICE_COLS - 1) * 12) / SERVICE_COLS;

type Service = {
  id: number;
  name: string;
  icon: React.ReactNode; // base icon without color
  screen: string;
  comingSoon?: boolean;
};

// Remove hardcoded colors from servicesData – icons will get theme primary color dynamically
const servicesData: Service[] = [
  { id: 1, name: "Data", icon: <Ionicons name="wifi" size={20} />, screen: "Data" },
  { id: 2, name: "Airtime", icon: <Ionicons name="call" size={20} />, screen: "Airtime" },
  { id: 3, name: "Cable", icon: <MaterialIcons name="live-tv" size={20} />, screen: "CableTv" },
  { id: 4, name: "Electricity", icon: <Ionicons name="flash" size={20} />, screen: "Electricity" },
  { id: 5, name: "Education", icon: <Ionicons name="school" size={20} />, screen: "Education" },
  { id: 6, name: "Rewards", icon: <Ionicons name="gift" size={20} />, screen: "Rewards" },
  { id: 7, name: "Refer & Earn", icon: <Ionicons name="people" size={20} />, screen: "Referral" },
  { id: 8, name: "Help", icon: <Ionicons name="help-circle" size={20} />, screen: "Support" },
];

export default function Home({ navigation }: { navigation: any }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const modalStyles = makeModalStyles(colors);

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
  const [deviceId, setDeviceId] = useState<string>('');
  const [pushToken, setPushToken] = useState<string | null>(null);

  const { stats, fetchNotifications, markAllAsRead } = useNotifications();
  const { user } = useProfile();
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [settingPin, setSettingPin] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);

  const dispatch = useAppDispatch();

  // Get device ID and register for push notifications
  useEffect(() => {
    getDeviceId();
    setupPushNotifications();
  }, []);

  const getDeviceId = async () => {
    try {
      const deviceId = Device.osBuildId || Device.modelId || 'mobile-device';
      setDeviceId(deviceId);
    } catch (error) {
      console.log('Error getting device ID:', error);
    }
  };

  const setupPushNotifications = async (): Promise<void> => {
    try {
      await pushNotificationService.setAndroidNotificationChannel();
      const token = await pushNotificationService.registerForPushNotifications();
      if (token) {
        console.log('Push notification token:', token);
        setPushToken(token);
        await pushNotificationService.sendTokenToBackend(token);
      }
    } catch (error) {
      console.log('Error setting up push notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Check pin_set from user profile
  useEffect(() => {
    // Show modal if pin_set is false OR undefined
    if (user && !user.pin_set) {
      setShowPinModal(true);
    }
  }, [user]);

  // PIN setup handler
  const handleSetPin = async () => {
    setPinError(null);

    if (pin.length !== 4 || confirmPin.length !== 4) {
      setPinError('PIN must be 4 digits.');
      return;
    }
    if (pin !== confirmPin) {
      setPinError('PINs do not match.');
      return;
    }
    setSettingPin(true);
    try {
      const result = await profileService.setPin(pin, confirmPin);
      if (result.success) {
        // Update user in Redux and AsyncStorage
        const updatedUser = { ...user, pin_set: true };
        dispatch(setUser(updatedUser)); // you need a setUser action
        await AsyncStorage.setItem(
          APP_CONSTANTS.STORAGE_KEYS.USER_DATA,
          JSON.stringify(updatedUser)
        );
        setShowPinModal(false);
        showSuccess('Success', 'PIN set successfully!');
      } else {
        setPinError(result.message || 'Failed to set PIN.');
      }
    } catch (error: any) {
      setPinError(error.message || 'Failed to set PIN.');
    } finally {
      setSettingPin(false);
    }
  };

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
        Toast.show({ type: 'error', text1: 'Session Expired', text2: 'Please login again to continue.' });
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

  // Theme‑aware service renderer
  const renderService = ({ item }: { item: Service }) => {
    const iconColor = colors.primary;          // use theme primary color for icons
    const themedIcon = React.cloneElement(item.icon as React.ReactElement, { color: iconColor });
    const tint = `${colors.primary}20`;        // light background tint using theme primary

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => !item.comingSoon && navigation.navigate(item.screen)}
        style={styles.serviceCard}
        disabled={item.comingSoon}
      >
        <View style={[styles.serviceIconContainer, { backgroundColor: tint, borderColor: `${colors.primary}40` }]}>
          <Text style={[styles.iconInner, { color: iconColor }]}>{themedIcon}</Text>
          {item.comingSoon && (
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>Soon</Text>
            </View>
          )}
        </View>
        <Text
          style={[
            styles.serviceName,
            item.comingSoon && styles.comingSoonServiceName,
            { color: colors.textPrimary }      // theme‑aware text color
          ]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const getTransactionIcon = (transaction: Transaction) => {
    const isCredit = ['Fund Wallet', 'Commission', 'Referral Commission', 'Refund'].includes(transaction.name);
    if (isCredit) {
      return <View style={[styles.transactionIcon, styles.creditIcon]}><Ionicons name="arrow-down" size={20} color="#10B981" /></View>;
    } else {
      if (transaction.provider_logo) {
        return (
          <View style={[styles.transactionIcon, styles.debitIconBg]}>
            <Image source={{ uri: transaction.provider_logo }} style={styles.transactionLogo} resizeMode="contain" />
          </View>
        );
      }
      return <View style={[styles.transactionIcon, styles.debitIconBg]}><Ionicons name="arrow-up" size={20} color="#EF4444" /></View>;
    }
  };

  const getTransactionDescription = (transaction: Transaction) => {
    if (transaction.name === "WAEC Registration" || transaction.name === "WAEC Result Checker") {
      return transaction.name;
    }
    if (transaction.name === "Commission") return `Bonus from ${transaction.type} purchase`;
    if (transaction.name === "Fund Wallet") return "Top Up";
    let description = transaction.name;
    if (transaction.type) description += ` ${transaction.type}`;
    return description;
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isBonus = ['Commission', 'Referral Commission'].includes(item.name);
    const isFundWallet = item.name === 'Fund Wallet';
    const isRefund = item.name === 'Refund';
    const isCredit = isFundWallet || isBonus || isRefund;

    let iconElement;
    if (isBonus) {
      iconElement = <View style={[styles.transactionIcon, styles.bonusIcon]}><Ionicons name="gift" size={24} color="#10B981" /></View>;
    } else if (item.provider_logo && !isCredit) {
      iconElement = <View style={[styles.transactionIcon, styles.debitIconBg]}><Image source={{ uri: item.provider_logo }} style={styles.transactionLogo} contentFit="contain" /></View>;
    } else if (isCredit) {
      iconElement = <View style={[styles.transactionIcon, styles.creditIcon]}><Ionicons name="arrow-down" size={24} color="#10B981" /></View>;
    } else {
      iconElement = <View style={[styles.transactionIcon, styles.debitIconBg]}><Ionicons name="arrow-up" size={24} color="#EF4444" /></View>;
    }

    return (
      <TouchableOpacity style={styles.transactionItem} onPress={() => navigation.navigate('TransactionDetail', { transaction: item })}>
        <View style={styles.transactionLeft}>
          {iconElement}
          <View style={styles.transactionDetails}>
            <Text style={[styles.transactionTitle, { color: colors.textPrimary }]} numberOfLines={1}>{getTransactionDescription(item)}</Text>
            <Text style={[styles.transactionDate, { color: colors.textMuted }]}>{formatDate(item.created_at)}</Text>
          </View>
        </View>
        <Text style={[styles.transactionAmount, isCredit ? styles.amountCredit : styles.amountDebit]}>
          ₦{formatAmount(item.amount)}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderEmptyTransactions = () => {
    if (transactionsLoading) {
      return (
        <View style={styles.empty}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>Loading transactions...</Text>
        </View>
      );
    }
    if (transactionsError) {
      return (
        <View style={styles.empty}>
          <Ionicons name="alert-circle" size={48} color={colors.error} />
          <Text style={[styles.emptyText, { color: colors.error }]}>{transactionsError}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchTransactions}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.empty}>
        <Ionicons name="receipt-outline" size={48} color={colors.textMuted} />
        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No transactions yet</Text>
        <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
          Your recent transactions will appear here once you start using our services.
        </Text>
      </View>
    );
  };

  const hasCommission = parseFloat(commissionBalance) > 0;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle={colors.isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />
      <FlatList
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <View>
                <Text style={[styles.greeting, { color: colors.textPrimary }]}>Hi {user?.name?.split(' ')[0]}!</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Welcome back to WiseSub</Text>
              </View>
              <View style={styles.headerIcons}>
                <TouchableOpacity style={[styles.iconButton, { backgroundColor: colors.card }]} onPress={async () => {
                  if (stats.unread > 0) {
                    try {
                      await markAllAsRead();
                      await fetchNotifications();
                    } catch (error) { console.error(error); }
                  }
                  navigation.navigate("Notification");
                }}>
                  <Ionicons name="notifications-outline" size={18} color={colors.textPrimary} />
                  {stats.unread > 0 && (
                    <View style={styles.notificationBadge}>
                      <Text style={styles.badgeText}>{stats.unread > 9 ? '9+' : stats.unread}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.walletContainer}>
              <View style={[styles.walletCard, { backgroundColor: colors.primary }]}>
                <View style={styles.walletRow}>
                  <View>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Text style={styles.walletLabel}>Available Balance</Text>
                      <TouchableOpacity onPress={() => setShowBalance(!showBalance)} style={styles.eyeBtn}>
                        <Ionicons name={showBalance ? "eye-outline" : "eye-off-outline"} size={18} color="#fff" />
                      </TouchableOpacity>
                    </View>
                    {loading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : walletError ? (
                      <TouchableOpacity onPress={fetchWalletBalance}>
                        <Text style={[styles.balanceText, { fontSize: 14, opacity: 0.8 }]}>Tap to retry</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.balanceRow}>
                        <Text style={styles.currency}>₦</Text>
                        <Text style={styles.balanceText}>{showBalance ? formatAmount(walletBalance) : "••••••"}</Text>
                      </View>
                    )}
                  </View>
                  <TouchableOpacity style={styles.fundBtn} onPress={handleFundWalletPress} disabled={loading}>
                    <Text style={styles.fundBtnText}>+ Top Up</Text>
                  </TouchableOpacity>
                </View>
                {hasCommission && (
                  <View style={styles.commissionContainer}>
                    <View style={styles.commissionRow}>
                      <View style={styles.commissionIconContainer}><Ionicons name="gift" size={14} color="#10B981" /></View>
                      <Text style={styles.commissionLabel}>You have bonus balance:</Text>
                      <Text style={styles.commissionAmount}>₦{showBalance ? formatAmount(commissionBalance) : "••••••"}</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Services</Text>
              <FlatList
                data={servicesData}
                renderItem={renderService}
                keyExtractor={(s) => s.id.toString()}
                numColumns={SERVICE_COLS}
                scrollEnabled={false}
                contentContainerStyle={styles.servicesGrid}
              />
            </View>

            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Recent Transactions</Text>
              <TouchableOpacity onPress={() => navigation.navigate("History")}>
                <Text style={[styles.seeMore, { color: colors.primary }]}>See more</Text>
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

      <FundWalletModal
        isVisible={showFundModal}
        onClose={() => setShowFundModal(false)}
        onSelectMethod={handleSelectPaymentMethod}
        colors={colors}
        modalStyles={modalStyles}
      />

      {showPinModal && (
        <Modal
          visible={showPinModal}
          transparent={true}
          animationType="fade"
          statusBarTranslucent={true}
          onRequestClose={() => { }} // Prevent dismissal on Android back press
        >
          <KeyboardAvoidingView
            style={styles.pinModalOverlay}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            <ScrollView
              contentContainerStyle={styles.pinModalScrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={[styles.pinModalContainer, { backgroundColor: colors.card }]}>
                <Text style={[styles.pinModalTitle, { color: colors.textPrimary }]}>Secure Your Account</Text>
                <Text style={[styles.pinModalSubtitle, { color: colors.textSecondary }]}>
                  To protect your funds, we require a <Text style={{ fontWeight: 'bold' }}>4‑digit PIN</Text> for all transactions. This adds an extra layer of security.
                </Text>
                <View style={styles.pinInputGroup}>
                  <Text style={[styles.pinInputLabel, { color: colors.textSecondary }]}>Enter PIN</Text>
                  <View style={styles.pinInputWrapper}>
                    <TextInput
                      style={[styles.pinInput, { color: colors.textPrimary, backgroundColor: colors.backgroundSecondary }]}
                      secureTextEntry={!showPin}
                      maxLength={4}
                      keyboardType="number-pad"
                      value={pin}
                      onChangeText={(text) => {
                        setPin(text.replace(/\D/g, ''));
                        if (pinError) setPinError(null);
                      }}
                      placeholder="****"
                      placeholderTextColor={colors.textMuted}
                    />
                    <TouchableOpacity onPress={() => setShowPin(!showPin)} style={styles.pinEyeButton}>
                      <Ionicons name={showPin ? "eye-off-outline" : "eye-outline"} size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.pinInputGroup}>
                  <Text style={[styles.pinInputLabel, { color: colors.textSecondary }]}>Confirm PIN</Text>
                  <View style={styles.pinInputWrapper}>
                    <TextInput
                      style={[styles.pinInput, { color: colors.textPrimary, backgroundColor: colors.backgroundSecondary }]}
                      secureTextEntry={!showConfirmPin}
                      maxLength={4}
                      keyboardType="number-pad"
                      value={confirmPin}
                      onChangeText={(text) => {
                        setConfirmPin(text.replace(/\D/g, ''));
                        if (pinError) setPinError(null);
                      }}
                      placeholder="****"
                      placeholderTextColor={colors.textMuted}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPin(!showConfirmPin)} style={styles.pinEyeButton}>
                      <Ionicons name={showConfirmPin ? "eye-off-outline" : "eye-outline"} size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                  {pinError && (
                    <View style={styles.pinErrorRow}>
                      <Ionicons name="alert-circle" size={14} color={colors.error} />
                      <Text style={[styles.pinErrorText, { color: colors.error }]}>{pinError}</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  style={[styles.pinSetButton, { backgroundColor: colors.primary }]}
                  onPress={handleSetPin}
                  disabled={settingPin}
                >
                  {settingPin ? <ActivityIndicator color="#fff" /> : <Text style={styles.pinSetButtonText}>Set PIN</Text>}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </Modal>
      )}

    </View>
  );
}

// FundWalletModal with theme
function FundWalletModal({ isVisible, onClose, onSelectMethod, colors, modalStyles }: {
  isVisible: boolean; onClose: () => void; onSelectMethod: (method: 'bank' | 'card') => void;
  colors: any; modalStyles: any;
}) {
  return (
    <Modal animationType="slide" transparent visible={isVisible} onRequestClose={onClose}>
      <TouchableOpacity style={modalStyles.overlay} activeOpacity={1} onPressOut={onClose}>
        <View style={[modalStyles.container, { backgroundColor: colors.card }]}>
          <View style={[modalStyles.header, { borderBottomColor: colors.separator }]}>
            <Text style={[modalStyles.title, { color: colors.textPrimary }]}>Top Up</Text>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <Text style={[modalStyles.subtitle, { color: colors.textSecondary }]}>Choose payment method</Text>
          <TouchableOpacity style={[modalStyles.option, { backgroundColor: colors.backgroundSecondary, borderColor: colors.divider }]} onPress={() => onSelectMethod('bank')}>
            <View style={[modalStyles.optionIcon, { backgroundColor: '#E0E7FF' }]}>
              <Ionicons name="business" size={24} color="#1F54DD" />
            </View>
            <View style={modalStyles.optionText}>
              <Text style={[modalStyles.optionTitle, { color: colors.textPrimary }]}>Bank Transfer</Text>
              <Text style={[modalStyles.optionDescription, { color: colors.textMuted }]}>Transfer directly from your bank account</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

// Styles
const makeStyles = (colors: any) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, paddingTop: 15 },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  header: { marginTop: 18, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  greeting: { fontSize: 22, fontFamily: "Poppins-Bold" },
  subtitle: { marginTop: 4, fontSize: 13, fontFamily: "Poppins-Regular" },
  headerIcons: { flexDirection: "row", gap: 10 },
  iconButton: { width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  notificationBadge: { position: "absolute", top: -2, right: -3, width: 18, height: 18, borderRadius: 18, backgroundColor: "#EF4444", justifyContent: "center", alignItems: "center" },
  badgeText: { color: "#fff", fontSize: 10, fontFamily: "Poppins-SemiBold" },
  walletContainer: { marginBottom: 18 },
  walletCard: { borderRadius: 16, padding: 14, shadowColor: colors.primary, shadowOpacity: 0.12, shadowRadius: 12, elevation: 6, overflow: "hidden" },
  walletRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  walletLabel: { color: "rgba(255,255,255,0.9)", fontSize: 13, marginBottom: 6, fontFamily: "Poppins-Medium" },
  balanceRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  currency: { color: "#fff", fontSize: 22, marginBottom: 8, fontFamily: "Poppins-Medium" },
  balanceText: { color: "#fff", fontSize: 22, fontFamily: "Poppins-Bold", marginBottom: 7 },
  eyeBtn: { marginLeft: 1, marginBottom: 5, padding: 6, borderRadius: 8 },
  fundBtn: { backgroundColor: "#fff", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 6, elevation: 2 },
  fundBtnText: { color: colors.primary, fontSize: 14, fontFamily: "Poppins-Medium" },
  commissionContainer: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.2)" },
  commissionRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap" },
  commissionIconContainer: { width: 24, height: 24, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center", marginRight: 8 },
  commissionLabel: { color: "rgba(255,255,255,0.9)", fontSize: 12, fontFamily: "Poppins-Regular", marginRight: 6 },
  commissionAmount: { color: "#10B981", fontSize: 14, fontFamily: "Poppins-SemiBold", marginRight: 12 },
  section: { marginTop: 18, marginBottom: 18 },
  sectionTitle: { fontSize: 16, fontFamily: "Poppins-Medium", marginBottom: 12 },
  servicesGrid: { paddingBottom: 6 },
  serviceCard: { width: SERVICE_SIZE, marginRight: 12, marginBottom: 12, alignItems: "center" },
  serviceIconContainer: { width: SERVICE_SIZE - 14, height: SERVICE_SIZE - 14, borderRadius: 12, justifyContent: "center", alignItems: "center", borderWidth: 0.5, position: "relative" },
  iconInner: { color: "#000" },
  comingSoonBadge: { position: "absolute", top: -6, right: -6, backgroundColor: colors.primary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, borderWidth: 1.5, borderColor: colors.card },
  comingSoonText: { color: "#FFFFFF", fontSize: 8, fontFamily: "Poppins-Bold" },
  comingSoonServiceName: { opacity: 0.7 },
  serviceName: { marginTop: 8, fontSize: 12, fontFamily: "Poppins-Medium", textAlign: "center" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
  seeMore: { fontSize: 13, fontFamily: "Poppins-Medium" },
  transactionItem: { backgroundColor: colors.card, borderRadius: 14, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: colors.divider, shadowColor: "#000", shadowOpacity: 0.02, shadowRadius: 12, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  transactionLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  transactionIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: "center", alignItems: "center", marginRight: 12 },
  creditIcon: { backgroundColor: "#ECFDF5" },
  debitIconBg: { backgroundColor: "#FEF3F2" },
  bonusIcon: { backgroundColor: "#ECFDF5" },
  transactionDetails: { flex: 1 },
  transactionTitle: { fontSize: 14, fontFamily: "Poppins-Medium", marginBottom: 2 },
  transactionDate: { fontSize: 12, fontFamily: "Poppins-Regular" },
  transactionAmount: { fontSize: 14, fontFamily: "Poppins-SemiBold" },
  amountCredit: { color: "#10B981" },
  amountDebit: { color: "#EF4444" },
  transactionLogo: { width: 32, height: 32, borderRadius: 16 },
  empty: { padding: 40, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 18, fontFamily: "Poppins-SemiBold", marginTop: 16, marginBottom: 8 },
  emptyDescription: { fontSize: 14, fontFamily: "Poppins-Regular", textAlign: "center", lineHeight: 20 },
  emptyText: { fontSize: 14, fontFamily: "Poppins-Regular", marginTop: 8 },
  retryButton: { marginTop: 16, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: colors.primary, borderRadius: 8 },
  retryButtonText: { color: "#FFFFFF", fontSize: 14, fontFamily: "Poppins-SemiBold" },
  pinModalOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 1000,
  },
  pinModalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  pinModalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  pinModalTitle: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  pinModalSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  pinInputGroup: { marginBottom: 16 },
  pinInputLabel: { fontSize: 14, fontFamily: 'Poppins-Medium', marginBottom: 6 },
  pinInputWrapper: { position: 'relative' },
  pinInput: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
    letterSpacing: 8,
  },
  pinEyeButton: {
    position: 'absolute',
    right: 12,
    top: 15,
  },
  pinErrorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  pinErrorText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    flexShrink: 1,
  },
  pinSetButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  pinSetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
});

const makeModalStyles = (colors: any) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  container: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40, minHeight: 300 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, borderBottomWidth: 1, paddingBottom: 12 },
  title: { fontSize: 20, fontFamily: 'Poppins-SemiBold' },
  closeButton: { padding: 4 },
  subtitle: { fontSize: 14, fontFamily: 'Poppins-Regular', marginBottom: 24 },
  option: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1 },
  optionIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  optionText: { flex: 1 },
  optionTitle: { fontSize: 16, fontFamily: 'Poppins-SemiBold', marginBottom: 4 },
  optionDescription: { fontSize: 12, fontFamily: 'Poppins-Regular', lineHeight: 16 },
});