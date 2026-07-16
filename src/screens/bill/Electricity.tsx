import BalanceBar from '@/src/components/bills/BalanceBar.tsx';
import { ElectricityTokenDisplay } from '@/src/components/bills/ElectricityTokenDisplay';
import { formatAmount } from '@/src/helper/util';
import { useProfile } from '@/src/redux/hooks/useProfile';
import { IMAGE_BASE_URL } from '@/src/services/api';
import { billService } from '@/src/services/billService';
import { CommissionConfig, commissionService } from '@/src/services/commissionService';
import { RecentCustomer, walletService } from '@/src/services/walletService';
import { showError } from '@/src/utils/toast';
import { ElectricityValidators } from '@/src/utils/validators/electricityValidators';
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
import { PurchaseDetail } from '../ConfirmPurchase';

const { width } = Dimensions.get('window');

// Define electricity providers
const PROVIDERS = [
  { id: 'ikedc', name: 'Ikeja Electric', logoLocal: require('../../../assets/images/ikedc.jpg'), logoUrl: `${IMAGE_BASE_URL}/ikedc.jpg`, serviceID: 'ikeja-electric' },
  { id: 'ekedc', name: 'Eko Electric', logoLocal: require('../../../assets/images/ekedc.jpg'), logoUrl: `${IMAGE_BASE_URL}/ekedc.jpg`, serviceID: 'eko-electric' },
  { id: 'kedco', name: 'Kano Electric', logoLocal: require('../../../assets/images/kedco.jpg'), logoUrl: `${IMAGE_BASE_URL}/kedco.jpg`, serviceID: 'kano-electric' },
  { id: 'phedc', name: 'Port Harcourt Electric', logoLocal: require('../../../assets/images/phedc.jpg'), logoUrl: `${IMAGE_BASE_URL}/phedc.jpg`, serviceID: 'portharcourt-electric' },
  { id: 'ibedc', name: 'Ibadan Electric', logoLocal: require('../../../assets/images/ibedc.jpg'), logoUrl: `${IMAGE_BASE_URL}/ibedc.jpg`, serviceID: 'ibadan-electric' },
  { id: 'aedc', name: 'Abuja Electric', logoLocal: require('../../../assets/images/aedc.jpg'), logoUrl: `${IMAGE_BASE_URL}/aedc.jpg`, serviceID: 'abuja-electric' },
  { id: 'jed', name: 'Jos Electric', logoLocal: require('../../../assets/images/jed.jpg'), logoUrl: `${IMAGE_BASE_URL}/jed.jpg`, serviceID: 'jos-electric' },
  { id: 'kaedco', name: 'Kaduna Electric', logoLocal: require('../../../assets/images/kaedco.jpg'), logoUrl: `${IMAGE_BASE_URL}/kaedco.jpg`, serviceID: 'kaduna-electric' },
];

const ELECTRICITY_AMOUNTS = ['500', '1000', '2000', '5000', '10000', '20000'];
const METER_TYPES = [{ id: 'prepaid', name: 'Prepaid' }, { id: 'postpaid', name: 'Postpaid' }];

interface TokenData {
  token: string; units: string; amount: number; meterNumber: string;
  provider: string; customerName: string; phoneNumber: string;
}

export default function Electricity({ navigation }: { navigation: any }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const modalStyles = makeModalStyles(colors);

  const [meterNumber, setMeterNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validating, setValidating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedProvider, setSelectedProvider] = useState<(typeof PROVIDERS)[0] | null>(null);
  const [meterType, setMeterType] = useState<string>('prepaid');
  const [customerName, setCustomerName] = useState<string>('');
  const [minPurchaseAmount, setMinPurchaseAmount] = useState<number>(0);
  const [commissionConfig, setCommissionConfig] = useState<CommissionConfig | null>(null);
  const [commission, setCommission] = useState<number>(0);
  const [loadingCommission, setLoadingCommission] = useState<boolean>(false);
  const [showToken, setShowToken] = useState(false);
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [showRecentMeterModal, setShowRecentMeterModal] = useState(false);
  const [showRecentPhoneModal, setShowRecentPhoneModal] = useState(false);
  const [recentMeters, setRecentMeters] = useState<RecentCustomer[]>([]);
  const [recentPhones, setRecentPhones] = useState<RecentCustomer[]>([]);
  const [loadingRecentMeters, setLoadingRecentMeters] = useState(false);
  const [loadingRecentPhones, setLoadingRecentPhones] = useState(false);

  const { user } = useProfile();
  useEffect(() => {
    if (user?.phone && !phoneNumber) setPhoneNumber(user.phone);
  }, [user?.phone]);

  const clearFieldError = (field: string) => {
    setErrors(prev => { const newErrors = { ...prev }; delete newErrors[field]; return newErrors; });
  };

  useEffect(() => { fetchCommissionConfig(); }, []);

  const fetchCommissionConfig = async () => {
    setLoadingCommission(true);
    try {
      const response = await commissionService.getCommissionConfig('Electricity');
      if (response.success && response.data) setCommissionConfig(response.data);
    } catch (error: any) { console.error(error); } finally { setLoadingCommission(false); }
  };

  const calculateCommissionForAmount = (amountValue: number) => {
    if (!commissionConfig || amountValue <= 0) { setCommission(0); return; }
    setCommission(commissionService.calculateCommission(amountValue, commissionConfig));
  };

  const handleProviderSelect = (provider: typeof PROVIDERS[0]) => {
    setSelectedProvider(provider);
    setMeterNumber('');
    setCustomerName('');
    setAmount('');
    setCustomAmount('');
    clearFieldError('provider');
    setCommission(0);
  };

  const handleMeterTypeSelect = (type: string) => {
    setMeterType(type);
    setMeterNumber('');
    setCustomerName('');
    clearFieldError('meterType');
  };

  const handleAmountSelect = (selectedAmount: string) => {
    setAmount(selectedAmount);
    setCustomAmount('');
    clearFieldError('amount');
    calculateCommissionForAmount(Number(selectedAmount));
  };

  const handleCustomAmountChange = (text: string) => {
    const cleaned = text.replace(/[^\d.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    setCustomAmount(cleaned);
    if (cleaned) { setAmount(cleaned); calculateCommissionForAmount(Number(cleaned)); }
    else { setAmount(''); setCommission(0); }
    clearFieldError('amount');
  };

  const handleMeterChange = (text: string) => {
    setMeterNumber(text);
    setCustomerName('');
    if (errors.meterNumber) clearFieldError('meterNumber');
  };

  const handlePhoneChange = (text: string) => {
    setPhoneNumber(text);
    if (errors.phoneNumber) clearFieldError('phoneNumber');
  };

  const fetchRecentMeters = async () => {
    setLoadingRecentMeters(true);
    try {
      const response = await walletService.getRecentCustomers({ type: 'Electricity', limit: 15 });
      if (response.success) { setRecentMeters(response.data); setShowRecentMeterModal(true); }
      else showError('Error', response.message || 'Failed to fetch recent meter numbers');
    } catch (error: any) { showError('Error', 'Failed to load recent meter numbers'); }
    finally { setLoadingRecentMeters(false); }
  };

  const fetchRecentPhones = async () => {
    setLoadingRecentPhones(true);
    try {
      const response = await walletService.getRecentCustomers({ type: 'Electricity', limit: 15 });
      if (response.success) { setRecentPhones(response.data); setShowRecentPhoneModal(true); }
      else showError('Error', response.message || 'Failed to fetch recent phone numbers');
    } catch (error: any) { showError('Error', 'Failed to load recent phone numbers'); }
    finally { setLoadingRecentPhones(false); }
  };

  const handleSelectMeter = (meter: string) => { setMeterNumber(meter); setShowRecentMeterModal(false); };
  const handleSelectPhone = (phone: string) => { setPhoneNumber(phone); setShowRecentPhoneModal(false); };

  const validateMeter = async () => {
    if (!selectedProvider) { showError('Error', 'Please select a provider first'); return; }
    if (!meterNumber.trim()) { setErrors(prev => ({ ...prev, meterNumber: 'Meter number is required' })); showError('Error', 'Meter number is required'); return; }
    if (!/^\d{11,}$/.test(meterNumber.trim())) { setErrors(prev => ({ ...prev, meterNumber: 'Please enter a valid meter number (min 11 digits)' })); showError('Error', 'Please enter a valid meter number (min 11 digits)'); return; }

    setValidating(true);
    setCustomerName('');
    try {
      const payload = { serviceID: selectedProvider.serviceID, billersCode: meterNumber, type: meterType };
      const response = await billService.validateMeter(payload);
      if (response.success && response.data?.code === "000") {
        if (response.data.content?.Customer_Name) {
          const apiMinAmount = parseFloat(response.data.content.Min_Purchase_Amount || '500');
          setMinPurchaseAmount(apiMinAmount);
          setCustomerName(response.data.content.Customer_Name);
          clearFieldError('meterNumber');
          Alert.alert('Success', 'Meter validated successfully!');
        } else if (response.data.content?.error) {
          Alert.alert('Meter Validation Warning', response.data.content.error, [{ text: 'OK', style: 'default' }]);
        } else {
          setCustomerName('Customer');
          setMinPurchaseAmount(500);
          clearFieldError('meterNumber');
          Alert.alert('Success', 'Meter validated successfully!');
        }
      } else {
        const errorMessage = response.data?.response_description || response.data?.content?.error || response.message || 'Invalid meter number';
        setErrors(prev => ({ ...prev, meterNumber: errorMessage }));
        setCustomerName('');
        showError('Validation Failed', errorMessage);
      }
    } catch (error: any) {
      setErrors(prev => ({ ...prev, meterNumber: error.response?.data?.message || 'Validation failed' }));
      setCustomerName('');
      showError('Error', 'Validation failed. Please try again.');
    } finally { setValidating(false); }
  };

  const validateForm = () => {
    const validation = ElectricityValidators.validateElectricityForm({
      meterNumber, provider: selectedProvider?.id || null, phoneNumber, amount, meterType,
    });
    if (!validation.isValid) {
      setErrors(validation.errors);
      const firstError = Object.values(validation.errors)[0];
      if (firstError) showError('Validation Error', firstError);
      return false;
    }
    if (!customerName) { showError('Error', 'Please validate your meter number first'); return false; }
    const amountValue = parseFloat(amount);
    if (amountValue < minPurchaseAmount) {
      setErrors(prev => ({ ...prev, amount: `Minimum purchase amount is ₦${minPurchaseAmount}` }));
      showError('Error', `Minimum purchase amount is ₦${minPurchaseAmount}`);
      return false;
    }
    return true;
  };

  const handleProceed = () => {
    if (!validateForm()) return;
    if (!selectedProvider) { showError('Error', 'Please select a provider'); return; }
    navigation.navigate('ConfirmPurchase', {
      onConfirm: purchaseElectricity,
      title: 'Confirm Electricity Purchase',
      providerLogo: selectedProvider?.logoLocal,
      providerName: selectedProvider?.name,
      details: getConfirmationDetails(),
      amount: parseFloat(amount) || 0,
      commission,
      confirmButtonText: meterType === 'prepaid' ? 'Buy Electricity Token' : 'Pay Electricity Bill',
      infoNote: meterType === 'prepaid' ? 'Electricity token will be generated instantly' : 'Postpaid bill payment will be processed within 24 hours',
    });
  };

  const purchaseElectricity = async (pin: string) => {
    if (!selectedProvider) return { success: false };
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
        pin,
      };
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
          // Leave the confirm screen first, then show the token on this screen
          navigation.goBack();
          setShowToken(true);
        } else {
          Alert.alert('Success', response.message || 'Electricity purchase successful!');
          resetForm();
          navigation.navigate('Tabs');
        }
        return { success: true, data: response.data };
      } else {
        const message = response.message || 'Electricity purchase failed';
        if (!/pin/i.test(message)) {
          showError('Error', message);
        }
        return { success: false, message };
      }
    } catch (error: any) {
      let errorMessage = error.message || 'Electricity purchase failed';
      if (error.errors) {
        const apiErrors: Record<string, string> = {};
        Object.entries(error.errors).forEach(([field, messages]) => { if (Array.isArray(messages) && messages.length) apiErrors[field] = messages[0]; });
        setErrors(apiErrors);
        const firstError = Object.values(apiErrors)[0];
        if (firstError) {
          errorMessage = String(firstError);
          if (!/pin/i.test(errorMessage)) showError('Validation Error', errorMessage);
        }
      } else if (!/pin/i.test(errorMessage)) {
        showError('Error', errorMessage);
      }
      return { success: false, message: errorMessage };
    } finally { setIsSubmitting(false); }
  };

  const resetForm = () => {
    setMeterNumber(''); setPhoneNumber(''); setAmount(''); setCustomAmount('');
    setSelectedProvider(null); setCustomerName(''); setCommission(0);
  };

  const getConfirmationDetails = (): PurchaseDetail[] => {
    const details: PurchaseDetail[] = [];
    details.push({ label: 'Meter Type', value: meterType === 'prepaid' ? 'Prepaid' : 'Postpaid', icon: meterType === 'prepaid' ? 'battery-charging-outline' : 'receipt-outline', iconColor: colors.textSecondary });
    if (meterNumber) details.push({ label: 'Meter Number', value: meterNumber, icon: 'home-outline', iconColor: colors.textSecondary });
    if (customerName) details.push({ label: 'Customer Name', value: customerName, icon: customerName === 'Customer (Validation Warning)' ? 'warning-outline' : 'person-outline', iconColor: customerName === 'Customer (Validation Warning)' ? '#F59E0B' : colors.textSecondary, valueColor: customerName === 'Customer (Validation Warning)' ? '#F59E0B' : colors.textPrimary });
    if (phoneNumber) details.push({ label: 'Phone Number', value: phoneNumber, icon: 'call-outline', iconColor: colors.textSecondary });
    if (amount) details.push({ label: 'Amount', value: `₦${formatAmount(amount)}`, icon: 'cash-outline', iconColor: colors.textSecondary, valueColor: '#10B981' });
    return details;
  };

  const handleCloseTokenDisplay = () => {
    setShowToken(false);
    setTokenData(null);
    resetForm();
    navigation.navigate('Tabs');
  };

  // Recent customers modal inner component
  function RecentCustomersModal({ visible, onClose, customers, loading, onSelectCustomer, type = 'meter' }: {
    visible: boolean; onClose: () => void; customers: RecentCustomer[];
    loading: boolean; onSelectCustomer: (c: string) => void; type?: 'meter' | 'phone';
  }) {
    return (
      <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
        <TouchableOpacity style={modalStyles.overlay} activeOpacity={1} onPressOut={onClose}>
          <View style={[modalStyles.container, { backgroundColor: colors.card }]}>
            <View style={[modalStyles.header, { borderBottomColor: colors.separator }]}>
              <Text style={[modalStyles.title, { color: colors.textPrimary }]}>{type === 'meter' ? 'Recent Meter Numbers' : 'Recent Phone Numbers'}</Text>
              <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}><Ionicons name="close" size={24} color={colors.textSecondary} /></TouchableOpacity>
            </View>
            <Text style={[modalStyles.subtitle, { color: colors.textSecondary }]}>{type === 'meter' ? 'Select a meter number' : 'Select a phone number'}</Text>
            {loading ? (
              <View style={modalStyles.loadingContainer}><ActivityIndicator size="large" color={colors.primary} /><Text style={[modalStyles.loadingText, { color: colors.textSecondary }]}>Loading...</Text></View>
            ) : customers.length === 0 ? (
              <View style={modalStyles.emptyContainer}>
                <Ionicons name={type === 'meter' ? 'flash-outline' : 'call-outline'} size={48} color={colors.textMuted} />
                <Text style={[modalStyles.emptyTitle, { color: colors.textSecondary }]}>No Recent {type === 'meter' ? 'Meter Numbers' : 'Phone Numbers'}</Text>
                <Text style={[modalStyles.emptyDescription, { color: colors.textMuted }]}>Your recent {type === 'meter' ? 'meter numbers' : 'phone numbers'} will appear here</Text>
              </View>
            ) : (
              <FlatList
                data={customers}
                renderItem={({ item }) => (
                  <TouchableOpacity style={[modalStyles.customerItem, { backgroundColor: colors.backgroundSecondary, borderColor: colors.divider }]} onPress={() => onSelectCustomer(item.customer)}>
                    <View style={modalStyles.customerIcon}><Ionicons name={type === 'meter' ? 'flash-outline' : 'call-outline'} size={24} color={colors.primary} /></View>
                    <View style={modalStyles.customerInfo}>
                      <Text style={[modalStyles.customerPhone, { color: colors.textPrimary }]}>{item.customer}</Text>
                      <Text style={[modalStyles.customerType, { color: colors.textSecondary }]}>{type === 'meter' ? 'Meter Number' : 'Phone Number'}</Text>
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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}><Ionicons name="arrow-back" size={24} color={colors.textPrimary} /></TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Buy Electricity</Text>
        <View style={styles.placeholder} />
      </View>
      <BalanceBar />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Provider Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Select Provider</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.providersScrollContent}>
            {PROVIDERS.map((provider) => (
              <TouchableOpacity key={provider.id} style={[styles.providerCard, { backgroundColor: colors.backgroundSecondary }, selectedProvider?.id === provider.id && { borderColor: colors.primary, backgroundColor: colors.primaryLight }]} onPress={() => handleProviderSelect(provider)} activeOpacity={0.7}>
                <View style={[styles.providerLogoContainer, { backgroundColor: colors.card }]}><Image source={provider.logoLocal} style={styles.providerLogo} resizeMode="contain" /></View>
                <Text style={[styles.providerName, { color: colors.textSecondary }, selectedProvider?.id === provider.id && { color: colors.primary, fontFamily: 'Poppins-SemiBold' }]} numberOfLines={2}>{provider.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {errors.provider && <Text style={[styles.errorText, { color: colors.error }]}>{errors.provider}</Text>}
        </View>

        {/* Meter Type */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Meter Type</Text>
          <View style={styles.meterTypeContainer}>
            {METER_TYPES.map((type) => (
              <TouchableOpacity key={type.id} style={[styles.meterTypeButton, { backgroundColor: colors.backgroundSecondary, borderColor: colors.divider }, meterType === type.id && { backgroundColor: colors.primaryLight, borderColor: colors.primary }]} onPress={() => handleMeterTypeSelect(type.id)}>
                <Text style={[styles.meterTypeText, { color: colors.textSecondary }, meterType === type.id && { color: colors.primary }]}>{type.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.meterType && <Text style={[styles.errorText, { color: colors.error }]}>{errors.meterType}</Text>}
        </View>

        {/* Meter Number */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Meter Number</Text>
            <TouchableOpacity onPress={fetchRecentMeters} disabled={loadingRecentMeters}><Text style={[styles.beneficiaryLink, { color: colors.primary }]}>{loadingRecentMeters ? 'Loading...' : 'Choose from recent'}</Text></TouchableOpacity>
          </View>
          <View style={styles.meterInputRow}>
            <View style={[styles.meterInputContainer, { backgroundColor: colors.backgroundSecondary, borderColor: errors.meterNumber ? colors.error : colors.divider }]}>
              <TextInput style={[styles.meterInput, { color: colors.textPrimary }]} placeholder="Enter meter number" value={meterNumber} onChangeText={handleMeterChange} keyboardType="number-pad" maxLength={20} placeholderTextColor={colors.textMuted} />
            </View>
            <TouchableOpacity style={[styles.validateButton, { backgroundColor: colors.primary }, (!selectedProvider || !meterNumber || validating) && { backgroundColor: '#94A3B8', opacity: 0.6 }]} onPress={validateMeter} disabled={!selectedProvider || !meterNumber || validating}>
              {validating ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.validateButtonText}>Validate</Text>}
            </TouchableOpacity>
          </View>
          {errors.meterNumber && <Text style={[styles.errorText, { color: colors.error }]}>{errors.meterNumber}</Text>}
          {customerName && (
            <View style={styles.customerInfoContainer}>
              <Ionicons name={customerName === 'Customer (Validation Warning)' ? "warning" : "checkmark-circle"} size={16} color={customerName === 'Customer (Validation Warning)' ? "#F59E0B" : "#10B981"} />
              <Text style={[styles.customerNameText, customerName === 'Customer (Validation Warning)' && { color: '#F59E0B' }, customerName !== 'Customer (Validation Warning)' && { color: '#10B981' }]}>{customerName}</Text>
            </View>
          )}
        </View>

        {/* Phone Number */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}><Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Phone Number</Text></View>
          <View style={[styles.inputContainer, { backgroundColor: colors.backgroundSecondary, borderColor: errors.phoneNumber ? colors.error : colors.divider }]}>
            <TextInput style={[styles.input, { color: colors.textPrimary }]} placeholder="Enter phone number" value={phoneNumber} onChangeText={handlePhoneChange} keyboardType="phone-pad" placeholderTextColor={colors.textMuted} />
          </View>
          {errors.phoneNumber && <Text style={[styles.errorText, { color: colors.error }]}>{errors.phoneNumber}</Text>}
        </View>

        {/* Amount */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Amount</Text>
          <View style={[styles.inputContainer, { backgroundColor: colors.backgroundSecondary, borderColor: errors.amount ? colors.error : colors.divider }]}>
            <TextInput style={[styles.input, { color: colors.textPrimary }]} placeholder="Enter amount (Minimum ₦500)" value={customAmount} onChangeText={handleCustomAmountChange} keyboardType="decimal-pad" placeholderTextColor={colors.textMuted} />
            <Text style={[styles.currencySymbol, { color: colors.textSecondary }]}>₦</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.amountsScroll} contentContainerStyle={styles.amountsScrollContent}>
            {ELECTRICITY_AMOUNTS.map((amt) => (
              <TouchableOpacity key={amt} style={[styles.amountChip, { backgroundColor: colors.card, borderColor: colors.divider }, amount === amt && { backgroundColor: colors.primary, borderColor: colors.primary }]} onPress={() => handleAmountSelect(amt)}>
                <Text style={[styles.amountChipText, { color: colors.textSecondary }, amount === amt && { color: '#FFFFFF' }]}>₦{formatAmount(amt)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {errors.amount && <Text style={[styles.errorText, { color: colors.error }]}>{errors.amount}</Text>}
          {amount && parseFloat(amount) > 0 && (
            <View style={[styles.amountDisplayContainer, { backgroundColor: colors.backgroundSecondary }]}>
              <View style={styles.amountDisplay}><Text style={[styles.amountDisplayLabel, { color: colors.textSecondary }]}>Amount to pay:</Text><Text style={styles.amountDisplayValue}>₦{formatAmount(amount)}</Text></View>
              {minPurchaseAmount > 0 && parseFloat(amount) < minPurchaseAmount && (
                <View style={styles.minAmountWarning}><Ionicons name="warning" size={14} color="#F59E0B" /><Text style={[styles.minAmountText, { color: '#F59E0B' }]}>Minimum amount: ₦{formatAmount(minPurchaseAmount.toString())}</Text></View>
              )}
              {commission > 0 && (
                <View style={[styles.commissionContainer, { borderTopColor: colors.divider }]}>
                  <Text style={[styles.commissionText, { color: '#10B981' }]}>You will earn: ₦{formatAmount(commission)}</Text>
                  {loadingCommission && <ActivityIndicator size="small" color="#10B981" style={styles.commissionLoader} />}
                </View>
              )}
            </View>
          )}
        </View>

        {/* Proceed Button */}
        <TouchableOpacity style={[styles.proceedButton, { backgroundColor: colors.primary, shadowColor: colors.primary }, (isSubmitting || !amount || !selectedProvider || !meterNumber || !phoneNumber || !customerName) && { backgroundColor: '#94A3B8', opacity: 0.6 }]} onPress={handleProceed} disabled={isSubmitting || !amount || !selectedProvider || !meterNumber || !phoneNumber || !customerName}>
          {isSubmitting ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.proceedButtonText}>{!customerName ? 'Validate Meter First' : customerName === 'Customer (Validation Warning)' ? 'Proceed with Unverified Meter' : 'Proceed to Buy'}</Text>}
        </TouchableOpacity>

        <View style={[styles.infoSection, { backgroundColor: colors.primaryLight }]}>
          <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>{meterType === 'prepaid' ? 'Electricity token will be generated instantly' : 'Postpaid bill payment will be processed within 24 hours'}</Text>
        </View>
        <View style={{ height: 320 }} />
      </ScrollView>

      <RecentCustomersModal visible={showRecentMeterModal} onClose={() => setShowRecentMeterModal(false)} customers={recentMeters} loading={loadingRecentMeters} onSelectCustomer={handleSelectMeter} type="meter" />
      <RecentCustomersModal visible={showRecentPhoneModal} onClose={() => setShowRecentPhoneModal(false)} customers={recentPhones} loading={loadingRecentPhones} onSelectCustomer={handleSelectPhone} type="phone" />
      {tokenData && <ElectricityTokenDisplay visible={showToken} onClose={handleCloseTokenDisplay} token={tokenData.token} units={tokenData.units} amount={tokenData.amount} meterNumber={tokenData.meterNumber} provider={tokenData.provider} customerName={tokenData.customerName} phoneNumber={tokenData.phoneNumber} />}
    </View>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, borderBottomWidth: 1 },
  backButton: { padding: 4 }, title: { fontSize: 20, fontFamily: 'Poppins-SemiBold' }, placeholder: { width: 32 },
  scrollView: { flex: 1 }, scrollContent: { paddingBottom: 40 },
  section: { paddingHorizontal: 20, marginBottom: 24 }, sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontFamily: 'Poppins-SemiBold', marginBottom: 16 },
  beneficiaryLink: { fontSize: 14, fontFamily: 'Poppins-Medium' },
  providersScrollContent: { flexDirection: 'row', gap: 12, paddingRight: 20 },
  providerCard: { borderRadius: 12, padding: 12, width: 100, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  providerLogoContainer: { width: 56, height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8, overflow: 'hidden' },
  providerLogo: { width: 48, height: 48, borderRadius: 8 },
  providerName: { fontSize: 12, fontFamily: 'Poppins-Medium', textAlign: 'center', lineHeight: 16 },
  meterTypeContainer: { flexDirection: 'row', gap: 12 },
  meterTypeButton: { flex: 1, borderRadius: 12, paddingVertical: 16, alignItems: 'center', borderWidth: 1 },
  meterTypeText: { fontSize: 14, fontFamily: 'Poppins-Medium' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 16, height: 56, borderWidth: 1 },
  input: { flex: 1, fontSize: 16, fontFamily: 'Poppins-Regular' },
  meterInputRow: { flexDirection: 'row', gap: 12 },
  meterInputContainer: { flex: 1, borderRadius: 12, paddingHorizontal: 16, height: 56, justifyContent: 'center', borderWidth: 1 },
  meterInput: { fontSize: 16, fontFamily: 'Poppins-Regular' },
  validateButton: { borderRadius: 12, paddingHorizontal: 20, height: 56, justifyContent: 'center', alignItems: 'center', minWidth: 100 },
  validateButtonText: { color: '#FFFFFF', fontSize: 14, fontFamily: 'Poppins-SemiBold' },
  customerInfoContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8, paddingHorizontal: 4 },
  customerNameText: { fontSize: 14, fontFamily: 'Poppins-Medium', marginLeft: 6 },
  currencySymbol: { fontSize: 16, fontFamily: 'Poppins-Medium', marginLeft: 8 },
  amountsScroll: { marginHorizontal: -20, marginTop: 12 },
  amountsScrollContent: { paddingHorizontal: 20, gap: 8 },
  amountChip: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, minWidth: 80, alignItems: 'center', justifyContent: 'center' },
  amountChipText: { fontSize: 14, fontFamily: 'Poppins-Medium' },
  amountDisplayContainer: { marginTop: 16, borderRadius: 12, padding: 16 },
  amountDisplay: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  amountDisplayLabel: { fontSize: 14, fontFamily: 'Poppins-Medium' },
  amountDisplayValue: { fontSize: 18, fontFamily: 'Poppins-Bold', color: '#10B981' },
  minAmountWarning: { flexDirection: 'row', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.divider },
  minAmountText: { fontSize: 12, fontFamily: 'Poppins-Medium', marginLeft: 6 },
  commissionContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTopWidth: 1 },
  commissionText: { fontSize: 14, fontFamily: 'Poppins-Medium' },
  commissionLoader: { marginLeft: 8 },
  proceedButton: { marginHorizontal: 20, borderRadius: 12, height: 56, justifyContent: 'center', alignItems: 'center', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4, marginTop: 8, marginBottom: 24 },
  proceedButtonText: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Poppins-SemiBold' },
  errorText: { fontSize: 12, fontFamily: 'Poppins-Regular', marginTop: 8 },
  infoSection: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 20, paddingVertical: 16, borderRadius: 12, marginHorizontal: 20, marginTop: 16 },
  infoText: { fontSize: 12, fontFamily: 'Poppins-Regular', marginLeft: 8, flex: 1 },
});

const makeModalStyles = (colors: any) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  container: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40, minHeight: 400, maxHeight: '80%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, borderBottomWidth: 1, paddingBottom: 12 },
  title: { fontSize: 20, fontFamily: 'Poppins-SemiBold' }, closeButton: { padding: 4 },
  subtitle: { fontSize: 14, fontFamily: 'Poppins-Regular', marginBottom: 24 },
  listContent: { paddingBottom: 20 },
  customerItem: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 16, marginBottom: 8, borderWidth: 1 },
  customerIcon: { marginRight: 12 }, customerInfo: { flex: 1 },
  customerPhone: { fontSize: 16, fontFamily: 'Poppins-Medium', marginBottom: 4 },
  customerType: { fontSize: 12, fontFamily: 'Poppins-Regular' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  loadingText: { fontSize: 14, fontFamily: 'Poppins-Regular', marginTop: 12 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 18, fontFamily: 'Poppins-SemiBold', marginTop: 16, marginBottom: 8 },
  emptyDescription: { fontSize: 14, fontFamily: 'Poppins-Regular', textAlign: 'center', maxWidth: 300, lineHeight: 20 },
});