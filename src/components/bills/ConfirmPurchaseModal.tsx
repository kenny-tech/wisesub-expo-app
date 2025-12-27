import { formatAmount } from '@/src/helper/util';
import { Ionicons } from '@expo/vector-icons';
import React, { ReactNode } from 'react';
import {
    ActivityIndicator,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

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
  providerLogo?: any; // Can be require(local) or {uri: remote}
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
  visible,
  onClose,
  onConfirm,
  title = 'Confirm Purchase',
  providerLogo,
  providerName,
  details,
  amount,
  commission = 0,
  loading = false,
  confirmButtonText = 'Confirm Purchase',
  cancelButtonText = 'Cancel',
  showTotal = true,
  infoNote = 'Transaction will be processed immediately after confirmation',
}) => {
  const renderDetailItem = (detail: PurchaseDetail, index: number) => {
    return (
      <View key={index} style={styles.detailRow}>
        <View style={styles.detailLabelContainer}>
          {detail.icon && (
            <Ionicons 
              name={detail.icon as any} 
              size={20} 
              color={detail.iconColor || '#64748B'} 
            />
          )}
          <Text style={styles.detailLabel}>{detail.label}</Text>
        </View>
        
        {detail.customComponent ? (
          detail.customComponent
        ) : (
          <Text 
            style={[
              styles.detailValue,
              detail.valueColor && { color: detail.valueColor }
            ]}
            numberOfLines={detail.label === 'Data Plan' ? 2 : 1}
          >
            {detail.value}
          </Text>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPressOut={onClose}
      >
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Provider Info (if provided) */}
          {(providerLogo || providerName) && (
            <View style={styles.providerSection}>
              {providerLogo && (
                <Image 
                  source={providerLogo} 
                  style={styles.providerLogo}
                  resizeMode="contain"
                />
              )}
              {providerName && (
                <Text style={styles.providerName}>{providerName}</Text>
              )}
            </View>
          )}

          {/* Transaction Details */}
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsTitle}>Transaction Details</Text>
            
            {details.map((detail, index) => renderDetailItem(detail, index))}

            {/* Divider */}
            <View style={styles.divider} />

            {/* Amount */}
            <View style={styles.amountDetailRow}>
              <Text style={styles.amountLabel}>Amount</Text>
              <Text style={styles.amountValue}>
                ₦{formatAmount(amount)}
              </Text>
            </View>

            {/* Commission */}
            {commission > 0 && (
              <View style={styles.commissionDetailRow}>
                <Text style={styles.commissionLabel}>You Earn</Text>
                <Text style={styles.commissionValue}>
                  ₦{formatAmount(commission)}
                </Text>
              </View>
            )}

            {/* Total */}
            {showTotal && (
              <View style={styles.totalDetailRow}>
                <Text style={styles.totalLabel}>Total Cost</Text>
                <Text style={styles.totalValue}>
                  ₦{formatAmount(amount)}
                </Text>
              </View>
            )}
          </View>

          {/* Modal Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>{cancelButtonText}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.confirmButton,
                loading && styles.confirmButtonDisabled
              ]}
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

          {/* Info Note */}
          <View style={styles.modalInfoNote}>
            <Ionicons name="information-circle-outline" size={16} color="#64748B" />
            <Text style={styles.modalInfoText}>
              {infoNote}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F172A',
  },
  closeButton: {
    padding: 4,
  },
  providerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  providerLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  providerName: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F172A',
  },
  detailsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  detailsTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F172A',
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  detailValue: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#0F172A',
    textAlign: 'right',
    maxWidth: '70%',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 16,
  },
  amountDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  amountLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#64748B',
  },
  amountValue: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F172A',
  },
  commissionDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  commissionLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#10B981',
  },
  commissionValue: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#10B981',
  },
  totalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F172A',
  },
  totalValue: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#10B981',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#64748B',
  },
  confirmButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#10B981',
  },
  confirmButtonDisabled: {
    backgroundColor: '#94A3B8',
    opacity: 0.6,
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
  },
  modalInfoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 8,
  },
  modalInfoText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
    textAlign: 'center',
    flex: 1,
  },
});