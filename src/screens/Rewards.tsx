import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { formatAmount, formatDate } from "../helper/util";
import { walletService } from "../services/walletService";
import { useTheme } from '../theme/ThemeContext';

interface CommissionItem {
  reference: string;
  type: string;
  amount: string;
  description: string;
  transaction_name: string | null;
  created_at: string;
}

export default function Rewards({ navigation }: { navigation: any }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [commissions, setCommissions] = useState<CommissionItem[]>([]);
  const [currentBalance, setCurrentBalance] = useState<string>("0.00");
  const [commissionsLoading, setCommissionsLoading] = useState<boolean>(false);
  const [commissionsError, setCommissionsError] = useState<string | null>(null);

  const fetchCommissions = async () => {
    try {
      setCommissionsLoading(true);
      setCommissionsError(null);
      const response = await walletService.getCommissions({ limit: 20 }) as any;
      if (response.success) {
        setCurrentBalance(response.data.balance);
        setCommissions(response.data.commissions);
      } else {
        setCommissionsError(response.message || 'Failed to fetch commissions');
      }
    } catch (error: any) {
      setCommissionsError(error.message || 'Failed to fetch commissions');
    } finally {
      setCommissionsLoading(false);
    }
  };

  const fetchAllData = async () => { await fetchCommissions(); };

  useFocusEffect(useCallback(() => { fetchAllData(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  };

  const formatDescription = (description: string) => description.replace(/Commission from Commission from/g, 'Commission from');

  const getTransactionIcon = (type: string) => {
    if (type === "earned" || type === "referral_earned") {
      return <View style={[styles.transactionIcon, styles.creditIcon]}><Ionicons name="gift" size={20} color="#10B981" /></View>;
    } else {
      return <View style={[styles.transactionIcon, styles.debitIcon]}><Ionicons name="card" size={20} color={colors.primary} /></View>;
    }
  };

  const renderCommission = ({ item }: { item: CommissionItem }) => {
    const isEarned = item.type === "earned" || item.type === "referral_earned";
    const amountColor = isEarned ? "#10B981" : colors.primary;
    const amountPrefix = isEarned ? "+" : "";
    return (
      <TouchableOpacity style={styles.transactionItem}>
        <View style={styles.transactionLeft}>
          {getTransactionIcon(item.type)}
          <View style={styles.transactionDetails}>
            <Text style={[styles.transactionTitle, { color: colors.textPrimary }]} numberOfLines={2}>
              {formatDescription(item.description)}
            </Text>
            <Text style={[styles.transactionDate, { color: colors.textMuted }]}>{formatDate(item.created_at)}</Text>
            <View style={styles.tagsContainer}>
              <View style={[styles.typeTag, isEarned ? styles.earnedTag : styles.usedTag]}>
                <Text style={[styles.typeText, isEarned ? styles.earnedText : styles.usedText]}>
                  {isEarned ? 'Earned' : 'Used'}
                </Text>
              </View>
              {item.transaction_name && (
                <View style={styles.nameTag}>
                  <Text style={[styles.nameText, { color: colors.textMuted }]}>{item.transaction_name}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
        <Text style={[styles.transactionAmount, { color: amountColor }]}>
          {amountPrefix}₦{formatAmount(item.amount)}
        </Text>
      </TouchableOpacity>
    );
  };

  const formatAmountValue = (amt: string) =>
    parseFloat(amt || "0").toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const renderContent = () => {
    if (commissionsLoading && commissions.length === 0) {
      return (
        <View style={styles.empty}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>Loading rewards...</Text>
        </View>
      );
    }
    if (commissionsError && commissions.length === 0) {
      return (
        <View style={styles.empty}>
          <Ionicons name="alert-circle" size={48} color={colors.error} />
          <Text style={[styles.emptyText, { color: colors.error }]}>{commissionsError}</Text>
          <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={fetchCommissions}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (commissions.length === 0) {
      return (
        <View style={styles.empty}>
          <Ionicons name="gift-outline" size={64} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No bonus transactions yet</Text>
          <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
            Your bonus and commission history will appear here when you start earning rewards.
          </Text>
        </View>
      );
    }
    return (
      <FlatList
        data={commissions}
        renderItem={renderCommission}
        keyExtractor={(item) => item.reference}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshing={refreshing}
        onRefresh={onRefresh}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <>
            <View style={[styles.balanceCard, { backgroundColor: colors.card, borderColor: '#D1FAE5' }]}>
              <View style={styles.balanceIconContainer}>
                <Ionicons name="gift" size={24} color="#10B981" />
              </View>
              <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>Bonus Balance</Text>
              <Text style={[styles.balanceAmount, { color: "#10B981" }]}>₦{formatAmountValue(currentBalance)}</Text>
            </View>
            {commissionsLoading && commissions.length > 0 && (
              <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            )}
          </>
        )}
      />
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Rewards History</Text>
        <View style={styles.placeholder} />
      </View>
      {renderContent()}
    </View>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  backButton: { padding: 4 },
  title: { fontSize: 18, fontFamily: "Poppins-SemiBold" },
  placeholder: { width: 32 },
  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
  separator: { height: 8 },
  balanceCard: { borderRadius: 14, padding: 24, marginBottom: 20, borderWidth: 1, shadowColor: "#000", shadowOpacity: 0.02, shadowRadius: 12, shadowOffset: { width: 0, height: 2 }, elevation: 1, alignItems: "center" },
  balanceIconContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#ECFDF5", justifyContent: "center", alignItems: "center", marginBottom: 12 },
  balanceLabel: { fontSize: 14, fontFamily: "Poppins-Medium", marginBottom: 8 },
  balanceAmount: { fontSize: 32, fontFamily: "Poppins-Bold" },
  transactionItem: { backgroundColor: colors.card, borderRadius: 14, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: colors.divider, shadowColor: "#000", shadowOpacity: 0.02, shadowRadius: 12, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  transactionLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  transactionIcon: { width: 42, height: 42, borderRadius: 10, justifyContent: "center", alignItems: "center", marginRight: 10 },
  creditIcon: { backgroundColor: "#ECFDF5" },
  debitIcon: { backgroundColor: "#DBEAFE" },
  transactionDetails: { flex: 1 },
  transactionTitle: { fontSize: 14, fontFamily: "Poppins-Medium", marginBottom: 4, lineHeight: 20 },
  transactionDate: { fontSize: 12, fontFamily: "Poppins-Regular", marginBottom: 6 },
  transactionAmount: { fontSize: 14, fontFamily: "Poppins-SemiBold" },
  tagsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  typeTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  earnedTag: { backgroundColor: "#ECFDF5" },
  usedTag: { backgroundColor: "#DBEAFE" },
  typeText: { fontSize: 10, fontFamily: "Poppins-Medium" },
  earnedText: { color: "#10B981" },
  usedText: { color: colors.primary },
  nameTag: { backgroundColor: colors.backgroundSecondary, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  nameText: { fontSize: 10, fontFamily: "Poppins-Regular" },
  empty: { flex: 1, padding: 40, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 18, fontFamily: "Poppins-SemiBold", marginTop: 16, marginBottom: 8 },
  emptyDescription: { fontSize: 14, fontFamily: "Poppins-Regular", textAlign: "center", lineHeight: 20 },
  emptyText: { fontSize: 14, fontFamily: "Poppins-Regular", marginTop: 8 },
  retryButton: { marginTop: 16, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryButtonText: { color: "#FFFFFF", fontSize: 14, fontFamily: "Poppins-SemiBold" },
  loadingMore: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, marginBottom: 8 },
});