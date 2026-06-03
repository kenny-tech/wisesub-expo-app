import { formatAmount } from '@/src/helper/util';
import { Ionicons } from '@expo/vector-icons';
import React, { ReactNode } from 'react';
import {
  ActivityIndicator, Image, Modal, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

export interface PurchaseDetail {
  label: string;
  value: string;
  icon?: string;
  iconColor?: string;
  valueColor?: string;
  customComponent?: ReactNode;
}

export interface ConfirmPurchaseModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  providerLogo?: any;
  providerName?: string;
  details: PurchaseDetail[];
  amount: number;
  commission?: number;
  loading?: boolean;
  confirmButtonText?: string;
  cancelButtonText?: string;
  showTotal?: boolean;
  infoNote?: string;
}

export const ConfirmPurchaseModal: React.FC<ConfirmPurchaseModalProps> = ({
  visible, onClose, onConfirm,
  title = 'Confirm Purchase',
  providerLogo, providerName, details, amount,
  commission = 0, loading = false,
  confirmButtonText = 'Confirm Purchase',
  cancelButtonText = 'Cancel',
  showTotal = true,
  infoNote = 'Transaction will be processed immediately after confirmation',
}) => {
  const { colors } = useTheme();

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

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={onClose}>
        <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.separator }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {(providerLogo || providerName) && (
            <View style={[styles.providerSection, { borderBottomColor: colors.separator }]}>
              {providerLogo && <Image source={providerLogo} style={styles.providerLogo} resizeMode="contain" />}
              {providerName && <Text style={[styles.providerName, { color: colors.textPrimary }]}>{providerName}</Text>}
            </View>
          )}

          <View style={styles.detailsContainer}>
            <Text style={[styles.detailsTitle, { color: colors.textPrimary }]}>Transaction Details</Text>
            {details.map((detail, index) => renderDetailItem(detail, index))}

            <View style={[styles.divider, { backgroundColor: colors.separator }]} />

            <View style={styles.amountDetailRow}>
              <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>Amount</Text>
              <Text style={[styles.amountValue, { color: colors.textPrimary }]}>₦{formatAmount(amount)}</Text>
            </View>

            {/* {commission > 0 && (
              <View style={styles.commissionDetailRow}>
                <Text style={styles.commissionLabel}>You Earn</Text>
                <Text style={styles.commissionValue}>₦{formatAmount(commission)}</Text>
              </View>
            )} */}

            {showTotal && (
              <View style={[styles.totalDetailRow, { borderTopColor: colors.separator }]}>
                <Text style={[styles.totalLabel, { color: colors.textPrimary }]}>Total Cost</Text>
                <Text style={styles.totalValue}>₦{formatAmount(amount)}</Text>
              </View>
            )}
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.divider, backgroundColor: colors.backgroundSecondary }]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>{cancelButtonText}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmButton, loading && styles.confirmButtonDisabled]}
              onPress={onConfirm}
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

          <View style={styles.modalInfoNote}>
            <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
            <Text style={[styles.modalInfoText, { color: colors.textMuted }]}>{infoNote}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay:          { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer:        { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%', paddingBottom: 20 },
  modalHeader:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, borderBottomWidth: 1 },
  modalTitle:            { fontSize: 18, fontFamily: 'Poppins-SemiBold' },
  closeButton:           { padding: 4 },
  providerSection:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderBottomWidth: 1, gap: 12 },
  providerLogo:          { width: 32, height: 32, borderRadius: 16 },
  providerName:          { fontSize: 16, fontFamily: 'Poppins-SemiBold' },
  detailsContainer:      { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  detailsTitle:          { fontSize: 16, fontFamily: 'Poppins-SemiBold', marginBottom: 20 },
  detailRow:             { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  detailLabelContainer:  { flexDirection: 'row', alignItems: 'center', flex: 1 },
  detailLabel:           { fontSize: 14, fontFamily: 'Poppins-Medium', marginLeft: 8 },
  detailValue:           { fontSize: 14, fontFamily: 'Poppins-Medium', textAlign: 'right', maxWidth: '70%' },
  divider:               { height: 1, marginVertical: 16 },
  amountDetailRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  amountLabel:           { fontSize: 14, fontFamily: 'Poppins-Medium' },
  amountValue:           { fontSize: 16, fontFamily: 'Poppins-SemiBold' },
  commissionDetailRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, backgroundColor: '#ECFDF5', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  commissionLabel:       { fontSize: 14, fontFamily: 'Poppins-Medium', color: '#10B981' },
  commissionValue:       { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#10B981' },
  totalDetailRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 12, borderTopWidth: 1 },
  totalLabel:            { fontSize: 16, fontFamily: 'Poppins-SemiBold' },
  totalValue:            { fontSize: 20, fontFamily: 'Poppins-Bold', color: '#10B981' },
  modalFooter:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, gap: 12 },
  cancelButton:          { flex: 1, paddingVertical: 16, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  cancelButtonText:      { fontSize: 16, fontFamily: 'Poppins-Medium' },
  confirmButton:         { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 12, backgroundColor: '#10B981' },
  confirmButtonDisabled: { backgroundColor: '#94A3B8', opacity: 0.6 },
  confirmButtonText:     { fontSize: 16, fontFamily: 'Poppins-SemiBold', color: '#FFFFFF' },
  modalInfoNote:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingTop: 16, marginBottom: 30, gap: 8 },
  modalInfoText:         { fontSize: 12, fontFamily: 'Poppins-Regular', textAlign: 'center', flex: 1 },
});