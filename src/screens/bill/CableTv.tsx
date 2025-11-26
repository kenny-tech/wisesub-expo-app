import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

// Mock data - replace with your actual API calls
const providers = [
  { id: 'dstv', name: 'DStv', logo: require('../../../assets/images/dstv.png') },
  { id: 'gotv', name: 'GOtv', logo: require('../../../assets/images/gotv.png') },
  { id: 'startimes', name: 'Startimes', logo: require('../../../assets/images/startimes.png') },
];

const mockCablePlans = {
  dstv: [
    { id: 1, name: 'DStv Yanga', price: 2500 },
    { id: 2, name: 'DStv Confam', price: 5300 },
    { id: 3, name: 'DStv Compact', price: 8100 },
    { id: 4, name: 'DStv Compact Plus', price: 12900 },
    { id: 5, name: 'DStv Premium', price: 24500 },
  ],
  gotv: [
    { id: 1, name: 'GOtv Lite', price: 1200 },
    { id: 2, name: 'GOtv Jinja', price: 2600 },
    { id: 3, name: 'GOtv Jolli', price: 3700 },
    { id: 4, name: 'GOtv Max', price: 5200 },
  ],
  startimes: [
    { id: 1, name: 'Nova', price: 900 },
    { id: 2, name: 'Basic', price: 1600 },
    { id: 3, name: 'Smart', price: 2600 },
    { id: 4, name: 'Classic', price: 3800 },
    { id: 5, name: 'Super', price: 5500 },
  ],
};

const mockBeneficiaries = [
  { id: 1, decoder: '1234567890', name: 'Home Decoder' },
  { id: 2, decoder: '0987654321', name: 'Office Decoder' },
];

export default function CableTv({ navigation }: { navigation: any }) {
  const [decoderNumber, setDecoderNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isBeneficiaryModalVisible, setIsBeneficiaryModalVisible] = useState(false);
  const [isPlanModalVisible, setIsPlanModalVisible] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [validating, setValidating] = useState(false);

  const [selectedProviderError, setSelectedProviderError] = useState('');
  const [decoderError, setDecoderError] = useState('');
  const [planError, setPlanError] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      // Simulate API calls
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }, [])
  );

  const formatAmount = (amt: string) => {
    return parseFloat(amt || '0').toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleProviderSelect = (provider: any) => {
    setSelectedProvider(provider);
    setSelectedPlan(null);
    setAmount('');
    setCustomerName('');
    setSelectedProviderError('');
  };

  const handlePlanSelect = (plan: any) => {
    setSelectedPlan(plan);
    setAmount(plan.price.toString());
    setPlanError('');
    setIsPlanModalVisible(false);
  };

  const handleDecoderChange = (text: string) => {
    setDecoderNumber(text);
    setDecoderError('');
    setCustomerName('');

    // Simulate customer validation when decoder number is complete
    if (text.length === 10) {
      setValidating(true);
      setTimeout(() => {
        setValidating(false);
        // Mock customer name - replace with actual API validation
        setCustomerName('John Doe');
      }, 1500);
    }
  };

  const validateForm = () => {
    let isValid = true;

    if (!selectedProvider) {
      setSelectedProviderError('Please select a provider');
      isValid = false;
    }

    if (!selectedPlan) {
      setPlanError('Please select a cable plan');
      isValid = false;
    }

    if (!decoderNumber.trim()) {
      setDecoderError('Decoder number is required');
      isValid = false;
    } else if (!/^\d{10}$/.test(decoderNumber.trim())) {
      setDecoderError('Please enter a valid 10-digit decoder number');
      isValid = false;
    }

    return isValid;
  };

  const handleProceed = () => {
    if (validateForm()) {
      setIsConfirmModalVisible(true);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1F54DD" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.title}>Cable TV</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Provider Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Provider</Text>
          <View style={styles.providersRow}>
            {providers.map(provider => (
              <TouchableOpacity
                key={provider.id}
                style={[
                  styles.providerCard,
                  selectedProvider?.id === provider.id && styles.providerCardSelected,
                ]}
                onPress={() => handleProviderSelect(provider)}
              >
                <Image 
                  source={provider.logo} 
                  style={styles.providerImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            ))}
          </View>
          {selectedProviderError ? <Text style={styles.errorText}>{selectedProviderError}</Text> : null}
        </View>

        {/* Plan Selection */}
        {selectedProvider && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cable Plan</Text>
            <TouchableOpacity 
              style={styles.planSelector}
              onPress={() => setIsPlanModalVisible(true)}
            >
              <Text style={[
                styles.planSelectorText,
                selectedPlan && styles.planSelectorTextSelected
              ]}>
                {selectedPlan ? `${selectedPlan.name} - ₦${formatAmount(selectedPlan.price.toString())}` : 'Select Cable Plan'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#64748B" />
            </TouchableOpacity>
            {planError ? <Text style={styles.errorText}>{planError}</Text> : null}
          </View>
        )}

        {/* Amount Display */}
        {selectedPlan && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amount</Text>
            <View style={styles.amountDisplay}>
              <Text style={styles.amountText}>₦{formatAmount(amount)}</Text>
            </View>
          </View>
        )}

        {/* Decoder Number Input */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Decoder Number</Text>
            {mockBeneficiaries.length > 0 && (
              <TouchableOpacity onPress={() => setIsBeneficiaryModalVisible(true)}>
                <Text style={styles.beneficiaryLink}>Choose from beneficiaries</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.decoderInputContainer}>
            <TextInput
              style={styles.decoderInput}
              placeholder="Enter decoder number"
              value={decoderNumber}
              onChangeText={handleDecoderChange}
              keyboardType="number-pad"
              maxLength={10}
            />
            {validating && (
              <ActivityIndicator size="small" color="#1F54DD" />
            )}
          </View>
          {decoderError ? <Text style={styles.errorText}>{decoderError}</Text> : null}
          
          {/* Customer Name Display */}
          {customerName && (
            <View style={styles.customerNameContainer}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.customerNameText}>{customerName}</Text>
            </View>
          )}
        </View>

        {/* Proceed Button */}
        <TouchableOpacity
          style={[styles.proceedButton, processing && styles.proceedButtonDisabled]}
          onPress={handleProceed}
          disabled={processing || validating}
        >
          {processing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : validating ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.proceedButtonText}>Proceed</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
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
  providersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  providerCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    width: (width - 80) / 3,
    height: 60,
  },
  providerCardSelected: {
    borderColor: '#1F54DD',
    backgroundColor: '#F1F6FF',
  },
  providerImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  planSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  planSelectorText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
  },
  planSelectorTextSelected: {
    color: '#0F172A',
  },
  amountDisplay: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    justifyContent: 'center',
  },
  amountText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F172A',
  },
  decoderInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  decoderInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#0F172A',
  },
  customerNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  customerNameText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#10B981',
    marginLeft: 6,
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
  },
  proceedButtonDisabled: {
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#0F172A',
    marginLeft: 8,
  },
  plansList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  planItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  planItemSelected: {
    backgroundColor: '#F1F6FF',
    borderRadius: 8,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#0F172A',
    marginBottom: 4,
  },
  planProvider: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
  },
  planPrice: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1F54DD',
  },
  confirmIcon: {
    alignItems: 'center',
    marginBottom: 16,
  },
  confirmDetails: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  confirmLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
  },
  confirmValue: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#0F172A',
  },
  amountValue: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#10B981',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  confirmButton: {
    backgroundColor: '#1F54DD',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#64748B',
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#FFFFFF',
  },
  beneficiaryList: {
    maxHeight: 200,
    marginBottom: 20,
  },
  beneficiaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  beneficiaryAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1F54DD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  beneficiaryInfo: {
    flex: 1,
  },
  beneficiaryName: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#0F172A',
    marginBottom: 2,
  },
  beneficiaryDecoder: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
  },
  modalCloseButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#64748B',
  },
});