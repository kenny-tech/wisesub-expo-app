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

interface CommissionItem {
  reference: string;
  type: string;
  amount: string;
  description: string;
  transaction_name: string | null;
  created_at: string;
}

interface CommissionsResponse {
  success: boolean;
  data: {
    balance: string;
    commissions: CommissionItem[];
  };
  message: string;
}

export default function Rewards({ navigation }: { navigation: any }) {
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [commissions, setCommissions] = useState<CommissionItem[]>([]);
  const [currentBalance, setCurrentBalance] = useState<string>("0.00");
  const [commissionsLoading, setCommissionsLoading] = useState<boolean>(false);
  const [commissionsError, setCommissionsError] = useState<string | null>(null);
  const [totalsError, setTotalsError] = useState<string | null>(null);

  const fetchCommissions = async () => {
    try {
      setCommissionsLoading(true);
      setCommissionsError(null);

      const response = await walletService.getCommissions({ limit: 20 }) as unknown as CommissionsResponse;
      
      if (response.success) {
        setCurrentBalance(response.data.balance);
        setCommissions(response.data.commissions);
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

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchCommissions().finally(() => setLoading(false));
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCommissions();
    setRefreshing(false);
  };

  // Helper function to format description by removing duplicates (same as web)
  const formatDescription = (description: string) => {
    return description.replace(/Commission from Commission from/g, 'Commission from');
  };

  const getTransactionIcon = (type: string) => {
    if (type === "earned") {
      return (
        <View style={styles.iconContainerEarned}>
          <Ionicons name="gift" size={20} color="#10B981" />
        </View>
      );
    } else {
      return (
        <View style={styles.iconContainerUsed}>
          <Ionicons name="card" size={20} color="#1F54DD" />
        </View>
      );
    }
  };

  const renderCommission = ({ item }: { item: CommissionItem }) => {
    const isEarned = item.type === "earned" || item.type === "referral_earned";
    const amountColor = isEarned ? "#10B981" : "#1F54DD";
    const amountPrefix = isEarned ? "+" : "";
    
    return (
      <View style={styles.commissionCard}>
        <View style={styles.commissionContent}>
          {/* Left Section */}
          <View style={styles.commissionLeft}>
            {getTransactionIcon(item.type)}
            <View style={styles.commissionDetails}>
              <Text style={styles.description} numberOfLines={2}>
                {formatDescription(item.description)}
              </Text>
              <View style={styles.detailsRow}>
                <Text style={styles.date}>
                  {formatDate(item.created_at)}
                </Text>
                <View style={styles.tagsContainer}>
                  <View style={[
                    styles.typeTag,
                    isEarned ? styles.earnedTag : styles.usedTag
                  ]}>
                    <Text style={[
                      styles.typeText,
                      isEarned ? styles.earnedText : styles.usedText
                    ]}>
                      {isEarned ? 'Earned' : 'Used'}
                    </Text>
                  </View>
                  {item.transaction_name && (
                    <View style={styles.nameTag}>
                      <Text style={styles.nameText}>{item.transaction_name}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* Right Section */}
          <View style={styles.commissionRight}>
            <Text style={[styles.amount, { color: amountColor }]}>
              {amountPrefix}₦{formatAmount(item.amount)}
            </Text>
            <Text style={styles.amountLabel}>
              {isEarned ? 'Bonus Earned' : 'Payment Applied'}
            </Text>
          </View>
        </View>
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

    if (commissionsError && commissions.length === 0) {
      return (
        <View style={styles.empty}>
          <Ionicons name="alert-circle" size={48} color="#EF4444" />
          <Text style={[styles.emptyText, { color: '#EF4444' }]}>
            {commissionsError}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchCommissions}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (commissions.length === 0) {
      return (
        <View style={styles.empty}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="gift-outline" size={32} color="#94A3B8" />
          </View>
          <Text style={styles.emptyTitle}>No bonus transactions yet</Text>
          <Text style={styles.emptyDescription}>
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
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={20} color="#3B82F6" />
                <Text style={styles.backText}>Back</Text>
              </TouchableOpacity>
              <Text style={styles.pageTitle}>Rewards History</Text>
              <View style={styles.headerPlaceholder} />
            </View>

            {/* Balance Card */}
            <View style={styles.balanceCard}>
              <View style={styles.balanceHeader}>
                <View style={styles.balanceTitleContainer}>
                  <Ionicons name="gift" size={24} color="#10B981" />
                  <Text style={styles.balanceTitle}>Bonus Balance</Text>
                </View>
              </View>
              
              <View style={styles.balanceContent}>
                <Text style={styles.balanceAmount}>
                  ₦{formatAmount(currentBalance)}
                </Text>
              </View>
            </View>

            {/* Bonus Transactions Header */}
            <View style={styles.transactionsHeader}>
              <Text style={styles.transactionsTitle}>Bonus Transactions</Text>
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
                Showing {commissions.length} most recent transactions
              </Text>
            </View>
          )
        )}
      />
    );
  };

  return (
    <View style={styles.screen}>
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F3F4F6"
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  listContent: {
    paddingBottom: 20,
  },
  separator: {
    height: 12,
  },
  
  // Header Styles
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
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
  },
  backText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#3B82F6",
    marginLeft: 4,
  },
  pageTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: "#111827",
  },
  headerPlaceholder: {
    width: 60,
  },

  // Balance Card Styles
  balanceCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#D1FAE5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  balanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  balanceTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  balanceTitle: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: "#111827",
    marginLeft: 8,
  },
  balanceContent: {
    alignItems: "center",
    paddingVertical: 12,
  },
  balanceLabel: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#6B7280",
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontFamily: "Poppins-Bold",
    color: "#10B981",
  },

  // Transactions Header
  transactionsHeader: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  transactionsTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: "#111827",
  },

  // Commission Card Styles
  commissionCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  commissionContent: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  commissionLeft: {
    flex: 1,
    flexDirection: "row",
    marginRight: 12,
  },
  iconContainerEarned: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#D1FAE5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  iconContainerUsed: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  commissionDetails: {
    flex: 1,
  },
  description: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#111827",
    marginBottom: 8,
    lineHeight: 20,
  },
  detailsRow: {
    flexDirection: "column",
  },
  date: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#6B7280",
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  typeTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  earnedTag: {
    backgroundColor: "#D1FAE5",
  },
  usedTag: {
    backgroundColor: "#DBEAFE",
  },
  typeText: {
    fontSize: 11,
    fontFamily: "Poppins-Medium",
  },
  earnedText: {
    color: "#10B981",
  },
  usedText: {
    color: "#1F54DD",
  },
  nameTag: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  nameText: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    color: "#6B7280",
  },
  commissionRight: {
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  amount: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    marginBottom: 4,
  },
  amountLabel: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    color: "#6B7280",
  },

  // Empty State
  empty: {
    flex: 1,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: "#6B7280",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 300,
  },
  emptyText: {
    color: "#94A3B8",
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    marginTop: 8,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#1F54DD",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
  },

  // Loading More
  loadingMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginBottom: 8,
  },
  loadingMoreText: {
    marginLeft: 8,
    color: '#6B7280',
    fontSize: 12,
    fontFamily: "Poppins-Regular",
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: '#9CA3AF',
  },
});