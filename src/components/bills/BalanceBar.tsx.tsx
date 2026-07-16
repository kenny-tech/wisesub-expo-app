import { formatAmount } from '@/src/helper/util';
import { walletService } from '@/src/services/walletService';
import { useTheme } from '@/src/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function BalanceBar() {
  const { colors } = useTheme();
  const [walletBalance, setWalletBalance] = useState('0');
  const [commissionBalance, setCommissionBalance] = useState('0');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBalances();
  }, []);

  const fetchBalances = async () => {
    setLoading(true);
    try {
      const response = await walletService.getWalletBalance();
      if (response.success) {
        setWalletBalance(response.data.wallet_balance || '0');
        setCommissionBalance(response.data.commission_balance || '0');
      }
    } catch (error) {
      console.error('Failed to fetch balances:', error);
    } finally {
      setLoading(false);
    }
  };

  const styles = makeStyles(colors);

  return (
    <View style={[styles.balanceBar, { backgroundColor: colors.backgroundSecondary, borderBottomColor: colors.separator }]}>
      <View style={styles.balanceItem}>
        <Ionicons name="wallet-outline" size={14} color={colors.textSecondary} />
        <Text style={[styles.balanceText, { color: colors.textSecondary }]}>
          Available:{' '}
          <Text style={[styles.balanceAmount, { color: colors.primary }]}>
            {loading ? '...' : `₦${formatAmount(walletBalance)}`}
          </Text>
        </Text>
      </View>
      <View style={styles.balanceItem}>
        <Ionicons name="gift-outline" size={14} color={colors.textSecondary} />
        <Text style={[styles.balanceText, { color: colors.textSecondary }]}>
          Bonus:{' '}
          <Text style={[styles.balanceAmount, { color: '#10B981' }]}>
            {loading ? '...' : `₦${formatAmount(commissionBalance)}`}
          </Text>
        </Text>
      </View>
    </View>
  );
}

const makeStyles = (colors: any) =>
  StyleSheet.create({
    balanceBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderBottomWidth: 1,
      marginBottom: 20,
    },
    balanceItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    balanceText: {
      fontSize: 12,
      fontFamily: 'Poppins-Medium',
    },
    balanceAmount: {
      fontSize: 13,
      fontFamily: 'Poppins-SemiBold',
    },
  });