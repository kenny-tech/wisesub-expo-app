import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import {
    Clipboard,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Toast from 'react-native-toast-message';

type BankTransferDetailsRouteProps = {
  BankTransferDetails: {
    transferDetails: {
      account_number: string;
      account_status: string;
      amount: string;
      bank_name: string;
      created_at: string;
      expiry_date: string;
      flw_ref: string;
      frequency: number;
      note: string;
      order_ref: string;
      response_code: string;
      response_message: string;
    };
    amount: string;
  };
};

export default function BankTransferDetails({ navigation }: { navigation: any }) {
  const route = useRoute<RouteProp<BankTransferDetailsRouteProps, 'BankTransferDetails'>>();
  const { transferDetails, amount } = route.params;
  
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const formatAmount = (amt: string): string => {
    const num = parseFloat(amt);
    return isNaN(num) ? amt : `₦${num.toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleString('en-NG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return dateString;
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    await Clipboard.setString(text);
    setCopiedField(field);
    
    Toast.show({
      type: 'success',
      text1: 'Copied!',
      text2: `${field} copied to clipboard`,
      visibilityTime: 2000,
    });

    // Reset copied field after 2 seconds
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const getCopyIcon = (field: string) => {
    return copiedField === field ? 'checkmark' : 'copy-outline';
  };

  const getCopyColor = (field: string) => {
    return copiedField === field ? '#10B981' : '#1F54DD';
  };

  const handleDone = () => {
    navigation.navigate('Tabs');
  };

  const handleSupport = () => {
    Toast.show({
      type: 'info',
      text1: 'Support',
      text2: 'Contact support at support@wisesub.com.ng',
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.title}>Bank Transfer Details</Text>
        <TouchableOpacity 
          onPress={handleSupport} 
          style={styles.supportButton}
        >
          <Ionicons name="help-circle-outline" size={24} color="#1F54DD" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Banner */}
        {/* <View style={[
          styles.statusBanner,
          transferDetails.account_status === 'active' ? styles.statusActive : styles.statusInactive
        ]}>
          <Ionicons 
            name={transferDetails.account_status === 'active' ? 'checkmark-circle' : 'alert-circle'} 
            size={20} 
            color={transferDetails.account_status === 'active' ? '#10B981' : '#DC2626'} 
          />
          <Text style={styles.statusText}>
            {transferDetails.account_status === 'active' 
              ? 'Account is active and ready for transfer' 
              : 'Account is inactive'}
          </Text>
        </View> */}

        {/* Important Note */}
        <View style={styles.noteCard}>
          <Ionicons name="alert-circle" size={20} color="#F59E0B" />
          <Text style={styles.noteText}>
            {transferDetails.note || `Transfer exactly ${formatAmount(transferDetails.amount)} to the account below`}
          </Text>
        </View>

        {/* Transfer Details */}
        <View style={styles.detailsCard}>
          {/* Amount */}
          <View style={styles.detailRow}>
            <View style={styles.detailLabelContainer}>
              <Ionicons name="cash-outline" size={18} color="#64748B" />
              <Text style={styles.detailLabel}>Amount to Transfer</Text>
            </View>
            <View style={styles.detailValueContainer}>
              <Text style={styles.detailValue}>{formatAmount(transferDetails.amount)}</Text>
              <TouchableOpacity
                onPress={() => copyToClipboard(transferDetails.amount, 'amount')}
                style={styles.copyButton}
              >
                <Ionicons
                  name={getCopyIcon('amount')}
                  size={18}
                  color={getCopyColor('amount')}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Bank Name */}
          <View style={styles.detailRow}>
            <View style={styles.detailLabelContainer}>
              <Ionicons name="business-outline" size={18} color="#64748B" />
              <Text style={styles.detailLabel}>Bank Name</Text>
            </View>
            <Text style={styles.detailValue}>{transferDetails.bank_name}</Text>
          </View>

          {/* Account Number */}
          <View style={styles.detailRow}>
            <View style={styles.detailLabelContainer}>
              <Ionicons name="card-outline" size={18} color="#64748B" />
              <Text style={styles.detailLabel}>Account Number</Text>
            </View>
            <View style={styles.detailValueContainer}>
              <Text style={styles.detailValue}>{transferDetails.account_number}</Text>
              <TouchableOpacity
                onPress={() => copyToClipboard(transferDetails.account_number, 'account')}
                style={styles.copyButton}
              >
                <Ionicons
                  name={getCopyIcon('account')}
                  size={18}
                  color={getCopyColor('account')}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Order Reference */}
          <View style={styles.detailRow}>
            <View style={styles.detailLabelContainer}>
              <Ionicons name="document-text-outline" size={18} color="#64748B" />
              <Text style={styles.detailLabel}>Order Reference</Text>
            </View>
            <View style={styles.detailValueContainer}>
              <Text style={styles.detailValueSmall}>{transferDetails.order_ref}</Text>
              <TouchableOpacity
                onPress={() => copyToClipboard(transferDetails.order_ref, 'reference')}
                style={styles.copyButton}
              >
                <Ionicons
                  name={getCopyIcon('reference')}
                  size={18}
                  color={getCopyColor('reference')}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Status */}
          <View style={styles.detailRow}>
            <View style={styles.detailLabelContainer}>
              <Ionicons name="information-circle-outline" size={18} color="#64748B" />
              <Text style={styles.detailLabel}>Status</Text>
            </View>
            <View style={[
              styles.statusBadge,
              transferDetails.response_code === '02' ? styles.statusProcessing : styles.statusCompleted
            ]}>
              <Text style={styles.statusBadgeText}>
                {transferDetails.response_message}
              </Text>
            </View>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>How to Complete Transfer</Text>
          
          <View style={styles.instructionStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.instructionText}>
              Open your bank's mobile app or internet banking
            </Text>
          </View>
          
          <View style={styles.instructionStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.instructionText}>
              Transfer <Text style={styles.highlight}>exactly {formatAmount(transferDetails.amount)}</Text> to the account above
            </Text>
          </View>
          
          {/* <View style={styles.instructionStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.instructionText}>
              Use the reference <Text style={styles.highlight}>{transferDetails.order_ref}</Text> if required by your bank
            </Text>
          </View> */}
          
          <View style={styles.instructionStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.instructionText}>
              Your wallet will be credited automatically once payment is confirmed
            </Text>
          </View>
        </View>

        {/* Important Notes */}
        <View style={styles.importantNotes}>
          <Text style={styles.importantNotesTitle}>Important Notes:</Text>
          
          <View style={styles.noteItem}>
            <Ionicons name="warning-outline" size={16} color="#DC2626" />
            <Text style={styles.noteItemText}>
              Do not transfer a different amount or your payment will not be recognized
            </Text>
          </View>
          
          <View style={styles.noteItem}>
            <Ionicons name="warning-outline" size={16} color="#DC2626" />
            <Text style={styles.noteItemText}>
              Contact support if your wallet is not credited within 15 minutes
            </Text>
          </View>
          
          <View style={styles.noteItem}>
            <Ionicons name="information-circle-outline" size={16} color="#1F54DD" />
            <Text style={styles.noteItemText}>
              Transaction Reference: {transferDetails.flw_ref}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.doneButton}
          onPress={handleDone}
        >
          <Text style={styles.doneButtonText}>I've Made the Transfer</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.supportLinkButton}
          onPress={handleSupport}
        >
          <Ionicons name="chatbubble-outline" size={18} color="#1F54DD" />
          <Text style={styles.supportLinkText}>Need Help? Contact Support</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F172A',
  },
  supportButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 16,
  },
  statusActive: {
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  statusInactive: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  statusText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#065F46',
    marginLeft: 12,
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#92400E',
    marginLeft: 12,
    lineHeight: 20,
  },
  detailsCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  detailLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#64748B',
    marginLeft: 8,
  },
  detailValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailValue: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F172A',
  },
  detailValueSmall: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F172A',
  },
  copyButton: {
    padding: 4,
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusProcessing: {
    backgroundColor: '#FEF3C7',
  },
  statusCompleted: {
    backgroundColor: '#D1FAE5',
  },
  statusBadgeText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#92400E',
  },
  instructionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  instructionsTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F172A',
    marginBottom: 16,
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1F54DD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#475569',
    lineHeight: 20,
  },
  highlight: {
    fontFamily: 'Poppins-SemiBold',
    color: '#1F54DD',
  },
  importantNotes: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  importantNotesTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#DC2626',
    marginBottom: 12,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  noteItemText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#DC2626',
    marginLeft: 8,
    lineHeight: 16,
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  doneButton: {
    backgroundColor: '#1F54DD',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  supportLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  supportLinkText: {
    color: '#1F54DD',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    marginLeft: 8,
  },
});