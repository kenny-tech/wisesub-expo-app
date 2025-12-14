import React from 'react';
import { StyleSheet } from 'react-native';
import { BaseToast, ErrorToast } from 'react-native-toast-message';

export const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={styles.successContainer}
      contentContainerStyle={styles.content}
      text1Style={styles.title}
      text2Style={styles.message}
    />
  ),

  error: (props: any) => (
    <ErrorToast
      {...props}
      style={styles.errorContainer}
      contentContainerStyle={styles.content}
      text1Style={styles.title}
      text2Style={styles.message}
    />
  ),
};

const styles = StyleSheet.create({
  successContainer: {
    borderLeftColor: '#16A34A',
    borderLeftWidth: 6,
  },
  errorContainer: {
    borderLeftColor: '#DC2626',
    borderLeftWidth: 6,
  },
  content: {
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F172A',
  },
  message: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#334155',
  },
});

export default toastConfig;
