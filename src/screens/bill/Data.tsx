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
const networks = [
  { id: 'mtn', name: 'MTN', logo: require('../../../assets/images/mtn.png') },
  { id: 'airtel', name: 'Airtel', logo: require('../../../assets/images/airtel.png') },
  { id: 'glo', name: 'Glo', logo: require('../../../assets/images/glo.png') },
  { id: '9mobile', name: '9mobile', logo: require('../../../assets/images/ninemobile.png') },
];

const mockDataPlans = {
  mtn: [
    { id: 1, size: '100MB', validity: '1 day', price: 100 },
    { id: 2, size: '350MB', validity: '7 days', price: 200 },
    { id: 3, size: '1GB', validity: '30 days', price: 500 },
    { id: 4, size: '2GB', validity: '30 days', price: 1000 },
    { id: 5, size: '5GB', validity: '30 days', price: 2000 },
  ],
  airtel: [
    { id: 1, size: '100MB', validity: '1 day', price: 100 },
    { id: 2, size: '350MB', validity: '7 days', price: 200 },
    { id: 3, size: '1GB', validity: '30 days', price: 500 },
    { id: 4, size: '2GB', validity: '30 days', price: 1000 },
  ],
  glo: [
    { id: 1, size: '100MB', validity: '1 day', price: 100 },
    { id: 2, size: '350MB', validity: '7 days', price: 200 },
    { id: 3, size: '1GB', validity: '30 days', price: 500 },
  ],
  '9mobile': [
    { id: 1, size: '100MB', validity: '1 day', price: 100 },
    { id: 2, size: '350MB', validity: '7 days', price: 200 },
    { id: 3, size: '1GB', validity: '30 days', price: 500 },
  ],
};

const mockBeneficiaries = [
  { id: 1, phone: '08012345678', name: 'John Doe' },
  { id: 2, phone: '08087654321', name: 'Jane Smith' },
];

export default function Data({ navigation }: { navigation: any }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [isBeneficiaryModalVisible, setIsBeneficiaryModalVisible] = useState(false);
  const [isDataPlanModalVisible, setIsDataPlanModalVisible] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedDataPlan, setSelectedDataPlan] = useState(null);
  const [searchText, setSearchText] = useState('');

  const [selectedNetworkError, setSelectedNetworkError] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('');
  const [dataPlanError, setDataPlanError] = useState('');

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

  const handleNetworkSelect = (network: any) => {
    setSelectedNetwork(network);
    setSelectedDataPlan(null);
    setAmount('');
    setSelectedNetworkError('');
  };

  const handleDataPlanSelect = (plan: any) => {
    setSelectedDataPlan(plan);
    setAmount(plan.price.toString());
    setDataPlanError('');
    setIsDataPlanModalVisible(false);
  };

  const validateForm = () => {
    let isValid = true;

    if (!selectedNetwork) {
      setSelectedNetworkError('Please select a network');
      isValid = false;
    }

    if (!phoneNumber.trim()) {
      setPhoneNumberError('Phone number is required');
      isValid = false;
    } else if (!/^\d{11}$/.test(phoneNumber.trim())) {
      setPhoneNumberError('Please enter a valid 11-digit phone number');
      isValid = false;
    }

    if (!selectedDataPlan) {
      setDataPlanError('Please select a data plan');
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
          <Text style={styles.title}>Buy Data</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Network Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Network</Text>
          <View style={styles.networksRow}>
            {networks.map(network => (
              <TouchableOpacity
                key={network.id}
                style={[
                  styles.networkCard,
                  selectedNetwork?.id === network.id && styles.networkCardSelected,
                ]}
                onPress={() => handleNetworkSelect(network)}
              >
                <Image 
                  source={network.logo} 
                  style={styles.networkImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            ))}
          </View>
          {selectedNetworkError ? <Text style={styles.errorText}>{selectedNetworkError}</Text> : null}
        </View>

        {/* Phone Number Input */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Phone Number</Text>
            {mockBeneficiaries.length > 0 && (
              <TouchableOpacity onPress={() => setIsBeneficiaryModalVisible(true)}>
                <Text style={styles.beneficiaryLink}>Choose from beneficiaries</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.phoneInputContainer}>
            <TextInput
              style={styles.phoneInput}
              placeholder="Enter phone number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              maxLength={11}
            />
            <TouchableOpacity style={styles.contactButton}>
              <Ionicons name="person-outline" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>
          {phoneNumberError ? <Text style={styles.errorText}>{phoneNumberError}</Text> : null}
        </View>

        {/* Data Plan Selection */}
        {selectedNetwork && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Plan</Text>
            <TouchableOpacity 
              style={styles.dataPlanSelector}
              onPress={() => setIsDataPlanModalVisible(true)}
            >
              <Text style={[
                styles.dataPlanSelectorText,
                selectedDataPlan && styles.dataPlanSelectorTextSelected
              ]}>
                {selectedDataPlan ? `${selectedDataPlan.size} - ₦${formatAmount(selectedDataPlan.price.toString())}` : 'Select Data Plan'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#64748B" />
            </TouchableOpacity>
            {dataPlanError ? <Text style={styles.errorText}>{dataPlanError}</Text> : null}
          </View>
        )}

        {/* Amount Display */}
        {selectedDataPlan && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amount</Text>
            <View style={styles.amountDisplay}>
              <Text style={styles.amountText}>₦{formatAmount(amount)}</Text>
            </View>
          </View>
        )}

        {/* Proceed Button */}
        <TouchableOpacity
          style={[styles.proceedButton, processing && styles.proceedButtonDisabled]}
          onPress={handleProceed}
          disabled={processing}
        >
          {processing ? (
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
  networksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  networkCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    width: (width - 80) / 4,
    height: 60,
  },
  networkCardSelected: {
    borderColor: '#1F54DD',
    backgroundColor: '#F1F6FF',
  },
  networkImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#0F172A',
  },
  contactButton: {
    padding: 8,
  },
  dataPlanSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  dataPlanSelectorText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
  },
  dataPlanSelectorTextSelected: {
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
  dataPlansList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  dataPlanItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dataPlanItemSelected: {
    backgroundColor: '#F1F6FF',
    borderRadius: 8,
  },
  dataPlanInfo: {
    flex: 1,
  },
  dataPlanSize: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#0F172A',
    marginBottom: 4,
  },
  dataPlanValidity: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
  },
  dataPlanPrice: {
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
  beneficiaryAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
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
  beneficiaryPhone: {
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