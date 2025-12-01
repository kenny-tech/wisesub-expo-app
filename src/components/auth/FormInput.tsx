import React from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    View,
} from 'react-native';

export interface FormInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: any;
  showLabel?: boolean;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  containerStyle,
  showLabel = true,
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {showLabel && label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          props.editable === false && styles.inputDisabled,
        ]}
        placeholderTextColor="#94A3B8"
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#DC2626',
  },
  inputDisabled: {
    backgroundColor: '#F8FAFC',
    color: '#64748B',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    marginTop: 4,
  },
});

export default FormInput;