import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

// Mock data - replace with your actual API calls
const discos = [
  { id: 'ikedc', name: 'IKEDC', area: 'Ikeja Electric' },
  { id: 'ekedc', name: 'EKEDC', area: 'Eko Electric' },
  { id: 'phed', name: 'PHED', area: 'Port Harcourt Electric' },
  { id: 'kedco', name: 'KEDCO', area: 'Kano Electric' },
  { id: 'ibedc', name: 'IBEDC', area: 'Ibadan Electric' },
  { id: 'eedc', name: 'EEDC', area: 'Enugu Electric' },
  { id: 'aedc', name: 'AEDC', area: 'Abuja Electric' },
  { id: 'jedc', name: 'JEDC', area: 'Jos Electric' },
  { id: 'kedco', name: 'KEDCO', area: 'Kaduna Electric' },
  { id: 'bedc', name: 'BEDC', area: 'Benin Electric' },
];

const electricityAmounts = ['500', '1000', '2000', '5000', '10000', '20000'];
const mockBeneficiaries = [
  { id: 1, meter: '12345678901', name: 'Home Meter' },
  { id: 2, meter: '09876543210', name: 'Office Meter' },
];

export default function Electricity({ navigation }: { navigation: any }) {
  const [meterNumber, setMeterNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedDisco, setSelectedDisco] = useState(null);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [isBeneficiaryModalVisible, setIsBeneficiaryModalVisible] = useState(false);
  const [isDiscoModalVisible, setIsDiscoModalVisible] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [validating, setValidating] = useState(false);
  const [searchText, setSearchText] = useState('');

  const [selectedDiscoError, setSelectedDiscoError] = useState('');
  const [meterError, setMeterError] = useState('');
  const [amountError, setAmountError] = useState('');

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

  const handleDiscoSelect = (disco: any) => {
    setSelectedDisco(disco);
    setSelectedDiscoError('');
    setMeterNumber('');
    setCustomerName('');
  };

  const handleAmountSelect = (amt: string) => {
    setSelectedAmount(amt);
    setAmount(amt);
    setAmountError('');
  };

  const handleAmountChange = (text: string) => {
    // Remove non-numeric characters except decimal point
    const numericText = text.replace(/[^\d.]/g, '');
    setAmount(numericText);
    setSelectedAmount(null);
    setAmountError('');
  };

  const handleMeterChange = (text: string) => {
    setMeterNumber(text);
    setMeterError('');
    setCustomerName('');

    // Simulate customer validation when meter number is complete
    if (text.length === 11) {
      setValidating(true);
      setTimeout(() => {
        setValidating(false);
        // Mock customer name - replace with actual API validation
        setCustomerName('John Doe - Residential');
      }, 1500);
    }
  };

  const validateForm = () => {
    let isValid = true;

    if (!selectedDisco) {
      setSelectedDiscoError('Please select a Disco');
      isValid = false;
    }

    if (!meterNumber.trim()) {
      setMeterError('Meter number is required');
      isValid = false;
    } else if (!/^\d{11}$/.test(meterNumber.trim())) {
      setMeterError('Please enter a valid 11-digit meter number');
      isValid = false;
    }

    if (!amount.trim()) {
      setAmountError('Amount is required');
      isValid = false;
    } else if (parseFloat(amount) < 500) {
      setAmountError('Minimum amount is ₦500');
      isValid = false;
    }

    return isValid;
  };

  const handleProceed = () => {
    if (validateForm()) {
      setIsConfirmModalVisible(true);
    }
  };

  const filteredDiscos = searchText 
    ? discos.filter(disco => 
        disco.name.toLowerCase().includes(searchText.toLowerCase()) ||
        disco.area.toLowerCase().includes(searchText.toLowerCase())
      )
    : discos;

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
          <Text style={styles.title}>Electricity</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Disco Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Disco</Text>
          <TouchableOpacity 
            style={styles.discoSelector}
            onPress={() => setIsDiscoModalVisible(true)}
          >
            <Text style={[
              styles.discoSelectorText,
              selectedDisco && styles.discoSelectorTextSelected
            ]}>
              {selectedDisco ? `${selectedDisco.name} - ${selectedDisco.area}` : 'Select Electricity Disco'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#64748B" />
          </TouchableOpacity>
          {selectedDiscoError ? <Text style={styles.errorText}>{selectedDiscoError}</Text> : null}
        </View>

        {/* Meter Number Input */}
        {selectedDisco && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Meter Number</Text>
              {mockBeneficiaries.length > 0 && (
                <TouchableOpacity onPress={() => setIsBeneficiaryModalVisible(true)}>
                  <Text style={styles.beneficiaryLink}>Choose from beneficiaries</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.meterInputContainer}>
              <TextInput
                style={styles.meterInput}
                placeholder="Enter meter number"
                value={meterNumber}
                onChangeText={handleMeterChange}
                keyboardType="number-pad"
                maxLength={11}
              />
              {validating && (
                <ActivityIndicator size="small" color="#1F54DD" />
              )}
            </View>
            {meterError ? <Text style={styles.errorText}>{meterError}</Text> : null}
            
            {/* Customer Name Display */}
            {customerName && (
              <View style={styles.customerNameContainer}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={styles.customerNameText}>{customerName}</Text>
              </View>
            )}
          </View>
        )}

        {/* Amount Selection */}
        {selectedDisco && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amount</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="Enter amount"
              value={amount}
              onChangeText={handleAmountChange}
              keyboardType="decimal-pad"
            />
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.amountsScroll}>
              <View style={styles.amountsContainer}>
                {electricityAmounts.map(amt => (
                  <TouchableOpacity
                    key={amt}
                    style={[
                      styles.amountChip,
                      selectedAmount === amt && styles.amountChipSelected,
                    ]}
                    onPress={() => handleAmountSelect(amt)}
                  >
                    <Text style={[
                      styles.amountChipText,
                      selectedAmount === amt && styles.amountChipTextSelected,
                    ]}>
                      ₦{formatAmount(amt)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            {amountError ? <Text style={styles.errorText}>{amountError}</Text> : null}
          </View>
        )}

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
  discoSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  discoSelectorText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
  },
  discoSelectorTextSelected: {
    color: '#0F172A',
  },
  meterInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  meterInput: {
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
  amountInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#0F172A',
    marginBottom: 12,
  },
  amountsScroll: {
    marginHorizontal: -20,
  },
  amountsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
  },
  amountChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 80,
    alignItems: 'center',
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
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 20,
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
  discosList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  discoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  discoItemSelected: {
    backgroundColor: '#F1F6FF',
    borderRadius: 8,
  },
  discoInfo: {
    flex: 1,
  },
  discoName: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#0F172A',
    marginBottom: 4,
  },
  discoArea: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
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
  beneficiaryMeter: {
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