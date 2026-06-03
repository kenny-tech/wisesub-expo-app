import { ConfirmPurchaseModal, PurchaseDetail } from '@/src/components/bills/ConfirmPurchaseModal';
import { DataPlanModal } from '@/src/components/bills/DataPlanModal';
import { formatAmount } from '@/src/helper/util';
import { IMAGE_BASE_URL } from '@/src/services/api';
import { billService, DataPlan } from '@/src/services/billService';
import { CommissionConfig, commissionService } from '@/src/services/commissionService';
import { RecentCustomer, walletService } from '@/src/services/walletService';
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
import { useTheme } from '../../theme/ThemeContext';

const { width } = Dimensions.get('window');

// Define base networks with URL paths
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

// Regular network options (VTPass)
const REGULAR_NETWORK_OPTIONS = NETWORKS.map(network => ({
  value: network.id,
  name: network.name,
  serviceID: network.id === 'mtn' ? 'mtn-data' :
    network.id === 'airtel' ? 'airtel-data' :
      network.id === 'glo' ? 'glo-data' : 'etisalat-data',
  logo: network.logo,
  logoLocal: network.logoLocal,
  isAwuf: false,
  providerCode: null,
  originalNetwork: network.id,
}));

// AWUF network options
const AWUF_NETWORK_OPTIONS = [
  {
    value: 'mtn-awuf',
    name: 'MTN AWUF',
    originalNetwork: 'mtn',
    logo: `${IMAGE_BASE_URL}/mtn.png`,
    logoLocal: require('../../../assets/images/mtn.png'),
    providerCode: 'mtn-awuf-data',
    serviceID: null,
    isAwuf: true,
  },
  {
    value: 'airtel-awuf',
    name: 'Airtel AWUF',
    originalNetwork: 'airtel',
    logo: `${IMAGE_BASE_URL}/airtel.png`,
    logoLocal: require('../../../assets/images/airtel.png'),
    providerCode: 'airtel-awuf-data',
    serviceID: null,
    isAwuf: true,
  },
  {
    value: 'glo-awuf',
    name: 'Glo AWUF',
    originalNetwork: 'glo',
    logo: `${IMAGE_BASE_URL}/glo.png`,
    logoLocal: require('../../../assets/images/glo.png'),
    providerCode: 'gloawufdata',
    serviceID: null,
    isAwuf: true,
  },
];

export default function Data({ navigation }: { navigation: any }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const modalStyles = makeModalStyles(colors);

  // State
  const [phone, setPhone] = useState('');
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dataPlans, setDataPlans] = useState<DataPlan[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedPlan, setSelectedPlan] = useState<DataPlan | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<any | null>(null);

  // Commission state - only for VTPass
  const [commissionConfig, setCommissionConfig] = useState<CommissionConfig | null>(null);
  const [commission, setCommission] = useState<number>(0);
  const [loadingCommission, setLoadingCommission] = useState<boolean>(false);

  // AWUF specific state
  const [isAwuf, setIsAwuf] = useState<boolean>(false);
  const [additionalAmount, setAdditionalAmount] = useState<number>(30);

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

  // Fetch commission configuration for VTPass
  useEffect(() => {
    fetchCommissionConfig('Data');
  }, []);

  // Fetch AidaPay pricing config
  useEffect(() => {
    fetchAwufPricingConfig();
  }, []);

  // Fetch commission configuration
  const fetchCommissionConfig = async (type: string) => {
    setLoadingCommission(true);
    try {
      const response = await commissionService.getCommissionConfig(type);
      if (response.success && response.data) {
        setCommissionConfig(response.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch commission config:', error);
    } finally {
      setLoadingCommission(false);
    }
  };

  // Fetch AidaPay pricing config
  const fetchAwufPricingConfig = async () => {
    try {
      const response = await billService.getAwufPricingConfig();
      if (response.success && response.data) {
        setAdditionalAmount(response.data.additional_amount);
      }
    } catch (error: any) {
      console.error('Failed to fetch AidaPay config:', error);
    }
  };

  // Calculate commission only for VTPass plans
  const calculateCommissionForPlan = (planAmount: number) => {
    if (!commissionConfig || planAmount <= 0 || isAwuf) {
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
  const handleNetworkSelect = async (network: any) => {
    setSelectedNetwork(network);
    setSelectedPlan(null);
    setDataPlans([]);
    clearFieldError('network');
    setCommission(0);

    // Set AWUF flag
    setIsAwuf(network.isAwuf || false);

    // Fetch data plans based on network type
    if (network.isAwuf) {
      await fetchAwufDataPlans(network.providerCode);
    } else {
      await fetchDataPlans(network.serviceID);
    }
  };

  // Fetch regular data plans
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
            description: plan.fixedPrice === "Yes" ? "Fixed Price" : "",
            isAwuf: false
          };
        });
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

  // Fetch AWUF data plans
  const fetchAwufDataPlans = async (providerCode: string) => {
    if (!providerCode) {
      setDataPlans([]);
      return;
    }

    setLoading(true);
    try {
      const response = await billService.getAwufDataPlans(providerCode);

      if (response.success && response.data) {
        const sorted = [...response.data].sort((a, b) => {
          const aIsAwuf = a.package_name?.toLowerCase().includes('awuf') ? 0 : 1;
          const bIsAwuf = b.package_name?.toLowerCase().includes('awuf') ? 0 : 1;
          return aIsAwuf - bIsAwuf;
        });

        setDataPlans(sorted);
      } else {
        setDataPlans([]);
        showError('Info', 'No AWUF plans available for this network');
      }
    } catch (error: any) {
      setDataPlans([]);
      showError('Error', error.message || 'Failed to fetch AWUF plans');
    } finally {
      setLoading(false);
    }
  };

  // Data plan selection handler
  const handlePlanSelect = (plan: DataPlan) => {
    setSelectedPlan(plan);
    clearFieldError('plan');
    setShowPlanModal(false);

    // Calculate commission only for VTPass plans
    if (!plan.isAwuf) {
      const planAmount = parseFloat(plan.variation_amount?.toString() || '0');
      calculateCommissionForPlan(planAmount);
    } else {
      setCommission(0);
    }
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
        type: isAwuf ? 'AwufData' : 'Data',
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
      plan: selectedPlan?.isAwuf ? selectedPlan?.package_api_code || null : selectedPlan?.variation_code || null
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

  // Purchase data
  const purchaseData = async () => {
    if (!selectedNetwork || !selectedPlan) {
      showError('Error', 'Please select both network and data plan');
      return { success: false };
    }

    setIsSubmitting(true);

    try {
      let payload: any = {};

      if (isAwuf) {
        // AWUF Data payload
        payload = {
          type: "AwufData",
          service_type: "AwufData",
          name: selectedPlan.package_name || "AwufData Plan",
          provider_logo: selectedNetwork.logo,
          customer: phone,
          phone: phone,
          amount: parseFloat(selectedPlan.price?.toString() || '0'),
          provider_code: selectedNetwork.providerCode,
          package_code: selectedPlan.package_api_code,
          network: selectedNetwork.originalNetwork,
          network_name: selectedNetwork.name,
        };
      } else {
        // Regular Data payload
        payload = {
          serviceID: selectedNetwork.serviceID,
          variation_code: selectedPlan.variation_code,
          customer: phone,
          type: "Data",
          service_type: "Data",
          provider_logo: selectedNetwork.logo,
          name: selectedPlan.name,
          billersCode: phone,
          phone: phone,
          amount: parseFloat(selectedPlan.variation_amount?.toString() || '0'),
          network: selectedNetwork.value,
          network_name: selectedNetwork.name,
        };
      }

      const response = await billService.purchaseData(payload);

      if (response.success) {
        const successMessage = isAwuf
          ? "AWUF data purchased successfully! Dial *323*4# or *323*1# to check your data balance"
          : response.message || 'Data purchase successful!';

        showSuccess('Success', successMessage);

        // Reset form
        setPhone('');
        setSelectedPlan(null);
        setSelectedNetwork(null);
        setDataPlans([]);
        setCommission(0);
        setIsAwuf(false);

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
      const planName = isAwuf ? selectedPlan.package_name : selectedPlan.name;
      details.push({
        label: 'Data Plan',
        value: planName || '',
        icon: 'layers-outline',
        iconColor: colors.textSecondary,
        valueColor: colors.textPrimary,
      });
    }

    if (phone) {
      details.push({
        label: 'Phone Number',
        value: phone,
        icon: 'call-outline',
        iconColor: colors.textSecondary,
      });
    }

    if (selectedPlan?.validity && !isAwuf) {
      details.push({
        label: 'Validity',
        value: selectedPlan.validity,
        icon: 'time-outline',
        iconColor: colors.textSecondary,
      });
    }

    if (isAwuf) {
      details.push({
        label: 'Plan Type',
        value: 'AWUF Data',
        icon: 'flash-outline',
        iconColor: '#F59E0B',
      });
    }

    return details;
  };

  // Get amount for confirmation modal
  const getAmount = (): number => {
    if (!selectedPlan) return 0;
    if (isAwuf) {
      return parseFloat(selectedPlan.price?.toString() || '0');
    }
    return parseFloat(selectedPlan.variation_amount?.toString() || '0');
  };

  // Recent Customers Modal (now inside component to access colors)
  function RecentCustomersModalInner({ visible, onClose, customers, loading, onSelectCustomer }: {
    visible: boolean; onClose: () => void; customers: RecentCustomer[];
    loading: boolean; onSelectCustomer: (c: string) => void;
  }) {
    const renderCustomer = ({ item }: { item: RecentCustomer }) => (
      <TouchableOpacity
        style={modalStyles.customerItem}
        onPress={() => onSelectCustomer(item.customer)}
      >
        <View style={modalStyles.customerIcon}>
          <Ionicons name="person-circle-outline" size={24} color={colors.primary} />
        </View>
        <View style={modalStyles.customerInfo}>
          <Text style={[modalStyles.customerPhone, { color: colors.textPrimary }]}>{item.customer}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
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
          <View style={[modalStyles.container, { backgroundColor: colors.card }]}>
            <View style={[modalStyles.header, { borderBottomColor: colors.separator }]}>
              <Text style={[modalStyles.title, { color: colors.textPrimary }]}>Recent Customers</Text>
              <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[modalStyles.subtitle, { color: colors.textSecondary }]}>
              Select a phone number from your recent purchases
            </Text>

            {loading ? (
              <View style={modalStyles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[modalStyles.loadingText, { color: colors.textSecondary }]}>Loading recent customers...</Text>
              </View>
            ) : customers.length === 0 ? (
              <View style={modalStyles.emptyContainer}>
                <Ionicons name="people-outline" size={48} color={colors.textMuted} />
                <Text style={[modalStyles.emptyTitle, { color: colors.textSecondary }]}>No Recent Customers</Text>
                <Text style={[modalStyles.emptyDescription, { color: colors.textMuted }]}>
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

  return (
    <View style={styles.container}>
      <View style={[styles.header, { borderBottomColor: colors.separator }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Buy Data</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Network Selection Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Select Network</Text>

          {/* AWUF Networks Row */}
          <Text style={[styles.subSectionTitle, { color: colors.textSecondary }]}>AWUF Plans</Text>
          <View style={styles.networksRow}>
            {AWUF_NETWORK_OPTIONS.map((network) => (
              <TouchableOpacity
                key={network.value}
                style={[
                  styles.networkCard,
                  { backgroundColor: colors.backgroundSecondary },
                  selectedNetwork?.value === network.value && { borderColor: colors.primary, backgroundColor: colors.primaryLight }
                ]}
                onPress={() => handleNetworkSelect(network)}
                activeOpacity={0.7}
              >
                <View style={[styles.networkLogoContainer, { backgroundColor: colors.card }]}>
                  <Image
                    source={network.logoLocal}
                    style={styles.networkLogo}
                    resizeMode="contain"
                  />
                </View>
                <Text style={[
                  styles.networkName,
                  { color: colors.textSecondary },
                  selectedNetwork?.value === network.value && { color: colors.primary, fontFamily: 'Poppins-SemiBold' }
                ]} numberOfLines={1}>
                  {network.name}
                </Text>
                <View style={styles.awufBadge}>
                  <Text style={styles.awufBadgeText}>AWUF</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Regular Networks Row */}
          <Text style={[styles.subSectionTitle, { color: colors.textSecondary, marginTop: 16 }]}>Regular Plans</Text>
          <View style={styles.networksRow}>
            {REGULAR_NETWORK_OPTIONS.map((network) => (
              <TouchableOpacity
                key={network.value}
                style={[
                  styles.networkCard,
                  { backgroundColor: colors.backgroundSecondary },
                  selectedNetwork?.value === network.value && { borderColor: colors.primary, backgroundColor: colors.primaryLight }
                ]}
                onPress={() => handleNetworkSelect(network)}
                activeOpacity={0.7}
              >
                <View style={[styles.networkLogoContainer, { backgroundColor: colors.card }]}>
                  <Image
                    source={network.logoLocal}
                    style={styles.networkLogo}
                    resizeMode="contain"
                  />
                </View>
                <Text style={[
                  styles.networkName,
                  { color: colors.textSecondary },
                  selectedNetwork?.value === network.value && { color: colors.primary, fontFamily: 'Poppins-SemiBold' }
                ]} numberOfLines={1}>
                  {network.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {errors.network && (
            <Text style={[styles.errorText, { color: colors.error }]}>{errors.network}</Text>
          )}
        </View>

        {/* Data Plan Selection */}
        {selectedNetwork && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Data Plan</Text>
            <TouchableOpacity
              style={[
                styles.dataPlanButton,
                { backgroundColor: colors.backgroundSecondary, borderColor: errors.plan ? colors.error : colors.divider },
                errors.plan && styles.dataPlanButtonError
              ]}
              onPress={() => setShowPlanModal(true)}
              disabled={dataPlans.length === 0 || loading}
            >
              <View style={styles.dataPlanButtonContent}>
                {selectedPlan ? (
                  <>
                    <View style={styles.selectedPlanInfo}>
                      <Text style={[styles.selectedPlanName, { color: colors.textPrimary }]} numberOfLines={1}>
                        {isAwuf ? selectedPlan.package_name : selectedPlan.name}
                      </Text>
                      <Text style={[styles.selectedPlanPrice, { color: colors.primary }]}>
                        ₦{formatAmount(
                          isAwuf
                            ? (selectedPlan.price || 0)
                            : (selectedPlan.variation_amount || 0)
                        )}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.primary} />
                  </>
                ) : (
                  <>
                    <Text style={[
                      styles.dataPlanPlaceholder,
                      { color: colors.textMuted },
                      loading && { color: colors.textSecondary }
                    ]}>
                      {loading ? 'Loading plans...' : dataPlans.length === 0 ? 'No plans available' : 'Select Data Plan'}
                    </Text>
                    {!loading && dataPlans.length > 0 && (
                      <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
                    )}
                    {loading && (
                      <ActivityIndicator size="small" color={colors.textSecondary} />
                    )}
                  </>
                )}
              </View>
            </TouchableOpacity>
            {errors.plan && (
              <Text style={[styles.errorText, { color: colors.error }]}>{errors.plan}</Text>
            )}
            {selectedNetwork && dataPlans.length === 0 && !loading && (
              <Text style={[styles.infoText, { color: colors.textMuted }]}>
                No plans available for {selectedNetwork.name}
              </Text>
            )}
          </View>
        )}

        {/* Amount Display with Commission */}
        {selectedPlan && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Amount</Text>
            <View style={[styles.amountContainer, { backgroundColor: colors.backgroundSecondary }]}>
              <Text style={[styles.amountText, { color: '#10B981' }]}>
                ₦{formatAmount(
                  isAwuf
                    ? (selectedPlan.price || 0)
                    : (selectedPlan.variation_amount || 0)
                )}
              </Text>
            </View>

            {/* Show commission only for VTPass plans */}
            {/* {!isAwuf && commission > 0 && (
              <View style={styles.commissionContainer}>
                <Text style={[styles.commissionText, { color: '#10B981' }]}>
                  You will earn: ₦{formatAmount(commission)}
                </Text>
                {loadingCommission && (
                  <ActivityIndicator size="small" color="#10B981" style={styles.commissionLoader} />
                )}
              </View>
            )} */}
          </View>
        )}

        {/* Phone Number Input */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Phone Number</Text>
            <TouchableOpacity
              onPress={fetchRecentCustomers}
              disabled={loadingRecentCustomers}
            >
              <Text style={[styles.beneficiaryLink, { color: colors.primary }]}>
                {loadingRecentCustomers ? 'Loading...' : 'Choose from recent'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={[
            styles.inputContainer,
            { backgroundColor: colors.backgroundSecondary, borderColor: errors.phone ? colors.error : colors.divider },
            errors.phone && styles.inputContainerError
          ]}>
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
              placeholder="Enter 11-digit phone number"
              value={phone}
              onChangeText={handlePhoneChange}
              keyboardType="phone-pad"
              maxLength={11}
              placeholderTextColor={colors.textMuted}
            />
            <TouchableOpacity
              style={styles.contactButton}
              onPress={fetchRecentCustomers}
              disabled={loadingRecentCustomers}
            >
              {loadingRecentCustomers ? (
                <ActivityIndicator size="small" color={colors.textSecondary} />
              ) : (
                <Ionicons name="people-outline" size={20} color={colors.textSecondary} />
              )}
            </TouchableOpacity>
          </View>
          {errors.phone && (
            <Text style={[styles.errorText, { color: colors.error }]}>{errors.phone}</Text>
          )}
        </View>

        {/* Proceed Button */}
        <TouchableOpacity
          style={[
            styles.proceedButton,
            { backgroundColor: colors.primary, shadowColor: colors.primary },
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
        isAwuf={isAwuf}
      />

      {/* Recent Customers Modal */}
      <RecentCustomersModalInner
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
        title={isAwuf ? "Confirm AWUF Data Purchase" : "Confirm Data Purchase"}
        providerLogo={selectedNetwork?.logoLocal}
        providerName={selectedNetwork?.name}
        details={getConfirmationDetails()}
        amount={getAmount()}
        commission={!isAwuf ? commission : 0}
        loading={isSubmitting}
        confirmButtonText="Buy Data"
        infoNote={isAwuf
          ? "Dial *323*4# or *323*1# to check your data balance after purchase"
          : "Data will be delivered within 1-3 minutes after successful payment"}
      />
    </View>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, borderBottomWidth: 1 },
  backButton: { padding: 4 },
  title: { fontSize: 20, fontFamily: 'Poppins-SemiBold' },
  placeholder: { width: 32 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontFamily: 'Poppins-SemiBold', marginBottom: 12 },
  subSectionTitle: { fontSize: 14, fontFamily: 'Poppins-Medium', marginBottom: 8 },
  networksRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  beneficiaryLink: { fontSize: 14, fontFamily: 'Poppins-Medium' },
  networkCard: { alignItems: 'center', borderRadius: 12, padding: 12, width: width / 4 - 20, height: 100, borderWidth: 2, borderColor: 'transparent', position: 'relative' },
  networkLogoContainer: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  networkLogo: { width: 36, height: 36, borderRadius: 18 },
  networkName: { fontSize: 11, fontFamily: 'Poppins-Medium', textAlign: 'center' },
  awufBadge: { position: 'absolute', top: 5, right: 5, backgroundColor: '#F59E0B', borderRadius: 4, paddingHorizontal: 4, paddingVertical: 2 },
  awufBadgeText: { fontSize: 8, fontFamily: 'Poppins-Bold', color: '#FFFFFF' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 16, height: 56, borderWidth: 1 },
  inputContainerError: { borderColor: colors.error },
  input: { flex: 1, fontSize: 16, fontFamily: 'Poppins-Regular' },
  contactButton: { padding: 8 },
  dataPlanButton: { borderRadius: 12, paddingHorizontal: 16, height: 56, borderWidth: 1, justifyContent: 'center' },
  dataPlanButtonError: { borderColor: colors.error },
  dataPlanButtonContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectedPlanInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectedPlanName: { fontSize: 14, fontFamily: 'Poppins-Medium', flex: 1, marginRight: 12 },
  selectedPlanPrice: { fontSize: 14, fontFamily: 'Poppins-SemiBold' },
  dataPlanPlaceholder: { fontSize: 16, fontFamily: 'Poppins-Regular' },
  amountContainer: { borderRadius: 12, paddingHorizontal: 16, height: 56, justifyContent: 'center' },
  amountText: { fontSize: 18, fontFamily: 'Poppins-Bold' },
  commissionContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  commissionText: { fontSize: 14, fontFamily: 'Poppins-Medium' },
  commissionLoader: { marginLeft: 8 },
  proceedButton: { marginHorizontal: 20, borderRadius: 12, height: 56, justifyContent: 'center', alignItems: 'center', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4, marginTop: 8, marginBottom: 24 },
  proceedButtonDisabled: { backgroundColor: '#94A3B8', opacity: 0.6 },
  proceedButtonText: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Poppins-SemiBold' },
  errorText: { fontSize: 12, fontFamily: 'Poppins-Regular', marginTop: 8 },
  infoText: { fontSize: 12, fontFamily: 'Poppins-Regular', textAlign: 'center', fontStyle: 'italic', marginTop: 8 },
});

const makeModalStyles = (colors: any) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  container: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40, minHeight: 400, maxHeight: '80%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, borderBottomWidth: 1, paddingBottom: 12 },
  title: { fontSize: 20, fontFamily: 'Poppins-SemiBold' },
  closeButton: { padding: 4 },
  subtitle: { fontSize: 14, fontFamily: 'Poppins-Regular', marginBottom: 24 },
  listContent: { paddingBottom: 20 },
  customerItem: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: colors.divider, backgroundColor: colors.backgroundSecondary },
  customerIcon: { marginRight: 12 },
  customerInfo: { flex: 1 },
  customerPhone: { fontSize: 16, fontFamily: 'Poppins-Medium' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  loadingText: { fontSize: 14, fontFamily: 'Poppins-Regular', marginTop: 12 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 18, fontFamily: 'Poppins-SemiBold', marginTop: 16, marginBottom: 8 },
  emptyDescription: { fontSize: 14, fontFamily: 'Poppins-Regular', textAlign: 'center', maxWidth: 300, lineHeight: 20 },
});