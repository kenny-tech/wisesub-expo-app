import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Clipboard from 'expo-clipboard';
import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { formatAmount, formatDate } from '../helper/util';
import { showError, showSuccess } from '../utils/toast';

type RootStackParamList = {
  TransactionDetail: { transaction: any };
};

type TransactionDetailScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'TransactionDetail'
>;

type TransactionDetailScreenRouteProp = RouteProp<
  RootStackParamList,
  'TransactionDetail'
>;

interface Props {
  navigation: TransactionDetailScreenNavigationProp;
  route: TransactionDetailScreenRouteProp;
}

const TransactionDetail: React.FC<Props> = ({ navigation, route }) => {
  const { transaction } = route.params;

  const isCredit = [
    'Fund Wallet',
    'Commission',
    'Referral Commission',
    'Refund'
  ].includes(transaction.name);

  const getStatusColor = () => {
    return isCredit ? '#10B981' : '#EF4444';
  };

  const getStatusText = () => {
    return isCredit ? 'Credit' : 'Debit';
  };

  // Check if this is a WiseSub transaction (no provider logo)
  const isWiseSubTransaction = [
    'Fund Wallet',
    'Commission',
    'Referral Commission',
    'Refund'
  ].includes(transaction.name);

  // Get the appropriate logo
  const getLogoSource = () => {
    if (isWiseSubTransaction) {
      return require('../../assets/images/logo.png'); // Your WiseSub logo
    } else if (transaction.provider_logo) {
      return { uri: transaction.provider_logo };
    }
    return null;
  };

  // Get service icon based on transaction type
  const getServiceIcon = () => {
    if (isWiseSubTransaction) {
      return 'business'; // Bank icon for WiseSub transactions
    }

    switch (transaction.type) {
      case 'Data':
        return 'wifi';
      case 'Airtime':
        return 'call';
      case 'Cable TV':
      case 'Cable':
        return 'tv';
      case 'Electricity':
        return 'flash';
      default:
        return 'card';
    }
  };

  const logoSource = getLogoSource();
  const serviceIcon = getServiceIcon();

  const handleCopyToken = async (token: string) => {
    try {
      await Clipboard.setStringAsync(token);
      showSuccess('Token Copied', 'Electricity token has been copied to clipboard')
    } catch (error) {
      showError('Error', 'Failed to copy token. Please try again.')
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.title}>Transaction Details</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {/* Logo/Icon Section */}
        <View style={styles.logoSection}>
          <View style={[
            styles.logoContainer,
            isWiseSubTransaction ? styles.wiseSubLogoContainer : styles.providerLogoContainer
          ]}>
            {logoSource ? (
              <Image
                source={logoSource}
                style={[
                  styles.logoImage,
                  isWiseSubTransaction ? styles.wiseSubLogo : styles.providerLogo
                ]}
                resizeMode={isWiseSubTransaction ? 'contain' : 'cover'}
                defaultSource={require('../../assets/images/logo.png')}
              />
            ) : (
              <View style={styles.iconFallback}>
                <Ionicons
                  name={serviceIcon}
                  size={32}
                  color={isWiseSubTransaction ? "#1F54DD" : "#64748B"}
                />
              </View>
            )}
          </View>

          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>{transaction.name}</Text>
            <Text style={styles.serviceType}>
              {transaction.type || (isWiseSubTransaction ? 'Wallet Transaction' : 'Service Purchase')}
            </Text>
          </View>
        </View>

        {/* Amount Card */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Amount</Text>
          <Text style={[styles.amount, { color: getStatusColor() }]}>
            {isCredit ? '+' : '-'}₦{formatAmount(transaction.amount)}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
          </View>
        </View>

        {/* Transaction Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={20} color="#1F54DD" />
            <Text style={styles.infoTitle}>Transaction Information</Text>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Transaction Reference</Text>
              <Text style={styles.infoValue}>{transaction.reference}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Date & Time</Text>
              <Text style={styles.infoValue}>{formatDate(transaction.created_at)}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Status</Text>
              <View style={[
                styles.statusIndicator,
                { backgroundColor: isCredit ? '#10B98120' : '#EF444420' }
              ]}>
                <Text style={[
                  styles.statusIndicatorText,
                  { color: getStatusColor() }
                ]}>
                  {isCredit ? 'Completed' : 'Completed'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.detailsHeader}>
            <Ionicons name="receipt" size={20} color="#1F54DD" />
            <Text style={styles.detailsTitle}>Transaction Details</Text>
          </View>

          <View style={styles.detailsContent}>
            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <Ionicons name="cube" size={16} color="#64748B" />
                <Text style={styles.detailLabel}>Service Type</Text>
              </View>
              <Text style={styles.detailValue}>{transaction.name}</Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <Ionicons name="grid" size={16} color="#64748B" />
                <Text style={styles.detailLabel}>Category</Text>
              </View>
              <Text style={styles.detailValue}>{transaction.type || 'General'}</Text>
            </View>

            {transaction.customer && (
              <View style={styles.detailRow}>
                <View style={styles.detailLeft}>
                  <Ionicons name="person" size={16} color="#64748B" />
                  <Text style={styles.detailLabel}>Customer</Text>
                </View>
                <Text style={styles.detailValue}>{transaction.customer}</Text>
              </View>
            )}

            {transaction.electricity_token && (
              <View style={styles.detailRow}>
                <View style={styles.detailLeft}>
                  <Ionicons name="key" size={16} color="#64748B" />
                  <Text style={styles.detailLabel}>Meter Token</Text>
                </View>
                <View style={styles.tokenContainer}>
                  <Text style={styles.tokenValue}>{transaction.electricity_token}</Text>
                  <TouchableOpacity style={styles.copyButton} onPress={() => handleCopyToken(transaction.electricity_token)}>
                    <Ionicons name="copy-outline" size={14} color="#1F54DD" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {transaction.units && (
              <View style={styles.detailRow}>
                <View style={styles.detailLeft}>
                  <Ionicons name="person" size={16} color="#64748B" />
                  <Text style={styles.detailLabel}>Units</Text>
                </View>
                <Text style={styles.detailValue}>{transaction.units}</Text>
              </View>
            )}

            {transaction.reference && (
              <View style={styles.detailRow}>
                <View style={styles.detailLeft}>
                  <Ionicons name="document-text" size={16} color="#64748B" />
                  <Text style={styles.detailLabel}>Reference</Text>
                </View>
                <Text style={styles.detailValue}>{transaction.reference}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Help Section */}
        <View style={styles.helpCard}>
          <View style={styles.helpHeader}>
            <Ionicons name="help-circle" size={20} color="#1F54DD" />
            <Text style={styles.helpTitle}>Need Help?</Text>
          </View>
          <Text style={styles.helpText}>
            If you have any questions about this transaction, please contact our support team.
          </Text>
          <TouchableOpacity style={styles.supportButton}>
            <Ionicons name="chatbubble-ellipses" size={18} color="#FFFFFF" />
            <Text style={styles.supportButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F172A',
  },
  placeholder: {
    width: 32,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  // Logo Section
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  wiseSubLogoContainer: {
    backgroundColor: '#E0E7FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  providerLogoContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  wiseSubLogo: {
    width: '70%',
    height: '70%',
  },
  providerLogo: {
    width: '100%',
    height: '100%',
  },
  iconFallback: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F172A',
    marginBottom: 4,
  },
  serviceType: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
  },
  // Amount Card
  amountCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  amountLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
    marginBottom: 8,
  },
  amount: {
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  // Info Card
  infoCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F172A',
    marginLeft: 8,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  infoItem: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#0F172A',
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusIndicatorText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  // Details Card
  detailsCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  detailsTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F172A',
    marginLeft: 8,
  },
  detailsContent: {
    padding: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
    marginLeft: 8,
  },
  detailValue: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#0F172A',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  tokenContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tokenValue: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#1F54DD',
    marginRight: 8,
  },
  copyButton: {
    padding: 4,
  },
  // Help Card
  helpCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E0F2FE',
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  helpTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F172A',
    marginLeft: 8,
  },
  helpText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 16,
  },
  supportButton: {
    backgroundColor: '#1F54DD',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  supportButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    marginLeft: 8,
  },
});

export default TransactionDetail;