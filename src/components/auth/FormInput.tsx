import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

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
  const { colors } = useTheme();

  return (
    <View style={[styles.container, containerStyle]}>
      {showLabel && label && (
        <Text style={[styles.label, { color: colors.textPrimary }]}>{label}</Text>
      )}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.inputBackground,
            borderColor: error ? colors.error : colors.inputBorder,
            color: colors.inputText,
          },
          props.editable === false && { backgroundColor: colors.backgroundSecondary, color: colors.textSecondary },
        ]}
        placeholderTextColor={colors.inputPlaceholder}
        {...props}
      />
      {error && <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>}
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
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    marginTop: 4,
  },
});

export default FormInput;