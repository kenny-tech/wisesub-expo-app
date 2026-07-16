import BalanceBar from '@/src/components/bills/BalanceBar.tsx';
import { formatAmount } from '@/src/helper/util';
import { IMAGE_BASE_URL } from '@/src/services/api';
import { billService } from '@/src/services/billService';
import { CommissionConfig, commissionService } from '@/src/services/commissionService';
import { RecentCustomer, walletService } from '@/src/services/walletService';
import { showError, showSuccess } from '@/src/utils/toast';
import { AirtimeValidators } from '@/src/utils/validators/airtimeValidators';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, FlatList, Image, Modal, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { PurchaseDetail } from '../ConfirmPurchase';

const NETWORKS = [
  { id: 'mtn', name: 'MTN', logo: `${IMAGE_BASE_URL}/mtn.png`, logoLocal: require('../../../assets/images/mtn.png') },
  { id: 'airtel', name: 'Airtel', logo: `${IMAGE_BASE_URL}/airtel.png`, logoLocal: require('../../../assets/images/airtel.png') },
  { id: 'glo', name: 'Glo', logo: `${IMAGE_BASE_URL}/glo.png`, logoLocal: require('../../../assets/images/glo.png') },
  { id: '9mobile', name: '9mobile', logo: `${IMAGE_BASE_URL}/ninemobile.png`, logoLocal: require('../../../assets/images/ninemobile.png') },
];

const NETWORK_OPTIONS = NETWORKS.map(n => ({
  value: n.id,
  name: n.name,
  serviceID: n.id === 'mtn' ? 'mtn' : n.id === 'airtel' ? 'airtel' : n.id === 'glo' ? 'glo' : 'etisalat',
  logo: n.logo,
  logoLocal: n.logoLocal,
}));

const AIRTIME_AMOUNTS = ['100', '200', '500', '1000', '2000', '5000'];

function RecentCustomersModal({ visible, onClose, customers, loading, onSelectCustomer }: {
  visible: boolean; onClose: () => void; customers: RecentCustomer[];
  loading: boolean; onSelectCustomer: (c: string) => void;
}) {
  const { colors } = useTheme();

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <TouchableOpacity style={[modalStyles.overlay]} activeOpacity={1} onPressOut={onClose}>
        <View style={[modalStyles.container, { backgroundColor: colors.card }]}>
          <View style={[modalStyles.header, { borderBottomColor: colors.separator }]}>
            <Text style={[modalStyles.title, { color: colors.textPrimary }]}>Recent Customers</Text>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <Text style={[modalStyles.subtitle, { color: colors.textSecondary }]}>Select a phone number from your recent purchases</Text>

          {loading ? (
            <View style={modalStyles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[modalStyles.loadingText, { color: colors.textSecondary }]}>Loading recent customers...</Text>
            </View>
          ) : customers.length === 0 ? (
            <View style={modalStyles.emptyContainer}>
              <Ionicons name="people-outline" size={48} color={colors.textMuted} />
              <Text style={[modalStyles.emptyTitle, { color: colors.textSecondary }]}>No Recent Customers</Text>
              <Text style={[modalStyles.emptyDescription, { color: colors.textMuted }]}>Your recent customers will appear here after you make purchases</Text>
            </View>
          ) : (
            <FlatList
              data={customers}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={modalStyles.listContent}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity style={[modalStyles.customerItem, { backgroundColor: colors.backgroundSecondary, borderColor: colors.divider }]} onPress={() => onSelectCustomer(item.customer)}>
                  <View style={modalStyles.customerIcon}>
                    <Ionicons name="person-circle-outline" size={24} color={colors.primary} />
                  </View>
                  <View style={modalStyles.customerInfo}>
                    <Text style={[modalStyles.customerPhone, { color: colors.textPrimary }]}>{item.customer}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

export default function Airtime({ navigation }: { navigation: any }) {
  const { colors } = useTheme();

  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedNetwork, setSelectedNetwork] = useState<typeof NETWORK_OPTIONS[0] | null>(null);
  const [commissionConfig, setCommissionConfig] = useState<CommissionConfig | null>(null);
  const [commission, setCommission] = useState(0);
  const [loadingCommission, setLoadingCommission] = useState(false);
  const [showRecentModal, setShowRecentModal] = useState(false);
  const [recentCustomers, setRecentCustomers] = useState<RecentCustomer[]>([]);
  const [loadingRecentCustomers, setLoadingRecentCustomers] = useState(false);

  const clearFieldError = (field: string) => setErrors(prev => { const e = { ...prev }; delete e[field]; return e; });

  useEffect(() => { fetchCommissionConfig(); }, []);

  const fetchCommissionConfig = async () => {
    setLoadingCommission(true);
    try {
      const r = await commissionService.getCommissionConfig('Airtime');
      if (r.success && r.data) setCommissionConfig(r.data);
    } catch (e) { console.error(e); } finally { setLoadingCommission(false); }
  };

  const calculateCommission = (val: number) => {
    if (!commissionConfig || val <= 0) { setCommission(0); return; }
    setCommission(commissionService.calculateCommission(val, commissionConfig));
  };

  const handleNetworkSelect = (n: typeof NETWORK_OPTIONS[0]) => { setSelectedNetwork(n); clearFieldError('network'); };
  const handleAmountSelect = (a: string) => { setAmount(a); setCustomAmount(''); clearFieldError('amount'); calculateCommission(Number(a)); };
  const handleCustomAmountChange = (text: string) => {
    const cleaned = text.replace(/[^\d.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2 || (parts[1] && parts[1].length > 2)) return;
    setCustomAmount(cleaned);
    setAmount(cleaned || '');
    calculateCommission(cleaned ? Number(cleaned) : 0);
    clearFieldError('amount');
  };
  const handlePhoneChange = (text: string) => { setPhone(text); if (errors.phone) clearFieldError('phone'); };

  const fetchRecentCustomers = async () => {
    setLoadingRecentCustomers(true);
    try {
      const r = await walletService.getRecentCustomers({ type: 'Airtime', limit: 15 });
      if (r.success) { setRecentCustomers(r.data); setShowRecentModal(true); }
      else showError('Error', r.message || 'Failed to fetch recent customers');
    } catch (e) { showError('Error', 'Failed to load recent customers'); }
    finally { setLoadingRecentCustomers(false); }
  };

  const handleSelectCustomer = (p: string) => { setPhone(p); setShowRecentModal(false); };

  const validateForm = () => {
    const v = AirtimeValidators.validateAirtimeForm({ phone, network: selectedNetwork?.value || null, amount: amount || null });
    if (!v.isValid) { setErrors(v.errors); const first = Object.values(v.errors)[0]; if (first) showError('Validation Error', first); return false; }
    return true;
  };

  // Navigate to the confirmation screen instead of opening a modal
  const handleProceed = () => {
    if (!validateForm() || !selectedNetwork) { if (!selectedNetwork) showError('Error', 'Please select a network'); return; }
    navigation.navigate('ConfirmPurchase', {
      onConfirm: purchaseAirtime,
      title: 'Confirm Airtime Purchase',
      providerLogo: selectedNetwork?.logoLocal,
      providerName: selectedNetwork?.name,
      details: getConfirmationDetails(),
      amount: parseFloat(amount) || 0,
      commission,
      confirmButtonText: 'Buy Airtime',
      infoNote: 'Airtime will be delivered instantly after successful payment',
    });
  };

  // Called by the ConfirmPurchase screen with the entered PIN
  const purchaseAirtime = async (pin: string) => {
    if (!selectedNetwork) return { success: false };
    setIsSubmitting(true);
    try {
      const payload = { serviceID: selectedNetwork.serviceID, amount: parseFloat(amount), customer: phone, type: 'Airtime', provider_logo: selectedNetwork.logo, name: selectedNetwork.name, service_type: 'Airtime', billersCode: phone, variation_code: 'default', phone, network: selectedNetwork.value, network_name: selectedNetwork.name, pin };
      const r = await billService.purchaseData(payload);
      if (r.success) {
        showSuccess('Success', r.message || 'Airtime purchase successful!');
        setPhone(''); setAmount(''); setCustomAmount(''); setSelectedNetwork(null); setCommission(0);
        navigation.navigate('Tabs');
        return { success: true, data: r.data };
      } else {
        const message = r.message || 'Airtime purchase failed';
        if (!/pin/i.test(message)) {
          showError('Error', message);
        }
        return { success: false, message };
      }
    } catch (error: any) {
      let errorMessage = error.message || 'Airtime purchase failed. Please try again.';
      if (error.errors) {
        const apiErrors: Record<string, string> = {};
        Object.entries(error.errors).forEach(([f, m]) => { if (Array.isArray(m) && m.length) apiErrors[f] = m[0]; });
        setErrors(apiErrors);
        const first = Object.values(apiErrors)[0];
        if (first) {
          errorMessage = String(first);
          if (!/pin/i.test(errorMessage)) showError('Validation Error', errorMessage);
        }
      } else if (!/pin/i.test(errorMessage)) {
        showError('Error', errorMessage);
      }
      return { success: false, message: errorMessage };
    } finally { setIsSubmitting(false); }
  };

  const getConfirmationDetails = (): PurchaseDetail[] => {
    const details: PurchaseDetail[] = [];
    if (amount) details.push({ label: 'Amount', value: `₦${formatAmount(amount)}`, icon: 'cash-outline', iconColor: '#64748B', valueColor: '#10B981' });
    if (phone) details.push({ label: 'Phone Number', value: phone, icon: 'call-outline', iconColor: '#64748B' });
    return details;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.separator }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Buy Airtime</Text>
        <View style={styles.placeholder} />
      </View>
      <BalanceBar />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Network Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Select Network</Text>
          <View style={styles.networksContainer}>
            {NETWORK_OPTIONS.map((network) => (
              <TouchableOpacity key={network.value} style={[styles.networkCard, { backgroundColor: colors.backgroundSecondary }, selectedNetwork?.value === network.value && { borderColor: colors.primary, backgroundColor: colors.primaryLight }]} onPress={() => handleNetworkSelect(network)} activeOpacity={0.7}>
                <View style={[styles.networkLogoContainer, { backgroundColor: colors.card }]}>
                  <Image source={network.logoLocal} style={styles.networkLogo} resizeMode="contain" />
                </View>
                <Text style={[styles.networkName, { color: colors.textSecondary }, selectedNetwork?.value === network.value && { color: colors.primary, fontFamily: 'Poppins-SemiBold' }]} numberOfLines={1}>{network.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.network && <Text style={styles.errorText}>{errors.network}</Text>}
        </View>

        {/* Phone Number */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Phone Number</Text>
            <TouchableOpacity onPress={fetchRecentCustomers} disabled={loadingRecentCustomers}>
              <Text style={[styles.beneficiaryLink, { color: colors.primary }]}>{loadingRecentCustomers ? 'Loading...' : 'Choose from recent'}</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.inputContainer, { backgroundColor: colors.backgroundSecondary, borderColor: errors.phone ? colors.error : colors.divider }]}>
            <TextInput style={[styles.input, { color: colors.textPrimary }]} placeholder="Enter 11-digit phone number" value={phone} onChangeText={handlePhoneChange} keyboardType="phone-pad" maxLength={11} placeholderTextColor={colors.textMuted} />
            <TouchableOpacity style={styles.contactButton} onPress={fetchRecentCustomers} disabled={loadingRecentCustomers}>
              {loadingRecentCustomers ? <ActivityIndicator size="small" color={colors.textSecondary} /> : <Ionicons name="people-outline" size={20} color={colors.textSecondary} />}
            </TouchableOpacity>
          </View>
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
        </View>

        {/* Amount */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Amount</Text>
          <View style={[styles.inputContainer, { backgroundColor: colors.backgroundSecondary, borderColor: errors.amount ? colors.error : colors.divider }]}>
            <TextInput style={[styles.input, { color: colors.textPrimary }]} placeholder="Enter custom amount" value={customAmount} onChangeText={handleCustomAmountChange} keyboardType="decimal-pad" placeholderTextColor={colors.textMuted} />
            <Text style={[styles.currencySymbol, { color: colors.textSecondary }]}>₦</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.amountsScroll} contentContainerStyle={styles.amountsScrollContent}>
            {AIRTIME_AMOUNTS.map((amt) => (
              <TouchableOpacity key={amt} style={[styles.amountChip, { backgroundColor: colors.card, borderColor: colors.divider }, amount === amt && { backgroundColor: colors.primary, borderColor: colors.primary }]} onPress={() => handleAmountSelect(amt)}>
                <Text style={[styles.amountChipText, { color: colors.textSecondary }, amount === amt && { color: '#FFFFFF' }]}>₦{formatAmount(amt)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}

          {amount && parseFloat(amount) > 0 && (
            <View style={[styles.amountDisplayContainer, { backgroundColor: colors.backgroundSecondary }]}>
              <View style={styles.amountDisplay}>
                <Text style={[styles.amountDisplayLabel, { color: colors.textSecondary }]}>Amount to pay:</Text>
                <Text style={styles.amountDisplayValue}>₦{formatAmount(amount)}</Text>
              </View>
              {commission > 0 && (
                <View style={[styles.commissionContainer, { borderTopColor: colors.divider }]}>
                  <Text style={styles.commissionText}>You will earn: ₦{formatAmount(commission)}</Text>
                  {loadingCommission && <ActivityIndicator size="small" color="#10B981" style={styles.commissionLoader} />}
                </View>
              )}
            </View>
          )}
        </View>

        <TouchableOpacity style={[styles.proceedButton, { backgroundColor: colors.primary, shadowColor: colors.primary }, (isSubmitting || !amount || !selectedNetwork || !phone) && styles.proceedButtonDisabled]} onPress={handleProceed} disabled={isSubmitting || !amount || !selectedNetwork || !phone}>
          {isSubmitting ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.proceedButtonText}>{!amount || !selectedNetwork || !phone ? 'Fill all fields' : 'Proceed to Buy'}</Text>}
        </TouchableOpacity>

        <View style={{ height: 320 }} />
      </ScrollView>

      <RecentCustomersModal visible={showRecentModal} onClose={() => setShowRecentModal(false)} customers={recentCustomers} loading={loadingRecentCustomers} onSelectCustomer={handleSelectCustomer} />
    </View>
  );
}

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  container: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40, minHeight: 400, maxHeight: '80%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, borderBottomWidth: 1, paddingBottom: 12 },
  title: { fontSize: 20, fontFamily: 'Poppins-SemiBold' },
  closeButton: { padding: 4 },
  subtitle: { fontSize: 14, fontFamily: 'Poppins-Regular', marginBottom: 24, marginTop: 8 },
  listContent: { paddingBottom: 20 },
  customerItem: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 16, marginBottom: 8, borderWidth: 1 },
  customerIcon: { marginRight: 12 },
  customerInfo: { flex: 1 },
  customerPhone: { fontSize: 16, fontFamily: 'Poppins-Medium' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  loadingText: { fontSize: 14, fontFamily: 'Poppins-Regular', marginTop: 12 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 18, fontFamily: 'Poppins-SemiBold', marginTop: 16, marginBottom: 8 },
  emptyDescription: { fontSize: 14, fontFamily: 'Poppins-Regular', textAlign: 'center', maxWidth: 300, lineHeight: 20 },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  networksContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  networkCard: { alignItems: 'center', borderRadius: 12, padding: 12, width: 80, height: 90, borderWidth: 2, borderColor: 'transparent' },
  networkLogoContainer: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  networkLogo: { width: 36, height: 36, borderRadius: 18 },
  networkName: { fontSize: 12, fontFamily: 'Poppins-Medium', textAlign: 'center' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 16, height: 56, borderWidth: 1 },
  input: { flex: 1, fontSize: 16, fontFamily: 'Poppins-Regular' },
  contactButton: { padding: 8 },
  currencySymbol: { fontSize: 16, fontFamily: 'Poppins-Medium', marginLeft: 8 },
  amountsScroll: { marginHorizontal: -20, marginTop: 12 },
  amountsScrollContent: { paddingHorizontal: 20, gap: 8 },
  amountChip: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, minWidth: 80, alignItems: 'center', justifyContent: 'center' },
  amountChipText: { fontSize: 14, fontFamily: 'Poppins-Medium' },
  amountDisplayContainer: { marginTop: 16, borderRadius: 12, padding: 16 },
  amountDisplay: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  amountDisplayLabel: { fontSize: 14, fontFamily: 'Poppins-Medium' },
  amountDisplayValue: { fontSize: 18, fontFamily: 'Poppins-Bold', color: '#10B981' },
  commissionContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTopWidth: 1 },
  commissionText: { fontSize: 14, fontFamily: 'Poppins-Medium', color: '#10B981' },
  commissionLoader: { marginLeft: 8 },
  proceedButton: { marginHorizontal: 20, borderRadius: 12, height: 56, justifyContent: 'center', alignItems: 'center', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4, marginTop: 8, marginBottom: 24 },
  proceedButtonDisabled: { backgroundColor: '#94A3B8', opacity: 0.6 },
  proceedButtonText: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Poppins-SemiBold' },
  errorText: { color: '#EF4444', fontSize: 12, fontFamily: 'Poppins-Regular', marginTop: 8 },
});