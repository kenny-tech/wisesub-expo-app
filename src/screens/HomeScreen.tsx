import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const SERVICE_COLS = 4;
const SERVICE_SIZE = (width - 40 - (SERVICE_COLS - 1) * 12) / SERVICE_COLS; // padding 20 each side + gaps

type Service = {
  id: number;
  name: string;
  icon: React.ReactNode;
  screen: string;
  color: string; // base color hex
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
  { id: 6, name: "Refer", icon: <Ionicons name="people" size={20} />, screen: "Referral", color: "#06B6D4" },
  { id: 7, name: "Internet", icon: <Ionicons name="planet" size={20} />, screen: "Internet", color: "#84CC16" },
  { id: 8, name: "Education", icon: <Ionicons name="school" size={20} />, screen: "Education", color: "#F97316" },
];

export default function Home({ navigation }: { navigation: any }) {
  const [loading, setLoading] = useState<boolean>(false);
  const [walletBalance, setWalletBalance] = useState<string>("15250");
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 1, type: "Wallet Top-up", created_at: new Date().toISOString(), amount: "5000.00" },
    { id: 2, type: "Data Purchase", created_at: new Date().toISOString(), amount: "1000.00" },
  ]);
  const [showBalance, setShowBalance] = useState<boolean>(true);
  const [unreadCount, setUnreadCount] = useState<number>(2);

  // refresh when screen focused
  useFocusEffect(
    useCallback(() => {
      // simulate refresh
      setLoading(true);
      const t = setTimeout(() => {
        setWalletBalance("152500");
        setTransactions((prev) => prev); // in real app fetch
        setLoading(false);
      }, 800);
      return () => clearTimeout(t);
    }, [])
  );

  const formatAmount = (amt: string) =>
    parseFloat(amt || "0").toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const renderService = ({ item }: { item: Service }) => {
    const tint = `${item.color}20`; // append alpha approx (works for many hex -> not exact alpha; okay for soft tint)
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate(item.screen)}
        style={styles.serviceCard}
      >
        <View style={[styles.serviceIconContainer, { backgroundColor: tint, borderColor: `${item.color}40` }]}>
          <View style={[styles.iconInner, { color: item.color }]}>{item.icon}</View>
        </View>
        <Text style={styles.serviceName} numberOfLines={1}>
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
            <Text style={styles.transactionDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
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
                <Text style={styles.greeting}>Hi, John! 👋</Text>
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

                      {/* 👁️ Eye Button */}
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

                  {/* Fund button */}
                  <TouchableOpacity
                    style={styles.fundBtn}
                    onPress={() => navigation.navigate("Fund")}
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
                <Text style={styles.seeMore}>View all</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FFFFFF" }, 
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
    top: -6,
    right: -6,
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
  balanceText: { color: "#fff", fontSize: 22, fontFamily: "Poppins-Bold" }, // reduced from 36 to 22
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
  fundBtnText: { color: "#1F54DD", fontSize: 14, fontFamily: "Poppins-SemiBold" },

  // services
  section: { marginTop: 6, marginBottom: 18 },
  sectionTitle: { fontSize: 16, fontFamily: "Poppins-SemiBold", color: "#0F172A", marginBottom: 12 },
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
  },
  iconInner: { color: "#000" },
  serviceName: { marginTop: 8, fontSize: 12, fontFamily: "Poppins-Medium", color: "#0F172A", textAlign: "center" },

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
