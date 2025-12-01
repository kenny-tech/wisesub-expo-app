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
        style={[props.style, styles.input]}
      />
      {showPasswordToggle && (
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowPassword(!showPassword)}
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
  input: {
    paddingRight: 40,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -10 }],
    padding: 4,
  },
});

export default PasswordInput;