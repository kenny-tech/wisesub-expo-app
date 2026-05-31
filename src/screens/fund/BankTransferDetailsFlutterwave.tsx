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

export default function BankTransferDetailsFlutterwave({ navigation }: { navigation: any }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const route = useRoute<RouteProp<BankTransferDetailsRouteProps, 'BankTransferDetails'>>();
  const { transferDetails } = route.params;

  const [copiedField, setCopiedField] = useState<string | null>(null);

  const formatAmount = (amt: string): string => {
    const num = parseFloat(amt);
    return isNaN(num) ? amt : `₦${num.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const copyToClipboard = async (text: string, field: string) => {
    await Clipboard.setString(text);
    setCopiedField(field);
    Toast.show({ type: 'success', text1: 'Copied!', text2: `${field} copied to clipboard`, visibilityTime: 2000 });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getCopyIcon = (field: string) => copiedField === field ? 'checkmark' : 'copy-outline';
  const getCopyColor = (field: string) => copiedField === field ? '#10B981' : colors.primary;

  const handleDone = () => navigation.navigate('Tabs');
  const handleSupport = () => navigation.navigate("Support");

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.separator }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Bank Transfer Details</Text>
        <TouchableOpacity onPress={handleSupport} style={styles.supportButton}>
          <Ionicons name="help-circle-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.noteCard, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
          <Ionicons name="alert-circle" size={20} color="#F59E0B" />
          <Text style={[styles.noteText, { color: '#92400E' }]}>
            {transferDetails.note || `Transfer exactly ${formatAmount(transferDetails.amount)} to the account below`}
          </Text>
        </View>

        <View style={[styles.detailsCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.divider }]}>
          <View style={[styles.detailRow, { borderBottomColor: colors.divider }]}>
            <View style={styles.detailLabelContainer}>
              <Ionicons name="cash-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Amount to Transfer</Text>
            </View>
            <View style={styles.detailValueContainer}>
              <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{formatAmount(transferDetails.amount)}</Text>
              <TouchableOpacity onPress={() => copyToClipboard(transferDetails.amount, 'amount')} style={styles.copyButton}>
                <Ionicons name={getCopyIcon('amount')} size={18} color={getCopyColor('amount')} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.detailRow, { borderBottomColor: colors.divider }]}>
            <View style={styles.detailLabelContainer}>
              <Ionicons name="business-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Bank Name</Text>
            </View>
            <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{transferDetails.bank_name}</Text>
          </View>

          <View style={[styles.detailRow, { borderBottomColor: colors.divider }]}>
            <View style={styles.detailLabelContainer}>
              <Ionicons name="card-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Account Number</Text>
            </View>
            <View style={styles.detailValueContainer}>
              <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{transferDetails.account_number}</Text>
              <TouchableOpacity onPress={() => copyToClipboard(transferDetails.account_number, 'account')} style={styles.copyButton}>
                <Ionicons name={getCopyIcon('account')} size={18} color={getCopyColor('account')} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.detailRow, { borderBottomColor: colors.divider }]}>
            <View style={styles.detailLabelContainer}>
              <Ionicons name="document-text-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Order Reference</Text>
            </View>
            <View style={styles.detailValueContainer}>
              <Text style={[styles.detailValueSmall, { color: colors.textPrimary }]}>{transferDetails.order_ref}</Text>
              <TouchableOpacity onPress={() => copyToClipboard(transferDetails.order_ref, 'reference')} style={styles.copyButton}>
                <Ionicons name={getCopyIcon('reference')} size={18} color={getCopyColor('reference')} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailLabelContainer}>
              <Ionicons name="information-circle-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Status</Text>
            </View>
            <View style={[styles.statusBadge, transferDetails.response_code === '02' ? styles.statusProcessing : styles.statusCompleted]}>
              <Text style={[styles.statusBadgeText, { color: transferDetails.response_code === '02' ? '#92400E' : '#065F46' }]}>
                {transferDetails.response_message}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.instructionsCard, { backgroundColor: colors.card, borderColor: colors.divider }]}>
          <Text style={[styles.instructionsTitle, { color: colors.textPrimary }]}>How to Complete Transfer</Text>
          {['Open your bank\'s mobile app or internet banking', `Transfer exactly ${formatAmount(transferDetails.amount)} to the account above`, 'Your wallet will be credited automatically once payment is confirmed'].map((text, i) => (
            <View key={i} style={styles.instructionStep}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <Text style={styles.stepNumberText}>{i + 1}</Text>
              </View>
              <Text style={[styles.instructionText, { color: colors.textSecondary }]}>{text}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.importantNotes, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
          <Text style={[styles.importantNotesTitle, { color: '#DC2626' }]}>Important Notes:</Text>
          <View style={styles.noteItem}>
            <Ionicons name="warning-outline" size={16} color="#DC2626" />
            <Text style={[styles.noteItemText, { color: '#DC2626' }]}>Do not transfer a different amount or your payment will not be recognized</Text>
          </View>
          <View style={styles.noteItem}>
            <Ionicons name="warning-outline" size={16} color="#DC2626" />
            <Text style={[styles.noteItemText, { color: '#DC2626' }]}>Contact support if your wallet is not credited within 15 minutes</Text>
          </View>
          <View style={styles.noteItem}>
            <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
            <Text style={[styles.noteItemText, { color: colors.primary }]}>Transaction Reference: {transferDetails.flw_ref}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.separator }]}>
        <TouchableOpacity style={[styles.doneButton, { backgroundColor: colors.primary }]} onPress={handleDone}>
          <Text style={styles.doneButtonText}>I've Made the Transfer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.supportLinkButton} onPress={handleSupport}>
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
  noteCard: { flexDirection: 'row', alignItems: 'flex-start', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1 },
  noteText: { flex: 1, fontSize: 14, fontFamily: 'Poppins-Medium', marginLeft: 12, lineHeight: 20 },
  detailsCard: { borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  detailLabelContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  detailLabel: { fontSize: 14, fontFamily: 'Poppins-Medium', marginLeft: 8 },
  detailValueContainer: { flexDirection: 'row', alignItems: 'center' },
  detailValue: { fontSize: 14, fontFamily: 'Poppins-SemiBold' },
  detailValueSmall: { fontSize: 12, fontFamily: 'Poppins-SemiBold' },
  copyButton: { padding: 4, marginLeft: 8 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  statusProcessing: { backgroundColor: '#FEF3C7' },
  statusCompleted: { backgroundColor: '#D1FAE5' },
  statusBadgeText: { fontSize: 12, fontFamily: 'Poppins-Medium' },
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
  footer: { padding: 20, borderTopWidth: 1 },
  doneButton: { borderRadius: 12, padding: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  doneButtonText: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Poppins-SemiBold' },
  supportLinkButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 8 },
  supportLinkText: { fontSize: 14, fontFamily: 'Poppins-Medium', marginLeft: 8 },
});