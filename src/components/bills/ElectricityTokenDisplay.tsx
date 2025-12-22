import { formatAmount } from '@/src/helper/util';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import React from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

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
  const handleCopyToken = async () => {
    try {
      await Clipboard.setStringAsync(token);

      Alert.alert(
        'Token Copied',
        'Electricity token has been copied to clipboard',
        [{ text: 'OK', style: 'default' }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to copy token. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  const formatProviderName = (providerCode: string) => {
    const providerMap: Record<string, string> = {
      'ikedc': 'Ikeja Electric',
      'ekedc': 'Eko Electric',
      'kedco': 'Kano Electric',
      'phedc': 'Port Harcourt Electric',
      'ibedc': 'Ibadan Electric',
      'aedc': 'Abuja Electric',
    };
    return providerMap[providerCode] || providerCode;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Electricity Token</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Success Icon */}
            <View style={styles.successIconContainer}>
              <View style={styles.successIcon}>
                <Ionicons name="flash" size={48} color="#10B981" />
              </View>
              <Text style={styles.successTitle}>Token Generated Successfully!</Text>
              <Text style={styles.successSubtitle}>
                Your electricity token has been generated
              </Text>
            </View>

            {/* Token Display */}
            <View style={styles.tokenSection}>
              <Text style={styles.sectionTitle}>Token Number</Text>
              <View style={styles.tokenContainer}>
                <Text style={styles.tokenText}>{token}</Text>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={handleCopyToken}
                >
                  <Ionicons name="copy-outline" size={20} color="#1F54DD" />
                  <Text style={styles.copyButtonText}>Copy</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Token Details */}
            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Transaction Details</Text>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Meter Number:</Text>
                <Text style={styles.detailValue}>{meterNumber}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Customer Name:</Text>
                <Text style={styles.detailValue}>{customerName}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Provider:</Text>
                <Text style={styles.detailValue}>{formatProviderName(provider)}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Units:</Text>
                <Text style={styles.detailValue}>{units} kWh</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Amount Paid:</Text>
                <Text style={styles.amountValue}>₦{formatAmount(amount)}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Phone Number:</Text>
                <Text style={styles.detailValue}>{phoneNumber}</Text>
              </View>
            </View>

            {/* Usage Instructions */}
            {/* <View style={styles.instructionsSection}>
              <Text style={styles.sectionTitle}>How to Use Your Token</Text>
              <View style={styles.instructionItem}>
                <View style={styles.instructionNumber}>
                  <Text style={styles.instructionNumberText}>1</Text>
                </View>
                <Text style={styles.instructionText}>
                  Enter your meter number on your prepaid meter
                </Text>
              </View>
              <View style={styles.instructionItem}>
                <View style={styles.instructionNumber}>
                  <Text style={styles.instructionNumberText}>2</Text>
                </View>
                <Text style={styles.instructionText}>
                  Select "Enter Token" from the menu options
                </Text>
              </View>
              <View style={styles.instructionItem}>
                <View style={styles.instructionNumber}>
                  <Text style={styles.instructionNumberText}>3</Text>
                </View>
                <Text style={styles.instructionText}>
                  Enter the 20-digit token number provided above
                </Text>
              </View>
              <View style={styles.instructionItem}>
                <View style={styles.instructionNumber}>
                  <Text style={styles.instructionNumberText}>4</Text>
                </View>
                <Text style={styles.instructionText}>
                  Press "Enter" or "OK" to load the units
                </Text>
              </View>
            </View> */}

            {/* Important Notes */}
            {/* <View style={styles.notesSection}>
              <Text style={styles.notesTitle}>
                <Ionicons name="information-circle" size={16} color="#64748B" />
                <Text> Important Notes</Text>
              </Text>
              <Text style={styles.noteText}>
                • Token is valid for immediate use
              </Text>
              <Text style={styles.noteText}>
                • Keep this token safe for your records
              </Text>
              <Text style={styles.noteText}>
                • Token will expire if not used within 30 days
              </Text>
              <Text style={styles.noteText}>
                • Contact your electricity provider for assistance
              </Text>
            </View> */}
          </ScrollView>

          {/* Action Button */}
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={styles.doneButton}
              onPress={onClose}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxHeight: '90%',
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  successIconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#10B981',
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
    textAlign: 'center',
  },
  tokenSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F172A',
    marginBottom: 12,
  },
  tokenContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tokenText: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#1F54DD',
    flex: 1,
    marginRight: 12,
    letterSpacing: 1,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F6FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  copyButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#1F54DD',
    marginLeft: 4,
  },
  detailsSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
  },
  detailValue: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#0F172A',
  },
  amountValue: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#10B981',
  },
  instructionsSection: {
    marginBottom: 24,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1F54DD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  instructionNumberText: {
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
  notesSection: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  notesTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#92400E',
    marginBottom: 12,
  },
  noteText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#92400E',
    marginBottom: 6,
    lineHeight: 16,
  },
  actionSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  doneButton: {
    backgroundColor: '#1F54DD',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
});