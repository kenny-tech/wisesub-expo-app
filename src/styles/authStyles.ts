import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
  },
  formContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  button: {
    width: '100%',
    maxWidth: 320,
    height: 48,
    backgroundColor: '#1F54DD',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  linkContainer: {
    marginTop: 20,
  },
  linkText: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Poppins-Regular',
  },
  link: {
    color: '#1F54DD',
    fontFamily: 'Poppins-SemiBold',
  },
  termsText: {
    width: '100%',
    maxWidth: 320,
    textAlign: 'center',
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Poppins-Regular',
    marginTop: 20,
    lineHeight: 18,
  },
  forgotPasswordContainer: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'flex-end',
    marginTop: 8,
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#1F54DD',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  infoText: {
    width: '100%',
    maxWidth: 320,
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  passwordHint: {
    width: '100%',
    maxWidth: 320,
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Poppins-Regular',
    marginTop: 8,
    marginBottom: 20,
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  resendText: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Poppins-Regular',
  },
  resendLink: {
    color: '#1F54DD',
    fontFamily: 'Poppins-SemiBold',
  },
  resendLinkDisabled: {
    color: '#94A3B8',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    marginBottom: 16,
  },
});

export default styles;