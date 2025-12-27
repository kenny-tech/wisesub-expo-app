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
import { CommissionTotal, Transaction, walletService } from "../services/walletService";

export default function Rewards({ navigation }: { navigation: any }) {
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [commissions, setCommissions] = useState<Transaction[]>([]);
  const [commissionTotal, setCommissionTotal] = useState<number>(0);
  const [commissionCount, setCommissionCount] = useState<number>(0);
  const [commissionsLoading, setCommissionsLoading] = useState<boolean>(false);
  const [commissionsError, setCommissionsError] = useState<string | null>(null);
  const [totalsError, setTotalsError] = useState<string | null>(null);

  const fetchCommissionTotals = async () => {
    try {
      const response = await walletService.getCommissionTotals({ type: 'COMMISSION' });
      
      if (response.success) {
        const data: CommissionTotal[] = response.data;
        if (data.length === 0) {
          setCommissionTotal(0);
          setCommissionCount(0);
        } else {
          const {total_amount, transaction_count} = data.reduce(
            (acc: any, entry: CommissionTotal) => {
              const total_amount = acc.total_amount + parseFloat(entry.total_amount);
              const transaction_count = acc.transaction_count + entry.transaction_count;
              return {total_amount, transaction_count};
            },
            {total_amount: 0, transaction_count: 0},
          );

          setCommissionTotal(total_amount);
          setCommissionCount(transaction_count);
        }
        setTotalsError(null);
      } else {
        setTotalsError(response.message || 'Failed to fetch commission totals');
      }
    } catch (error: any) {
      console.error('Commission totals error:', error);
      
      if (error.message) {
        setTotalsError(error.message);
      } else {
        setTotalsError('Failed to fetch commission totals');
      }
    }
  };

  const fetchCommissions = async () => {
    try {
      setCommissionsLoading(true);
      setCommissionsError(null);

      const response = await walletService.getCommissions({ limit: 20 });
      console.log(response.data);
      
      if (response.success) {
        setCommissions(response.data);
      } else {
        setCommissionsError(response.message || 'Failed to fetch commissions');
      }
    } catch (error: any) {
      console.error('Commissions error:', error);
      
      if (error.message) {
        setCommissionsError(error.message);
      } else {
        setCommissionsError('Failed to fetch commissions');
      }
    } finally {
      setCommissionsLoading(false);
    }
  };

  const fetchAllData = async () => {
    await Promise.all([fetchCommissionTotals(), fetchCommissions()]);
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchAllData().finally(() => setLoading(false));
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  };

  const getTransactionIcon = (transaction: Transaction) => {
    const isReferral = transaction.name.includes('Referral');
    
    return (
      <View style={[
        styles.transactionIcon, 
        isReferral ? styles.referralIcon : styles.commissionIcon
      ]}>
        <Ionicons 
          name={isReferral ? "people" : "gift"} 
          size={20} 
          color={isReferral ? "#8B5CF6" : "#10B981"} 
        />
      </View>
    );
  };

  const getTransactionDescription = (transaction: Transaction) => {
    if (transaction.name === "Commission") {
      return `Bonus from ${transaction.type} purchase`;
    } else if (transaction.name === "Referral Commission") {
      return `Referral bonus from ${transaction.customer || 'user'}`;
    } else {
      let description = transaction.name;
      if (transaction.type) description += ` - ${transaction.type}`;
      if (transaction.customer) description += ` (${transaction.customer})`;
      return description;
    }
  };

  const renderCommission = ({ item }: { item: Transaction }) => {
    return (
      <View style={styles.commissionItem}>
        <View style={styles.commissionLeft}>
          {getTransactionIcon(item)}
          <View style={styles.commissionDetails}>
            <Text style={styles.commissionTitle} numberOfLines={1}>
              {getTransactionDescription(item)}
            </Text>
            <Text style={styles.commissionDate}>
              {formatDate(item.created_at)}
            </Text>
          </View>
        </View>
        <Text style={styles.commissionAmount}>
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

  // Determine what to render based on state
  const renderContent = () => {
    if (commissionsLoading && commissions.length === 0) {
      return (
        <View style={styles.empty}>
          <ActivityIndicator size="large" color="#1F54DD" />
          <Text style={styles.emptyText}>Loading rewards...</Text>
        </View>
      );
    }

    if ((commissionsError || totalsError) && commissions.length === 0) {
      const errorMessage = commissionsError || totalsError;
      return (
        <View style={styles.empty}>
          <Ionicons name="alert-circle" size={48} color="#EF4444" />
          <Text style={[styles.emptyText, { color: '#EF4444' }]}>
            {errorMessage}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchAllData}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (commissions.length === 0) {
      return (
        <View style={styles.empty}>
          <Ionicons name="gift-outline" size={64} color="#94A3B8" />
          <Text style={styles.emptyTitle}>No Rewards Yet</Text>
          <Text style={styles.emptyDescription}>
            Complete transactions and refer friends to start earning rewards!
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={commissions}
        renderItem={renderCommission}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshing={refreshing}
        onRefresh={onRefresh}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <>
            {/* Total Commission Card */}
            <View style={styles.commissionCard}>
              <View style={styles.commissionContent}>
                <Ionicons name="trophy" size={32} color="#1F54DD" />
                <View style={styles.commissionText}>
                  <Text style={styles.commissionLabel}>Total Commission Earned</Text>
                  <Text style={styles.commissionAmountTotal}>
                    ₦{formatAmount(commissionTotal.toString())}
                  </Text>
                  <Text style={styles.commissionCount}>
                    From {commissionCount} transaction{commissionCount !== 1 ? 's' : ''}
                  </Text>
                  {totalsError && (
                    <Text style={styles.commissionError}>
                      {totalsError}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* Recent Commissions Header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Commissions</Text>
              {commissionsError && (
                <Text style={styles.sectionError}>{commissionsError}</Text>
              )}
            </View>

            {/* Loading indicator when refreshing with existing data */}
            {commissionsLoading && commissions.length > 0 && (
              <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color="#1F54DD" />
                <Text style={styles.loadingMoreText}>Updating...</Text>
              </View>
            )}
          </>
        )}
        ListFooterComponent={() => (
          commissions.length > 0 && (
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Showing {commissions.length} most recent commissions
              </Text>
            </View>
          )
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
        <Text style={styles.title}>Rewards</Text>
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
  commissionCard: {
    backgroundColor: "#F1F6FF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#1F54DD",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  commissionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  commissionText: {
    marginLeft: 16,
    flex: 1,
  },
  commissionLabel: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#64748B",
    marginBottom: 4,
  },
  commissionAmountTotal: {
    fontSize: 28,
    fontFamily: "Poppins-Bold",
    color: "#1F54DD",
    marginBottom: 4,
  },
  commissionCount: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#94A3B8",
  },
  commissionError: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#EF4444",
    marginTop: 4,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#0F172A",
  },
  sectionError: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#EF4444",
    marginTop: 4,
  },
  commissionItem: {
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
  commissionLeft: {
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
  commissionIcon: {
    backgroundColor: "#ECFDF5"
  },
  referralIcon: {
    backgroundColor: "#F5F3FF"
  },
  commissionDetails: {
    flex: 1
  },
  commissionTitle: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#0F172A",
    marginBottom: 2
  },
  commissionDate: {
    fontSize: 12,
    color: "#94A3B8",
    fontFamily: "Poppins-Regular"
  },
  commissionAmount: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: "#10B981"
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
    maxWidth: 300,
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
    marginBottom: 8,
  },
  loadingMoreText: {
    marginLeft: 8,
    color: '#64748B',
    fontSize: 12,
    fontFamily: "Poppins-Regular",
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 16,
  },
  footerText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: '#94A3B8',
  },
});