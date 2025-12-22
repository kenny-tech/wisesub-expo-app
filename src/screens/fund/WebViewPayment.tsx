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
import Toast from 'react-native-toast-message';
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

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack) {
        webViewRef.current?.goBack();
        return true;
      } else {
        if (paymentStatus === 'processing') {
          Alert.alert(
            'Cancel Payment',
            'Are you sure you want to cancel this payment?',
            [
              { text: 'No', style: 'cancel' },
              { 
                text: 'Yes', 
                style: 'destructive',
                onPress: () => {
                  navigation.goBack();
                }
              }
            ]
          );
          return true;
        }
      }
      return false;
    });

    return () => backHandler.remove();
  }, [canGoBack, paymentStatus]);

  const calculateTotal = (): number => {
    const amountNum = parseFloat(amount);
    const fee = amountNum * 0.014; // 1.4% fee
    return amountNum + fee;
  };

  const generateFlutterwaveHtml = (): string => {
    const txRef = `ws_m_${Date.now().toString()}`;
    const totalAmount = calculateTotal().toFixed(2);
    const userEmail = user?.email || '';
    const userPhone = user?.phone || '';
    const userName = user?.name || '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <title>Payment | WiseSub</title>
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
          
          .logo {
            text-align: center;
            margin-bottom: 30px;
          }
          
          .logo h1 {
            color: #1F54DD;
            font-size: 28px;
            font-weight: 700;
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
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 10px;
          }
          
          .pay-button:hover {
            background: #1543b3;
            transform: translateY(-2px);
          }
          
          .pay-button:disabled {
            background: #94a3b8;
            cursor: not-allowed;
            transform: none;
          }
          
          .pay-button.loading {
            background: #94a3b8;
          }
          
          .spinner {
            border: 2px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top-color: white;
            width: 20px;
            height: 20px;
            animation: spin 1s linear infinite;
          }
          
          @keyframes spin {
            to { transform: rotate(360deg); }
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
          <div class="logo">
            <h1>WiseSub</h1>
          </div>
          
          <div class="payment-details">
            <div class="detail-row">
              <span class="detail-label">Amount to fund:</span>
              <span class="detail-value">₦${parseFloat(amount).toLocaleString()}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Processing fee (1.4%):</span>
              <span class="detail-value">₦${(parseFloat(amount) * 0.014).toFixed(2)}</span>
            </div>
            
            <div class="detail-row total-row">
              <span class="total-label">Total to pay:</span>
              <span class="total-value">₦${totalAmount}</span>
            </div>
          </div>
          
          <button id="payButton" class="pay-button" onclick="makePayment()">
            <span>Proceed to Payment</span>
          </button>
          
          <div class="secure-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <span>Secured by Flutterwave</span>
          </div>
          
          <p class="info-note">
            You will be redirected to a secure payment page. 
            Your card details are encrypted and never stored.
          </p>
        </div>

        <script src="https://checkout.flutterwave.com/v3.js"></script>
        <script>
          let paymentInProgress = false;
          
          function makePayment() {
            if (paymentInProgress) return;
            
            paymentInProgress = true;
            const payButton = document.getElementById('payButton');
            payButton.innerHTML = '<div class="spinner"></div><span>Processing...</span>';
            payButton.classList.add('loading');
            payButton.disabled = true;
            
            try {
              FlutterwaveCheckout({
                public_key: "${FLUTTERWAVE_PUBLIC_KEY}",
                tx_ref: "${txRef}",
                amount: ${totalAmount},
                currency: "NGN",
                payment_options: "card, mobilemoney, ussd",
                customer: {
                  email: "${userEmail}",
                  phone_number: "${userPhone}",
                  name: "${userName}",
                },
                customizations: {
                  title: "WiseSub Wallet Funding",
                  description: "Fund wallet: ₦${parseFloat(amount).toLocaleString()}",
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
                }
              });
            } catch (error) {
              console.error('Payment error:', error);
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'payment_error',
                error: error.message
              }));
              paymentInProgress = false;
              
              // Reset button
              payButton.innerHTML = '<span>Proceed to Payment</span>';
              payButton.classList.remove('loading');
              payButton.disabled = false;
            }
          }
          
          // Auto-start payment on page load
          document.addEventListener('DOMContentLoaded', function() {
            setTimeout(makePayment, 500);
          });
        </script>
      </body>
      </html>
    `;
  };

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack);
  };

  const handleMessage = async (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      
      switch (message.type) {
        case 'payment_response':
          await handlePaymentResponse(message.data);
          break;
          
        case 'payment_closed':
          if (!message.inProgress && paymentStatus === 'pending') {
            // User closed payment modal before completing
            Toast.show({
              type: 'info',
              text1: 'Payment Cancelled',
              text2: 'You closed the payment window',
            });
            navigation.goBack();
          }
          break;
          
        case 'payment_error':
          showError('Payment Error', message.error || 'An error occurred during payment');
          navigation.goBack();
          break;
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  };

  const handlePaymentResponse = async (response: any) => {
    console.log('Payment response:', response);
    
    if (response.status === 'successful') {
      setPaymentStatus('processing');
      
      try {
        const paymentResponse = await walletService.createCardPayment({
          amount: parseFloat(amount),
          tx_ref: response.tx_ref,
          status: response.status,
          transaction_id: response.transaction_id.toString(),
        });

        if (paymentResponse.success) {
          setPaymentStatus('completed');
          showSuccess('Success', paymentResponse.message || 'Payment successful!');
          
          // Wait a moment before navigating
          setTimeout(() => {
            navigation.navigate('Tabs');
          }, 1500);
        } else {
          setPaymentStatus('failed');
          showError('Error', paymentResponse.message || 'Payment verification failed');
          setTimeout(() => navigation.goBack(), 2000);
        }
      } catch (error: any) {
        setPaymentStatus('failed');
        console.error('Payment verification error:', error);
        showError('Error', error.message || 'Payment verification failed');
        setTimeout(() => navigation.goBack(), 2000);
      }
    } else if (response.status === 'cancelled') {
      Toast.show({
        type: 'info',
        text1: 'Payment Cancelled',
        text2: 'You cancelled the payment process',
      });
      navigation.goBack();
    } else {
      showError('Payment Failed', response.message || 'Payment was not successful');
      navigation.goBack();
    }
  };

  const handleBack = () => {
    if (canGoBack) {
      webViewRef.current?.goBack();
    } else {
      if (paymentStatus === 'processing') {
        Alert.alert(
          'Cancel Payment',
          'Are you sure you want to cancel this payment?',
          [
            { text: 'No', style: 'cancel' },
            { 
              text: 'Yes', 
              style: 'destructive',
              onPress: () => {
                navigation.goBack();
              }
            }
          ]
        );
      } else {
        navigation.goBack();
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.title}>Card Payment</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#1F54DD" />
          <Text style={styles.loadingText}>Loading payment page...</Text>
        </View>
      )}

      {/* Payment Status Overlay */}
      {paymentStatus === 'processing' && (
        <View style={styles.statusOverlay}>
          <View style={styles.statusContent}>
            <ActivityIndicator size="large" color="#16A34A" />
            <Text style={styles.statusTitle}>Processing Payment</Text>
            <Text style={styles.statusText}>
              Please wait while we verify your payment...
            </Text>
          </View>
        </View>
      )}

      {paymentStatus === 'completed' && (
        <View style={styles.statusOverlay}>
          <View style={styles.statusContent}>
            <Ionicons name="checkmark-circle" size={60} color="#16A34A" />
            <Text style={styles.statusTitle}>Payment Successful!</Text>
            <Text style={styles.statusText}>
              Your wallet has been credited with ₦{parseFloat(amount).toLocaleString()}
            </Text>
          </View>
        </View>
      )}

      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{ html: generateFlutterwaveHtml() }}
        style={styles.webview}
        onMessage={handleMessage}
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={handleNavigationStateChange}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        mixedContentMode="always"
        allowFileAccess={true}
        originWhitelist={['*']}
        renderLoading={() => (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#1F54DD" />
          </View>
        )}
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
    borderBottomColor: '#E2E8F0',
    zIndex: 10,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F172A',
  },
  placeholder: {
    width: 32,
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 140,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    zIndex: 5,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
  },
  statusOverlay: {
    position: 'absolute',
    top: 140,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    zIndex: 20,
  },
  statusContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  statusTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#0F172A',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
});