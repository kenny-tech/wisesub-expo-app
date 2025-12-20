import { CablePlanModal } from '@/src/components/bills/CablePlanModal';
import { formatAmount } from '@/src/helper/util';
import { IMAGE_BASE_URL } from '@/src/services/api';
import { billService } from '@/src/services/billService';
import { CommissionConfig, commissionService } from '@/src/services/commissionService';
import { showError, showSuccess } from '@/src/utils/toast';
import { CableValidators } from '@/src/utils/validators/cableValidators';
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

// Define cable providers with URL paths
const PROVIDERS = [
  {
    id: 'dstv',
    name: 'DStv',
    logo: `${IMAGE_BASE_URL}/dstv.png`,
    logoLocal: require('../../../assets/images/dstv.png')
  },
  {
    id: 'gotv',
    name: 'GOtv',
    logo: `${IMAGE_BASE_URL}/gotv.png`,
    logoLocal: require('../../../assets/images/gotv.png')
  },
  {
    id: 'startimes',
    name: 'Startimes',
    logo: `${IMAGE_BASE_URL}/startimes.png`,
    logoLocal: require('../../../assets/images/startimes.png')
  },
];

// Map providers to service structure
const PROVIDER_OPTIONS = PROVIDERS.map(provider => ({
  value: provider.id,
  name: provider.name,
  serviceID: provider.id,
  logo: provider.logo,
  logoLocal: provider.logoLocal,
}));

export interface CablePlan {
  variation_code: string;
  name: string;
  variation_amount: string | number;
  description?: string;
}

export default function CableTv({ navigation }: { navigation: any }) {
  // State
  const [decoderNumber, setDecoderNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validating, setValidating] = useState(false);
  const [cablePlans, setCablePlans] = useState<CablePlan[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedPlan, setSelectedPlan] = useState<CablePlan | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<(typeof PROVIDER_OPTIONS)[0] | null>(null);
  const [customerName, setCustomerName] = useState<string>('');
  const [subscriptionType, setSubscriptionType] = useState<'renewal' | 'change'>('renewal');

  // Commission state
  const [commissionConfig, setCommissionConfig] = useState<CommissionConfig | null>(null);
  const [commission, setCommission] = useState<number>(0);
  const [loadingCommission, setLoadingCommission] = useState<boolean>(false);

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
      const response = await commissionService.getCommissionConfig('Cabletv');
      if (response.success && response.data) {
        setCommissionConfig(response.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch commission config:', error);
    } finally {
      setLoadingCommission(false);
    }
  };

  // Calculate commission when plan changes
  const calculateCommissionForPlan = (planAmount: number) => {
    if (!commissionConfig || planAmount <= 0) {
      setCommission(0);
      return;
    }

    const calculatedCommission = commissionService.calculateCommission(
      planAmount,
      commissionConfig
    );
    setCommission(calculatedCommission);
  };

  // Provider selection handler
  const handleProviderSelect = async (provider: typeof PROVIDER_OPTIONS[0]) => {
    setSelectedProvider(provider);
    setSelectedPlan(null);
    setCablePlans([]);
    setDecoderNumber('');
    setCustomerName('');
    clearFieldError('provider');
    setCommission(0);

    // Fetch cable plans for the selected provider
    await fetchCablePlans(provider.serviceID);
  };

  // Fetch cable plans
  const fetchCablePlans = async (serviceID: string) => {
    if (!serviceID) {
      setCablePlans([]);
      return;
    }

    setLoading(true);
    try {
      const response = await billService.getDataPlans(serviceID); // Using same endpoint as data

      if (response.success && response.content?.varations) {
        const plans = response.content.varations.map((plan: any) => ({
          variation_code: plan.variation_code || '',
          name: plan.name || '',
          variation_amount: plan.variation_amount || 0,
          description: plan.description || ''
        }));
        setCablePlans(plans);
      } else {
        setCablePlans([]);
        showError('Info', 'No cable plans available for this provider');
      }
    } catch (error: any) {
      setCablePlans([]);
      showError('Error', error.message || 'Failed to fetch cable plans');
    } finally {
      setLoading(false);
    }
  };

  // Cable plan selection handler
  const handlePlanSelect = (plan: CablePlan) => {
    setSelectedPlan(plan);
    setAmount(plan.variation_amount.toString());
    clearFieldError('plan');
    setShowPlanModal(false);

    // Calculate commission for the selected plan
    calculateCommissionForPlan(Number(plan.variation_amount));
  };

  // Decoder number change handler
  const handleDecoderChange = (text: string) => {
    setDecoderNumber(text);
    setCustomerName(''); // Clear customer name when decoder changes
    if (errors.decoderNumber) {
      clearFieldError('decoderNumber');
    }
  };

  // Phone number change handler
  const handlePhoneChange = (text: string) => {
    setPhoneNumber(text);
    if (errors.phoneNumber) {
      clearFieldError('phoneNumber');
    }
  };

  // Validate decoder number
  const validateDecoder = async () => {
    if (!selectedProvider) {
      showError('Error', 'Please select a provider first');
      return;
    }

    if (!decoderNumber.trim()) {
      setErrors(prev => ({ ...prev, decoderNumber: 'Decoder number is required' }));
      showError('Error', 'Decoder number is required');
      return;
    }

    if (!/^\d{10,}$/.test(decoderNumber.trim())) {
      setErrors(prev => ({ ...prev, decoderNumber: 'Please enter a valid decoder number (min 10 digits)' }));
      showError('Error', 'Please enter a valid decoder number (min 10 digits)');
      return;
    }

    setValidating(true);
    setCustomerName(''); // Clear any existing customer name

    try {
      const response = await billService.validateDecoder({
        serviceID: selectedProvider.serviceID,
        billersCode: decoderNumber,
      });

      console.log('Validation response:', response);

      if (response.success && response.data?.code === "000") {
        // Check if there's an error message in content
        if (response.data.content?.error) {
          // This is a special case: API returns success but with error message
          // Ask user to confirm if they want to proceed
          Alert.alert(
            'Decoder Validation',
            response.data.content.error,
            [
              {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => {
                  setErrors(prev => ({ ...prev, decoderNumber: 'Decoder may be invalid' }));
                  setCustomerName('');
                }
              },
              {
                text: 'Proceed Anyway',
                style: 'destructive',
                onPress: () => {
                  // User wants to proceed despite the warning
                  setCustomerName('Customer (Unverified)');
                  setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.decoderNumber;
                    return newErrors;
                  });
                  showError('Warning', 'Proceeding with unverified decoder. Please ensure the decoder number is correct.');
                }
              }
            ]
          );
        } else if (response.data.content?.Customer_Name) {
          // Valid decoder with customer name
          setCustomerName(response.data.content.Customer_Name);
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.decoderNumber;
            return newErrors;
          });
          Alert.alert('Success', 'Decoder number validated successfully!');
        } else {
          // Valid decoder but no customer name
          setCustomerName('Customer');
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.decoderNumber;
            return newErrors;
          });
          Alert.alert('Success', 'Decoder number validated successfully!');
        }
      } else {
        // Validation failed
        const errorMessage = response.data?.content?.error ||
          response.message ||
          'Invalid decoder number';

        setErrors(prev => ({ ...prev, decoderNumber: errorMessage }));
        setCustomerName('');
        showError('Validation Failed', errorMessage);
      }
    } catch (error: any) {
      console.error('Validation error:', error);
      setErrors(prev => ({
        ...prev,
        decoderNumber: error.message || 'Validation failed. Please try again.'
      }));
      setCustomerName('');
      showError('Error', 'Validation failed. Please try again.');
    } finally {
      setValidating(false);
    }
  };

  // Form validation
  const validateForm = () => {
    const validation = CableValidators.validateCableForm({
      decoderNumber,
      provider: selectedProvider?.value || null,
      plan: selectedPlan?.variation_code || null,
      phoneNumber,
      amount,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);

      // Show first error in toast
      const firstError = Object.values(validation.errors)[0];
      if (firstError) {
        showError('Validation Error', firstError);
      }

      return false;
    }

    // Additional validation: decoder must be validated
    // But we allow proceeding even with warning (when customerName is "Customer (Unverified)")
    if (!customerName) {
      showError('Error', 'Please validate your decoder number first');
      return false;
    }

    return true;
  };

  // Purchase cable subscription
  const purchaseCable = async () => {
    if (!validateForm()) {
      return { success: false };
    }

    if (!selectedProvider || !selectedPlan) {
      showError('Error', 'Please select both provider and cable plan');
      return { success: false };
    }

    setIsSubmitting(true);

    try {
      const payload = {
        serviceID: selectedProvider.serviceID,
        variation_code: selectedPlan.variation_code,
        customer: decoderNumber,
        type: 'CableTV',
        service_type: 'CableTV',
        provider_logo: selectedProvider.logo,
        name: selectedPlan.name,
        amount: parseFloat(amount),
        billersCode: decoderNumber,
        phone: phoneNumber,
        subscription_type: subscriptionType,
        customer_name: customerName,
        // Add validation status
        validation_status: customerName === 'Customer (Unverified)' ? 'warning' : 'validated',
        validation_message: customerName === 'Customer (Unverified)' ? 'Decoder may be invalid, user confirmed' : 'Validated successfully',
      };

      console.log('Cable purchase payload:', payload);

      const response = await billService.purchaseData(payload);

      if (response.success) {
        // Alert.alert('Success', response.message || 'Cable subscription successful!');
        showSuccess('Success', response.message || 'Cable subscription successful!');
      
        navigation.navigate('Tabs');
        return { success: true, data: response.data };
      } else {
        showError('Error', response.message || 'Cable subscription failed');
        return { success: false };
      }
    } catch (error: any) {
      console.error('Cable purchase error:', error);

      let errorMessage = 'Cable subscription failed. Please try again.';

      if (error.errors) {
        const apiErrors: Record<string, string> = {};
        Object.entries(error.errors).forEach(([field, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) {
            apiErrors[field] = messages[0];
          }
        });
        setErrors(apiErrors);

        // Show first error in toast
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

      return { success: false, message: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  };

  // Proceed button handler
  const handleProceed = async () => {
    const result = await purchaseCable();
    if (result.success) {
      // Reset form
      setDecoderNumber('');
      setPhoneNumber('');
      setAmount('');
      setSelectedPlan(null);
      setSelectedProvider(null);
      setCustomerName('');
      setCommission(0);
    }
  };

  // Handle opening the cable plan modal
  const handleOpenPlanModal = () => {
    setShowPlanModal(true);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.title}>Cable TV</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Provider Selection Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Provider</Text>
          <View style={styles.providersContainer}>
            {PROVIDER_OPTIONS.map((provider) => (
              <TouchableOpacity
                key={provider.value}
                style={[
                  styles.providerCard,
                  selectedProvider?.value === provider.value && styles.providerCardSelected
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
                  selectedProvider?.value === provider.value && styles.providerNameSelected
                ]} numberOfLines={1}>
                  {provider.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.provider && (
            <Text style={styles.errorText}>{errors.provider}</Text>
          )}
        </View>

        {/* Cable Plan Selection */}
        {selectedProvider && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cable Plan</Text>
            <TouchableOpacity
              style={[
                styles.planButton,
                errors.plan && styles.planButtonError
              ]}
              onPress={handleOpenPlanModal}
              disabled={cablePlans.length === 0 || loading}
            >
              <View style={styles.planButtonContent}>
                {selectedPlan ? (
                  <>
                    <View style={styles.selectedPlanInfo}>
                      <Text style={styles.selectedPlanName} numberOfLines={1}>
                        {selectedPlan.name}
                      </Text>
                      <Text style={styles.selectedPlanPrice}>
                        ₦{formatAmount(selectedPlan.variation_amount)}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#1F54DD" />
                  </>
                ) : (
                  <>
                    <Text style={[
                      styles.planPlaceholder,
                      loading && styles.planPlaceholderLoading
                    ]}>
                      {loading ? 'Loading plans...' : cablePlans.length === 0 ? 'No plans available' : 'Select Cable Plan'}
                    </Text>
                    {!loading && cablePlans.length > 0 && (
                      <Ionicons name="chevron-down" size={20} color="#94A3B8" />
                    )}
                    {loading && (
                      <ActivityIndicator size="small" color="#64748B" />
                    )}
                  </>
                )}
              </View>
            </TouchableOpacity>
            {errors.plan && (
              <Text style={styles.errorText}>{errors.plan}</Text>
            )}
            {selectedProvider && cablePlans.length === 0 && !loading && (
              <Text style={styles.infoText}>
                No cable plans available for {selectedProvider.name}
              </Text>
            )}
          </View>
        )}

        {/* Subscription Type Selection */}
        {selectedProvider && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Subscription Type</Text>
            <View style={styles.subscriptionTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.subscriptionTypeButton,
                  subscriptionType === 'renewal' && styles.subscriptionTypeButtonSelected
                ]}
                onPress={() => setSubscriptionType('renewal')}
              >
                <Text style={[
                  styles.subscriptionTypeText,
                  subscriptionType === 'renewal' && styles.subscriptionTypeTextSelected
                ]}>
                  Renewal
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.subscriptionTypeButton,
                  subscriptionType === 'change' && styles.subscriptionTypeButtonSelected
                ]}
                onPress={() => setSubscriptionType('change')}
              >
                <Text style={[
                  styles.subscriptionTypeText,
                  subscriptionType === 'change' && styles.subscriptionTypeTextSelected
                ]}>
                  Change Package
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Amount Display with Commission */}
        {selectedPlan && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amount</Text>
            <View style={styles.amountContainer}>
              <Text style={styles.amountText}>
                ₦{formatAmount(amount)}
              </Text>
            </View>
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

        {/* Decoder Number Input with Validation */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Decoder Number</Text>
            <TouchableOpacity onPress={() => { /* Implement beneficiary selection */ }}>
              <Text style={styles.beneficiaryLink}>Choose from saved</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.decoderInputRow}>
            <View style={[
              styles.decoderInputContainer,
              errors.decoderNumber && styles.inputContainerError
            ]}>
              <TextInput
                style={styles.decoderInput}
                placeholder="Enter decoder number"
                value={decoderNumber}
                onChangeText={handleDecoderChange}
                keyboardType="number-pad"
                maxLength={20}
                placeholderTextColor="#94A3B8"
              />
            </View>
            <TouchableOpacity
              style={[
                styles.validateButton,
                (!selectedProvider || !decoderNumber || validating) && styles.validateButtonDisabled
              ]}
              onPress={validateDecoder}
              disabled={!selectedProvider || !decoderNumber || validating}
            >
              {validating ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.validateButtonText}>Validate</Text>
              )}
            </TouchableOpacity>
          </View>
          {errors.decoderNumber && (
            <Text style={styles.errorText}>{errors.decoderNumber}</Text>
          )}

          {/* Customer Name Display */}
          {customerName && (
            <View style={styles.customerInfoContainer}>
              <Ionicons
                name={customerName === 'Customer (Unverified)' ? "warning" : "checkmark-circle"}
                size={16}
                color={customerName === 'Customer (Unverified)' ? "#F59E0B" : "#10B981"}
              />
              <Text style={[
                styles.customerNameText,
                customerName === 'Customer (Unverified)' && styles.customerNameWarning
              ]}>
                {customerName}
              </Text>
              {customerName === 'Customer (Unverified)' && (
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert(
                      'Unverified Decoder',
                      'The decoder number may be invalid. Please ensure it is correct before proceeding.',
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

        {/* Proceed Button */}
        <TouchableOpacity
          style={[
            styles.proceedButton,
            (isSubmitting || !selectedPlan || !customerName) && styles.proceedButtonDisabled
          ]}
          onPress={handleProceed}
          disabled={isSubmitting || !selectedPlan || !customerName}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.proceedButtonText}>
              {!customerName ? 'Validate Decoder First' : 'Subscribe Now'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Additional Info */}
        {/* <View style={styles.infoSection}>
          <Ionicons name="information-circle-outline" size={20} color="#64748B" />
          <Text style={styles.infoText}>
            Cable subscription will be activated within 2-5 minutes after successful payment
          </Text>
        </View> */}
        <View style={{ height: 320 }} />
      </ScrollView>

      {/* Cable Plan Modal */}
      <CablePlanModal
        visible={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        cablePlans={cablePlans}
        selectedPlan={selectedPlan}
        onSelectPlan={handlePlanSelect}
        loading={loading}
        providerName={selectedProvider?.name}
      />
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
  providersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  providerCard: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    width: (width - 80) / 3,
    height: 100,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  providerCardSelected: {
    borderColor: '#1F54DD',
    backgroundColor: '#F1F6FF',
  },
  providerLogoContainer: {
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
  providerLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  providerName: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#64748B',
    textAlign: 'center',
  },
  providerNameSelected: {
    color: '#1F54DD',
    fontFamily: 'Poppins-SemiBold',
  },
  planButton: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
  },
  planButtonError: {
    borderColor: '#EF4444',
  },
  planButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedPlanInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedPlanName: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#0F172A',
    flex: 1,
    marginRight: 12,
  },
  selectedPlanPrice: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1F54DD',
  },
  planPlaceholder: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#94A3B8',
  },
  planPlaceholderLoading: {
    fontFamily: 'Poppins-Medium',
    color: '#64748B',
  },
  subscriptionTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  subscriptionTypeButton: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  subscriptionTypeButtonSelected: {
    backgroundColor: '#F1F6FF',
    borderColor: '#1F54DD',
  },
  subscriptionTypeText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#64748B',
  },
  subscriptionTypeTextSelected: {
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
  decoderInputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  decoderInputContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    justifyContent: 'center',
  },
  decoderInput: {
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
  amountContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    justifyContent: 'center',
  },
  amountText: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#10B981',
  },
  // Commission styles
  commissionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
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
  customerNameWarning: {
    color: '#F59E0B',
  },
  infoIcon: {
    marginLeft: 6,
    padding: 2,
  },
});