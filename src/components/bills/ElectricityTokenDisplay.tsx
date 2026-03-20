import { formatAmount } from '@/src/helper/util';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import ViewShot from 'react-native-view-shot';

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
  const [isSharing, setIsSharing] = useState(false);
  const viewShotRef = useRef<ViewShot>(null);

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

  const handleShareAsImage = async () => {
    if (!viewShotRef.current) return;

    setIsSharing(true);
    try {
      const uri = await viewShotRef.current.capture?.();
      if (!uri) throw new Error('Failed to capture receipt');

      await Share.share({
        url: uri,       // iOS: shares the actual image
        message: `Electricity Token: ${token}\nMeter: ${meterNumber}\nUnits: ${units} kWh\nAmount: ₦${formatAmount(amount)}`,  // Android: text fallback
        title: 'Electricity Token Receipt',
      });
    } catch (error: any) {
      if (error?.message !== 'User did not share') {
        Alert.alert('Error', 'Failed to share receipt. Please try again.');
      }
    } finally {
      setIsSharing(false);
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
            {/* ViewShot wraps only the receipt — this is what gets captured */}
            <ViewShot
              ref={viewShotRef}
              options={{ format: 'png', quality: 1 }}
              style={styles.receiptCapture}
            >
              {/* Logo */}
              <View style={styles.logoContainer}>
                <Image
                  source={require('../../../assets/images/logo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>

              <Text style={styles.receiptTitle}>Electricity Token Receipt</Text>

              {/* Token Display */}
              <View style={styles.tokenSection}>
                <Text style={styles.sectionTitle}>Token Number</Text>
                <View style={styles.tokenContainer}>
                  <Text style={styles.tokenText}>{token}</Text>
                </View>
              </View>

              {/* Transaction Details */}
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

                {/* <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Phone Number:</Text>
                  <Text style={styles.detailValue}>{phoneNumber}</Text>
                </View> */}

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Date & Time:</Text>
                  <Text style={styles.detailValue}>
                    {new Date().toLocaleDateString()}{' '}
                    {new Date().toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              </View>

              <Text style={styles.receiptFooter}>Thank you for using WiseSub</Text>
            </ViewShot>

            {/* Copy button — outside ViewShot so it won't appear in the captured image */}
            <TouchableOpacity
              style={styles.copyButton}
              onPress={handleCopyToken}
            >
              <Ionicons name="copy-outline" size={20} color="#1F54DD" />
              <Text style={styles.copyButtonText}>Copy Token</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={[styles.shareButton, isSharing && styles.buttonDisabled]}
              onPress={handleShareAsImage}
              disabled={isSharing}
            >
              <Ionicons name="share-outline" size={20} color="#1F54DD" />
              <Text style={styles.shareButtonText}>
                {isSharing ? 'Generating...' : 'Share Receipt'}
              </Text>
            </TouchableOpacity>

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
  },
  receiptCapture: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 24,
    paddingHorizontal: 4,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 120,
    height: 40,
  },
  receiptTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#1F54DD',
    textAlign: 'center',
    marginBottom: 20,
  },
  receiptFooter: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 16,
  },
  tokenSection: {
    marginBottom: 20,
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
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tokenText: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#1F54DD',
    letterSpacing: 1,
    textAlign: 'center',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F6FF',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 12,
    marginBottom: 8,
    gap: 6,
  },
  copyButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#1F54DD',
  },
  detailsSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
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
  actionSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 10,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F6FF',
    borderRadius: 12,
    height: 52,
    gap: 8,
    borderWidth: 1,
    borderColor: '#1F54DD',
  },
  shareButtonText: {
    color: '#1F54DD',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  buttonDisabled: {
    opacity: 0.5,
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