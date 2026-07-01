import { formatAmount } from '@/src/helper/util';
import { Ionicons } from '@expo/vector-icons';
import React, { ReactNode, useRef, useState } from 'react';
import {
  ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity, View
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export interface PurchaseDetail {
  label: string;
  value: string;
  icon?: string;
  iconColor?: string;
  valueColor?: string;
  customComponent?: ReactNode;
}

export interface ConfirmPurchaseParams {
  onConfirm: (pin: string) => Promise<{ success: boolean; message?: string } | void>;
  title?: string;
  providerLogo?: any;
  providerName?: string;
  details: PurchaseDetail[];
  amount: number;
  commission?: number;
  confirmButtonText?: string;
  cancelButtonText?: string;
  showTotal?: boolean;
  infoNote?: string;
}

const PIN_LENGTH = 4;

export default function ConfirmPurchase({ navigation, route }: { navigation: any; route: any }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const {
    onConfirm,
    title = 'Confirm Purchase',
    providerLogo,
    providerName,
    details,
    amount,
    confirmButtonText = 'Confirm Purchase',
    cancelButtonText = 'Cancel',
    showTotal = true,
    infoNote = 'Transaction will be processed immediately after confirmation',
  } = (route?.params || {}) as ConfirmPurchaseParams;

  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [showPin, setShowPin] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handlePinChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, PIN_LENGTH);
    setPin(cleaned);
    // Clear any existing pin error as soon as the PIN field is edited or cleared
    if (pinError) setPinError(null);
  };

  const handleClose = () => {
    if (loading) return;
    navigation.goBack();
  };

  const handleConfirm = async () => {
    if (pin.length !== PIN_LENGTH) {
      setPinError('Please enter your 4-digit PIN.');
      return;
    }
    setLoading(true);
    try {
      const result = await onConfirm?.(pin);
      if (result && result.success === false) {
        const message = result.message || 'Transaction failed. Please try again.';
        if (/pin/i.test(message)) {
          setPinError(message);
        }
        // Non-PIN errors are expected to be surfaced by the caller (toast) already.
      }
      // On success the caller is expected to navigate away (e.g. navigation.navigate('Tabs')).
    } finally {
      setLoading(false);
    }
  };

  const renderDetailItem = (detail: PurchaseDetail, index: number) => (
    <View key={index} style={styles.detailRow}>
      <View style={styles.detailLabelContainer}>
        {detail.icon && <Ionicons name={detail.icon as any} size={20} color={detail.iconColor || colors.textSecondary} />}
        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>{detail.label}</Text>
      </View>
      {detail.customComponent ? detail.customComponent : (
        <Text
          style={[styles.detailValue, { color: colors.textPrimary }, detail.valueColor ? { color: detail.valueColor } : {}]}
          numberOfLines={detail.label === 'Data Plan' ? 2 : 1}
        >
          {detail.value}
        </Text>
      )}
    </View>
  );

  const digits = Array.from({ length: PIN_LENGTH }, (_, i) => pin[i] ?? '');

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.separator }]}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton} disabled={loading}>
          <Ionicons name="close" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{title}</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {(providerLogo || providerName) && (
            <View style={[styles.providerSection, { borderBottomColor: colors.separator }]}>
              {providerLogo && <Image source={providerLogo} style={styles.providerLogo} resizeMode="contain" />}
              {providerName && <Text style={[styles.providerName, { color: colors.textPrimary }]}>{providerName}</Text>}
            </View>
          )}

          <View style={styles.detailsContainer}>
            <Text style={[styles.detailsTitle, { color: colors.textPrimary }]}>Transaction Details</Text>
            {(details || []).map((detail, index) => renderDetailItem(detail, index))}

            <View style={[styles.divider, { backgroundColor: colors.separator }]} />

            <View style={styles.amountDetailRow}>
              <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>Amount</Text>
              <Text style={[styles.amountValue, { color: colors.textPrimary }]}>₦{formatAmount(amount)}</Text>
            </View>

            {showTotal && (
              <View style={[styles.totalDetailRow, { borderTopColor: colors.separator }]}>
                <Text style={[styles.totalLabel, { color: colors.textPrimary }]}>Total Cost</Text>
                <Text style={styles.totalValue}>₦{formatAmount(amount)}</Text>
              </View>
            )}
          </View>

          <View style={styles.pinSection}>
            <View style={styles.pinLabelRow}>
              <Text style={[styles.pinLabel, { color: colors.textSecondary }]}>Transaction PIN</Text>
              <TouchableOpacity
                onPress={() => setShowPin(!showPin)}
                style={styles.pinToggle}
                hitSlop={8}
                disabled={loading}
              >
                <Ionicons name={showPin ? 'eye-off-outline' : 'eye-outline'} size={16} color={colors.textSecondary} />
                <Text style={[styles.pinToggleText, { color: colors.textSecondary }]}>
                  {showPin ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.pinBoxesWrapper}>
              <Pressable onPress={() => !loading && inputRef.current?.focus()} style={styles.pinBoxesRow}>
                {digits.map((digit, i) => {
                  const isActiveCell = isFocused && i === pin.length;
                  const filled = digit !== '';
                  return (
                    <View
                      key={i}
                      style={[
                        styles.pinBox,
                        {
                          backgroundColor: colors.backgroundSecondary,
                          borderColor: pinError
                            ? colors.error
                            : isActiveCell
                              ? colors.primary
                              : colors.divider,
                          borderWidth: isActiveCell ? 2 : 1,
                          opacity: loading ? 0.6 : 1,
                        },
                      ]}
                    >
                      {filled ? (
                        showPin ? (
                          <Text style={[styles.pinDigitText, { color: colors.textPrimary }]}>
                            {digit}
                          </Text>
                        ) : (
                          <View
                            style={[
                              styles.pinDot,
                              { backgroundColor: colors.textPrimary || '#1A1A1A' },
                            ]}
                          />
                        )
                      ) : null}
                    </View>
                  );
                })}
              </Pressable>

              {/* Hidden input drives actual text entry/keyboard.
                  Scoped to just this wrapper (not the whole pinSection) so it
                  doesn't sit on top of the Show/Hide toggle above and silently
                  swallow taps meant for it. */}
              <TextInput
                ref={inputRef}
                value={pin}
                onChangeText={handlePinChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                keyboardType="number-pad"
                maxLength={PIN_LENGTH}
                autoFocus
                editable={!loading}
                style={styles.hiddenInput}
                caretHidden
              />
            </View>

            {pinError ? (
              <View style={styles.pinErrorRow}>
                <Ionicons name="alert-circle" size={14} color={colors.error} />
                <Text style={[styles.pinErrorText, { color: colors.error }]}>{pinError}</Text>
              </View>
            ) : null}

            {/* Forgot PIN link */}
            <TouchableOpacity
              onPress={() => navigation.navigate('ChangePin')}
              disabled={loading}
              style={styles.forgotPinContainer}
            >
              <Text style={[styles.forgotPinText, { color: colors.primary }]}>
                Forgot PIN?
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.divider, backgroundColor: colors.backgroundSecondary }]}
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>{cancelButtonText}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmButton, loading && styles.confirmButtonDisabled]}
              onPress={handleConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.confirmButtonText}>{confirmButtonText}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.infoNoteRow}>
            <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
            <Text style={[styles.infoNoteText, { color: colors.textMuted }]}>{infoNote}</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, borderBottomWidth: 1,
  },
  closeButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontFamily: 'Poppins-SemiBold' },
  placeholder: { width: 32 },

  scrollContent: { paddingBottom: 40 },

  providerSection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 20, borderBottomWidth: 1, gap: 12 },
  providerLogo: { width: 32, height: 32, borderRadius: 16 },
  providerName: { fontSize: 16, fontFamily: 'Poppins-SemiBold' },

  detailsContainer: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  detailsTitle: { fontSize: 16, fontFamily: 'Poppins-SemiBold', marginBottom: 20 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  detailLabelContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  detailLabel: { fontSize: 14, fontFamily: 'Poppins-Medium', marginLeft: 8 },
  detailValue: { fontSize: 14, fontFamily: 'Poppins-Medium', textAlign: 'right', maxWidth: '70%' },
  divider: { height: 1, marginVertical: 16 },
  amountDetailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  amountLabel: { fontSize: 14, fontFamily: 'Poppins-Medium' },
  amountValue: { fontSize: 16, fontFamily: 'Poppins-SemiBold' },
  totalDetailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 12, borderTopWidth: 1 },
  totalLabel: { fontSize: 16, fontFamily: 'Poppins-SemiBold' },
  totalValue: { fontSize: 20, fontFamily: 'Poppins-Bold', color: '#10B981' },

  pinSection: { paddingHorizontal: 20, marginTop: 12, marginBottom: 8 },
  pinLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  pinLabel: { fontSize: 14, fontFamily: 'Poppins-Medium' },
  pinToggle: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pinToggleText: { fontSize: 12, fontFamily: 'Poppins-Medium' },

  pinBoxesWrapper: { position: 'relative' },
  pinBoxesRow: { flexDirection: 'row', justifyContent: 'center', gap: 14 },
  pinBox: {
    width: 52,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDigitText: { fontSize: 22, fontFamily: 'Poppins-SemiBold' },
  pinDot: { width: 10, height: 10, borderRadius: 5 },

  hiddenInput: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    opacity: 0,
  },

  pinErrorRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10, justifyContent: 'center' },
  pinErrorText: { fontSize: 12, fontFamily: 'Poppins-Regular' },

  forgotPinContainer: { alignItems: 'center', marginTop: 12 },
  forgotPinText: { fontSize: 14, fontFamily: 'Poppins-Medium' },

  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 24, gap: 12 },
  cancelButton: { flex: 1, paddingVertical: 16, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  cancelButtonText: { fontSize: 16, fontFamily: 'Poppins-Medium' },
  confirmButton: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 12, backgroundColor: '#10B981' },
  confirmButtonDisabled: { backgroundColor: '#94A3B8', opacity: 0.6 },
  confirmButtonText: { fontSize: 16, fontFamily: 'Poppins-SemiBold', color: '#FFFFFF' },

  infoNoteRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingTop: 20, gap: 8 },
  infoNoteText: { fontSize: 12, fontFamily: 'Poppins-Regular', textAlign: 'center', flex: 1 },
});