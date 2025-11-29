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
import { formatAmount, formatDate } from "../helper/util";

type Transaction = {
  id: number;
  type: string;
  created_at: string;
  amount: string;
};

const mockCommissions: Transaction[] = [
  { id: 1, type: "Referral Commission", created_at: new Date().toISOString(), amount: "250.00" },
  { id: 2, type: "Commission", created_at: new Date().toISOString(), amount: "150.00" },
  { id: 3, type: "Referral Commission", created_at: new Date().toISOString(), amount: "300.00" },
  { id: 4, type: "Commission", created_at: new Date().toISOString(), amount: "200.00" },
];

export default function Rewards({ navigation }: { navigation: any }) {
  const [loading, setLoading] = useState<boolean>(false);
  const [commissions, setCommissions] = useState<Transaction[]>(mockCommissions);
  const [totalCommission, setTotalCommission] = useState<string>("900.00");

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      const t = setTimeout(() => {
        setCommissions(mockCommissions);
        setTotalCommission("900.00");
        setLoading(false);
      }, 1000);
      return () => clearTimeout(t);
    }, [])
  );

  const renderTransaction = ({ item }: { item: Transaction }) => {
    return (
      <View style={styles.transactionItem}>
        <View style={styles.transactionLeft}>
          <View style={[styles.transactionIcon, styles.creditIcon]}>
            <Ionicons name="gift" size={16} color="#10B981" />
          </View>
          <View style={styles.transactionDetails}>
            <Text style={styles.transactionTitle}>{item.type}</Text>
            <Text style={styles.transactionDate}>{formatDate(item.created_at)}</Text>
          </View>
        </View>
        <Text style={[styles.transactionAmount, styles.amountCredit]}>
          +₦{formatAmount(item.amount)}
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
        <Text style={styles.title}>Rewards</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        ListHeaderComponent={
          <>
            {/* Total Commission Card */}
            <View style={styles.commissionCard}>
              <View style={styles.commissionContent}>
                <Ionicons name="trophy" size={24} color="#1F54DD" />
                <View style={styles.commissionText}>
                  <Text style={styles.commissionLabel}>Total Commission Earned</Text>
                  <Text style={styles.commissionAmount}>₦{formatAmount(totalCommission)}</Text>
                </View>
              </View>
            </View>

            {/* Transactions Header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Commission History</Text>
            </View>
          </>
        }
        data={commissions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="gift-outline" size={64} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No Rewards Yet</Text>
            <Text style={styles.emptyDescription}>
              Complete a transaction to start earning rewards!
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
  commissionCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  commissionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  commissionText: {
    marginLeft: 12,
    flex: 1,
  },
  commissionLabel: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#64748B",
    marginBottom: 4,
  },
  commissionAmount: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: "#10B981",
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#0F172A",
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