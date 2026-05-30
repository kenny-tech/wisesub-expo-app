import { CablePlanModal } from '@/src/components/bills/CablePlanModal';
import { ConfirmPurchaseModal, PurchaseDetail } from '@/src/components/bills/ConfirmPurchaseModal';
import { formatAmount } from '@/src/helper/util';
import { useProfile } from '@/src/redux/hooks/useProfile';
import { IMAGE_BASE_URL } from '@/src/services/api';
import { billService } from '@/src/services/billService';
import { CommissionConfig, commissionService } from '@/src/services/commissionService';
import { RecentCustomer, walletService } from '@/src/services/walletService';
import { showError, showSuccess } from '@/src/utils/toast';
import { CableValidators } from '@/src/utils/validators/cableValidators';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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

// Define cable providers with URL paths
const PROVIDERS = [
  { id: 'dstv', name: 'DStv', logo: `${IMAGE_BASE_URL}/dstv.png`, logoLocal: require('../../../assets/images/dstv.png') },
  { id: 'gotv', name: 'GOtv', logo: `${IMAGE_BASE_URL}/gotv.png`, logoLocal: require('../../../assets/images/gotv.png') },
  { id: 'startimes', name: 'Startimes', logo: `${IMAGE_BASE_URL}/startimes.png`, logoLocal: require('../../../assets/images/startimes.png') },
];

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
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const modalStyles = makeModalStyles(colors);

  // State
  const [decoderNumber, setDecoderNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
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

  // Recent customers state
  const [showRecentDecoderModal, setShowRecentDecoderModal] = useState(false);
  const [showRecentPhoneModal, setShowRecentPhoneModal] = useState(false);
  const [recentDecoders, setRecentDecoders] = useState<RecentCustomer[]>([]);
  const [recentPhones, setRecentPhones] = useState<RecentCustomer[]>([]);
  const [loadingRecentDecoders, setLoadingRecentDecoders] = useState(false);
  const [loadingRecentPhones, setLoadingRecentPhones] = useState(false);

  // Get user profile
  const { user } = useProfile();

  // Set phone number from profile
  useEffect(() => {
    if (user?.phone && !phoneNumber) setPhoneNumber(user.phone);
  }, [user?.phone]);

  const clearFieldError = (field: string) => {
    setErrors(prev => { const newErrors = { ...prev }; delete newErrors[field]; return newErrors; });
  };

  // Fetch commission configuration
  useEffect(() => {
    fetchCommissionConfig();
  }, []);

  const fetchCommissionConfig = async () => {
    setLoadingCommission(true);
    try {
      const response = await commissionService.getCommissionConfig('Cabletv');
      if (response.success && response.data) setCommissionConfig(response.data);
    } catch (error: any) { console.error(error); } finally { setLoadingCommission(false); }
  };

  const calculateCommissionForPlan = (planAmount: number) => {
    if (!commissionConfig || planAmount <= 0) { setCommission(0); return; }
    setCommission(commissionService.calculateCommission(planAmount, commissionConfig));
  };

  const handleProviderSelect = async (provider: typeof PROVIDER_OPTIONS[0]) => {
    setSelectedProvider(provider);
    setSelectedPlan(null);
    setCablePlans([]);
    setDecoderNumber('');
    setCustomerName('');
    clearFieldError('provider');
    setCommission(0);
    await fetchCablePlans(provider.serviceID);
  };

  const fetchCablePlans = async (serviceID: string) => {
    if (!serviceID) { setCablePlans([]); return; }
    setLoading(true);
    try {
      const response = await billService.getDataPlans(serviceID);
      if (response.success && response.content?.varations) {
        const plans = response.content.varations.map((plan: any) => ({
          variation_code: plan.variation_code || '',
          name: plan.name || '',
          variation_amount: plan.variation_amount || 0,
          description: plan.description || ''
        }));
        setCablePlans(plans);
      } else { setCablePlans([]); showError('Info', 'No cable plans available for this provider'); }
    } catch (error: any) { setCablePlans([]); showError('Error', error.message || 'Failed to fetch cable plans'); }
    finally { setLoading(false); }
  };

  const handlePlanSelect = (plan: CablePlan) => {
    setSelectedPlan(plan);
    setAmount(plan.variation_amount.toString());
    clearFieldError('plan');
    setShowPlanModal(false);
    calculateCommissionForPlan(Number(plan.variation_amount));
  };

  const handleDecoderChange = (text: string) => {
    setDecoderNumber(text);
    setCustomerName('');
    if (errors.decoderNumber) clearFieldError('decoderNumber');
  };

  const handlePhoneChange = (text: string) => {
    setPhoneNumber(text);
    if (errors.phoneNumber) clearFieldError('phoneNumber');
  };

  const fetchRecentDecoders = async () => {
    setLoadingRecentDecoders(true);
    try {
      const response = await walletService.getRecentCustomers({ type: 'Cabletv', limit: 15 });
      if (response.success) { setRecentDecoders(response.data); setShowRecentDecoderModal(true); }
      else showError('Error', response.message || 'Failed to fetch recent decoder numbers');
    } catch (error: any) { showError('Error', 'Failed to load recent decoder numbers'); }
    finally { setLoadingRecentDecoders(false); }
  };

  const fetchRecentPhones = async () => {
    setLoadingRecentPhones(true);
    try {
      const response = await walletService.getRecentCustomers({ type: 'Cabletv', limit: 15 });
      if (response.success) { setRecentPhones(response.data); setShowRecentPhoneModal(true); }
      else showError('Error', response.message || 'Failed to fetch recent phone numbers');
    } catch (error: any) { showError('Error', 'Failed to load recent phone numbers'); }
    finally { setLoadingRecentPhones(false); }
  };

  const handleSelectDecoder = (decoder: string) => { setDecoderNumber(decoder); setShowRecentDecoderModal(false); };
  const handleSelectPhone = (phone: string) => { setPhoneNumber(phone); setShowRecentPhoneModal(false); };

  const validateDecoder = async () => {
    if (!selectedProvider) { showError('Error', 'Please select a provider first'); return; }
    if (!decoderNumber.trim()) {
      setErrors(prev => ({ ...prev, decoderNumber: 'Decoder number is required' }));
      showError('Error', 'Decoder number is required'); return;
    }
    if (!/^\d{10,}$/.test(decoderNumber.trim())) {
      setErrors(prev => ({ ...prev, decoderNumber: 'Please enter a valid decoder number (min 10 digits)' }));
      showError('Error', 'Please enter a valid decoder number (min 10 digits)'); return;
    }

    setValidating(true);
    setCustomerName('');
    try {
      const response = await billService.validateDecoder({ serviceID: selectedProvider.serviceID, billersCode: decoderNumber });
      if (response.success && response.data?.code === "000") {
        if (response.data.content?.error) {
          Alert.alert('Decoder Validation', response.data.content.error, [{ text: 'OK', style: 'default' }]);
        } else if (response.data.content?.Customer_Name) {
          setCustomerName(response.data.content.Customer_Name);
          clearFieldError('decoderNumber');
          Alert.alert('Success', 'Decoder number validated successfully!');
        } else {
          setCustomerName('Customer');
          clearFieldError('decoderNumber');
          Alert.alert('Success', 'Decoder number validated successfully!');
        }
      } else {
        const errorMessage = response.data?.content?.error || response.message || 'Invalid decoder number';
        setErrors(prev => ({ ...prev, decoderNumber: errorMessage }));
        setCustomerName('');
        showError('Validation Failed', errorMessage);
      }
    } catch (error: any) {
      setErrors(prev => ({ ...prev, decoderNumber: error.message || 'Validation failed' }));
      setCustomerName('');
      showError('Error', 'Validation failed. Please try again.');
    } finally { setValidating(false); }
  };

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
      const firstError = Object.values(validation.errors)[0];
      if (firstError) showError('Validation Error', firstError);
      return false;
    }
    if (!customerName) { showError('Error', 'Please validate your decoder number first'); return false; }
    return true;
  };

  const handleProceed = () => {
    if (!validateForm()) return;
    if (!selectedProvider || !selectedPlan) { showError('Error', 'Please select both provider and cable plan'); return; }
    setShowConfirmModal(true);
  };

  const purchaseCable = async () => {
    if (!selectedProvider || !selectedPlan) return { success: false };
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
        validation_status: customerName === 'Customer (Unverified)' ? 'warning' : 'validated',
        validation_message: customerName === 'Customer (Unverified)' ? 'Decoder may be invalid, user confirmed' : 'Validated successfully',
      };
      const response = await billService.purchaseData(payload);
      if (response.success) {
        showSuccess('Success', response.message || 'Cable subscription successful!');
        setDecoderNumber('');
        setPhoneNumber('');
        setAmount('');
        setSelectedPlan(null);
        setSelectedProvider(null);
        setCustomerName('');
        setCommission(0);
        setShowConfirmModal(false);
        navigation.navigate('Tabs');
        return { success: true, data: response.data };
      } else {
        showError('Error', response.message || 'Cable subscription failed');
        return { success: false };
      }
    } catch (error: any) {
      if (error.errors) {
        const apiErrors: Record<string, string> = {};
        Object.entries(error.errors).forEach(([field, messages]) => { if (Array.isArray(messages) && messages.length) apiErrors[field] = messages[0]; });
        setErrors(apiErrors);
        const firstError = Object.values(apiErrors)[0];
        if (firstError) showError('Validation Error', firstError);
      } else showError('Error', error.message || 'Cable subscription failed');
      setShowConfirmModal(false);
      return { success: false };
    } finally { setIsSubmitting(false); }
  };

  const getConfirmationDetails = (): PurchaseDetail[] => {
    const details: PurchaseDetail[] = [];
    if (selectedPlan) details.push({ label: 'Cable Plan', value: selectedPlan.name, icon: 'layers-outline', iconColor: colors.textSecondary, valueColor: colors.textPrimary });
    details.push({ label: 'Subscription Type', value: subscriptionType === 'renewal' ? 'Renewal' : 'Change Package', icon: 'repeat-outline', iconColor: colors.textSecondary });
    if (decoderNumber) details.push({ label: 'Decoder Number', value: decoderNumber, icon: 'hardware-chip-outline', iconColor: colors.textSecondary });
    if (customerName) details.push({ label: 'Customer Name', value: customerName, icon: customerName === 'Customer (Unverified)' ? 'warning-outline' : 'person-outline', iconColor: customerName === 'Customer (Unverified)' ? '#F59E0B' : colors.textSecondary, valueColor: customerName === 'Customer (Unverified)' ? '#F59E0B' : colors.textPrimary });
    if (phoneNumber) details.push({ label: 'Phone Number', value: phoneNumber, icon: 'call-outline', iconColor: colors.textSecondary });
    return details;
  };

  // Recent customers modal inner component
  function RecentCustomersModal({ visible, onClose, customers, loading, onSelectCustomer, type = 'decoder' }: {
    visible: boolean; onClose: () => void; customers: RecentCustomer[];
    loading: boolean; onSelectCustomer: (c: string) => void; type?: 'decoder' | 'phone';
  }) {
    return (
      <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
        <TouchableOpacity style={modalStyles.overlay} activeOpacity={1} onPressOut={onClose}>
          <View style={[modalStyles.container, { backgroundColor: colors.card }]}>
            <View style={[modalStyles.header, { borderBottomColor: colors.separator }]}>
              <Text style={[modalStyles.title, { color: colors.textPrimary }]}>
                {type === 'decoder' ? 'Recent Decoder Numbers' : 'Recent Phone Numbers'}
              </Text>
              <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={[modalStyles.subtitle, { color: colors.textSecondary }]}>
              {type === 'decoder' ? 'Select a decoder number' : 'Select a phone number'}
            </Text>
            {loading ? (
              <View style={modalStyles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[modalStyles.loadingText, { color: colors.textSecondary }]}>Loading...</Text>
              </View>
            ) : customers.length === 0 ? (
              <View style={modalStyles.emptyContainer}>
                <Ionicons name={type === 'decoder' ? 'tv-outline' : 'call-outline'} size={48} color={colors.textMuted} />
                <Text style={[modalStyles.emptyTitle, { color: colors.textSecondary }]}>No Recent {type === 'decoder' ? 'Decoder Numbers' : 'Phone Numbers'}</Text>
                <Text style={[modalStyles.emptyDescription, { color: colors.textMuted }]}>Your recent {type === 'decoder' ? 'decoder numbers' : 'phone numbers'} will appear here</Text>
              </View>
            ) : (
              <FlatList
                data={customers}
                renderItem={({ item }) => (
                  <TouchableOpacity style={[modalStyles.customerItem, { backgroundColor: colors.backgroundSecondary, borderColor: colors.divider }]} onPress={() => onSelectCustomer(item.customer)}>
                    <View style={modalStyles.customerIcon}>
                      <Ionicons name={type === 'decoder' ? 'tv-outline' : 'call-outline'} size={24} color={colors.primary} />
                    </View>
                    <View style={modalStyles.customerInfo}>
                      <Text style={[modalStyles.customerPhone, { color: colors.textPrimary }]}>{item.customer}</Text>
                      <Text style={[modalStyles.customerType, { color: colors.textSecondary }]}>{type === 'decoder' ? 'Decoder Number' : 'Phone Number'}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                  </TouchableOpacity>
                )}
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
        <Text style={[styles.title, { color: colors.textPrimary }]}>Cable TV</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Provider Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Select Provider</Text>
          <View style={styles.providersContainer}>
            {PROVIDER_OPTIONS.map((provider) => (
              <TouchableOpacity
                key={provider.value}
                style={[
                  styles.providerCard,
                  { backgroundColor: colors.backgroundSecondary },
                  selectedProvider?.value === provider.value && { borderColor: colors.primary, backgroundColor: colors.primaryLight }
                ]}
                onPress={() => handleProviderSelect(provider)}
                activeOpacity={0.7}
              >
                <View style={[styles.providerLogoContainer, { backgroundColor: colors.card }]}>
                  <Image source={provider.logoLocal} style={styles.providerLogo} resizeMode="contain" />
                </View>
                <Text style={[styles.providerName, { color: colors.textSecondary }, selectedProvider?.value === provider.value && { color: colors.primary, fontFamily: 'Poppins-SemiBold' }]} numberOfLines={1}>
                  {provider.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.provider && <Text style={[styles.errorText, { color: colors.error }]}>{errors.provider}</Text>}
        </View>

        {/* Cable Plan Selection */}
        {selectedProvider && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Cable Plan</Text>
            <TouchableOpacity
              style={[styles.planButton, { backgroundColor: colors.backgroundSecondary, borderColor: errors.plan ? colors.error : colors.divider }]}
              onPress={() => setShowPlanModal(true)}
              disabled={cablePlans.length === 0 || loading}
            >
              <View style={styles.planButtonContent}>
                {selectedPlan ? (
                  <>
                    <View style={styles.selectedPlanInfo}>
                      <Text style={[styles.selectedPlanName, { color: colors.textPrimary }]} numberOfLines={1}>{selectedPlan.name}</Text>
                      <Text style={[styles.selectedPlanPrice, { color: colors.primary }]}>₦{formatAmount(selectedPlan.variation_amount)}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.primary} />
                  </>
                ) : (
                  <>
                    <Text style={[styles.planPlaceholder, { color: colors.textMuted }, loading && { color: colors.textSecondary }]}>
                      {loading ? 'Loading plans...' : cablePlans.length === 0 ? 'No plans available' : 'Select Cable Plan'}
                    </Text>
                    {!loading && cablePlans.length > 0 && <Ionicons name="chevron-down" size={20} color={colors.textMuted} />}
                    {loading && <ActivityIndicator size="small" color={colors.textSecondary} />}
                  </>
                )}
              </View>
            </TouchableOpacity>
            {errors.plan && <Text style={[styles.errorText, { color: colors.error }]}>{errors.plan}</Text>}
            {selectedProvider && cablePlans.length === 0 && !loading && <Text style={[styles.infoText, { color: colors.textMuted }]}>No cable plans available for {selectedProvider.name}</Text>}
          </View>
        )}

        {/* Subscription Type */}
        {selectedProvider && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Subscription Type</Text>
            <View style={styles.subscriptionTypeContainer}>
              <TouchableOpacity
                style={[styles.subscriptionTypeButton, { backgroundColor: colors.backgroundSecondary, borderColor: colors.divider }, subscriptionType === 'renewal' && { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}
                onPress={() => setSubscriptionType('renewal')}
              >
                <Text style={[styles.subscriptionTypeText, { color: colors.textSecondary }, subscriptionType === 'renewal' && { color: colors.primary }]}>Renewal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.subscriptionTypeButton, { backgroundColor: colors.backgroundSecondary, borderColor: colors.divider }, subscriptionType === 'change' && { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}
                onPress={() => setSubscriptionType('change')}
              >
                <Text style={[styles.subscriptionTypeText, { color: colors.textSecondary }, subscriptionType === 'change' && { color: colors.primary }]}>Change Package</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Amount Display with Commission */}
        {selectedPlan && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Amount</Text>
            <View style={[styles.amountContainer, { backgroundColor: colors.backgroundSecondary }]}>
              <Text style={[styles.amountText, { color: '#10B981' }]}>₦{formatAmount(amount)}</Text>
            </View>
            {commission > 0 && (
              <View style={styles.commissionContainer}>
                <Text style={[styles.commissionText, { color: '#10B981' }]}>You will earn: ₦{formatAmount(commission)}</Text>
                {loadingCommission && <ActivityIndicator size="small" color="#10B981" style={styles.commissionLoader} />}
              </View>
            )}
          </View>
        )}

        {/* Decoder Number */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Decoder Number</Text>
            <TouchableOpacity onPress={fetchRecentDecoders} disabled={loadingRecentDecoders}>
              <Text style={[styles.beneficiaryLink, { color: colors.primary }]}>{loadingRecentDecoders ? 'Loading...' : 'Choose from recent'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.decoderInputRow}>
            <View style={[styles.decoderInputContainer, { backgroundColor: colors.backgroundSecondary, borderColor: errors.decoderNumber ? colors.error : colors.divider }]}>
              <TextInput style={[styles.decoderInput, { color: colors.textPrimary }]} placeholder="Enter decoder number" value={decoderNumber} onChangeText={handleDecoderChange} keyboardType="number-pad" maxLength={20} placeholderTextColor={colors.textMuted} />
            </View>
            <TouchableOpacity
              style={[styles.validateButton, { backgroundColor: colors.primary }, (!selectedProvider || !decoderNumber || validating) && { backgroundColor: '#94A3B8', opacity: 0.6 }]}
              onPress={validateDecoder}
              disabled={!selectedProvider || !decoderNumber || validating}
            >
              {validating ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.validateButtonText}>Validate</Text>}
            </TouchableOpacity>
          </View>
          {errors.decoderNumber && <Text style={[styles.errorText, { color: colors.error }]}>{errors.decoderNumber}</Text>}
          {customerName && (
            <View style={styles.customerInfoContainer}>
              <Ionicons name={customerName === 'Customer (Unverified)' ? "warning" : "checkmark-circle"} size={16} color={customerName === 'Customer (Unverified)' ? "#F59E0B" : "#10B981"} />
              <Text style={[styles.customerNameText, customerName === 'Customer (Unverified)' && { color: '#F59E0B' }, customerName !== 'Customer (Unverified)' && { color: '#10B981' }]}>{customerName}</Text>
            </View>
          )}
        </View>

        {/* Phone Number */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Phone Number</Text>
          </View>
          <View style={[styles.inputContainer, { backgroundColor: colors.backgroundSecondary, borderColor: errors.phoneNumber ? colors.error : colors.divider }]}>
            <TextInput style={[styles.input, { color: colors.textPrimary }]} placeholder="Enter phone number" value={phoneNumber} onChangeText={handlePhoneChange} keyboardType="phone-pad" placeholderTextColor={colors.textMuted} />
          </View>
          {errors.phoneNumber && <Text style={[styles.errorText, { color: colors.error }]}>{errors.phoneNumber}</Text>}
        </View>

        {/* Proceed Button */}
        <TouchableOpacity
          style={[styles.proceedButton, { backgroundColor: colors.primary, shadowColor: colors.primary }, (isSubmitting || !selectedPlan || !customerName) && { backgroundColor: '#94A3B8', opacity: 0.6 }]}
          onPress={handleProceed}
          disabled={isSubmitting || !selectedPlan || !customerName}
        >
          {isSubmitting ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.proceedButtonText}>{!customerName ? 'Validate Decoder First' : 'Proceed to Subscribe'}</Text>}
        </TouchableOpacity>

        <View style={{ height: 320 }} />
      </ScrollView>

      <CablePlanModal visible={showPlanModal} onClose={() => setShowPlanModal(false)} cablePlans={cablePlans} selectedPlan={selectedPlan} onSelectPlan={handlePlanSelect} loading={loading} providerName={selectedProvider?.name} />
      <RecentCustomersModal visible={showRecentDecoderModal} onClose={() => setShowRecentDecoderModal(false)} customers={recentDecoders} loading={loadingRecentDecoders} onSelectCustomer={handleSelectDecoder} type="decoder" />
      <RecentCustomersModal visible={showRecentPhoneModal} onClose={() => setShowRecentPhoneModal(false)} customers={recentPhones} loading={loadingRecentPhones} onSelectCustomer={handleSelectPhone} type="phone" />
      <ConfirmPurchaseModal visible={showConfirmModal} onClose={() => setShowConfirmModal(false)} onConfirm={purchaseCable} title="Confirm Cable TV Subscription" providerLogo={selectedProvider?.logoLocal} providerName={selectedProvider?.name} details={getConfirmationDetails()} amount={parseFloat(amount) || 0} commission={commission} loading={isSubmitting} confirmButtonText="Subscribe Now" infoNote="Cable subscription will be activated within 2-5 minutes after successful payment" />
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
  sectionTitle: { fontSize: 16, fontFamily: 'Poppins-SemiBold', marginBottom: 16 },
  beneficiaryLink: { fontSize: 14, fontFamily: 'Poppins-Medium' },
  providersContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  providerCard: { alignItems: 'center', borderRadius: 12, padding: 12, width: (width - 80) / 3, height: 100, borderWidth: 2, borderColor: 'transparent' },
  providerLogoContainer: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  providerLogo: { width: 40, height: 40, borderRadius: 20 },
  providerName: { fontSize: 12, fontFamily: 'Poppins-Medium', textAlign: 'center' },
  planButton: { borderRadius: 12, paddingHorizontal: 16, height: 56, borderWidth: 1, justifyContent: 'center' },
  planButtonContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectedPlanInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectedPlanName: { fontSize: 16, fontFamily: 'Poppins-Medium', flex: 1, marginRight: 12 },
  selectedPlanPrice: { fontSize: 16, fontFamily: 'Poppins-SemiBold' },
  planPlaceholder: { fontSize: 16, fontFamily: 'Poppins-Regular' },
  subscriptionTypeContainer: { flexDirection: 'row', gap: 12 },
  subscriptionTypeButton: { flex: 1, borderRadius: 12, paddingVertical: 16, alignItems: 'center', borderWidth: 1 },
  subscriptionTypeText: { fontSize: 14, fontFamily: 'Poppins-Medium' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 16, height: 56, borderWidth: 1 },
  input: { flex: 1, fontSize: 16, fontFamily: 'Poppins-Regular' },
  decoderInputRow: { flexDirection: 'row', gap: 12 },
  decoderInputContainer: { flex: 1, borderRadius: 12, paddingHorizontal: 16, height: 56, justifyContent: 'center', borderWidth: 1 },
  decoderInput: { fontSize: 16, fontFamily: 'Poppins-Regular' },
  validateButton: { borderRadius: 12, paddingHorizontal: 20, height: 56, justifyContent: 'center', alignItems: 'center', minWidth: 100 },
  validateButtonText: { color: '#FFFFFF', fontSize: 14, fontFamily: 'Poppins-SemiBold' },
  customerInfoContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8, paddingHorizontal: 4 },
  customerNameText: { fontSize: 14, fontFamily: 'Poppins-Medium', marginLeft: 6 },
  amountContainer: { borderRadius: 12, paddingHorizontal: 16, height: 56, justifyContent: 'center' },
  amountText: { fontSize: 18, fontFamily: 'Poppins-Bold' },
  commissionContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  commissionText: { fontSize: 14, fontFamily: 'Poppins-Medium' },
  commissionLoader: { marginLeft: 8 },
  proceedButton: { marginHorizontal: 20, borderRadius: 12, height: 56, justifyContent: 'center', alignItems: 'center', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4, marginTop: 8, marginBottom: 24 },
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
  customerItem: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 16, marginBottom: 8, borderWidth: 1 },
  customerIcon: { marginRight: 12 },
  customerInfo: { flex: 1 },
  customerPhone: { fontSize: 16, fontFamily: 'Poppins-Medium', marginBottom: 4 },
  customerType: { fontSize: 12, fontFamily: 'Poppins-Regular' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  loadingText: { fontSize: 14, fontFamily: 'Poppins-Regular', marginTop: 12 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 18, fontFamily: 'Poppins-SemiBold', marginTop: 16, marginBottom: 8 },
  emptyDescription: { fontSize: 14, fontFamily: 'Poppins-Regular', textAlign: 'center', maxWidth: 300, lineHeight: 20 },
});