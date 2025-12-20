import { DataPlanModal } from '@/src/components/bills/DataPlanModal';
import { formatAmount } from '@/src/helper/util';
import { IMAGE_BASE_URL } from '@/src/services/api';
import { billService, DataPlan } from '@/src/services/billService';
import { CommissionConfig, commissionService } from '@/src/services/commissionService';
import { showError, showSuccess } from '@/src/utils/toast';
import { DataValidators } from '@/src/utils/validators/dataValidators';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
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

// Define networks with URL paths
const NETWORKS = [
  { 
    id: 'mtn', 
    name: 'MTN', 
    logo: `${IMAGE_BASE_URL}/mtn.png`, // Use URL instead of require
    logoLocal: require('../../../assets/images/mtn.png') // Keep local for display
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
  serviceID: network.id === 'mtn' ? 'mtn-data' :
    network.id === 'airtel' ? 'airtel-data' :
      network.id === 'glo' ? 'glo-data' : 'etisalat-data',
  logo: network.logo, // URL for backend
  logoLocal: network.logoLocal, // Local image for display
}));

export default function Data({ navigation }: { navigation: any }) {
  // State
  const [phone, setPhone] = useState('');
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dataPlans, setDataPlans] = useState<DataPlan[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedPlan, setSelectedPlan] = useState<DataPlan | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<(typeof NETWORK_OPTIONS)[0] | null>(null);
  
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
      const response = await commissionService.getCommissionConfig('Data');
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

  // Network selection handler
  const handleNetworkSelect = async (network: typeof NETWORK_OPTIONS[0]) => {
    setSelectedNetwork(network);
    setSelectedPlan(null);
    setDataPlans([]);
    clearFieldError('network');
    setCommission(0); // Reset commission when network changes

    // Fetch data plans for the selected network
    await fetchDataPlans(network.serviceID);
  };

  // Fetch data plans
  const fetchDataPlans = async (serviceID: string) => {
    if (!serviceID) {
      setDataPlans([]);
      return;
    }

    setLoading(true);
    try {
      const response = await billService.getDataPlans(serviceID);

      // Check if success is true and we have variations data
      if (response.success && response.content?.varations) {
        // Extract validity from plan name (e.g., "N100 100MB - 24 hrs" -> "24 hrs")
        const extractValidity = (name: string) => {
          const match = name.match(/- (\d+ (hrs|days|Month|Months|Year))$/i);
          return match ? match[1] : '';
        };

        // Map the variations to our DataPlan structure
        const plans = response.content.varations.map((plan: any) => {
          const validity = extractValidity(plan.name);
          return {
            variation_code: plan.variation_code || '',
            name: plan.name || '',
            variation_amount: plan.variation_amount || 0,
            validity: validity,
            description: plan.fixedPrice === "Yes" ? "Fixed Price" : ""
          };
        });
        setDataPlans(plans);
      } else if (response.success && response.content?.varations) {
        // Fallback to check variations (with correct spelling)
        const plans = response.content.varations.map((plan: any) => ({
          variation_code: plan.variation_code || '',
          name: plan.name || '',
          variation_amount: plan.variation_amount || 0,
          validity: '',
          description: plan.fixedPrice === "Yes" ? "Fixed Price" : ""
        }));
        setDataPlans(plans);
      } else {
        setDataPlans([]);
        showError('Info', 'No data plans available for this network');
      }
    } catch (error: any) {
      setDataPlans([]);
      showError('Error', error.message || 'Failed to fetch data plans');
    } finally {
      setLoading(false);
    }
  };

  // Data plan selection handler
  const handlePlanSelect = (plan: DataPlan) => {
    console.log('Selected data plan:', plan);
    setSelectedPlan(plan);
    clearFieldError('plan');
    setShowPlanModal(false); // Close modal after selection
    
    // Calculate commission for the selected plan
    calculateCommissionForPlan(Number(plan.variation_amount));
  };

  // Phone number change handler
  const handlePhoneChange = (text: string) => {
    setPhone(text);
    if (errors.phone) {
      clearFieldError('phone');
    }
  };

  // Form validation
  const validateForm = () => {
    const validation = DataValidators.validateDataForm({
      phone,
      network: selectedNetwork?.value || null,
      plan: selectedPlan?.variation_code || null
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

    return true;
  };

  // Purchase data
  const purchaseData = async () => {
    if (!validateForm()) {
      return { success: false };
    }

    if (!selectedNetwork || !selectedPlan) {
      showError('Error', 'Please select both network and data plan');
      return { success: false };
    }

    setIsSubmitting(true);

    try {
      const payload = {
        serviceID: selectedNetwork.serviceID,
        variation_code: selectedPlan.variation_code,
        customer: phone,
        type: 'Data',
        service_type: 'Data',
        provider_logo: selectedNetwork.logo, // Send URL to backend
        name: selectedPlan.name,
        billersCode: phone,
        phone: phone,
        amount: parseFloat(selectedPlan.variation_amount.toString()),
        // Include network info for better tracking
        network: selectedNetwork.value,
        network_name: selectedNetwork.name,
      };

      const response = await billService.purchaseData(payload);

      if (response.success) {
        // Alert.alert('Success', response.message || 'Data purchase successful!');
        showSuccess('Success', response.message || 'Data purchase successful!');
        navigation.navigate('Tabs');
        return { success: true, data: response.data };
      } else {
        showError('Error', response.message || 'Data purchase failed');
        return { success: false };
      }
    } catch (error: any) {
      console.error('Purchase error:', error);

      let errorMessage = 'Data purchase failed. Please try again.';

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
    const result = await purchaseData();
    if (result.success) {
      // Reset form
      setPhone('');
      setSelectedPlan(null);
      setSelectedNetwork(null);
      setDataPlans([]);
      setCommission(0);
    }
  };

  // Handle opening the data plan modal
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
        <Text style={styles.title}>Buy Data</Text>
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
                    source={network.logoLocal} // Use local image for display
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

        {/* Data Plan Selection */}
        {selectedNetwork && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Plan</Text>
            <TouchableOpacity
              style={[
                styles.dataPlanButton,
                errors.plan && styles.dataPlanButtonError
              ]}
              onPress={handleOpenPlanModal}
              disabled={dataPlans.length === 0 || loading}
            >
              <View style={styles.dataPlanButtonContent}>
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
                      styles.dataPlanPlaceholder,
                      loading && styles.dataPlanPlaceholderLoading
                    ]}>
                      {loading ? 'Loading plans...' : dataPlans.length === 0 ? 'No plans available' : 'Select Data Plan'}
                    </Text>
                    {!loading && dataPlans.length > 0 && (
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
            {selectedNetwork && dataPlans.length === 0 && !loading && (
              <Text style={styles.infoText}>
                No data plans available for {selectedNetwork.name}
              </Text>
            )}
          </View>
        )}

        {/* Amount Display with Commission */}
        {selectedPlan && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amount</Text>
            <View style={styles.amountContainer}>
              <Text style={styles.amountText}>
                ₦{formatAmount(selectedPlan.variation_amount)}
              </Text>
            </View>
            {/* Commission Display - Similar to web app */}
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

        {/* Phone Number Input */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Phone Number</Text>
            <TouchableOpacity onPress={() => { }}>
              <Text style={styles.beneficiaryLink}>Choose from saved</Text>
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
            <TouchableOpacity style={styles.contactButton} onPress={() => { }}>
              <Ionicons name="person-outline" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>
          {errors.phone && (
            <Text style={styles.errorText}>{errors.phone}</Text>
          )}
        </View>

        {/* Proceed Button */}
        <TouchableOpacity
          style={[
            styles.proceedButton,
            (isSubmitting || !selectedPlan) && styles.proceedButtonDisabled
          ]}
          onPress={handleProceed}
          disabled={isSubmitting || !selectedPlan}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.proceedButtonText}>
              {selectedPlan ? 'Buy Now' : 'Select Plan First'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Additional Info */}
        {/* <View style={styles.infoSection}>
          <Ionicons name="information-circle-outline" size={20} color="#64748B" />
          <Text style={styles.infoText}>
            Data will be delivered to the phone number within 1-3 minutes after successful payment
          </Text>
        </View> */}
        <View style={{ height: 320 }} />
      </ScrollView>

      {/* Data Plan Modal */}
      <DataPlanModal
        visible={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        dataPlans={dataPlans}
        selectedPlan={selectedPlan}
        onSelectPlan={handlePlanSelect}
        loading={loading}
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
  dataPlanButton: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
  },
  dataPlanButtonError: {
    borderColor: '#EF4444',
  },
  dataPlanButtonContent: {
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
  dataPlanPlaceholder: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#94A3B8',
  },
  dataPlanPlaceholderLoading: {
    fontFamily: 'Poppins-Medium',
    color: '#64748B',
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
  validityText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
    marginTop: 4,
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
});