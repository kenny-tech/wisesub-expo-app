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
import { useTheme } from '../../theme/ThemeContext';

type TransferDetails = {
  bank_name: string;
  account_number: string;
  account_name: string;
  amount: string;
  flw_ref: string;
  note?: string; // optional note field
};

type BankTransferDetailsRouteProps = {
  BankTransferDetails: {
    transferDetails: TransferDetails;
    amount: string;
  };
};

export default function BankTransferDetails({ navigation }: { navigation: any }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

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
  const getCopyColor = (field: string) => copiedField === field ? '#10B981' : colors.primary;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.separator }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Bank Transfer Details</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Support')} style={styles.supportButton}>
          <Ionicons name="help-circle-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Warning banner */}
        <View style={[styles.noteCard, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
          <Ionicons name="alert-circle" size={20} color="#F59E0B" />
          <Text style={[styles.noteText, { color: '#92400E' }]}>
            Transfer <Text style={{ fontFamily: 'Poppins-Bold' }}>exactly {formatAmount(transferDetails.amount)}</Text> to the account below. Any other amount will not be credited. The amount includes a processing fee charged by the payment provider.
          </Text>
        </View>

        {/* Details card */}
        <View style={[styles.detailsCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.divider }]}>

          {/* Note (if present) */}
          {transferDetails.note && (
            <View style={[styles.detailRow, { borderBottomColor: colors.divider }]}>
              <View style={styles.detailLabelContainer}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>{transferDetails.note}</Text>
              </View>
            </View>
          )}

          {/* Amount */}
          <View style={[styles.detailRow, { borderBottomColor: colors.divider }]}>
            <View style={styles.detailLabelContainer}>
              <Ionicons name="cash-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Amount to Transfer</Text>
            </View>
            <View style={styles.detailValueContainer}>
              <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{formatAmount(transferDetails.amount)}</Text>
              <TouchableOpacity
                onPress={() => copyToClipboard(transferDetails.amount, 'Amount')}
                style={styles.copyButton}
              >
                <Ionicons name={getCopyIcon('Amount')} size={18} color={getCopyColor('Amount')} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Bank Name */}
          <View style={[styles.detailRow, { borderBottomColor: colors.divider }]}>
            <View style={styles.detailLabelContainer}>
              <Ionicons name="business-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Bank Name</Text>
            </View>
            <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{transferDetails.bank_name}</Text>
          </View>

          {/* Account Number */}
          <View style={[styles.detailRow, { borderBottomColor: colors.divider }]}>
            <View style={styles.detailLabelContainer}>
              <Ionicons name="card-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Account Number</Text>
            </View>
            <View style={styles.detailValueContainer}>
              <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{transferDetails.account_number}</Text>
              <TouchableOpacity
                onPress={() => copyToClipboard(transferDetails.account_number, 'Account Number')}
                style={styles.copyButton}
              >
                <Ionicons name={getCopyIcon('Account Number')} size={18} color={getCopyColor('Account Number')} />
              </TouchableOpacity>
            </View>
          </View>

          {!!transferDetails.account_name && (
            <View style={[styles.detailRow, { borderBottomColor: colors.divider }]}>
              <View style={styles.detailLabelContainer}>
                <Ionicons name="person-outline" size={18} color={colors.textSecondary} />
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Account Name</Text>
              </View>
              <View style={styles.detailValueContainer}>
                <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{transferDetails.account_name}</Text>
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
                <Ionicons name="document-text-outline" size={18} color={colors.textSecondary} />
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Reference</Text>
              </View>
              <View style={styles.detailValueContainer}>
                <Text style={[styles.detailValueSmall, { color: colors.textPrimary }]}>{transferDetails.flw_ref}</Text>
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
        <View style={[styles.instructionsCard, { backgroundColor: colors.card, borderColor: colors.divider }]}>
          <Text style={[styles.instructionsTitle, { color: colors.textPrimary }]}>How to Complete Transfer</Text>
          {[
            'Open your bank\'s mobile app or internet banking.',
            `Transfer exactly ${formatAmount(transferDetails.amount)} to the account above.`,
            'Your wallet will be credited automatically once payment is confirmed.',
          ].map((text, i) => (
            <View key={i} style={styles.instructionStep}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <Text style={styles.stepNumberText}>{i + 1}</Text>
              </View>
              <Text style={[styles.instructionText, { color: colors.textSecondary }]}>{text}</Text>
            </View>
          ))}
        </View>

        {/* Important Notes */}
        <View style={[styles.importantNotes, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
          <Text style={[styles.importantNotesTitle, { color: '#DC2626' }]}>Important Notes:</Text>
          {[
            'Do not transfer a different amount or your payment will not be recognized.',
            'Contact support if your wallet is not credited within 15 minutes.',
            `Keep your reference handy: ${transferDetails.flw_ref}`,
          ].map((note, i) => (
            <View key={i} style={styles.noteItem}>
              <Ionicons
                name={i === 2 ? 'information-circle-outline' : 'warning-outline'}
                size={16}
                color={i === 2 ? colors.primary : '#DC2626'}
              />
              <Text style={[styles.noteItemText, i === 2 && { color: colors.primary }]}>{note}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.separator }]}>
        <TouchableOpacity style={[styles.doneButton, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('Tabs')}>
          <Text style={styles.doneButtonText}>I've Made the Transfer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.supportLinkButton} onPress={() => navigation.navigate('Support')}>
          <Ionicons name="chatbubble-outline" size={18} color={colors.primary} />
          <Text style={[styles.supportLinkText, { color: colors.primary }]}>Need Help? Contact Support</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, borderBottomWidth: 1 },
  backButton: { padding: 4 },
  title: { fontSize: 18, fontFamily: 'Poppins-SemiBold' },
  supportButton: { padding: 4 },
  content: { flex: 1, paddingHorizontal: 20 },
  noteCard: { flexDirection: 'row', alignItems: 'flex-start', borderRadius: 12, padding: 16, marginTop: 20, marginBottom: 16, borderWidth: 1 },
  noteText: { flex: 1, fontSize: 14, fontFamily: 'Poppins-Medium', marginLeft: 12, lineHeight: 20 },
  detailsCard: { borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  detailLabelContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  detailLabel: { fontSize: 14, fontFamily: 'Poppins-Medium', marginLeft: 8 },
  detailValueContainer: { flexDirection: 'row', alignItems: 'center' },
  detailValue: { fontSize: 14, fontFamily: 'Poppins-SemiBold' },
  detailValueSmall: { fontSize: 11, fontFamily: 'Poppins-SemiBold', maxWidth: 120 },
  copyButton: { padding: 4, marginLeft: 8 },
  instructionsCard: { borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1 },
  instructionsTitle: { fontSize: 16, fontFamily: 'Poppins-SemiBold', marginBottom: 16 },
  instructionStep: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  stepNumber: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  stepNumberText: { fontSize: 12, fontFamily: 'Poppins-Bold', color: '#FFFFFF' },
  instructionText: { flex: 1, fontSize: 14, fontFamily: 'Poppins-Regular', lineHeight: 20 },
  importantNotes: { borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1 },
  importantNotesTitle: { fontSize: 16, fontFamily: 'Poppins-SemiBold', marginBottom: 12 },
  noteItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  noteItemText: { flex: 1, fontSize: 12, fontFamily: 'Poppins-Regular', marginLeft: 8, lineHeight: 16 },
  footer: { padding: 20, marginBottom: 10, borderTopWidth: 1 },
  doneButton: { borderRadius: 12, padding: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  doneButtonText: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Poppins-SemiBold' },
  supportLinkButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 8, marginBottom: 10 },
  supportLinkText: { fontSize: 14, fontFamily: 'Poppins-Medium', marginLeft: 8 },
});