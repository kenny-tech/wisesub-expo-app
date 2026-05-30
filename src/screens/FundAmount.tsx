import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useRoute } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useProfile } from '../redux/hooks/useProfile';
import { FLUTTERWAVE_PUBLIC_KEY } from '../services/api';
import { walletService } from '../services/walletService';
import { useTheme } from '../theme/ThemeContext';
import { showError, showSuccess } from '../utils/toast';

type FundAmountRouteProps = {
  FundAmount: {
    method: 'bank' | 'card';
  };
};

// ─── Flutterwave HTML Generator ───────────────────────────────────────────────
function generateFlutterwaveHtml(
  amountNum: number,
  txRef: string,
  userEmail: string,
  userPhone: string,
  userName: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #F8FAFC;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }
    .loader-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
    }
    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid #E2E8F0;
      border-top-color: #1F54DD;
      border-radius: 50%;
      animation: spin 0.9s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .loader-text {
      color: #64748B;
      font-size: 15px;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="loader-wrap">
    <div class="spinner"></div>
    <p class="loader-text">Connecting to payment gateway...</p>
  </div>
  <script src="https://checkout.flutterwave.com/v3.js"></script>
  <script>
    window.onload = function () {
      FlutterwaveCheckout({
        public_key: "${FLUTTERWAVE_PUBLIC_KEY}",
        tx_ref: "${txRef}",
        amount: ${amountNum},
        currency: "NGN",
        payment_options: "card,mobilemoney,ussd",
        customer: {
          email: "${userEmail}",
          phone_number: "${userPhone}",
          name: "${userName}",
        },
        customizations: {
          title: "Wallet Funding",
          description: "Fund wallet: ₦${amountNum.toLocaleString()}",
          logo: "https://app.wisesub.com.ng/images/favicon.png",
        },
        callback: function (response) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'payment_response',
            data: response,
          }));
        },
        onclose: function () {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'payment_closed',
          }));
        },
      });
    };
  </script>
</body>
</html>
  `;
}

// ─── Card Payment Modal (theme‑aware) ───────────────────────────────────────
function CardPaymentModal({
  visible,
  onClose,
  amount,
  userEmail,
  userName,
  userPhone,
  onPaymentSuccess,
  onPaymentCancelled,
  colors,
}: {
  visible: boolean;
  onClose: () => void;
  amount: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  onPaymentSuccess: () => void;
  onPaymentCancelled: () => void;
  colors: any;
}) {
  const styles = makeModalStyles(colors);
  const amountNum = parseFloat(amount) || 0;
  const fee = amountNum * 0.02;
  const total = (amountNum + fee).toFixed(2);
  const txRef = useRef(`ws_m_${Date.now()}`).current;

  const [step, setStep] = useState<'confirm' | 'pay'>('confirm');
  const [webViewLoading, setWebViewLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  const resetAndClose = () => {
    setStep('confirm');
    setWebViewLoading(true);
    onClose();
  };

  const handleMessage = async (event: any) => {
    const message = JSON.parse(event.nativeEvent.data);

    if (message.type === 'payment_response') {
      const res = message.data;
      if (res.status === 'successful') {
        setVerifying(true);
        try {
          const paymentResponse = await walletService.createCardPayment({
            amount: amountNum,
            tx_ref: res.tx_ref,
            status: res.status,
            transaction_id: res.transaction_id.toString(),
          });
          if (paymentResponse.success) {
            showSuccess('Success', 'Payment successful!');
            onPaymentSuccess();
          } else {
            showError('Error', paymentResponse.message || 'Payment verification failed');
            onPaymentSuccess();
          }
        } catch (err: any) {
          showError('Error', err.message || 'Payment verification failed');
          resetAndClose();
        } finally {
          setVerifying(false);
        }
      }
    }

    if (message.type === 'payment_closed') {
      resetAndClose();
      onPaymentCancelled();
    }
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={resetAndClose}>
      {/* ── CONFIRM STEP ── */}
      {step === 'confirm' && (
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.dismissArea} activeOpacity={1} onPress={resetAndClose} />
          <View style={[styles.sheet, { backgroundColor: colors.card }]}>
            <View style={[styles.handle, { backgroundColor: colors.divider }]} />

            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.textPrimary }]}>Confirm Payment</Text>
              <TouchableOpacity onPress={resetAndClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Review your payment details below</Text>

            <View style={[styles.detailsCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.divider }]}>
              {/* Amount */}
              <View style={styles.detailRow}>
                <View style={[styles.detailIconBox, { backgroundColor: '#EEF2FF' }]}>
                  <Ionicons name="wallet-outline" size={18} color={colors.primary} />
                </View>
                <View style={styles.detailTexts}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Amount to fund</Text>
                  <Text style={[styles.detailValue, { color: colors.textPrimary }]}>₦{amountNum.toLocaleString()}</Text>
                </View>
              </View>

              <View style={[styles.separator, { backgroundColor: colors.divider }]} />

              {/* Fee */}
              <View style={styles.detailRow}>
                <View style={[styles.detailIconBox, { backgroundColor: '#FFF7ED' }]}>
                  <Ionicons name="receipt-outline" size={18} color="#F59E0B" />
                </View>
                <View style={styles.detailTexts}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Processing fee (2%)</Text>
                    <Text style={[styles.feeNote, { color: '#F59E0B' }]}>Charged by payment provider</Text>
                  </View>
                  <Text style={[styles.detailValue, { color: colors.textPrimary }]}>₦{fee.toFixed(2)}</Text>
                </View>
              </View>

              <View style={[styles.separator, { backgroundColor: colors.divider }]} />

              {/* Total */}
              <View style={[styles.totalBox, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.totalLabel, { color: colors.textPrimary }]}>Estimated Total</Text>
                <Text style={[styles.totalValue, { color: colors.primary }]}>
                  ₦{parseFloat(total).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                </Text>
              </View>
            </View>

            <View style={styles.noteRow}>
              <Ionicons name="information-circle-outline" size={15} color={colors.textMuted} />
              <Text style={[styles.noteText, { color: colors.textMuted }]}>
                The exact amount charged may vary slightly based on Flutterwave's fees.
              </Text>
            </View>

            <TouchableOpacity style={[styles.payButton, { backgroundColor: colors.primary }]} onPress={() => setStep('pay')}>
              <Ionicons name="lock-closed" size={16} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.payButtonText}>
                Pay Now · ₦{parseFloat(total).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
              </Text>
            </TouchableOpacity>

            <View style={styles.secureBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#10B981" />
              <Text style={[styles.secureText, { color: '#10B981' }]}>Secured by Flutterwave</Text>
            </View>
          </View>
        </View>
      )}

      {/* ── PAY STEP (full screen WebView) ── */}
      {step === 'pay' && (
        <View style={styles.webViewFullScreen}>
          <View style={[styles.webViewHeader, { backgroundColor: colors.background, borderBottomColor: colors.separator }]}>
            <TouchableOpacity
              onPress={() => {
                setStep('confirm');
                setWebViewLoading(true);
              }}
              style={[styles.webViewBackButton, { backgroundColor: colors.backgroundSecondary }]}
            >
              <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={[styles.webViewTitle, { color: colors.textPrimary }]}>Card Payment</Text>
            <View style={{ width: 36 }} />
          </View>

          <WebView
            source={{
              html: generateFlutterwaveHtml(amountNum, txRef, userEmail, userPhone, userName),
            }}
            onMessage={handleMessage}
            onLoadEnd={() => setWebViewLoading(false)}
            javaScriptEnabled
            domStorageEnabled
            style={{ flex: 1 }}
          />

          {(webViewLoading || verifying) && (
            <View style={[styles.webViewLoader, { backgroundColor: colors.background }]}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.webViewLoaderText, { color: colors.textSecondary }]}>
                {verifying ? 'Verifying payment...' : 'Connecting to payment gateway...'}
              </Text>
            </View>
          )}
        </View>
      )}
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function FundAmount({ navigation }: { navigation: any }) {
  const { colors } = useTheme();
  const styles = makeScreenStyles(colors);
  const { user } = useProfile();
  const route = useRoute<RouteProp<FundAmountRouteProps, 'FundAmount'>>();
  const { method } = route.params;

  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showCardModal, setShowCardModal] = useState<boolean>(false);

  const quickAmounts = ['500', '1000', '2000', '5000', '10000', '20000'];

  const handleAmountSelect = (selectedAmount: string) => {
    setAmount(selectedAmount);
    setError('');
  };

  const validateAmount = () => {
    if (!amount.trim()) {
      setError('Please enter an amount');
      return false;
    }
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      return false;
    }
    if (amountNum < 100) {
      setError('Minimum amount is ₦100');
      return false;
    }
    if (amountNum > 1000000) {
      setError('Maximum amount is ₦1,000,000');
      return false;
    }
    return true;
  };

  const handleBankTransfer = async () => {
    if (!user?.email) {
      showError('Error', 'User email not found. Please login again.');
      return;
    }
    setLoading(true);
    try {
      const response = await walletService.generateBankTransfer({
        email: user.email,
        amount: parseFloat(amount),
      });
      if (response?.status === 'success') {
        navigation.navigate('BankTransferDetails', {
          transferDetails: response.data,
          amount: amount,
        });
      } else {
        showError('Error', response?.message || 'Failed to generate transfer details');
      }
    } catch (error: any) {
      showError('Error', error.message || 'Failed to process bank transfer');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateAmount()) return;
    if (method === 'bank') {
      await handleBankTransfer();
    } else {
      if (!user?.email) {
        showError('Error', 'User email not found. Please login again.');
        return;
      }
      setShowCardModal(true);
    }
  };

  const getMethodDetails = () => {
    return method === 'bank'
      ? {
        title: 'Bank Transfer',
        icon: 'business',
        color: colors.primary,
        description: 'Transfer directly from your bank account',
        instructions: 'You will be provided with bank details to complete the transfer',
      }
      : {
        title: 'Card Payment',
        icon: 'card',
        color: '#16A34A',
        description: 'Pay instantly with your debit/credit card',
        instructions: 'Review your details, then confirm payment in the next step',
      };
  };

  const methodDetails = getMethodDetails();

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Top Up</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Method Info */}
        <View style={[styles.methodCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.divider }]}>
          <View style={[styles.methodIcon, { backgroundColor: `${methodDetails.color}20` }]}>
            <Ionicons name={methodDetails.icon as any} size={32} color={methodDetails.color} />
          </View>
          <Text style={[styles.methodTitle, { color: colors.textPrimary }]}>{methodDetails.title}</Text>
          <Text style={[styles.methodDescription, { color: colors.textSecondary }]}>{methodDetails.description}</Text>
        </View>

        {/* Amount Input */}
        <View style={styles.amountSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Enter Amount</Text>
          <View style={[styles.amountInputContainer, { borderColor: colors.primary }]}>
            <Text style={[styles.currencySymbol, { color: colors.textPrimary }]}>₦</Text>
            <TextInput
              style={[styles.amountInput, { color: colors.textPrimary }]}
              placeholder="0.00"
              value={amount}
              onChangeText={(text) => {
                setAmount(text);
                setError('');
              }}
              keyboardType="numeric"
              placeholderTextColor={colors.textMuted}
            />
          </View>
          {error ? <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text> : null}

          {/* Quick Amounts */}
          <View style={styles.quickAmounts}>
            <Text style={[styles.quickAmountsLabel, { color: colors.textSecondary }]}>Quick Select</Text>
            <View style={styles.quickAmountsGrid}>
              {quickAmounts.map((quickAmount) => (
                <TouchableOpacity
                  key={quickAmount}
                  style={[
                    styles.quickAmountButton,
                    { backgroundColor: colors.backgroundSecondary, borderColor: colors.divider },
                    amount === quickAmount && { backgroundColor: colors.primary, borderColor: colors.primary }
                  ]}
                  onPress={() => handleAmountSelect(quickAmount)}
                >
                  <Text
                    style={[
                      styles.quickAmountText,
                      { color: colors.textSecondary },
                      amount === quickAmount && { color: '#FFFFFF' }
                    ]}
                  >
                    ₦{quickAmount}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Instructions */}
        <View style={[styles.infoCard, { backgroundColor: colors.primaryLight, borderColor: `${colors.primary}20` }]}>
          <Ionicons name="information-circle" size={20} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>{methodDetails.instructions}</Text>
        </View>

        {/* Additional Info for Bank Transfer */}
        {method === 'bank' && (
          <View style={[styles.additionalInfoCard, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
            <Ionicons name="time-outline" size={20} color="#F59E0B" />
            <Text style={[styles.additionalInfoText, { color: '#92400E' }]}>
              Bank transfers are processed within 1-5 minutes. Your wallet will be credited automatically.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Submit Button */}
      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.separator }]}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: colors.primary },
            (!amount || loading) && { backgroundColor: '#94A3B8', opacity: 0.6 }
          ]}
          onPress={handleSubmit}
          disabled={!amount || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>
              Continue to {method === 'bank' ? 'Bank Transfer' : 'Card Payment'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Card Payment Modal */}
      {showCardModal && (
        <CardPaymentModal
          visible={showCardModal}
          onClose={() => setShowCardModal(false)}
          amount={amount}
          userEmail={user?.email || ''}
          userName={user?.name || ''}
          userPhone={user?.phone || ''}
          onPaymentSuccess={() => {
            setShowCardModal(false);
            navigation.navigate('Tabs');
          }}
          onPaymentCancelled={() => {
            setShowCardModal(false);
          }}
          colors={colors}
        />
      )}
    </View>
  );
}

// ─── Modal Styles ─────────────────────────────────────────────────────────────
const makeModalStyles = (colors: any) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  dismissArea: { flex: 1 },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },
  handle: { width: 40, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  title: { fontSize: 20, fontFamily: 'Poppins-SemiBold' },
  closeButton: { padding: 4 },
  subtitle: { fontSize: 14, fontFamily: 'Poppins-Regular', marginBottom: 20 },
  detailsCard: { borderRadius: 16, borderWidth: 1, marginBottom: 14, overflow: 'hidden' },
  detailRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  detailIconBox: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  detailTexts: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailLabel: { fontSize: 13, fontFamily: 'Poppins-Regular', flex: 1 },
  feeNote: { fontSize: 11, fontFamily: 'Poppins-Regular', marginTop: 2 },
  detailValue: { fontSize: 14, fontFamily: 'Poppins-SemiBold', textAlign: 'right', maxWidth: '55%' },
  separator: { height: 1, marginHorizontal: 14 },
  totalBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  totalLabel: { fontSize: 15, fontFamily: 'Poppins-SemiBold' },
  totalValue: { fontSize: 18, fontFamily: 'Poppins-Bold' },
  noteRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 20, paddingHorizontal: 2 },
  noteText: { flex: 1, fontSize: 11, fontFamily: 'Poppins-Regular', lineHeight: 16 },
  payButton: { borderRadius: 12, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  payButtonText: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Poppins-SemiBold' },
  secureBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 15 },
  secureText: { fontSize: 12, fontFamily: 'Poppins-Regular' },
  webViewFullScreen: { flex: 1 },
  webViewHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 54, paddingBottom: 14, borderBottomWidth: 1 },
  webViewBackButton: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  webViewTitle: { fontSize: 16, fontFamily: 'Poppins-SemiBold' },
  webViewLoader: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', gap: 14 },
  webViewLoaderText: { fontSize: 14, fontFamily: 'Poppins-Regular' },
});

// ─── Screen Styles ────────────────────────────────────────────────────────────
const makeScreenStyles = (colors: any) => StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  backButton: { padding: 4 },
  title: { fontSize: 18, fontFamily: 'Poppins-SemiBold' },
  placeholder: { width: 32 },
  content: { flex: 1, paddingHorizontal: 20 },
  methodCard: { borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 24, borderWidth: 1 },
  methodIcon: { width: 64, height: 64, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  methodTitle: { fontSize: 20, fontFamily: 'Poppins-Bold', marginBottom: 8, textAlign: 'center' },
  methodDescription: { fontSize: 14, fontFamily: 'Poppins-Regular', textAlign: 'center', lineHeight: 20 },
  amountSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontFamily: 'Poppins-SemiBold', marginBottom: 16 },
  amountInputContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 16, borderWidth: 2, marginBottom: 8 },
  currencySymbol: { fontSize: 24, fontFamily: 'Poppins-Bold', marginRight: 8 },
  amountInput: { flex: 1, fontSize: 24, fontFamily: 'Poppins-Bold', padding: 0 },
  errorText: { fontSize: 12, fontFamily: 'Poppins-Regular', marginTop: 4 },
  quickAmounts: { marginTop: 16 },
  quickAmountsLabel: { fontSize: 14, fontFamily: 'Poppins-Medium', marginBottom: 12 },
  quickAmountsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  quickAmountButton: { borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16, borderWidth: 1 },
  quickAmountText: { fontSize: 14, fontFamily: 'Poppins-Medium' },
  infoCard: { flexDirection: 'row', alignItems: 'flex-start', borderRadius: 12, padding: 16, borderWidth: 1, marginBottom: 16 },
  infoText: { flex: 1, fontSize: 12, fontFamily: 'Poppins-Regular', marginLeft: 8, lineHeight: 16 },
  additionalInfoCard: { flexDirection: 'row', alignItems: 'flex-start', borderRadius: 12, padding: 16, borderWidth: 1, marginBottom: 16 },
  additionalInfoText: { flex: 1, fontSize: 12, fontFamily: 'Poppins-Regular', marginLeft: 8, lineHeight: 16 },
  footer: { padding: 20, marginBottom: 40, borderTopWidth: 1 },
  submitButton: { borderRadius: 12, padding: 16, alignItems: 'center', justifyContent: 'center' },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Poppins-SemiBold' },
});