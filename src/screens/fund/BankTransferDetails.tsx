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

// Paystack DVA shape (normalised by your backend)
type TransferDetails = {
  bank_name: string;
  account_number: string;
  account_name: string;
  amount: string;
  flw_ref: string;
};

type BankTransferDetailsRouteProps = {
  BankTransferDetails: {
    transferDetails: TransferDetails;
    amount: string;
  };
};

export default function BankTransferDetails({ navigation }: { navigation: any }) {
  const route = useRoute<RouteProp<BankTransferDetailsRouteProps, 'BankTransferDetails'>>();
  const { transferDetails, amount } = route.params;

  const [copiedField, setCopiedField] = useState<string | null>(null);

  const formatAmount = (amt: string): string => {
    const num = parseFloat(amt);
    return isNaN(num)
      ? amt
      : `₦${num.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getCopyIcon = (field: string) => copiedField === field ? 'checkmark' : 'copy-outline';
  const getCopyColor = (field: string) => copiedField === field ? '#10B981' : '#1F54DD';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.title}>Bank Transfer Details</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Support')} style={styles.supportButton}>
          <Ionicons name="help-circle-outline" size={24} color="#1F54DD" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        {/* Warning banner */}
        <View style={styles.noteCard}>
          <Ionicons name="alert-circle" size={20} color="#F59E0B" />
          <Text style={styles.noteText}>
            Transfer <Text style={{ fontFamily: 'Poppins-Bold' }}>exactly {formatAmount(transferDetails.amount)}</Text> to the account below. Any other amount will not be credited. The amount includes a processing fee charged by the payment provider.
          </Text>
        </View>

        {/* Details card */}
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
                onPress={() => copyToClipboard(transferDetails.amount, 'Amount')}
                style={styles.copyButton}
              >
                <Ionicons name={getCopyIcon('Amount')} size={18} color={getCopyColor('Amount')} />
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
                onPress={() => copyToClipboard(transferDetails.account_number, 'Account Number')}
                style={styles.copyButton}
              >
                <Ionicons name={getCopyIcon('Account Number')} size={18} color={getCopyColor('Account Number')} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Account Name — Paystack specific */}
          {!!transferDetails.account_name && (
            <View style={styles.detailRow}>
              <View style={styles.detailLabelContainer}>
                <Ionicons name="person-outline" size={18} color="#64748B" />
                <Text style={styles.detailLabel}>Account Name</Text>
              </View>
              <View style={styles.detailValueContainer}>
                <Text style={styles.detailValue}>{transferDetails.account_name}</Text>
                <TouchableOpacity
                  onPress={() => copyToClipboard(transferDetails.account_name, 'Account Name')}
                  style={styles.copyButton}
                >
                  <Ionicons name={getCopyIcon('Account Name')} size={18} color={getCopyColor('Account Name')} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Reference — replaces flw_ref / order_ref */}
          {!!transferDetails.flw_ref && (
            <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
              <View style={styles.detailLabelContainer}>
                <Ionicons name="document-text-outline" size={18} color="#64748B" />
                <Text style={styles.detailLabel}>Reference</Text>
              </View>
              <View style={styles.detailValueContainer}>
                <Text style={styles.detailValueSmall}>{transferDetails.flw_ref}</Text>
                <TouchableOpacity
                  onPress={() => copyToClipboard(transferDetails.flw_ref, 'Reference')}
                  style={styles.copyButton}
                >
                  <Ionicons name={getCopyIcon('Reference')} size={18} color={getCopyColor('Reference')} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>How to Complete Transfer</Text>
          {[
            'Open your bank\'s mobile app or internet banking.',
            `Transfer exactly ${formatAmount(transferDetails.amount)} to the account above.`,
            'Your wallet will be credited automatically once payment is confirmed.',
          ].map((text, i) => (
            <View key={i} style={styles.instructionStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{i + 1}</Text>
              </View>
              <Text style={styles.instructionText}>{text}</Text>
            </View>
          ))}
        </View>

        {/* Important Notes */}
        <View style={styles.importantNotes}>
          <Text style={styles.importantNotesTitle}>Important Notes:</Text>
          {[
            'Do not transfer a different amount or your payment will not be recognized.',
            'Contact support if your wallet is not credited within 15 minutes.',
            `Keep your reference handy: ${transferDetails.flw_ref}`,
          ].map((note, i) => (
            <View key={i} style={styles.noteItem}>
              <Ionicons
                name={i === 2 ? 'information-circle-outline' : 'warning-outline'}
                size={16}
                color={i === 2 ? '#1F54DD' : '#DC2626'}
              />
              <Text style={[styles.noteItemText, i === 2 && { color: '#1F54DD' }]}>{note}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.doneButton} onPress={() => navigation.navigate('Tabs')}>
          <Text style={styles.doneButtonText}>I've Made the Transfer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.supportLinkButton} onPress={() => navigation.navigate('Support')}>
          <Ionicons name="chatbubble-outline" size={18} color="#1F54DD" />
          <Text style={styles.supportLinkText}>Need Help? Contact Support</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  backButton: { padding: 4 },
  title: { fontSize: 18, fontFamily: 'Poppins-SemiBold', color: '#0F172A' },
  supportButton: { padding: 4 },
  content: { flex: 1, paddingHorizontal: 20 },
  noteCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FFFBEB', borderRadius: 12, padding: 16, marginTop: 20, marginBottom: 16, borderWidth: 1, borderColor: '#FDE68A' },
  noteText: { flex: 1, fontSize: 14, fontFamily: 'Poppins-Medium', color: '#92400E', marginLeft: 12, lineHeight: 20 },
  detailsCard: { backgroundColor: '#F8FAFC', borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#E2E8F0' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  detailLabelContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  detailLabel: { fontSize: 14, fontFamily: 'Poppins-Medium', color: '#64748B', marginLeft: 8 },
  detailValueContainer: { flexDirection: 'row', alignItems: 'center' },
  detailValue: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#0F172A' },
  detailValueSmall: { fontSize: 11, fontFamily: 'Poppins-SemiBold', color: '#0F172A', maxWidth: 120 },
  copyButton: { padding: 4, marginLeft: 8 },
  instructionsCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#E2E8F0' },
  instructionsTitle: { fontSize: 16, fontFamily: 'Poppins-SemiBold', color: '#0F172A', marginBottom: 16 },
  instructionStep: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  stepNumber: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#1F54DD', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  stepNumberText: { fontSize: 12, fontFamily: 'Poppins-Bold', color: '#FFFFFF' },
  instructionText: { flex: 1, fontSize: 14, fontFamily: 'Poppins-Regular', color: '#475569', lineHeight: 20 },
  importantNotes: { backgroundColor: '#FEF2F2', borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#FECACA' },
  importantNotesTitle: { fontSize: 16, fontFamily: 'Poppins-SemiBold', color: '#DC2626', marginBottom: 12 },
  noteItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  noteItemText: { flex: 1, fontSize: 12, fontFamily: 'Poppins-Regular', color: '#DC2626', marginLeft: 8, lineHeight: 16 },
  footer: { padding: 20, marginBottom: 10, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  doneButton: { backgroundColor: '#1F54DD', borderRadius: 12, padding: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  doneButtonText: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Poppins-SemiBold' },
  supportLinkButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 8, marginBottom: 10 },
  supportLinkText: { color: '#1F54DD', fontSize: 14, fontFamily: 'Poppins-Medium', marginLeft: 8 },
});