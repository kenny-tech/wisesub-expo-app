import { ConfirmPurchaseModal, PurchaseDetail } from '@/src/components/bills/ConfirmPurchaseModal';
import { ElectricityTokenDisplay } from '@/src/components/bills/ElectricityTokenDisplay';
import { formatAmount } from '@/src/helper/util';
import { IMAGE_BASE_URL } from '@/src/services/api';
import { billService } from '@/src/services/billService';
import { CommissionConfig, commissionService } from '@/src/services/commissionService';
import { showError } from '@/src/utils/toast';
import { ElectricityValidators } from '@/src/utils/validators/electricityValidators';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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

// Define electricity providers with both local image for UI and URL for backend
const PROVIDERS = [
  { 
    id: 'ikedc', 
    name: 'Ikeja Electric', 
    logoLocal: require('../../../assets/images/ikedc.jpg'),
    logoUrl: `${IMAGE_BASE_URL}/ikedc.jpg`,
    serviceID: 'ikeja-electric'
  },
  { 
    id: 'ekedc', 
    name: 'Eko Electric', 
    logoLocal: require('../../../assets/images/ekedc.jpg'),
    logoUrl: `${IMAGE_BASE_URL}/ekedc.jpg`,
    serviceID: 'eko-electric'
  },
  { 
    id: 'kedco', 
    name: 'Kano Electric', 
    logoLocal: require('../../../assets/images/kedco.jpg'),
    logoUrl: `${IMAGE_BASE_URL}/kedco.jpg`,
    serviceID: 'kano-electric'
  },
  { 
    id: 'phedc', 
    name: 'Port Harcourt Electric', 
    logoLocal: require('../../../assets/images/phedc.jpg'),
    logoUrl: `${IMAGE_BASE_URL}/phedc.jpg`,
    serviceID: 'portharcourt-electric'
  },
  { 
    id: 'ibedc', 
    name: 'Ibadan Electric', 
    logoLocal: require('../../../assets/images/ibedc.jpg'),
    logoUrl: `${IMAGE_BASE_URL}/ibedc.jpg`,
    serviceID: 'ibadan-electric'
  },
  { 
    id: 'aedc', 
    name: 'Abuja Electric', 
    logoLocal: require('../../../assets/images/aedc.jpg'),
    logoUrl: `${IMAGE_BASE_URL}/aedc.jpg`,
    serviceID: 'abuja-electric'
  },
];

// Predefined electricity amounts
const ELECTRICITY_AMOUNTS = ['500', '1000', '2000', '5000', '10000', '20000'];

// Meter types
const METER_TYPES = [
  { id: 'prepaid', name: 'Prepaid' },
  { id: 'postpaid', name: 'Postpaid' },
];

interface TokenData {
  token: string;
  units: string;
  amount: number;
  meterNumber: string;
  provider: string;
  customerName: string;
  phoneNumber: string;
}

export default function Electricity({ navigation }: { navigation: any }) {
  // State
  const [meterNumber, setMeterNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validating, setValidating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedProvider, setSelectedProvider] = useState<(typeof PROVIDERS)[0] | null>(null);
  const [meterType, setMeterType] = useState<string>('prepaid');
  const [customerName, setCustomerName] = useState<string>('');
  const [minPurchaseAmount, setMinPurchaseAmount] = useState<number>(0);

  // Commission state
  const [commissionConfig, setCommissionConfig] = useState<CommissionConfig | null>(null);
  const [commission, setCommission] = useState<number>(0);
  const [loadingCommission, setLoadingCommission] = useState<boolean>(false);

  // Token display state
  const [showToken, setShowToken] = useState(false);
  const [tokenData, setTokenData] = useState<TokenData | null>(null);

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
      const response = await commissionService.getCommissionConfig('Electricity');
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

  // Provider selection handler
  const handleProviderSelect = (provider: typeof PROVIDERS[0]) => {
    setSelectedProvider(provider);
    setMeterNumber('');
    setCustomerName('');
    setAmount('');
    setCustomAmount('');
    clearFieldError('provider');
    setCommission(0);
  };

  // Meter type selection handler
  const handleMeterTypeSelect = (type: string) => {
    setMeterType(type);
    setMeterNumber('');
    setCustomerName('');
    clearFieldError('meterType');
  };

  // Amount selection handler
  const handleAmountSelect = (selectedAmount: string) => {
    setAmount(selectedAmount);
    setCustomAmount('');
    clearFieldError('amount');

    // Calculate commission
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

  // Meter number change handler
  const handleMeterChange = (text: string) => {
    setMeterNumber(text);
    setCustomerName('');
    if (errors.meterNumber) {
      clearFieldError('meterNumber');
    }
  };

  // Phone number change handler
  const handlePhoneChange = (text: string) => {
    setPhoneNumber(text);
    if (errors.phoneNumber) {
      clearFieldError('phoneNumber');
    }
  };

  // Validate meter number
  const validateMeter = async () => {
    if (!selectedProvider) {
      showError('Error', 'Please select a provider first');
      return;
    }

    if (!meterNumber.trim()) {
      setErrors(prev => ({ ...prev, meterNumber: 'Meter number is required' }));
      showError('Error', 'Meter number is required');
      return;
    }

    if (!/^\d{11,}$/.test(meterNumber.trim())) {
      setErrors(prev => ({ ...prev, meterNumber: 'Please enter a valid meter number (min 11 digits)' }));
      showError('Error', 'Please enter a valid meter number (min 11 digits)');
      return;
    }

    setValidating(true);
    setCustomerName('');

    try {
      const payload = {
        serviceID: selectedProvider.serviceID,
        billersCode: meterNumber,
        type: meterType,
      };

      console.log('Meter validation payload:', payload);

      const response = await billService.validateMeter(payload);

      console.log('Full validation response:', JSON.stringify(response, null, 2));

      if (response.success && response.data?.code === "000") {
        if (response.data.content?.Customer_Name) {
          const apiMinAmount = parseFloat(response.data.content.Min_Purchase_Amount || '500');
          setMinPurchaseAmount(apiMinAmount);
          setCustomerName(response.data.content.Customer_Name);

          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.meterNumber;
            return newErrors;
          });
          Alert.alert('Success', 'Meter validated successfully!');
        } else if (response.data.content?.error) {
          Alert.alert(
            'Meter Validation Warning',
            response.data.content.error,
            [
              {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => {
                  setErrors(prev => ({
                    ...prev,
                    meterNumber: response.data.content.error
                  }));
                  setCustomerName('');
                }
              },
              {
                text: 'Proceed Anyway',
                style: 'destructive',
                onPress: () => {
                  setCustomerName('Customer (Validation Warning)');
                  setMinPurchaseAmount(500);
                  setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.meterNumber;
                    return newErrors;
                  });
                  showError('Warning', 'Proceeding with meter that may be invalid. Please double-check the number.');
                }
              }
            ]
          );
        } else {
          setCustomerName('Customer');
          setMinPurchaseAmount(500);
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.meterNumber;
            return newErrors;
          });
          Alert.alert('Success', 'Meter validated successfully!');
        }
      } else {
        const errorMessage = response.data?.response_description ||
          response.data?.content?.error ||
          response.message ||
          'Invalid meter number';

        setErrors(prev => ({ ...prev, meterNumber: errorMessage }));
        setCustomerName('');
        showError('Validation Failed', errorMessage);
      }
    } catch (error: any) {
      console.error('Validation error:', error);
      setErrors(prev => ({
        ...prev,
        meterNumber: error.response?.data?.message || 'Validation failed. Please try again.'
      }));
      setCustomerName('');
      showError('Error', 'Validation failed. Please try again.');
    } finally {
      setValidating(false);
    }
  };

  // Form validation
  const validateForm = () => {
    const validation = ElectricityValidators.validateElectricityForm({
      meterNumber,
      provider: selectedProvider?.id || null,
      phoneNumber,
      amount,
      meterType,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);

      const firstError = Object.values(validation.errors)[0];
      if (firstError) {
        showError('Validation Error', firstError);
      }

      return false;
    }

    if (!customerName) {
      showError('Error', 'Please validate your meter number first');
      return false;
    }

    const amountValue = parseFloat(amount);
    if (amountValue < minPurchaseAmount) {
      setErrors(prev => ({
        ...prev,
        amount: `Minimum purchase amount is ₦${minPurchaseAmount}`
      }));
      showError('Error', `Minimum purchase amount is ₦${minPurchaseAmount}`);
      return false;
    }

    return true;
  };

  // Show confirmation modal
  const handleProceed = () => {
    if (!validateForm()) {
      return;
    }
    
    if (!selectedProvider) {
      showError('Error', 'Please select a provider');
      return;
    }

    setShowConfirmModal(true);
  };

  // Purchase electricity (called from confirmation modal)
  const purchaseElectricity = async () => {
    if (!selectedProvider) {
      showError('Error', 'Please select a provider');
      return { success: false };
    }

    setIsSubmitting(true);

    try {
      const payload = {
        serviceID: selectedProvider.serviceID,
        variation_code: meterType,
        amount: parseFloat(amount),
        phone: phoneNumber,
        customer: meterNumber,
        type: 'Electricity',
        service_type: 'Electricity',
        provider_logo: selectedProvider.logoUrl,
        name: selectedProvider.name,
        billersCode: meterNumber,
        meterType: meterType,
        customer_name: customerName,
        validation_status: customerName === 'Customer (Validation Warning)' ? 'warning' : 'validated',
      };

      console.log('Electricity purchase payload:', payload);

      const response = await billService.purchaseData(payload);

      if (response.success) {
        if (response.data?.token) {
          setTokenData({
            token: response.data.token,
            units: response.data.units || '0',
            amount: response.data.amount || parseFloat(amount),
            meterNumber: meterNumber,
            provider: selectedProvider.id,
            customerName: customerName,
            phoneNumber: phoneNumber,
          });
          setShowToken(true);
        } else {
          Alert.alert('Success', response.message || 'Electricity purchase successful!');
          
          // Reset form
          setMeterNumber('');
          setPhoneNumber('');
          setAmount('');
          setCustomAmount('');
          setSelectedProvider(null);
          setCustomerName('');
          setCommission(0);
          
          setShowConfirmModal(false);
          navigation.navigate('Tabs');
        }
        return { success: true, data: response.data };
      } else {
        showError('Error', response.message || 'Electricity purchase failed');
        return { success: false };
      }
    } catch (error: any) {
      console.error('Electricity purchase error:', error);

      let errorMessage = 'Electricity purchase failed. Please try again.';

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
    
    // if (selectedProvider) {
    //   details.push({
    //     label: 'Provider',
    //     value: selectedProvider.name,
    //     icon: 'flash-outline',
    //     iconColor: '#64748B',
    //     customComponent: (
    //       <View style={styles.providerValueContainer}>
    //         {selectedProvider.logoLocal && (
    //           <Image 
    //             source={selectedProvider.logoLocal} 
    //             style={styles.providerLogoSmall}
    //             resizeMode="contain"
    //           />
    //         )}
    //         <Text style={styles.providerValueText}>{selectedProvider.name}</Text>
    //       </View>
    //     ),
    //   });
    // }
    
    details.push({
      label: 'Meter Type',
      value: meterType === 'prepaid' ? 'Prepaid' : 'Postpaid',
      icon: meterType === 'prepaid' ? 'battery-charging-outline' : 'receipt-outline',
      iconColor: '#64748B',
    });
    
    if (meterNumber) {
      details.push({
        label: 'Meter Number',
        value: meterNumber,
        icon: 'home-outline',
        iconColor: '#64748B',
      });
    }
    
    if (customerName) {
      details.push({
        label: 'Customer Name',
        value: customerName,
        icon: customerName === 'Customer (Validation Warning)' ? 'warning-outline' : 'person-outline',
        iconColor: customerName === 'Customer (Validation Warning)' ? '#F59E0B' : '#64748B',
        valueColor: customerName === 'Customer (Validation Warning)' ? '#F59E0B' : '#0F172A',
      });
    }
    
    if (phoneNumber) {
      details.push({
        label: 'Phone Number',
        value: phoneNumber,
        icon: 'call-outline',
        iconColor: '#64748B',
      });
    }
    
    if (amount) {
      details.push({
        label: 'Amount',
        value: `₦${formatAmount(amount)}`,
        icon: 'cash-outline',
        iconColor: '#64748B',
        valueColor: '#10B981',
      });
    }
    
    return details;
  };

  // Handle closing token display
  const handleCloseTokenDisplay = () => {
    setShowToken(false);
    setTokenData(null);
    // Reset form
    setMeterNumber('');
    setPhoneNumber('');
    setAmount('');
    setCustomAmount('');
    setSelectedProvider(null);
    setCustomerName('');
    setCommission(0);
    setShowConfirmModal(false);
    navigation.navigate('Tabs');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.title}>Buy Electricity</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Provider Selection with Logos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Provider</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.providersScrollContent}
          >
            {PROVIDERS.map((provider) => (
              <TouchableOpacity
                key={provider.id}
                style={[
                  styles.providerCard,
                  selectedProvider?.id === provider.id && styles.providerCardSelected
                ]}
                onPress={() => handleProviderSelect(provider)}
                activeOpacity={0.7}
              >
                <View style={styles.providerLogoContainer}>
                  <Image
                    source={provider.logoLocal}
                    style={styles.providerLogo}
                    resizeMode="contain"
                  />
                </View>
                <Text style={[
                  styles.providerName,
                  selectedProvider?.id === provider.id && styles.providerNameSelected
                ]} numberOfLines={2}>
                  {provider.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {errors.provider && (
            <Text style={styles.errorText}>{errors.provider}</Text>
          )}
        </View>

        {/* Meter Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meter Type</Text>
          <View style={styles.meterTypeContainer}>
            {METER_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.meterTypeButton,
                  meterType === type.id && styles.meterTypeButtonSelected
                ]}
                onPress={() => handleMeterTypeSelect(type.id)}
              >
                <Text style={[
                  styles.meterTypeText,
                  meterType === type.id && styles.meterTypeTextSelected
                ]}>
                  {type.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.meterType && (
            <Text style={styles.errorText}>{errors.meterType}</Text>
          )}
        </View>

        {/* Meter Number Input with Validation */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Meter Number</Text>
            <TouchableOpacity onPress={() => { }}>
              <Text style={styles.beneficiaryLink}>Choose from saved</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.meterInputRow}>
            <View style={[
              styles.meterInputContainer,
              errors.meterNumber && styles.inputContainerError
            ]}>
              <TextInput
                style={styles.meterInput}
                placeholder="Enter meter number"
                value={meterNumber}
                onChangeText={handleMeterChange}
                keyboardType="number-pad"
                maxLength={20}
                placeholderTextColor="#94A3B8"
              />
            </View>
            <TouchableOpacity
              style={[
                styles.validateButton,
                (!selectedProvider || !meterNumber || validating) && styles.validateButtonDisabled
              ]}
              onPress={validateMeter}
              disabled={!selectedProvider || !meterNumber || validating}
            >
              {validating ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.validateButtonText}>Validate</Text>
              )}
            </TouchableOpacity>
          </View>
          {errors.meterNumber && (
            <Text style={styles.errorText}>{errors.meterNumber}</Text>
          )}

          {/* Customer Name Display */}
          {customerName && (
            <View style={styles.customerInfoContainer}>
              <Ionicons
                name={customerName === 'Customer (Validation Warning)' ? "warning" : "checkmark-circle"}
                size={16}
                color={customerName === 'Customer (Validation Warning)' ? "#F59E0B" : "#10B981"}
              />
              <Text style={[
                styles.customerNameText,
                customerName === 'Customer (Validation Warning)' && styles.customerNameWarning
              ]}>
                {customerName}
              </Text>
              {customerName === 'Customer (Validation Warning)' && (
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert(
                      'Unverified Meter',
                      'The meter number may be invalid. Please ensure it is correct before proceeding.',
                      [{ text: 'OK', style: 'default' }]
                    );
                  }}
                  style={styles.infoIcon}
                >
                  <Ionicons name="information-circle" size={16} color="#F59E0B" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Phone Number Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phone Number</Text>
          <View style={[
            styles.inputContainer,
            errors.phoneNumber && styles.inputContainerError
          ]}>
            <TextInput
              style={styles.input}
              placeholder="Enter phone number"
              value={phoneNumber}
              onChangeText={handlePhoneChange}
              keyboardType="phone-pad"
              placeholderTextColor="#94A3B8"
            />
          </View>
          {errors.phoneNumber && (
            <Text style={styles.errorText}>{errors.phoneNumber}</Text>
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
              placeholder="Enter amount (Minimum ₦500)"
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
            {ELECTRICITY_AMOUNTS.map((amt) => (
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

              {/* Minimum amount warning */}
              {minPurchaseAmount > 0 && parseFloat(amount) < minPurchaseAmount && (
                <View style={styles.minAmountWarning}>
                  <Ionicons name="warning" size={14} color="#F59E0B" />
                  <Text style={styles.minAmountText}>
                    Minimum amount: ₦{formatAmount(minPurchaseAmount.toString())}
                  </Text>
                </View>
              )}

              {/* Commission Display */}
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
            (isSubmitting || !amount || !selectedProvider || !meterNumber || !phoneNumber || !customerName) && styles.proceedButtonDisabled
          ]}
          onPress={handleProceed}
          disabled={isSubmitting || !amount || !selectedProvider || !meterNumber || !phoneNumber || !customerName}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.proceedButtonText}>
              {!customerName ? 'Validate Meter First' :
                customerName === 'Customer (Validation Warning)' ? 'Proceed with Unverified Meter' :
                  'Proceed to Buy'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Additional Info */}
        <View style={styles.infoSection}>
          <Ionicons name="information-circle-outline" size={20} color="#64748B" />
          <Text style={styles.infoText}>
            {meterType === 'prepaid'
              ? 'Electricity token will be generated instantly after successful payment'
              : 'Postpaid bill payment will be processed within 24 hours'}
          </Text>
        </View>
        <View style={{ height: 320 }} />
      </ScrollView>

      {/* Confirmation Modal */}
      <ConfirmPurchaseModal
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={purchaseElectricity}
        title="Confirm Electricity Purchase"
        providerLogo={selectedProvider?.logoLocal}
        providerName={selectedProvider?.name}
        details={getConfirmationDetails()}
        amount={parseFloat(amount) || 0}
        commission={commission}
        loading={isSubmitting}
        confirmButtonText={meterType === 'prepaid' ? 'Buy Electricity Token' : 'Pay Electricity Bill'}
        infoNote={
          meterType === 'prepaid' 
            ? 'Electricity token will be generated instantly after successful payment' 
            : 'Postpaid bill payment will be processed within 24 hours'
        }
      />

      {/* Token Display Modal */}
      {tokenData && (
        <ElectricityTokenDisplay
          visible={showToken}
          onClose={handleCloseTokenDisplay}
          token={tokenData.token}
          units={tokenData.units}
          amount={tokenData.amount}
          meterNumber={tokenData.meterNumber}
          provider={tokenData.provider}
          customerName={tokenData.customerName}
          phoneNumber={tokenData.phoneNumber}
        />
      )}
    </View>
  );
}

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
  providersScrollContent: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 20,
  },
  providerCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    width: 100,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  providerCardSelected: {
    backgroundColor: '#F1F6FF',
    borderColor: '#1F54DD',
  },
  providerLogoContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  providerLogo: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  providerName: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
  },
  providerNameSelected: {
    color: '#1F54DD',
    fontFamily: 'Poppins-SemiBold',
  },
  meterTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  meterTypeButton: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  meterTypeButtonSelected: {
    backgroundColor: '#F1F6FF',
    borderColor: '#1F54DD',
  },
  meterTypeText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#64748B',
  },
  meterTypeTextSelected: {
    color: '#1F54DD',
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
  meterInputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  meterInputContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    justifyContent: 'center',
  },
  meterInput: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#0F172A',
  },
  validateButton: {
    backgroundColor: '#1F54DD',
    borderRadius: 12,
    paddingHorizontal: 20,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
  },
  validateButtonDisabled: {
    backgroundColor: '#94A3B8',
    opacity: 0.6,
  },
  validateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
  customerInfoContainer: {
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
  customerNameWarning: {
    color: '#F59E0B',
  },
  infoIcon: {
    marginLeft: 6,
    padding: 2,
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
  minAmountWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  minAmountText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#F59E0B',
    marginLeft: 6,
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
  // Add these new styles for the custom component
  providerValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerLogoSmall: {
    width: 20,
    height: 20,
    marginRight: 8,
    borderRadius: 10,
  },
  providerValueText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#0F172A',
  },
});