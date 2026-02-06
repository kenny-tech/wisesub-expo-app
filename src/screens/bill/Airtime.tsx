import { ConfirmPurchaseModal, PurchaseDetail } from '@/src/components/bills/ConfirmPurchaseModal';
import { formatAmount } from '@/src/helper/util';
import { IMAGE_BASE_URL } from '@/src/services/api';
import { billService } from '@/src/services/billService';
import { CommissionConfig, commissionService } from '@/src/services/commissionService';
import { RecentCustomer, walletService } from '@/src/services/walletService'; // Import the service
import { showError, showSuccess } from '@/src/utils/toast';
import { AirtimeValidators } from '@/src/utils/validators/airtimeValidators';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// Define networks with URL paths
const NETWORKS = [
  {
    id: 'mtn',
    name: 'MTN',
    logo: `${IMAGE_BASE_URL}/mtn.png`,
    logoLocal: require('../../../assets/images/mtn.png')
  },
  {
    id: 'airtel',
    name: 'Airtel',
    logo: `${IMAGE_BASE_URL}/airtel.png`,
    logoLocal: require('../../../assets/images/airtel.png')
  },
  {
    id: 'glo',
    name: 'Glo',
    logo: `${IMAGE_BASE_URL}/glo.png`,
    logoLocal: require('../../../assets/images/glo.png')
  },
  {
    id: '9mobile',
    name: '9mobile',
    logo: `${IMAGE_BASE_URL}/ninemobile.png`,
    logoLocal: require('../../../assets/images/ninemobile.png')
  },
];

// Map network array to match the service structure
const NETWORK_OPTIONS = NETWORKS.map(network => ({
  value: network.id,
  name: network.name,
  serviceID: network.id === 'mtn' ? 'mtn' :
    network.id === 'airtel' ? 'airtel' :
      network.id === 'glo' ? 'glo' : 'etisalat',
  logo: network.logo,
  logoLocal: network.logoLocal,
}));

// Predefined airtime amounts
const AIRTIME_AMOUNTS = ['100', '200', '500', '1000', '2000', '5000'];

// Recent Customers Modal Component
function RecentCustomersModal({
  visible,
  onClose,
  customers,
  loading,
  onSelectCustomer
}: {
  visible: boolean;
  onClose: () => void;
  customers: RecentCustomer[];
  loading: boolean;
  onSelectCustomer: (customer: string) => void;
}) {
  const renderCustomer = ({ item }: { item: RecentCustomer }) => (
    <TouchableOpacity
      style={modalStyles.customerItem}
      onPress={() => onSelectCustomer(item.customer)}
    >
      <View style={modalStyles.customerIcon}>
        <Ionicons name="person-circle-outline" size={24} color="#1F54DD" />
      </View>
      <View style={modalStyles.customerInfo}>
        <Text style={modalStyles.customerPhone}>{item.customer}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
    </TouchableOpacity>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={modalStyles.overlay}
        activeOpacity={1}
        onPressOut={onClose}
      >
        <View style={modalStyles.container}>
          {/* Header */}
          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>Recent Customers</Text>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Subtitle */}
          <Text style={modalStyles.subtitle}>
            Select a phone number from your recent purchases
          </Text>

          {/* Loading State */}
          {loading ? (
            <View style={modalStyles.loadingContainer}>
              <ActivityIndicator size="large" color="#1F54DD" />
              <Text style={modalStyles.loadingText}>Loading recent customers...</Text>
            </View>
          ) : customers.length === 0 ? (
            <View style={modalStyles.emptyContainer}>
              <Ionicons name="people-outline" size={48} color="#94A3B8" />
              <Text style={modalStyles.emptyTitle}>No Recent Customers</Text>
              <Text style={modalStyles.emptyDescription}>
                Your recent customers will appear here after you make purchases
              </Text>
            </View>
          ) : (
            <FlatList
              data={customers}
              renderItem={renderCustomer}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={modalStyles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

export default function Airtime({ navigation }: { navigation: any }) {
  // State
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedNetwork, setSelectedNetwork] = useState<(typeof NETWORK_OPTIONS)[0] | null>(null);

  // Commission state
  const [commissionConfig, setCommissionConfig] = useState<CommissionConfig | null>(null);
  const [commission, setCommission] = useState<number>(0);
  const [loadingCommission, setLoadingCommission] = useState<boolean>(false);

  // Recent customers state
  const [showRecentModal, setShowRecentModal] = useState(false);
  const [recentCustomers, setRecentCustomers] = useState<RecentCustomer[]>([]);
  const [loadingRecentCustomers, setLoadingRecentCustomers] = useState(false);

  // Helper functions
  const clearFieldError = (field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  // Fetch commission configuration on component mount
  useEffect(() => {
    fetchCommissionConfig();
  }, []);

  // Fetch commission configuration
  const fetchCommissionConfig = async () => {
    setLoadingCommission(true);
    try {
      const response = await commissionService.getCommissionConfig('Airtime');
      if (response.success && response.data) {
        setCommissionConfig(response.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch commission config:', error);
    } finally {
      setLoadingCommission(false);
    }
  };

  // Calculate commission when amount changes
  const calculateCommissionForAmount = (amountValue: number) => {
    if (!commissionConfig || amountValue <= 0) {
      setCommission(0);
      return;
    }

    const calculatedCommission = commissionService.calculateCommission(
      amountValue,
      commissionConfig
    );
    setCommission(calculatedCommission);
  };

  // Network selection handler
  const handleNetworkSelect = (network: typeof NETWORK_OPTIONS[0]) => {
    setSelectedNetwork(network);
    clearFieldError('network');
  };

  // Amount selection handler
  const handleAmountSelect = (selectedAmount: string) => {
    setAmount(selectedAmount);
    setCustomAmount('');
    clearFieldError('amount');

    calculateCommissionForAmount(Number(selectedAmount));
  };

  // Custom amount input handler
  const handleCustomAmountChange = (text: string) => {
    const cleanedText = text.replace(/[^\d.]/g, '');

    const parts = cleanedText.split('.');
    if (parts.length > 2) {
      return;
    }

    if (parts[1] && parts[1].length > 2) {
      return;
    }

    setCustomAmount(cleanedText);

    if (cleanedText) {
      setAmount(cleanedText);
      calculateCommissionForAmount(Number(cleanedText));
    } else {
      setAmount('');
      setCommission(0);
    }

    clearFieldError('amount');
  };

  // Phone number change handler
  const handlePhoneChange = (text: string) => {
    setPhone(text);
    if (errors.phone) {
      clearFieldError('phone');
    }
  };

  // Fetch recent customers
  const fetchRecentCustomers = async () => {
    setLoadingRecentCustomers(true);
    try {
      const response = await walletService.getRecentCustomers({
        type: 'Airtime',
        limit: 15
      });
      
      if (response.success) {
        setRecentCustomers(response.data);
        setShowRecentModal(true);
      } else {
        showError('Error', response.message || 'Failed to fetch recent customers');
      }
    } catch (error: any) {
      console.error('Failed to fetch recent customers:', error);
      showError('Error', 'Failed to load recent customers');
    } finally {
      setLoadingRecentCustomers(false);
    }
  };

  // Handle customer selection from recent
  const handleSelectCustomer = (customerPhone: string) => {
    setPhone(customerPhone);
    setShowRecentModal(false);
  };

  // Form validation
  const validateForm = () => {
    const validation = AirtimeValidators.validateAirtimeForm({
      phone,
      network: selectedNetwork?.value || null,
      amount: amount || null
    });

    if (!validation.isValid) {
      setErrors(validation.errors);

      const firstError = Object.values(validation.errors)[0];
      if (firstError) {
        showError('Validation Error', firstError);
      }

      return false;
    }

    return true;
  };

  // Show confirmation modal
  const handleProceed = () => {
    if (!validateForm()) {
      return;
    }
    
    if (!selectedNetwork) {
      showError('Error', 'Please select a network');
      return;
    }

    setShowConfirmModal(true);
  };

  // Purchase airtime (called from confirmation modal)
  const purchaseAirtime = async () => {
    if (!selectedNetwork) {
      showError('Error', 'Please select a network');
      return { success: false };
    }

    setIsSubmitting(true);

    try {
      const payload = {
        serviceID: selectedNetwork.serviceID,
        amount: parseFloat(amount),
        customer: phone,
        type: 'Airtime',
        provider_logo: selectedNetwork.logo,
        name: selectedNetwork.name,
        service_type: 'Airtime',
        billersCode: phone,
        variation_code: 'default',
        phone: phone,
        network: selectedNetwork.value,
        network_name: selectedNetwork.name,
      };

      console.log('Airtime purchase payload:', payload);

      const response = await billService.purchaseData(payload);

      if (response.success) {
        showSuccess('Success', response.message || 'Airtime purchase successful!');
        
        // Reset form
        setPhone('');
        setAmount('');
        setCustomAmount('');
        setSelectedNetwork(null);
        setCommission(0);
        
        setShowConfirmModal(false);
        navigation.navigate('Tabs');
        return { success: true, data: response.data };
      } else {
        showError('Error', response.message || 'Airtime purchase failed');
        return { success: false };
      }
    } catch (error: any) {
      console.error('Airtime purchase error:', error);

      let errorMessage = 'Airtime purchase failed. Please try again.';

      if (error.errors) {
        const apiErrors: Record<string, string> = {};
        Object.entries(error.errors).forEach(([field, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) {
            apiErrors[field] = messages[0];
          }
        });
        setErrors(apiErrors);

        const firstError = Object.values(apiErrors)[0];
        if (firstError) {
          showError('Validation Error', firstError);
        }
      } else if (error.message) {
        errorMessage = error.message;
        showError('Error', errorMessage);
      } else {
        showError('Error', errorMessage);
      }

      setShowConfirmModal(false);
      return { success: false, message: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  };

  // Prepare details for confirmation modal
  const getConfirmationDetails = (): PurchaseDetail[] => {
    const details: PurchaseDetail[] = [];
    
    if (amount) {
      details.push({
        label: 'Amount',
        value: `₦${formatAmount(amount)}`,
        icon: 'cash-outline',
        iconColor: '#64748B',
        valueColor: '#10B981',
      });
    }
    
    if (phone) {
      details.push({
        label: 'Phone Number',
        value: phone,
        icon: 'call-outline',
        iconColor: '#64748B',
      });
    }
    
    return details;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.title}>Buy Airtime</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Network Selection Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Network</Text>
          <View style={styles.networksContainer}>
            {NETWORK_OPTIONS.map((network) => (
              <TouchableOpacity
                key={network.value}
                style={[
                  styles.networkCard,
                  selectedNetwork?.value === network.value && styles.networkCardSelected
                ]}
                onPress={() => handleNetworkSelect(network)}
                activeOpacity={0.7}
              >
                <View style={styles.networkLogoContainer}>
                  <Image
                    source={network.logoLocal}
                    style={styles.networkLogo}
                    resizeMode="contain"
                  />
                </View>
                <Text style={[
                  styles.networkName,
                  selectedNetwork?.value === network.value && styles.networkNameSelected
                ]} numberOfLines={1}>
                  {network.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.network && (
            <Text style={styles.errorText}>{errors.network}</Text>
          )}
        </View>

        {/* Phone Number Input */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Phone Number</Text>
            <TouchableOpacity 
              onPress={fetchRecentCustomers}
              disabled={loadingRecentCustomers}
            >
              <Text style={styles.beneficiaryLink}>
                {loadingRecentCustomers ? 'Loading...' : 'Choose from recent'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={[
            styles.inputContainer,
            errors.phone && styles.inputContainerError
          ]}>
            <TextInput
              style={styles.input}
              placeholder="Enter 11-digit phone number"
              value={phone}
              onChangeText={handlePhoneChange}
              keyboardType="phone-pad"
              maxLength={11}
              placeholderTextColor="#94A3B8"
            />
            <TouchableOpacity 
              style={styles.contactButton} 
              onPress={fetchRecentCustomers}
              disabled={loadingRecentCustomers}
            >
              {loadingRecentCustomers ? (
                <ActivityIndicator size="small" color="#64748B" />
              ) : (
                <Ionicons name="people-outline" size={20} color="#64748B" />
              )}
            </TouchableOpacity>
          </View>
          {errors.phone && (
            <Text style={styles.errorText}>{errors.phone}</Text>
          )}
        </View>

        {/* Amount Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amount</Text>

          {/* Custom amount input */}
          <View style={[
            styles.inputContainer,
            errors.amount && styles.inputContainerError
          ]}>
            <TextInput
              style={styles.input}
              placeholder="Enter custom amount"
              value={customAmount}
              onChangeText={handleCustomAmountChange}
              keyboardType="decimal-pad"
              placeholderTextColor="#94A3B8"
            />
            <Text style={styles.currencySymbol}>₦</Text>
          </View>

          {/* Quick select amounts */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.amountsScroll}
            contentContainerStyle={styles.amountsScrollContent}
          >
            {AIRTIME_AMOUNTS.map((amt) => (
              <TouchableOpacity
                key={amt}
                style={[
                  styles.amountChip,
                  amount === amt && styles.amountChipSelected
                ]}
                onPress={() => handleAmountSelect(amt)}
              >
                <Text style={[
                  styles.amountChipText,
                  amount === amt && styles.amountChipTextSelected
                ]}>
                  ₦{formatAmount(amt)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {errors.amount && (
            <Text style={styles.errorText}>{errors.amount}</Text>
          )}

          {/* Amount Display with Commission */}
          {amount && parseFloat(amount) > 0 && (
            <View style={styles.amountDisplayContainer}>
              <View style={styles.amountDisplay}>
                <Text style={styles.amountDisplayLabel}>Amount to pay:</Text>
                <Text style={styles.amountDisplayValue}>₦{formatAmount(amount)}</Text>
              </View>

              {commission > 0 && (
                <View style={styles.commissionContainer}>
                  <Text style={styles.commissionText}>
                    You will earn: ₦{formatAmount(commission)}
                  </Text>
                  {loadingCommission && (
                    <ActivityIndicator size="small" color="#10B981" style={styles.commissionLoader} />
                  )}
                </View>
              )}
            </View>
          )}
        </View>

        {/* Proceed Button */}
        <TouchableOpacity
          style={[
            styles.proceedButton,
            (isSubmitting || !amount || !selectedNetwork || !phone) && styles.proceedButtonDisabled
          ]}
          onPress={handleProceed}
          disabled={isSubmitting || !amount || !selectedNetwork || !phone}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.proceedButtonText}>
              {!amount || !selectedNetwork || !phone ? 'Fill all fields' : 'Proceed to Buy'}
            </Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 320 }} />
      </ScrollView>

      {/* Recent Customers Modal */}
      <RecentCustomersModal
        visible={showRecentModal}
        onClose={() => setShowRecentModal(false)}
        customers={recentCustomers}
        loading={loadingRecentCustomers}
        onSelectCustomer={handleSelectCustomer}
      />

      {/* Confirmation Modal */}
      <ConfirmPurchaseModal
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={purchaseAirtime}
        title="Confirm Airtime Purchase"
        providerLogo={selectedNetwork?.logoLocal}
        providerName={selectedNetwork?.name}
        details={getConfirmationDetails()}
        amount={parseFloat(amount) || 0}
        commission={commission}
        loading={isSubmitting}
        confirmButtonText="Buy Airtime"
        infoNote="Airtime will be delivered instantly after successful payment"
      />
    </View>
  );
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    minHeight: 400,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F172A',
  },
  closeButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
    marginBottom: 24,
  },
  listContent: {
    paddingBottom: 20,
  },
  customerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  customerIcon: {
    marginRight: 12,
  },
  customerInfo: {
    flex: 1,
  },
  customerPhone: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#0F172A',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#64748B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#94A3B8',
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 20,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F172A',
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F172A',
    marginBottom: 16,
  },
  beneficiaryLink: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#1F54DD',
  },
  networksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  networkCard: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    width: 80,
    height: 90,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  networkCardSelected: {
    borderColor: '#1F54DD',
    backgroundColor: '#F1F6FF',
  },
  networkLogoContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  networkLogo: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  networkName: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#64748B',
    textAlign: 'center',
  },
  networkNameSelected: {
    color: '#1F54DD',
    fontFamily: 'Poppins-SemiBold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputContainerError: {
    borderColor: '#EF4444',
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#0F172A',
  },
  contactButton: {
    padding: 8,
  },
  currencySymbol: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#64748B',
    marginLeft: 8,
  },
  amountsScroll: {
    marginHorizontal: -20,
    marginTop: 12,
  },
  amountsScrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  amountChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountChipSelected: {
    backgroundColor: '#1F54DD',
    borderColor: '#1F54DD',
  },
  amountChipText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#64748B',
  },
  amountChipTextSelected: {
    color: '#FFFFFF',
  },
  amountDisplayContainer: {
    marginTop: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
  },
  amountDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  amountDisplayLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#64748B',
  },
  amountDisplayValue: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#10B981',
  },
  commissionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  commissionText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#10B981',
  },
  commissionLoader: {
    marginLeft: 8,
  },
  proceedButton: {
    backgroundColor: '#1F54DD',
    marginHorizontal: 20,
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1F54DD',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 8,
    marginBottom: 24,
  },
  proceedButtonDisabled: {
    backgroundColor: '#94A3B8',
    opacity: 0.6,
  },
  proceedButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    marginTop: 8,
  },
  infoText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F1F6FF',
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 16,
  },
  networkValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  networkLogoSmall: {
    width: 20,
    height: 20,
    marginRight: 8,
    borderRadius: 10,
  },
  networkValueText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#0F172A',
  },
});