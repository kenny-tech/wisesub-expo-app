import React, { useEffect, useRef, useState } from 'react';
import {
    NativeSyntheticEvent,
    StyleSheet,
    TextInput,
    TextInputKeyPressEventData,
    View,
} from 'react-native';

interface OtpInputProps {
  length?: number;
  onOtpComplete?: (otp: string) => void;
  autoFocus?: boolean;
}

const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  onOtpComplete,
  autoFocus = true,
}) => {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<TextInput[]>([]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (text: string, index: number) => {
    if (text.length > 1) {
      // Handle paste
      const pastedText = text.slice(0, length - index);
      const newOtp = [...otp];
      
      pastedText.split('').forEach((char, charIndex) => {
        if (index + charIndex < length) {
          newOtp[index + charIndex] = char;
        }
      });
      
      setOtp(newOtp);
      
      // Move focus to next empty input or last input
      const nextIndex = Math.min(index + pastedText.length, length - 1);
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus();
      }
      
      // Check if complete
      const completeOtp = newOtp.join('');
      if (completeOtp.length === length && onOtpComplete) {
        onOtpComplete(completeOtp);
      }
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-focus next input
    if (text && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if OTP is complete
    const completeOtp = newOtp.join('');
    if (completeOtp.length === length && onOtpComplete) {
      onOtpComplete(completeOtp);
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {otp.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            if (ref) inputRefs.current[index] = ref;
          }}
          style={[styles.otpInput, digit && styles.otpInputFilled]}
          value={digit}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          keyboardType="numeric"
          maxLength={1}
          selectTextOnFocus
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 320,
    marginBottom: 30,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    backgroundColor: '#FFFFFF',
  },
  otpInputFilled: {
    borderColor: '#1F54DD',
    backgroundColor: '#F8FAFC',
  },
});

export default OtpInput;