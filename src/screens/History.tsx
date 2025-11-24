import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

type Transaction = {
  id: number;
  type: string;
  created_at: string;
  amount: string;
  provider_logo?: string;
};

const mockTransactions: Transaction[] = [
  { id: 1, type: "Wallet Top-up", created_at: new Date().toISOString(), amount: "5000.00" },
  { id: 2, type: "Data Purchase", created_at: new Date().toISOString(), amount: "1000.00" },
  { id: 3, type: "Airtime Purchase", created_at: new Date().toISOString(), amount: "500.00" },
  { id: 4, type: "Commission", created_at: new Date().toISOString(), amount: "250.00" },
];

export default function History({ navigation }: { navigation: any }) {
  const [loading, setLoading] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      const t = setTimeout(() => {
        setTransactions(mockTransactions);
        setLoading(false);
      }, 1000);
      return () => clearTimeout(t);
    }, [])
  );

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

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isCredit = item.type === "Wallet Top-up" ||
      item.type === "Commission" ||
      item.type === "Referral Commission" ||
      item.type === "Refund";

    return (
      <View style={styles.transactionItem}>
        <View style={styles.transactionLeft}>
          <View style={[styles.transactionIcon, isCredit ? styles.creditIcon : styles.debitIcon]}>
            <Ionicons
              name={isCredit ? "arrow-down" : "arrow-up"}
              size={16}
              color={isCredit ? "#10B981" : "#EF4444"}
            />
          </View>
          <View style={styles.transactionDetails}>
            <Text style={styles.transactionTitle}>
              {item.type === "Wallet Top-up" ? "Wallet Funded" : item.type}
            </Text>
            <Text style={styles.transactionDate}>{formatDate(item.created_at)}</Text>
          </View>
        </View>
        <Text style={[styles.transactionAmount, isCredit ? styles.amountCredit : styles.amountDebit]}>
          {isCredit ? "+" : "-"}₦{formatAmount(item.amount)}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1F54DD" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.title}>Transaction History</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="receipt-outline" size={64} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No Transaction Yet</Text>
            <Text style={styles.emptyDescription}>
              Get started by making transactions to track your financial activities!
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
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
});