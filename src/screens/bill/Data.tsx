import { ConfirmPurchaseModal, PurchaseDetail } from '@/src/components/bills/ConfirmPurchaseModal';
import { DataPlanModal } from '@/src/components/bills/DataPlanModal';
import { formatAmount } from '@/src/helper/util';
import { IMAGE_BASE_URL } from '@/src/services/api';
import { billService, DataPlan } from '@/src/services/billService';
import { CommissionConfig, commissionService } from '@/src/services/commissionService';
import { RecentCustomer, walletService } from '@/src/services/walletService'; // Import the service
import { showError, showSuccess } from '@/src/utils/toast';
import { DataValidators } from '@/src/utils/validators/dataValidators';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
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

const { width } = Dimensions.get('window');

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
  serviceID: network.id === 'mtn' ? 'mtn-data' :
    network.id === 'airtel' ? 'airtel-data' :
      network.id === 'glo' ? 'glo-data' : 'etisalat-data',
  logo: network.logo,
  logoLocal: network.logoLocal,
}));

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

export default function Data({ navigation }: { navigation: any }) {
  // State
  const [phone, setPhone] = useState('');
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
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

  // Recent customers state
  const [showRecentModal, setShowRecentModal] = useState(false);
  const [recentCustomers, setRecentCustomers] = useState<RecentCustomer[]>([]);
  const [loadingRecentCustomers, setLoadingRecentCustomers] = useState(false);

  const type = 'Data';

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
    setCommission(0);

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

      if (response.success && response.content?.varations) {
        const extractValidity = (name: string) => {
          const match = name.match(/- (\d+ (hrs|days|Month|Months|Year))$/i);
          return match ? match[1] : '';
        };

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
    setSelectedPlan(plan);
    clearFieldError('plan');
    setShowPlanModal(false);
    
    calculateCommissionForPlan(Number(plan.variation_amount));
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
        type: 'Data',
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
    const validation = DataValidators.validateDataForm({
      phone,
      network: selectedNetwork?.value || null,
      plan: selectedPlan?.variation_code || null
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
    
    if (!selectedNetwork || !selectedPlan) {
      showError('Error', 'Please select both network and data plan');
      return;
    }

    setShowConfirmModal(true);
  };

  // Purchase data (called from confirmation modal)
  const purchaseData = async () => {
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
        type: type,
        service_type: type,
        provider_logo: selectedNetwork.logo,
        name: selectedPlan.name,
        billersCode: phone,
        phone: phone,
        amount: parseFloat(selectedPlan.variation_amount.toString()),
        network: selectedNetwork.value,
        network_name: selectedNetwork.name,
      };

      const response = await billService.purchaseData(payload);

      if (response.success) {
        showSuccess('Success', response.message || 'Data purchase successful!');
        
        // Reset form
        setPhone('');
        setSelectedPlan(null);
        setSelectedNetwork(null);
        setDataPlans([]);
        setCommission(0);
        
        setShowConfirmModal(false);
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
    
    if (selectedPlan) {
      details.push({
        label: 'Data Plan',
        value: selectedPlan.name,
        icon: 'layers-outline',
        iconColor: '#64748B',
        valueColor: '#0F172A',
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
    
    if (selectedPlan?.validity) {
      details.push({
        label: 'Validity',
        value: selectedPlan.validity,
        icon: 'time-outline',
        iconColor: '#64748B',
      });
    }
    
    return details;
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
              {selectedPlan ? 'Proceed to Buy' : 'Select Plan First'}
            </Text>
          )}
        </TouchableOpacity>

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
        onConfirm={purchaseData}
        title="Confirm Data Purchase"
        providerLogo={selectedNetwork?.logoLocal}
        providerName={selectedNetwork?.name}
        details={getConfirmationDetails()}
        amount={selectedPlan ? parseFloat(selectedPlan.variation_amount.toString()) : 0}
        commission={commission}
        loading={isSubmitting}
        confirmButtonText="Buy Data"
        infoNote="Data will be delivered within 1-3 minutes after successful payment"
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
});