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
import { PAYSTACK_PUBLIC_KEY } from '../services/api';
import { walletService } from '../services/walletService';
import { showError, showSuccess } from '../utils/toast';

type FundAmountRouteProps = {
  FundAmount: { method: 'bank' | 'card' };
};

// ─── Paystack HTML Generator ──────────────────────────────────────────────────
function generatePaystackHtml(
  amountInKobo: number,
  reference: string,
  userEmail: string,
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
    <p class="loader-text">Connecting to Paystack...</p>
  </div>
  <script src="https://js.paystack.co/v2/inline.js"></script>
  <script>
    window.onload = function () {
      var handler = PaystackPop.setup({
        key: "${PAYSTACK_PUBLIC_KEY}",
        email: "${userEmail}",
        amount: ${amountInKobo},
        currency: "NGN",
        ref: "${reference}",
        callback: function(response) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'payment_response',
            data: {
              status: 'successful',
              reference: response.reference,   // this is tx_ref equivalent
              trans: response.trans,           // numeric transaction ID
              trxref: response.trxref,
            }
          }));
        },
        onClose: function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'payment_closed'
          }));
        }
      });
      handler.openIframe();
    };
  </script>
</body>
</html>`;
}

// ─── Card Payment Modal (Paystack) ────────────────────────────────────────────
function CardPaymentModal({
  visible,
  onClose,
  amount,
  userEmail,
  onPaymentSuccess,
  onPaymentCancelled,
}: {
  visible: boolean;
  onClose: () => void;
  amount: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  onPaymentSuccess: () => void;
  onPaymentCancelled: () => void;
}) {
  const amountNum = parseFloat(amount) || 0;
  const amountInKobo = Math.round(amountNum * 100); // Paystack uses kobo
  const fee = amountNum * 0.015;            // Paystack standard fee is 1.5%
  const total = (amountNum + fee).toFixed(2);
  const reference = useRef(`ws_m_${Date.now()}`).current;

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
          // Send Paystack fields — reference = tx_ref, trans = transaction_id
          const paymentResponse = await walletService.createPaystackCardPayment({
            amount: amountNum,
            tx_ref: res.reference,
            status: res.status,
            transaction_id: res.trans?.toString() ?? '',
          });
          if (paymentResponse.success) {
            showSuccess('Success', 'Payment successful!');
            navigation.navigate('Tabs');
          } else {
            showError('Error', paymentResponse.message || 'Payment verification failed');
            resetAndClose();
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
        <View style={modalStyles.overlay}>
          <TouchableOpacity style={modalStyles.dismissArea} activeOpacity={1} onPress={resetAndClose} />
          <View style={modalStyles.sheet}>
            <View style={modalStyles.handle} />

            <View style={modalStyles.header}>
              <Text style={modalStyles.title}>Confirm Payment</Text>
              <TouchableOpacity onPress={resetAndClose} style={modalStyles.closeButton}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={modalStyles.subtitle}>Review your payment details below</Text>

            <View style={modalStyles.detailsCard}>
              {/* Amount */}
              <View style={modalStyles.detailRow}>
                <View style={[modalStyles.detailIconBox, { backgroundColor: '#EEF2FF' }]}>
                  <Ionicons name="wallet-outline" size={18} color="#1F54DD" />
                </View>
                <View style={modalStyles.detailTexts}>
                  <Text style={modalStyles.detailLabel}>Amount to fund</Text>
                  <Text style={modalStyles.detailValue}>₦{amountNum.toLocaleString()}</Text>
                </View>
              </View>

              <View style={modalStyles.separator} />

              {/* Fee */}
              <View style={modalStyles.detailRow}>
                <View style={[modalStyles.detailIconBox, { backgroundColor: '#FFF7ED' }]}>
                  <Ionicons name="receipt-outline" size={18} color="#F59E0B" />
                </View>
                <View style={modalStyles.detailTexts}>
                  <View style={{ flex: 1 }}>
                    <Text style={modalStyles.detailLabel}>Processing fee (1.5%)</Text>
                    <Text style={modalStyles.feeNote}>Charged by Paystack</Text>
                  </View>
                  <Text style={modalStyles.detailValue}>₦{fee.toFixed(2)}</Text>
                </View>
              </View>

              <View style={modalStyles.separator} />

              {/* Total */}
              <View style={modalStyles.totalBox}>
                <Text style={modalStyles.totalLabel}>Estimated Total</Text>
                <Text style={modalStyles.totalValue}>
                  ₦{parseFloat(total).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                </Text>
              </View>
            </View>

            <View style={modalStyles.noteRow}>
              <Ionicons name="information-circle-outline" size={15} color="#94A3B8" />
              <Text style={modalStyles.noteText}>
                The exact amount charged may vary slightly based on Paystack's fees.
              </Text>
            </View>

            <TouchableOpacity style={modalStyles.payButton} onPress={() => setStep('pay')}>
              <Ionicons name="lock-closed" size={16} color="#fff" style={{ marginRight: 8 }} />
              <Text style={modalStyles.payButtonText}>
                Pay Now · ₦{parseFloat(total).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
              </Text>
            </TouchableOpacity>

            <View style={modalStyles.secureBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#10B981" />
              <Text style={modalStyles.secureText}>Secured by Paystack</Text>
            </View>
          </View>
        </View>
      )}

      {/* ── PAY STEP ── */}
      {step === 'pay' && (
        <View style={modalStyles.webViewFullScreen}>
          <View style={modalStyles.webViewHeader}>
            <TouchableOpacity
              onPress={() => { setStep('confirm'); setWebViewLoading(true); }}
              style={modalStyles.webViewBackButton}
            >
              <Ionicons name="arrow-back" size={22} color="#0F172A" />
            </TouchableOpacity>
            <Text style={modalStyles.webViewTitle}>Card Payment</Text>
            <View style={{ width: 36 }} />
          </View>

          <WebView
            source={{ html: generatePaystackHtml(amountInKobo, reference, userEmail) }}
            onMessage={handleMessage}
            onLoadEnd={() => setWebViewLoading(false)}
            javaScriptEnabled
            domStorageEnabled
            style={{ flex: 1 }}
          />

          {(webViewLoading || verifying) && (
            <View style={modalStyles.webViewLoader}>
              <ActivityIndicator size="large" color="#1F54DD" />
              <Text style={modalStyles.webViewLoaderText}>
                {verifying ? 'Verifying payment...' : 'Connecting to Paystack...'}
              </Text>
            </View>
          )}
        </View>
      )}
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function FundAmountPaystack({ navigation }: { navigation: any }) {
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
    if (!amount.trim()) { setError('Please enter an amount'); return false; }
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) { setError('Please enter a valid amount'); return false; }
    if (amountNum < 100) { setError('Minimum amount is ₦100'); return false; }
    if (amountNum > 1000000) { setError('Maximum amount is ₦1,000,000'); return false; }
    return true;
  };

  const handleBankTransfer = async () => {
    if (!user?.email) {
      showError('Error', 'User email not found. Please login again.');
      return;
    }
    setLoading(true);
    try {
      const response = await walletService.generatePaystackBankTransfer({
        email: user.email,
        amount: parseFloat(amount),
      });

      // status is boolean for Paystack — no more TS error
      if (response?.status === true) {
        navigation.navigate('BankTransferDetails', {
          transferDetails: response.data,  // PaystackDVAData shape
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
      if (!user?.email) { showError('Error', 'User email not found. Please login again.'); return; }
      setShowCardModal(true);
    }
  };

  const getMethodDetails = () =>
    method === 'bank'
      ? {
        title: 'Bank Transfer',
        icon: 'business',
        color: '#1F54DD',
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

  const methodDetails = getMethodDetails();

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.title}>Fund Wallet</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.methodCard}>
          <View style={[styles.methodIcon, { backgroundColor: `${methodDetails.color}20` }]}>
            <Ionicons name={methodDetails.icon as any} size={32} color={methodDetails.color} />
          </View>
          <Text style={styles.methodTitle}>{methodDetails.title}</Text>
          <Text style={styles.methodDescription}>{methodDetails.description}</Text>
        </View>

        <View style={styles.amountSection}>
          <Text style={styles.sectionTitle}>Enter Amount</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>₦</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              value={amount}
              onChangeText={(text) => { setAmount(text); setError(''); }}
              keyboardType="numeric"
              placeholderTextColor="#94A3B8"
            />
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.quickAmounts}>
            <Text style={styles.quickAmountsLabel}>Quick Select</Text>
            <View style={styles.quickAmountsGrid}>
              {quickAmounts.map((quickAmount) => (
                <TouchableOpacity
                  key={quickAmount}
                  style={[styles.quickAmountButton, amount === quickAmount && styles.quickAmountButtonActive]}
                  onPress={() => handleAmountSelect(quickAmount)}
                >
                  <Text style={[styles.quickAmountText, amount === quickAmount && styles.quickAmountTextActive]}>
                    ₦{quickAmount}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {user && (
          <View style={styles.userInfoCard}>
            <Text style={styles.userInfoText}>
              Payment will be processed for: {user.email || user.phone || user.name}
            </Text>
          </View>
        )}

        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color="#1F54DD" />
          <Text style={styles.infoText}>{methodDetails.instructions}</Text>
        </View>

        {method === 'bank' && (
          <View style={styles.additionalInfoCard}>
            <Ionicons name="time-outline" size={20} color="#F59E0B" />
            <Text style={styles.additionalInfoText}>
              Bank transfers are processed within 1-5 minutes. Your wallet will be credited automatically.
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, (!amount || loading) && styles.submitButtonDisabled]}
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

      {showCardModal && (
        <CardPaymentModal
          visible={showCardModal}
          onClose={() => setShowCardModal(false)}
          amount={amount}
          userEmail={user?.email || ''}
          userName={user?.name || ''}
          userPhone={user?.phone || ''}
          onPaymentSuccess={() => { setShowCardModal(false); navigation.navigate('Tabs'); }}
          onPaymentCancelled={() => setShowCardModal(false)}
        />
      )}
    </View>
  );
}

// styles are unchanged from your original — paste them as-is
const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  dismissArea: { flex: 1 },
  sheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },
  handle: { width: 40, borderRadius: 2, backgroundColor: '#E2E8F0', alignSelf: 'center', marginBottom: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  title: { fontSize: 20, fontFamily: 'Poppins-SemiBold', color: '#0F172A' },
  closeButton: { padding: 4 },
  subtitle: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#64748B', marginBottom: 20 },
  detailsCard: { backgroundColor: '#F8FAFC', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 14, overflow: 'hidden' },
  detailRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  detailIconBox: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  detailTexts: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailLabel: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#64748B', flex: 1 },
  feeNote: { fontSize: 11, fontFamily: 'Poppins-Regular', color: '#F59E0B', marginTop: 2 },
  detailValue: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#0F172A', textAlign: 'right', maxWidth: '55%' },
  separator: { height: 1, backgroundColor: '#E2E8F0', marginHorizontal: 14 },
  totalBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#EEF2FF', padding: 14 },
  totalLabel: { fontSize: 15, fontFamily: 'Poppins-SemiBold', color: '#0F172A' },
  totalValue: { fontSize: 18, fontFamily: 'Poppins-Bold', color: '#1F54DD' },
  noteRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 20, paddingHorizontal: 2 },
  noteText: { flex: 1, fontSize: 11, fontFamily: 'Poppins-Regular', color: '#94A3B8', lineHeight: 16 },
  payButton: { backgroundColor: '#1F54DD', borderRadius: 12, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  payButtonText: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Poppins-SemiBold' },
  secureBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 15 },
  secureText: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#10B981' },
  webViewFullScreen: { flex: 1, backgroundColor: '#FFFFFF' },
  webViewHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 54, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', backgroundColor: '#FFFFFF' },
  webViewBackButton: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  webViewTitle: { fontSize: 16, fontFamily: 'Poppins-SemiBold', color: '#0F172A' },
  webViewLoader: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', gap: 14 },
  webViewLoaderText: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#64748B' },
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: '#FFFFFF' },
  backButton: { padding: 4 },
  title: { fontSize: 18, fontFamily: 'Poppins-SemiBold', color: '#0F172A' },
  placeholder: { width: 32 },
  content: { flex: 1, paddingHorizontal: 20 },
  methodCard: { backgroundColor: '#F8FAFC', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: '#E2E8F0' },
  methodIcon: { width: 64, height: 64, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  methodTitle: { fontSize: 20, fontFamily: 'Poppins-Bold', color: '#0F172A', marginBottom: 8, textAlign: 'center' },
  methodDescription: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#64748B', textAlign: 'center', lineHeight: 20 },
  amountSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontFamily: 'Poppins-SemiBold', color: '#0F172A', marginBottom: 16 },
  amountInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, borderWidth: 2, borderColor: '#1F54DD', marginBottom: 8 },
  currencySymbol: { fontSize: 24, fontFamily: 'Poppins-Bold', color: '#0F172A', marginRight: 8 },
  amountInput: { flex: 1, fontSize: 24, fontFamily: 'Poppins-Bold', color: '#0F172A', padding: 0 },
  errorText: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#DC2626', marginTop: 4 },
  quickAmounts: { marginTop: 16 },
  quickAmountsLabel: { fontSize: 14, fontFamily: 'Poppins-Medium', color: '#64748B', marginBottom: 12 },
  quickAmountsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  quickAmountButton: { backgroundColor: '#F1F5F9', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  quickAmountButtonActive: { backgroundColor: '#1F54DD', borderColor: '#1F54DD' },
  quickAmountText: { fontSize: 14, fontFamily: 'Poppins-Medium', color: '#64748B' },
  quickAmountTextActive: { color: '#FFFFFF' },
  infoCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#F0F9FF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E0F2FE', marginBottom: 16 },
  infoText: { flex: 1, fontSize: 12, fontFamily: 'Poppins-Regular', color: '#64748B', marginLeft: 8, lineHeight: 16 },
  userInfoCard: { backgroundColor: '#F1F5F9', borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  userInfoText: { fontSize: 12, fontFamily: 'Poppins-Medium', color: '#475569', textAlign: 'center' },
  additionalInfoCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FFFBEB', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#FDE68A', marginBottom: 16 },
  additionalInfoText: { flex: 1, fontSize: 12, fontFamily: 'Poppins-Regular', color: '#92400E', marginLeft: 8, lineHeight: 16 },
  footer: { padding: 20, marginBottom: 40, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  submitButton: { backgroundColor: '#1F54DD', borderRadius: 12, padding: 16, alignItems: 'center', justifyContent: 'center' },
  submitButtonDisabled: { backgroundColor: '#94A3B8' },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Poppins-SemiBold' },
});