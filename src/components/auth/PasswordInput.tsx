import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import FormInput, { FormInputProps } from './FormInput';

interface PasswordInputProps extends Omit<FormInputProps, 'secureTextEntry'> {
  showPasswordToggle?: boolean;
  showLabel?: boolean;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  showPasswordToggle = true,
  showLabel = true,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      <FormInput
        {...props}
        showLabel={showLabel}
        secureTextEntry={!showPassword}
        // No need to override style here
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
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -10 }],
    padding: 4,
    zIndex: 10,
  },
});

export default PasswordInput;