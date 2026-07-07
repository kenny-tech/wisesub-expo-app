import WAECReceipt from '@/src/components/bills/WAECReceipt';
import { formatAmount } from '@/src/helper/util';
import { useProfile } from '@/src/redux/hooks/useProfile';
import { billService } from '@/src/services/billService';
import { useTheme } from '@/src/theme/ThemeContext';
import { showError, showSuccess } from '@/src/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { PurchaseDetail } from '../ConfirmPurchase';

type RouteParams = {
    serviceID: 'waec' | 'waec-registration';
    title: string;
    type: string;
    serviceType: string;
    name: string;
};

export default function WAECPurchase({ navigation }: { navigation: any }) {
    const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
    const { serviceID, title, type, serviceType, name } = route.params;

    const { colors } = useTheme();
    const styles = makeStyles(colors);

    const [plans, setPlans] = useState<any[]>([]);
    const [loadingPlans, setLoadingPlans] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formattedAmount, setFormattedAmount] = useState('');
    const [commission, setCommission] = useState(0);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showPlanPicker, setShowPlanPicker] = useState(false);
    const [showReceipt, setShowReceipt] = useState(false);
    const [receiptData, setReceiptData] = useState<any>(null);

    const { user } = useProfile();

    useEffect(() => {
        fetchPlans();
        if (user?.phone && !phoneNumber) setPhoneNumber(user.phone);
    }, []);

    const fetchPlans = async () => {
        setLoadingPlans(true);
        try {
            const res = await billService.getVariationCodes(serviceID);
            if (res?.content?.variations) {
                setPlans(res.content.variations);
            }
        } catch (error) {
            console.error('Failed to fetch WAEC plans:', error);
            showError('Error', 'Failed to load plans. Please refresh.');
        } finally {
            setLoadingPlans(false);
        }
    };

    useEffect(() => {
        if (selectedPlan && quantity > 0) {
            const amt = parseFloat(selectedPlan.variation_amount) * quantity;
            setFormattedAmount(formatAmount(amt));
        } else {
            setFormattedAmount('');
            setCommission(0);
        }
    }, [selectedPlan, quantity]);

    const validatePhoneNumber = (phone: string) =>
        /^(0|\+234)[7-9][0-1]\d{8}$/.test(phone);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!selectedPlan) newErrors.plan = 'Please select a plan';
        if (!phoneNumber) newErrors.phone = 'Phone number is required';
        else if (!validatePhoneNumber(phoneNumber)) newErrors.phone = 'Invalid phone number';
        if (quantity < 1) newErrors.quantity = 'Minimum quantity is 1';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleProceed = () => {
        if (!validateForm()) {
            const firstError = Object.values(errors)[0];
            if (firstError) showError('Validation Error', firstError);
            return;
        }
        navigation.navigate('ConfirmPurchase', {
            onConfirm: purchaseWAEC,
            title: `Confirm ${title}`,
            providerLogo: require('../../../assets/images/waec-logo.png'),
            providerName: title,
            details: getConfirmationDetails(),
            amount: parseFloat(selectedPlan.variation_amount) * quantity,
            commission,
            confirmButtonText: 'Purchase',
            infoNote: 'You will receive the PIN(s) immediately after confirmation.',
        });
    };

    const getConfirmationDetails = (): PurchaseDetail[] => {
        const details: PurchaseDetail[] = [];
        if (selectedPlan) details.push({ label: 'Plan', value: selectedPlan.name, icon: 'document-text-outline', iconColor: colors.textSecondary });
        details.push({ label: 'Quantity', value: String(quantity), icon: 'layers-outline', iconColor: colors.textSecondary });
        details.push({ label: 'Phone', value: phoneNumber, icon: 'call-outline', iconColor: colors.textSecondary });
        if (formattedAmount) details.push({ label: 'Total', value: `₦${formattedAmount}`, icon: 'cash-outline', iconColor: colors.textSecondary, valueColor: '#10B981' });
        return details;
    };

    const purchaseWAEC = async (pin: string) => {
        setIsSubmitting(true);
        try {
            const providerLogo = 'https://app.wisesub.com.ng/images/waec-logo.png';
            const payload = {
                serviceID,
                variation_code: selectedPlan.variation_code,
                amount: parseFloat(selectedPlan.variation_amount) * quantity,
                phone: phoneNumber,
                customer: phoneNumber,
                billersCode: phoneNumber,
                type: name,
                service_type: serviceType,
                provider_logo: providerLogo,
                name: name,
                quantity: quantity,
                pin,
            };

            const response = await billService.purchaseData(payload);

            if (response.success) {
                const data = response.data;
                const cards = data?.cards;
                const tokens = data?.tokens;
                const purchasedCode = data?.purchased_code;

                if (cards || tokens || purchasedCode) {
                    setReceiptData({
                        cards,
                        tokens,
                        purchasedCode,
                        amount: payload.amount,
                        customer: phoneNumber,
                        serviceType: serviceID,
                        productName: title,
                    });
                    navigation.goBack(); // close confirm modal
                    setShowReceipt(true);
                } else {
                    showSuccess('Success', response.message || 'Purchase successful');
                    navigation.navigate('Tabs');
                }
                return { success: true };
            } else {
                const msg = response.message || 'Purchase failed';
                if (!/pin/i.test(msg)) showError('Error', msg);
                return { success: false, message: msg };
            }
        } catch (error: any) {
            const msg = error.message || 'Purchase failed';
            if (!/pin/i.test(msg)) showError('Error', msg);
            return { success: false, message: msg };
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderPlanPicker = () => (
        <Modal visible={showPlanPicker} animationType="slide" transparent>
            <TouchableOpacity
                activeOpacity={1}
                style={styles.modalOverlay}
                onPress={() => setShowPlanPicker(false)}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    style={[styles.modalContainer, { backgroundColor: colors.card }]}
                    onPress={(e) => e.stopPropagation()}
                >
                    <View style={[styles.modalHeader, { borderBottomColor: colors.separator }]}>
                        <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Select Plan</Text>
                        <TouchableOpacity onPress={() => setShowPlanPicker(false)}>
                            <Ionicons name="close" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                    {loadingPlans ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={colors.primary} />
                            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading plans...</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={plans}
                            keyExtractor={(item) => item.variation_code}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.planItem, { borderBottomColor: colors.divider }]}
                                    onPress={() => {
                                        setSelectedPlan(item);
                                        setShowPlanPicker(false);
                                        setErrors((prev) => ({ ...prev, plan: '' }));
                                    }}
                                >
                                    <View>
                                        <Text style={[styles.planName, { color: colors.textPrimary }]}>{item.name}</Text>
                                        <Text style={[styles.planPrice, { color: colors.textSecondary }]}>
                                            ₦{formatAmount(item.variation_amount)}
                                        </Text>
                                    </View>
                                    {selectedPlan?.variation_code === item.variation_code && (
                                        <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                                    )}
                                </TouchableOpacity>
                            )}
                            contentContainerStyle={{ paddingBottom: 20 }}
                        />
                    )}
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );

    return (
        <View style={styles.container}>
            <View style={[styles.header, { borderBottomColor: colors.separator }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.textPrimary }]}>Buy {title}</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {/* Plan selection */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Select Plan</Text>
                    <TouchableOpacity
                        style={[styles.planSelector, { backgroundColor: colors.backgroundSecondary, borderColor: errors.plan ? colors.error : colors.divider }]}
                        onPress={() => setShowPlanPicker(true)}
                    >
                        <Text style={[styles.planSelectorText, { color: selectedPlan ? colors.textPrimary : colors.textMuted }]}>
                            {selectedPlan ? `${selectedPlan.name} - ₦${formatAmount(selectedPlan.variation_amount)}` : 'Choose a plan...'}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                    {errors.plan && <Text style={[styles.errorText, { color: colors.error }]}>{errors.plan}</Text>}
                </View>

                {/* Phone Number */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Phone Number</Text>
                    <View style={[styles.inputContainer, { backgroundColor: colors.backgroundSecondary, borderColor: errors.phone ? colors.error : colors.divider }]}>
                        <TextInput
                            style={[styles.input, { color: colors.textPrimary }]}
                            placeholder="Enter phone number"
                            value={phoneNumber}
                            onChangeText={(text) => {
                                setPhoneNumber(text);
                                setErrors((prev) => ({ ...prev, phone: '' }));
                            }}
                            keyboardType="phone-pad"
                            placeholderTextColor={colors.textMuted}
                        />
                    </View>
                    {errors.phone && <Text style={[styles.errorText, { color: colors.error }]}>{errors.phone}</Text>}
                </View>

                {/* Quantity */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Quantity</Text>
                    <View style={styles.quantityRow}>
                        <TouchableOpacity
                            style={[styles.quantityButton, { backgroundColor: colors.backgroundSecondary }]}
                            onPress={() => setQuantity(Math.max(1, quantity - 1))}
                        >
                            <Ionicons name="remove" size={24} color={colors.textPrimary} />
                        </TouchableOpacity>
                        <TextInput
                            style={[styles.quantityInput, { color: colors.textPrimary }]}
                            value={String(quantity)}
                            onChangeText={(text) => {
                                const val = parseInt(text) || 1;
                                setQuantity(Math.max(1, val));
                                setErrors((prev) => ({ ...prev, quantity: '' }));
                            }}
                            keyboardType="number-pad"
                        />
                        <TouchableOpacity
                            style={[styles.quantityButton, { backgroundColor: colors.backgroundSecondary }]}
                            onPress={() => setQuantity(quantity + 1)}
                        >
                            <Ionicons name="add" size={24} color={colors.textPrimary} />
                        </TouchableOpacity>
                    </View>
                    {errors.quantity && <Text style={[styles.errorText, { color: colors.error }]}>{errors.quantity}</Text>}
                </View>

                {/* Amount & Commission */}
                {formattedAmount && (
                    <View style={[styles.amountContainer, { backgroundColor: colors.backgroundSecondary }]}>
                        <View style={styles.amountRow}>
                            <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>Total Amount</Text>
                            <Text style={[styles.amountValue, { color: '#10B981' }]}>₦{formattedAmount}</Text>
                        </View>
                        {commission > 0 && (
                            <View style={[styles.commissionRow, { borderTopColor: colors.divider }]}>
                                <Text style={[styles.commissionText, { color: '#10B981' }]}>You will earn: ₦{formatAmount(commission)}</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Proceed Button */}
                <TouchableOpacity
                    style={[
                        styles.proceedButton,
                        { backgroundColor: colors.primary },
                        (!selectedPlan || !phoneNumber || isSubmitting) && { backgroundColor: '#94A3B8', opacity: 0.6 },
                    ]}
                    onPress={handleProceed}
                    disabled={!selectedPlan || !phoneNumber || isSubmitting}
                >
                    {isSubmitting ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.proceedButtonText}>Continue</Text>}
                </TouchableOpacity>

                <View style={[styles.infoSection, { backgroundColor: colors.primaryLight }]}>
                    <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} />
                    <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                        You will receive the PIN(s) immediately after purchase.
                    </Text>
                </View>
                <View style={{ height: 40 }} />
            </ScrollView>

            {renderPlanPicker()}

            {showReceipt && receiptData && (
                <WAECReceipt
                    visible={showReceipt}
                    onClose={() => {
                        setShowReceipt(false);
                        setReceiptData(null);
                        navigation.navigate('Tabs');
                    }}
                    {...receiptData}
                />
            )}
        </View>
    );
}

const makeStyles = (colors: any) =>
    StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingTop: 60,
            paddingBottom: 20,
            borderBottomWidth: 1,
        },
        backButton: { padding: 4 },
        title: { fontSize: 20, fontFamily: 'Poppins-SemiBold' },
        placeholder: { width: 32 },
        scrollView: { flex: 1 },
        scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
        section: { marginBottom: 24 },
        sectionTitle: { fontSize: 16, fontFamily: 'Poppins-SemiBold', marginBottom: 12 },
        planSelector: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRadius: 12,
            paddingHorizontal: 16,
            height: 56,
            borderWidth: 1,
        },
        planSelectorText: { fontSize: 16, fontFamily: 'Poppins-Regular', flex: 1 },
        inputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: 12,
            paddingHorizontal: 16,
            height: 56,
            borderWidth: 1,
        },
        input: { flex: 1, fontSize: 16, fontFamily: 'Poppins-Regular' },
        quantityRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
        },
        quantityButton: {
            width: 44,
            height: 44,
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
        },
        quantityInput: {
            width: 60,
            textAlign: 'center',
            fontSize: 18,
            fontFamily: 'Poppins-Medium',
            marginHorizontal: 12,
        },
        amountContainer: { borderRadius: 12, padding: 16, marginBottom: 24 },
        amountRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
        amountLabel: { fontSize: 14, fontFamily: 'Poppins-Medium' },
        amountValue: { fontSize: 18, fontFamily: 'Poppins-Bold' },
        commissionRow: { marginTop: 8, paddingTop: 8, borderTopWidth: 1 },
        commissionText: { fontSize: 14, fontFamily: 'Poppins-Medium' },
        proceedButton: {
            borderRadius: 12,
            height: 56,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 16,
        },
        proceedButtonText: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Poppins-SemiBold' },
        errorText: { fontSize: 12, fontFamily: 'Poppins-Regular', marginTop: 8 },
        infoSection: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 12,
            marginBottom: 16,
        },
        infoText: { fontSize: 12, fontFamily: 'Poppins-Regular', marginLeft: 8, flex: 1 },
        // Modal styles
        modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
        modalContainer: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 40,
            maxHeight: '80%',
        },
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: 12,
            borderBottomWidth: 1,
        },
        modalTitle: { fontSize: 18, fontFamily: 'Poppins-SemiBold' },
        loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
        loadingText: { fontSize: 14, fontFamily: 'Poppins-Regular', marginTop: 12 },
        planItem: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 16,
            borderBottomWidth: 1,
        },
        planName: { fontSize: 16, fontFamily: 'Poppins-Medium' },
        planPrice: { fontSize: 14, fontFamily: 'Poppins-Regular', marginTop: 2 },
    });