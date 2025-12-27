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
import { Transaction, walletService } from "../services/walletService";

export default function History({ navigation }: { navigation: any }) {
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
      console.error('Transactions error:', error);
      setTransactionsError(error.message || 'Failed to fetch transactions');
    } finally {
      setTransactionsLoading(false);
    }
  };

  const fetchAllData = async () => {
    await Promise.all([fetchTransactions()]);
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
      if (transaction.customer) description += ` — ${transaction.customer}`;

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

  const formatAmount = (amt: string) =>
    parseFloat(amt || "0").toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1F54DD" />
      </View>
    );
  }

  // Determine what to render based on state
  const renderContent = () => {
    if (transactionsLoading && transactions.length === 0) {
      return (
        <View style={styles.empty}>
          <ActivityIndicator size="large" color="#1F54DD" />
          <Text style={styles.emptyText}>Loading transactions...</Text>
        </View>
      );
    }

    if (transactionsError && transactions.length === 0) {
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

    if (transactions.length === 0) {
      return (
        <View style={styles.empty}>
          <Ionicons name="receipt-outline" size={64} color="#94A3B8" />
          <Text style={styles.emptyTitle}>No Transaction Yet</Text>
          <Text style={styles.emptyDescription}>
            Get started by making transactions to track your financial activities!
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
        ListHeaderComponent={() => (
          transactionsLoading && transactions.length > 0 ? (
            <View style={styles.loadingMore}>
              <ActivityIndicator size="small" color="#1F54DD" />
              <Text style={styles.loadingMoreText}>Updating...</Text>
            </View>
          ) : null
        )}
      />
    );
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.title}>Transaction History</Text>
        <View style={styles.placeholder} />
      </View>

      {renderContent()}
    </View>
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
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  separator: {
    height: 8,
  },
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
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1
  },
  transactionIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10
  },
  creditIcon: {
    backgroundColor: "#ECFDF5"
  },
  debitIcon: {
    backgroundColor: "#FEF3F2"
  },
  transactionDetails: {
    flex: 1
  },
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
  transactionAmount: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold"
  },
  amountCredit: {
    color: "#10B981"
  },
  amountDebit: {
    color: "#EF4444"
  },
  empty: {
    flex: 1,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
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
  loadingMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  loadingMoreText: {
    marginLeft: 8,
    color: '#64748B',
    fontSize: 12,
    fontFamily: "Poppins-Regular",
  },
});