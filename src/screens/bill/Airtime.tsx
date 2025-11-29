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

const airtimeAmounts = ['100', '200', '500', '1000', '2000', '5000'];
const mockBeneficiaries = [
  { id: 1, phone: '08012345678', name: 'John Doe' },
  { id: 2, phone: '08087654321', name: 'Jane Smith' },
];

export default function Airtime({ navigation }: { navigation: any }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [balance, setBalance] = useState(15250);
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [isBeneficiaryModalVisible, setIsBeneficiaryModalVisible] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [selectedNetworkError, setSelectedNetworkError] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('');
  const [amountError, setAmountError] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      // Simulate API calls
      setLoading(true);
      setTimeout(() => {
        setBalance(15250);
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
    setSelectedNetworkError('');
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

    if (!amount.trim()) {
      setAmountError('Amount is required');
      isValid = false;
    } else if (parseFloat(amount) < 50) {
      setAmountError('Minimum amount is ₦50');
      isValid = false;
    } else if (parseFloat(amount) > balance) {
      setAmountError('Insufficient balance');
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
          <Text style={styles.title}>Buy Airtime</Text>
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

        {/* Amount Selection */}
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
              {airtimeAmounts.map(amt => (
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
    width: (width - 80) / 4, // Calculate width to fit 4 items with spacing
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
});