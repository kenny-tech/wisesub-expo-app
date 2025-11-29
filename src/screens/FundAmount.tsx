import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

type FundAmountRouteProps = {
  FundAmount: {
    method: 'bank' | 'card';
  };
};

export default function FundAmount({ navigation }: { navigation: any }) {
  const route = useRoute<RouteProp<FundAmountRouteProps, 'FundAmount'>>();
  const { method } = route.params;

  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

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

  const handleSubmit = async () => {
    if (!validateAmount()) return;

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: `₦${amount} will be added to your wallet`,
      });
      
      // Navigate based on payment method
      if (method === 'bank') {
        navigation.navigate('BankTransfer', { amount });
      } else {
        navigation.navigate('CardPayment', { amount });
      }
    }, 1500);
  };

  const getMethodDetails = () => {
    return method === 'bank' 
      ? {
          title: 'Bank Transfer',
          icon: 'business',
          color: '#1F54DD',
          description: 'Transfer directly from your bank account',
          instructions: 'You will be provided with bank details to complete the transfer'
        }
      : {
          title: 'Card Payment',
          icon: 'card',
          color: '#16A34A',
          description: 'Pay instantly with your debit/credit card',
          instructions: 'You will be redirected to a secure payment page'
        };
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
        {/* Method Info */}
        <View style={styles.methodCard}>
          <View style={[styles.methodIcon, { backgroundColor: `${methodDetails.color}20` }]}>
            <Ionicons name={methodDetails.icon as any} size={32} color={methodDetails.color} />
          </View>
          <Text style={styles.methodTitle}>{methodDetails.title}</Text>
          <Text style={styles.methodDescription}>{methodDetails.description}</Text>
        </View>

        {/* Amount Input */}
        <View style={styles.amountSection}>
          <Text style={styles.sectionTitle}>Enter Amount</Text>
          
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>₦</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              value={amount}
              onChangeText={(text) => {
                setAmount(text);
                setError('');
              }}
              keyboardType="numeric"
              placeholderTextColor="#94A3B8"
            />
          </View>
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Quick Amounts */}
          <View style={styles.quickAmounts}>
            <Text style={styles.quickAmountsLabel}>Quick Select</Text>
            <View style={styles.quickAmountsGrid}>
              {quickAmounts.map((quickAmount) => (
                <TouchableOpacity
                  key={quickAmount}
                  style={[
                    styles.quickAmountButton,
                    amount === quickAmount && styles.quickAmountButtonActive
                  ]}
                  onPress={() => handleAmountSelect(quickAmount)}
                >
                  <Text style={[
                    styles.quickAmountText,
                    amount === quickAmount && styles.quickAmountTextActive
                  ]}>
                    ₦{quickAmount}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color="#1F54DD" />
          <Text style={styles.infoText}>{methodDetails.instructions}</Text>
        </View>
      </ScrollView>

      {/* Submit Button */}
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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { 
    flex: 1, 
    backgroundColor: "#FFFFFF" 
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: "#0F172A",
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  methodCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  methodIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  methodTitle: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: "#0F172A",
    marginBottom: 8,
    textAlign: "center",
  },
  methodDescription: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },
  amountSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#0F172A",
    marginBottom: 16,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "#1F54DD",
    marginBottom: 8,
  },
  currencySymbol: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: "#0F172A",
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: "#0F172A",
    padding: 0,
  },
  errorText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#DC2626",
    marginTop: 4,
  },
  quickAmounts: {
    marginTop: 16,
  },
  quickAmountsLabel: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#64748B",
    marginBottom: 12,
  },
  quickAmountsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  quickAmountButton: {
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  quickAmountButtonActive: {
    backgroundColor: "#1F54DD",
    borderColor: "#1F54DD",
  },
  quickAmountText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#64748B",
  },
  quickAmountTextActive: {
    color: "#FFFFFF",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F0F9FF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E0F2FE",
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#64748B",
    marginLeft: 8,
    lineHeight: 16,
  },
  footer: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  submitButton: {
    backgroundColor: "#1F54DD",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#94A3B8",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
  },
});