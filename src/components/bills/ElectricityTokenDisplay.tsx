import { formatAmount } from '@/src/helper/util';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import { useTheme } from '../../theme/ThemeContext';

interface ElectricityTokenDisplayProps {
  visible: boolean;
  onClose: () => void;
  token: string;
  units: string;
  amount: number;
  meterNumber: string;
  provider: string;
  customerName: string;
  phoneNumber: string;
}

export const ElectricityTokenDisplay: React.FC<ElectricityTokenDisplayProps> = ({
  visible,
  onClose,
  token,
  units,
  amount,
  meterNumber,
  provider,
  customerName,
  phoneNumber,
}) => {
  const { colors, isDark } = useTheme();  // ← get isDark for logo switching
  const styles = makeStyles(colors);
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const receiptRef = useRef<React.ElementRef<typeof ViewShot>>(null);

  const handleCopyToken = async (): Promise<void> => {
    try {
      await Clipboard.setStringAsync(token);
      Alert.alert('Token Copied', 'Electricity token has been copied to clipboard', [
        { text: 'OK', style: 'default' },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to copy token. Please try again.');
    }
  };

  const handleShareAsImage = async (): Promise<void> => {
    if (!receiptRef.current?.capture) return;

    setIsSharing(true);
    try {
      await new Promise<void>((resolve) => setTimeout(resolve, 150));
      const uri = await receiptRef.current.capture();
      if (!uri) throw new Error('Capture returned empty URI');
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Not Supported', 'Sharing is not available on this device.');
        return;
      }
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Share Electricity Receipt',
        UTI: 'public.png',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Share error:', message);
      Alert.alert('Error', 'Failed to share receipt. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  const formatProviderName = (providerCode: string): string => {
    const providerMap: Record<string, string> = {
      ikedc: 'Ikeja Electric',
      ekedc: 'Eko Electric',
      kedco: 'Kano Electric',
      phedc: 'Port Harcourt Electric',
      ibedc: 'Ibadan Electric',
      aedc: 'Abuja Electric',
    };
    return providerMap[providerCode] ?? providerCode;
  };

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString();
  const formattedTime = currentDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const detailRows: { label: string; value: string; highlight?: boolean }[] = [
    { label: 'Meter Number', value: meterNumber },
    { label: 'Customer Name', value: customerName },
    { label: 'Provider', value: formatProviderName(provider) },
    { label: 'Units', value: `${units} kWh` },
    { label: 'Amount Paid', value: `₦${formatAmount(amount)}`, highlight: true },
    { label: 'Date & Time', value: `${formattedDate} ${formattedTime}` },
  ];

  // ──────────────────────────────────────────────────────────────────────────
  // Light Receipt Content (for sharing – always uses light mode colours)
  // ──────────────────────────────────────────────────────────────────────────
  const LightReceiptContent: React.FC = () => (
    <>
      <View style={lightStyles.logoContainer}>
        <Image source={require('../../../assets/images/logo_black.png')} style={lightStyles.logo} resizeMode="contain" />
      </View>
      <Text style={lightStyles.receiptTitle}>Electricity Token Receipt</Text>
      <View style={lightStyles.tokenSection}>
        <Text style={lightStyles.sectionTitle}>Token Number</Text>
        <View style={lightStyles.tokenBox}>
          <Text style={lightStyles.tokenText} selectable>{token}</Text>
        </View>
      </View>
      <View style={lightStyles.detailsSection}>
        <Text style={lightStyles.sectionTitle}>Transaction Details</Text>
        {detailRows.map(({ label, value, highlight }) => (
          <View key={label} style={lightStyles.detailRow}>
            <Text style={lightStyles.detailLabel}>{label}:</Text>
            <Text style={highlight ? lightStyles.amountValue : lightStyles.detailValue}>
              {value}
            </Text>
          </View>
        ))}
      </View>
      <Text style={lightStyles.receiptFooter}>Thank you for using WiseSub</Text>
    </>
  );

  // ──────────────────────────────────────────────────────────────────────────
  // Theme Receipt Content (for on‑screen modal – respects current theme)
  // ──────────────────────────────────────────────────────────────────────────
  const themeLogo = isDark
    ? require('../../../assets/images/logo_white.png')
    : require('../../../assets/images/logo_black.png');

  const ThemeReceiptContent: React.FC = () => (
    <>
      <View style={styles.logoContainer}>
        <Image source={themeLogo} style={styles.logo} resizeMode="contain" />
      </View>
      <Text style={[styles.receiptTitle, { color: colors.primary }]}>Electricity Token Receipt</Text>
      <View style={styles.tokenSection}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Token Number</Text>
        <View style={[styles.tokenBox, { backgroundColor: colors.primaryLight, borderColor: `${colors.primary}40` }]}>
          <Text style={[styles.tokenText, { color: colors.primary }]} selectable>{token}</Text>
        </View>
      </View>
      <View style={[styles.detailsSection, { backgroundColor: colors.backgroundSecondary }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Transaction Details</Text>
        {detailRows.map(({ label, value, highlight }) => (
          <View key={label} style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>{label}:</Text>
            <Text style={highlight ? styles.amountValue : [styles.detailValue, { color: colors.textPrimary }]}>
              {value}
            </Text>
          </View>
        ))}
      </View>
      <Text style={[styles.receiptFooter, { color: colors.textMuted }]}>Thank you for using WiseSub</Text>
    </>
  );

  return (
    <>
      {/* Off‑screen receipt for sharing (always light mode) */}
      <ViewShot
        ref={receiptRef}
        options={{ format: 'png', quality: 1, result: 'tmpfile' }}
        style={styles.offScreenReceipt}
      >
        <View style={[styles.offScreenCard, { backgroundColor: '#FFFFFF' }]}>
          <LightReceiptContent />
        </View>
      </ViewShot>

      {/* On‑screen modal (theme‑aware) */}
      <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.separator }]}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Electricity Token</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContentContainer}
            >
              <ThemeReceiptContent />
              <TouchableOpacity style={[styles.copyButton, { backgroundColor: colors.primaryLight, borderColor: `${colors.primary}40` }]} onPress={handleCopyToken}>
                <Ionicons name="copy-outline" size={18} color={colors.primary} />
                <Text style={[styles.copyButtonText, { color: colors.primary }]}>Copy Token</Text>
              </TouchableOpacity>
            </ScrollView>
            <View style={[styles.actionSection, { borderTopColor: colors.separator }]}>
              <TouchableOpacity
                style={[styles.shareButton, { backgroundColor: colors.primaryLight, borderColor: colors.primary }, isSharing && styles.buttonDisabled]}
                onPress={handleShareAsImage}
                disabled={isSharing}
              >
                <Ionicons name="share-social-outline" size={20} color={colors.primary} />
                <Text style={[styles.shareButtonText, { color: colors.primary }]}>{isSharing ? 'Preparing...' : 'Share Receipt'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.doneButton, { backgroundColor: colors.primary }]} onPress={onClose}>
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

// ──────────────────────────────────────────────────────────────────────────
// Light mode styles (for shared receipt)
// ──────────────────────────────────────────────────────────────────────────
const lightStyles = StyleSheet.create({
  logoContainer: { alignItems: 'center', marginTop: 20, marginBottom: 16 },
  logo: { width: 120, height: 40 },
  receiptTitle: { fontSize: 18, fontFamily: 'Poppins-SemiBold', color: '#1F54DD', textAlign: 'center', marginBottom: 20 },
  receiptFooter: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#94A3B8', textAlign: 'center', marginTop: 8, marginBottom: 16 },
  tokenSection: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontFamily: 'Poppins-SemiBold', color: '#0F172A', marginBottom: 12 },
  tokenBox: { backgroundColor: '#F0F5FF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#C7D7FA', alignItems: 'center' },
  tokenText: { fontSize: 20, fontFamily: 'Poppins-Bold', color: '#1F54DD', letterSpacing: 2, textAlign: 'center' },
  detailsSection: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 16, marginBottom: 8 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  detailLabel: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#64748B' },
  detailValue: { fontSize: 14, fontFamily: 'Poppins-Medium', color: '#0F172A', flexShrink: 1, textAlign: 'right', marginLeft: 8 },
  amountValue: { fontSize: 16, fontFamily: 'Poppins-Bold', color: '#10B981' },
});

// ──────────────────────────────────────────────────────────────────────────
// Theme‑aware styles (for on‑screen modal)
// ──────────────────────────────────────────────────────────────────────────
const makeStyles = (colors: any) => StyleSheet.create({
  offScreenReceipt: { position: 'absolute', top: -9999, left: 0, width: 390, backgroundColor: 'transparent' },
  offScreenCard: { borderRadius: 24, padding: 24, overflow: 'hidden' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '92%', overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, borderBottomWidth: 1 },
  modalTitle: { fontSize: 18, fontFamily: 'Poppins-SemiBold' },
  closeButton: { padding: 4 },
  scrollContent: { paddingHorizontal: 20 },
  scrollContentContainer: { paddingBottom: 8 },
  logoContainer: { alignItems: 'center', marginTop: 20, marginBottom: 16 },
  logo: { width: 120, height: 40 },
  receiptTitle: { fontSize: 18, fontFamily: 'Poppins-SemiBold', textAlign: 'center', marginBottom: 20 },
  receiptFooter: { fontSize: 12, fontFamily: 'Poppins-Regular', textAlign: 'center', marginTop: 8, marginBottom: 16 },
  tokenSection: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontFamily: 'Poppins-SemiBold', marginBottom: 12 },
  tokenBox: { borderRadius: 12, padding: 16, borderWidth: 1, alignItems: 'center' },
  tokenText: { fontSize: 20, fontFamily: 'Poppins-Bold', letterSpacing: 2, textAlign: 'center' },
  copyButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 10, paddingVertical: 12, marginTop: 4, marginBottom: 8, gap: 6, borderWidth: 1 },
  copyButtonText: { fontSize: 14, fontFamily: 'Poppins-Medium' },
  detailsSection: { borderRadius: 12, padding: 16, marginBottom: 8 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  detailLabel: { fontSize: 14, fontFamily: 'Poppins-Regular' },
  detailValue: { fontSize: 14, fontFamily: 'Poppins-Medium', flexShrink: 1, textAlign: 'right', marginLeft: 8 },
  amountValue: { fontSize: 16, fontFamily: 'Poppins-Bold', color: '#10B981' },
  actionSection: { paddingHorizontal: 20, paddingBottom: 32, paddingTop: 16, borderTopWidth: 1, gap: 10 },
  shareButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 12, height: 52, gap: 8, borderWidth: 1 },
  shareButtonText: { fontSize: 16, fontFamily: 'Poppins-SemiBold' },
  buttonDisabled: { opacity: 0.5 },
  doneButton: { borderRadius: 12, height: 56, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  doneButtonText: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Poppins-SemiBold' },
});