// PasswordInput.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FormInput, { FormInputProps } from './FormInput';

interface PasswordInputProps extends Omit<FormInputProps, 'secureTextEntry'> {
  showPasswordToggle?: boolean;
  showLabel?: boolean;
  showPasswordHint?: boolean;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  showPasswordToggle = true,
  showLabel = true,
  showPasswordHint = false,
  value = '',
  error,
  onFocus,
  onBlur,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [hasStartedTyping, setHasStartedTyping] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);

  // Check if password meets requirements
  const checkPasswordValidity = (password: string) => {
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[@$!%*?&]/.test(password);
    
    return hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
  };

  // Monitor password changes
  useEffect(() => {
    if (value && value.length > 0 && !hasStartedTyping) {
      setHasStartedTyping(true);
    }
    
    const isValid = checkPasswordValidity(value as string);
    setIsPasswordValid(isValid);
  }, [value, hasStartedTyping]);

  // Determine if we should show the hint
  const shouldShowHint = showPasswordHint && 
    isFocused && 
    hasStartedTyping && 
    !isPasswordValid && 
    !error; // Don't show hint if there's already an error message

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <FormInput
          {...props}
          value={value}
          showLabel={showLabel}
          secureTextEntry={!showPassword}
          error={error}
          onFocus={handleFocus}
          onBlur={handleBlur}
          containerStyle={styles.formInputContainer}
        />
        {showPasswordToggle && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color="#64748B"
            />
          </TouchableOpacity>
        )}
      </View>
      
      {shouldShowHint && (
        <Text style={styles.hintText}>
          Password must be at least 8 characters with at least 1 uppercase, 1 lowercase, 1 number and 1 special character (@$!%*?&)
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  inputWrapper: {
    position: 'relative',
    width: '100%',
  },
  formInputContainer: {
    marginBottom: 0,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 25,
    transform: [{ translateY: -10 }],
    padding: 4,
    zIndex: 10,
  },
  hintText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#1F54DD',
    marginTop: 4,
    marginLeft: 4,
  },
});

export default PasswordInput;