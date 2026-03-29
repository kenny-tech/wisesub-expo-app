import { useProfile } from '@/src/redux/hooks/useProfile';
import { FLUTTERWAVE_PUBLIC_KEY } from '@/src/services/api';
import { walletService } from '@/src/services/walletService';
import { showError, showSuccess } from '@/src/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useRoute } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';

type WebViewPaymentRouteProps = {
  WebViewPayment: {
    amount: string;
  };
};

export default function WebViewPayment({ navigation }: { navigation: any }) {
  const { user } = useProfile();
  const route = useRoute<RouteProp<WebViewPaymentRouteProps, 'WebViewPayment'>>();
  const { amount } = route.params;

  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending');

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack) {
        webViewRef.current?.goBack();
        return true;
      } else {
        if (paymentStatus === 'processing') {
          Alert.alert('Cancel Payment', 'Are you sure?', [
            { text: 'No', style: 'cancel' },
            { text: 'Yes', style: 'destructive', onPress: () => navigation.goBack() },
          ]);
          return true;
        }
      }
      return false;
    });

    return () => backHandler.remove();
  }, [canGoBack, paymentStatus]);

  const generateFlutterwaveHtml = (): string => {
    const txRef = `ws_m_${Date.now().toString()}`;
    const amountNum = parseFloat(amount);
    const fee = amountNum * 0.02;
    const estimatedTotal = (amountNum + fee).toFixed(2); // Display only
    const userEmail = user?.email || '';
    const userPhone = user?.phone || '';
    const userName = user?.name || '';

    return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment</title>

    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
      }

      .payment-container {
        background: white;
        border-radius: 20px;
        padding: 30px;
        max-width: 400px;
        width: 100%;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      }

      .icon-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 25px;
      }

      .icon-circle {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: #EEF2FF;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 28px;
      }

      .payment-details {
        background: #f8fafc;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 30px;
      }

      .detail-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12px;
        padding-bottom: 12px;
        border-bottom: 1px solid #e2e8f0;
      }

      .detail-row:last-child {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
      }

      .detail-label {
        color: #64748b;
        font-size: 14px;
      }

      .detail-value {
        color: #0f172a;
        font-weight: 600;
        font-size: 14px;
      }

      .total-row {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 2px solid #e2e8f0;
      }

      .total-label {
        color: #0f172a;
        font-weight: 700;
        font-size: 16px;
      }

      .total-value {
        color: #16A34A;
        font-weight: 700;
        font-size: 18px;
      }

      .pay-button {
        background: #1F54DD;
        color: white;
        border: none;
        border-radius: 12px;
        padding: 18px;
        font-size: 16px;
        font-weight: 600;
        width: 100%;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .pay-button:hover {
        background: #1543b3;
        transform: translateY(-2px);
      }

      .pay-button:disabled {
        background: #94a3b8;
        cursor: not-allowed;
      }

      .info-note {
        text-align: center;
        color: #64748b;
        font-size: 12px;
        margin-top: 20px;
        line-height: 1.5;
      }

      .secure-badge {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin-top: 15px;
        color: #10B981;
        font-size: 12px;
      }
    </style>
  </head>

  <body>
    <div class="payment-container">

      <div class="icon-wrapper">
        <div class="icon-circle">💳</div>
      </div>

      <div class="payment-details">
        <div class="detail-row">
          <span class="detail-label">Amount to fund:</span>
          <span class="detail-value">₦${amountNum.toLocaleString()}</span>
        </div>

        <div class="detail-row">
          <span class="detail-label">Processing fee (2% - charged by payment provider):</span>
          <span class="detail-value">₦${fee.toFixed(2)}</span>
        </div>

        <div class="detail-row total-row">
          <span class="total-label">Estimated total:</span>
          <span class="total-value">₦${estimatedTotal}</span>
        </div>
      </div>

      <button id="payButton" class="pay-button" onclick="makePayment()">
        Pay Now
      </button>

      <div class="secure-badge">
        🔒 Secured by Flutterwave
      </div>

      <p class="info-note">
        The exact amount charged may vary slightly based on Flutterwave's fees.
      </p>

    </div>

    <script src="https://checkout.flutterwave.com/v3.js"></script>
    <script>
      let paymentInProgress = false;

      function makePayment() {
        if (paymentInProgress) return;

        paymentInProgress = true;
        const btn = document.getElementById('payButton');
        btn.innerText = 'Processing...';
        btn.disabled = true;

        FlutterwaveCheckout({
          public_key: "${FLUTTERWAVE_PUBLIC_KEY}",
          tx_ref: "${txRef}",
          amount: ${amountNum}, // Pass the raw amount — Flutterwave handles its own fees
          currency: "NGN",
          payment_options: "card, mobilemoney, ussd",
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
          callback: function(response) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'payment_response',
              data: response
            }));
            paymentInProgress = false;
          },
          onclose: function() {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'payment_closed',
              inProgress: paymentInProgress
            }));
            paymentInProgress = false;

            btn.innerText = 'Pay Now';
            btn.disabled = false;
          }
        });
      }
    </script>
  </body>
  </html>
  `;
  };

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack);
  };

  const handleMessage = async (event: any) => {
    const message = JSON.parse(event.nativeEvent.data);

    if (message.type === 'payment_response') {
      const res = message.data;

      if (res.status === 'successful') {
        setPaymentStatus('processing');

        const paymentResponse = await walletService.createCardPayment({
          amount: parseFloat(amount),
          tx_ref: res.tx_ref,
          status: res.status,
          transaction_id: res.transaction_id.toString(),
        });

        if (paymentResponse.success) {
          setPaymentStatus('completed');
          showSuccess('Success', 'Payment successful');
        } else {
          setPaymentStatus('failed');
          showError('Error', 'Verification failed');
        }
      }
    }

    if (message.type === 'payment_closed') {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Card Payment</Text>
        <View style={{ width: 24 }} />
      </View>

      {paymentStatus === 'completed' && (
        <View style={styles.overlay}>
          <Ionicons name="checkmark-circle" size={60} color="green" />
          <Text>Payment Successful</Text>

          <TouchableOpacity onPress={() => navigation.navigate('Tabs')}>
            <Text>Done</Text>
          </TouchableOpacity>
        </View>
      )}

      <WebView
        ref={webViewRef}
        source={{ html: generateFlutterwaveHtml() }}
        onMessage={handleMessage}
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={handleNavigationStateChange}
      />

      {loading && <ActivityIndicator />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  title: { fontSize: 18 },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});