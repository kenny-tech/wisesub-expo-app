import { formatAmount } from '@/src/helper/util';
import { useTheme } from '@/src/theme/ThemeContext';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ViewShot from 'react-native-view-shot';

interface WAECReceiptProps {
  visible: boolean;
  onClose: () => void;
  cards?: Array<{ Serial: string; Pin: string }>;
  tokens?: string[];
  purchasedCode?: string;
  amount: number;
  customer: string;
  serviceType: 'waec' | 'waec-registration';
  productName: string;
}

export default function WAECReceipt({
  visible,
  onClose,
  cards,
  tokens,
  purchasedCode,
  amount,
  customer,
  serviceType,
  productName,
}: WAECReceiptProps) {
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors);
  const [isSharing, setIsSharing] = useState(false);
  const receiptRef = useRef<ViewShot>(null);
  const insets = useSafeAreaInsets();

  const copyAll = async () => {
    let text = '';
    if (tokens && tokens.length > 0) {
      text = tokens.map((t, i) => `Token ${i + 1}: ${t}`).join('\n');
    } else if (cards && cards.length > 0) {
      text = cards.map((c, i) => `Card ${i + 1}: Serial: ${c.Serial}, Pin: ${c.Pin}`).join('\n');
    } else {
      text = purchasedCode || '';
    }
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', 'All details copied to clipboard.');
  };

  const copySingle = async (text: string, label: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', `${label} copied to clipboard.`);
  };

  const shareImage = async () => {
    if (!receiptRef.current?.capture) return;
    setIsSharing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 150));
      const uri = await receiptRef.current.capture();
      if (!uri) throw new Error('Capture failed');
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert('Not Supported', 'Sharing is not available on this device.');
        return;
      }
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Share Receipt',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share receipt.');
    } finally {
      setIsSharing(false);
    }
  };

  const renderCredentials = () => {
    if (serviceType === 'waec-registration' && tokens && tokens.length > 0) {
      return (
        <View style={styles.credentialSection}>
          <Text style={[styles.credentialLabel, { color: colors.textPrimary }]}>Registration PIN(s)</Text>
          {tokens.map((token, idx) => (
            <View key={idx} style={[styles.credentialItem, styles.credentialItemRow, { backgroundColor: colors.backgroundSecondary }]}>
              <Text style={[styles.credentialText, { color: colors.textPrimary, flex: 1 }]}>{token}</Text>
              <TouchableOpacity
                style={styles.itemCopyButton}
                onPress={() => copySingle(token, `Token ${idx + 1}`)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="copy-outline" size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      );
    }
    if (serviceType === 'waec' && cards && cards.length > 0) {
      return (
        <View style={styles.credentialSection}>
          <Text style={[styles.credentialLabel, { color: colors.textPrimary }]}>Result Checker Cards</Text>
          {cards.map((card, idx) => (
            <View key={idx} style={[styles.cardItem, { backgroundColor: colors.backgroundSecondary, borderColor: colors.divider }]}>
              <View style={styles.cardItemHeader}>
                <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Card {idx + 1}</Text>
                <TouchableOpacity
                  style={styles.itemCopyButton}
                  onPress={() => copySingle(`Serial: ${card.Serial}, Pin: ${card.Pin}`, `Card ${idx + 1}`)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="copy-outline" size={18} color={colors.primary} />
                </TouchableOpacity>
              </View>
              <View style={styles.cardRow}>
                <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Serial:</Text>
                <Text style={[styles.cardValue, { color: colors.textPrimary }]}>{card.Serial}</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>PIN:</Text>
                <Text style={[styles.cardValue, { color: colors.textPrimary }]}>{card.Pin}</Text>
              </View>
            </View>
          ))}
        </View>
      );
    }
    return (
      <View style={styles.credentialSection}>
        <Text style={[styles.credentialLabel, { color: colors.textPrimary }]}>Purchase Details</Text>
        <View style={[styles.fallbackContainer, { backgroundColor: colors.backgroundSecondary }]}>
          <Text style={[styles.fallbackText, { color: colors.textPrimary }]}>{purchasedCode}</Text>
        </View>
      </View>
    );
  };

  const themeLogo = isDark
    ? require('../../../assets/images/logo_white.png')
    : require('../../../assets/images/logo_black.png');

  // Off-screen receipt for sharing (light mode)
  const LightReceiptContent = () => (
    <>
      <View style={lightStyles.logoContainer}>
        <Image source={require('../../../assets/images/logo_black.png')} style={lightStyles.logo} resizeMode="contain" />
      </View>
      <Text style={lightStyles.receiptTitle}>{productName}</Text>
      <View style={lightStyles.detailsSection}>
        <View style={lightStyles.detailRow}>
          <Text style={lightStyles.detailLabel}>Customer:</Text>
          <Text style={lightStyles.detailValue}>{customer}</Text>
        </View>
        <View style={lightStyles.detailRow}>
          <Text style={lightStyles.detailLabel}>Amount:</Text>
          <Text style={[lightStyles.detailValue, lightStyles.amountValue]}>₦{formatAmount(amount)}</Text>
        </View>
        <View style={lightStyles.detailRow}>
          <Text style={lightStyles.detailLabel}>Date:</Text>
          <Text style={lightStyles.detailValue}>{new Date().toLocaleString()}</Text>
        </View>
      </View>
      {renderCredentialsLight()}
      <Text style={lightStyles.footer}>Thank you for using WiseSub</Text>
    </>
  );

  const renderCredentialsLight = () => {
    if (serviceType === 'waec-registration' && tokens && tokens.length > 0) {
      return tokens.map((t, i) => (
        <View key={i} style={lightStyles.tokenBox}>
          <Text style={lightStyles.tokenText}>Token {i + 1}: {t}</Text>
        </View>
      ));
    }
    if (serviceType === 'waec' && cards && cards.length > 0) {
      return cards.map((c, i) => (
        <View key={i} style={lightStyles.cardBox}>
          <Text style={lightStyles.cardText}>Card {i + 1}</Text>
          <Text style={lightStyles.cardText}>Serial: {c.Serial}</Text>
          <Text style={lightStyles.cardText}>PIN: {c.Pin}</Text>
        </View>
      ));
    }
    return (
      <View style={lightStyles.fallbackBox}>
        <Text style={lightStyles.fallbackText}>{purchasedCode}</Text>
      </View>
    );
  };

  return (
    <>
      {/* Off-screen receipt */}
      <ViewShot ref={receiptRef} options={{ format: 'png', quality: 1, result: 'tmpfile' }} style={styles.offScreenReceipt}>
        <View style={[styles.offScreenCard, { backgroundColor: '#FFFFFF' }]}>
          <LightReceiptContent />
        </View>
      </ViewShot>

      <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
            {/* Fixed header */}
            <View style={[styles.modalHeader, { borderBottomColor: colors.separator }]}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>{productName}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Scrollable content */}
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.logoContainer}>
                <Image source={themeLogo} style={styles.logo} resizeMode="contain" />
              </View>
              <Text style={[styles.receiptTitle, { color: colors.primary }]}>Receipt</Text>
              <View style={[styles.detailsContainer, { backgroundColor: colors.backgroundSecondary }]}>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Customer:</Text>
                  <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{customer}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Amount:</Text>
                  <Text style={[styles.detailValue, styles.amountValue]}>₦{formatAmount(amount)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Date:</Text>
                  <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{new Date().toLocaleString()}</Text>
                </View>
              </View>
              {renderCredentials()}
              <View style={styles.actionRow}>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]} onPress={copyAll}>
                  <Ionicons name="copy-outline" size={20} color={colors.primary} />
                  <Text style={[styles.actionButtonText, { color: colors.primary }]}>Copy All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}
                  onPress={shareImage}
                  disabled={isSharing}
                >
                  <Ionicons name="share-social-outline" size={20} color={colors.primary} />
                  <Text style={[styles.actionButtonText, { color: colors.primary }]}>{isSharing ? '...' : 'Share'}</Text>
                </TouchableOpacity>
              </View>
              {/* Extra bottom space so content doesn't hide behind footer */}
              <View style={{ height: 20 }} />
            </ScrollView>

            {/* Fixed footer with Done button — padding accounts for safe area (home indicator / nav bar) */}
            <View
              style={[
                styles.footerButtonContainer,
                { borderTopColor: colors.separator, paddingBottom: Math.max(insets.bottom, 16) + 16 },
              ]}
            >
              <TouchableOpacity style={[styles.doneButton, { backgroundColor: colors.primary }]} onPress={onClose}>
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

// Light styles (for sharing)
const lightStyles = StyleSheet.create({
  logoContainer: { alignItems: 'center', marginTop: 20, marginBottom: 16 },
  logo: { width: 120, height: 40 },
  receiptTitle: { fontSize: 18, fontFamily: 'Poppins-SemiBold', color: '#1F54DD', textAlign: 'center', marginBottom: 20 },
  detailsSection: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 16, marginBottom: 16 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  detailLabel: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#64748B' },
  detailValue: { fontSize: 14, fontFamily: 'Poppins-Medium', color: '#0F172A' },
  amountValue: { color: '#10B981', fontWeight: 'bold' },
  tokenBox: { backgroundColor: '#F0F5FF', borderRadius: 8, padding: 12, marginBottom: 8 },
  tokenText: { fontSize: 16, fontFamily: 'Poppins-Medium', color: '#1F54DD' },
  cardBox: { backgroundColor: '#F0F5FF', borderRadius: 8, padding: 12, marginBottom: 8 },
  cardText: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#0F172A' },
  fallbackBox: { backgroundColor: '#F8FAFC', borderRadius: 8, padding: 12, marginBottom: 8 },
  fallbackText: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#0F172A' },
  footer: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#94A3B8', textAlign: 'center', marginTop: 16 },
});

// Theme styles
const makeStyles = (colors: any) =>
  StyleSheet.create({
    offScreenReceipt: { position: 'absolute', top: -9999, left: 0, width: 390, backgroundColor: 'transparent' },
    offScreenCard: { borderRadius: 24, padding: 24, overflow: 'hidden' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContainer: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: '92%',
      flex: 1, // make it fill available space
      overflow: 'hidden',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      flexShrink: 0,
    },
    modalTitle: { fontSize: 18, fontFamily: 'Poppins-SemiBold' },
    closeButton: { padding: 4 },
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },
    logoContainer: { alignItems: 'center', marginVertical: 16 },
    logo: { width: 120, height: 40 },
    receiptTitle: { fontSize: 18, fontFamily: 'Poppins-SemiBold', textAlign: 'center', marginBottom: 16 },
    detailsContainer: { borderRadius: 12, padding: 16, marginBottom: 16 },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    detailLabel: { fontSize: 14, fontFamily: 'Poppins-Regular' },
    detailValue: { fontSize: 14, fontFamily: 'Poppins-Medium' },
    amountValue: { color: '#10B981', fontWeight: 'bold' },
    credentialSection: { marginBottom: 16 },
    credentialLabel: { fontSize: 16, fontFamily: 'Poppins-SemiBold', marginBottom: 8 },
    credentialItem: { borderRadius: 8, padding: 12, marginBottom: 8 },
    credentialItemRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    credentialText: { fontSize: 16, fontFamily: 'Poppins-Medium' },
    itemCopyButton: { padding: 4 },
    cardItem: { borderRadius: 8, padding: 12, marginBottom: 8, borderWidth: 1 },
    cardItemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    cardLabel: { fontSize: 14, fontFamily: 'Poppins-Regular' },
    cardValue: { fontSize: 14, fontFamily: 'Poppins-Medium' },
    fallbackContainer: { borderRadius: 8, padding: 12 },
    fallbackText: { fontSize: 14, fontFamily: 'Poppins-Regular', textAlign: 'center' },
    actionRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 12 },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 10,
      borderWidth: 1,
      gap: 8,
    },
    actionButtonText: { fontSize: 14, fontFamily: 'Poppins-Medium' },
    footerButtonContainer: {
      paddingHorizontal: 20,
      paddingTop: 16,
      borderTopWidth: 1,
      flexShrink: 0,
    },
    doneButton: { borderRadius: 12, height: 56, justifyContent: 'center', alignItems: 'center' },
    doneButtonText: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Poppins-SemiBold' },
  });