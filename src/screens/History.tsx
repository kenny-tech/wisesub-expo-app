import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Transaction, walletService } from "../services/walletService";
import { useTheme } from '../theme/ThemeContext';

export default function History({ navigation }: { navigation: any }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState<boolean>(false);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      setTransactionsLoading(true);
      setTransactionsError(null);
      const response = await walletService.getTransactions({ limit: 20 });
      if (response.success) {
        setTransactions(response.data);
      } else {
        setTransactionsError(response.message || 'Failed to fetch transactions');
      }
    } catch (error: any) {
      setTransactionsError(error.message || 'Failed to fetch transactions');
    } finally {
      setTransactionsLoading(false);
    }
  };

  const fetchAllData = async () => { await fetchTransactions(); };

  useFocusEffect(useCallback(() => { fetchAllData(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
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
            <Text style={[styles.transactionTitle, { color: colors.textPrimary }]} numberOfLines={1}>
              {getTransactionDescription(item)}
            </Text>
            <Text style={[styles.transactionDate, { color: colors.textMuted }]}>{formatDate(item.created_at)}</Text>
          </View>
        </View>
        <Text style={[styles.transactionAmount, isCredit ? styles.amountCredit : styles.amountDebit]}>
          ₦{formatAmount(item.amount)}
        </Text>
      </TouchableOpacity>
    );
  };

  const formatAmount = (amt: string) =>
    parseFloat(amt || "0").toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const renderContent = () => {
    if (transactionsLoading && transactions.length === 0) {
      return (
        <View style={styles.empty}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>Loading transactions...</Text>
        </View>
      );
    }
    if (transactionsError && transactions.length === 0) {
      return (
        <View style={styles.empty}>
          <Ionicons name="alert-circle" size={48} color={colors.error} />
          <Text style={[styles.emptyText, { color: colors.error }]}>{transactionsError}</Text>
          <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={fetchTransactions}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (transactions.length === 0) {
      return (
        <View style={styles.empty}>
          <Ionicons name="receipt-outline" size={64} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Transaction Yet</Text>
          <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
            Your transaction history will appear here once you start using our services.
          </Text>
        </View>
      );
    }
    return (
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshing={refreshing}
        onRefresh={onRefresh}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (transactionsLoading && transactions.length > 0 ? <View style={styles.loadingMore}><ActivityIndicator size="small" color={colors.primary} /></View> : null)}
      />
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Transaction History</Text>
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
  empty: { flex: 1, padding: 40, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 18, fontFamily: "Poppins-SemiBold", marginTop: 16, marginBottom: 8 },
  emptyDescription: { fontSize: 14, fontFamily: "Poppins-Regular", textAlign: "center", lineHeight: 20 },
  emptyText: { fontSize: 14, fontFamily: "Poppins-Regular", marginTop: 8 },
  retryButton: { marginTop: 16, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryButtonText: { color: "#FFFFFF", fontSize: 14, fontFamily: "Poppins-SemiBold" },
  loadingMore: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10 },
});