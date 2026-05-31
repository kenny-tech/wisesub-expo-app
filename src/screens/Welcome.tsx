import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

const { width, height } = Dimensions.get('window');

export default function Welcome({ navigation }: { navigation: any }) {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Decorative circles */}
      <View style={[styles.circle1, { backgroundColor: colors.primary + '0D' }]} />
      <View style={[styles.circle2, { backgroundColor: colors.primary + '08' }]} />
      <View style={[styles.circle3, { backgroundColor: colors.primary + '0A' }]} />

      <View style={styles.topSection}>
        <View style={[styles.logoContainer, { backgroundColor: colors.primary + '14', shadowColor: colors.primary }]}>
          <Image
            source={
              isDark
                ? require('../../assets/images/logo_white.png')
                : require('../../assets/images/logo_black.png')
            }
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Welcome to WiseSub</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Buy cheap data, airtime, cable TV subscriptions, and electricity tokens the wisest way, with rewards on WiseSub.
        </Text>
      </View>

      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
          onPress={() => navigation.navigate('Signup')}
          activeOpacity={0.9}
        >
          <Text style={styles.primaryText}>Create Account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryBtn, { borderColor: colors.primary, backgroundColor: colors.primaryLight }]}
          onPress={() => navigation.navigate('Signin')}
          activeOpacity={0.8}
        >
          <Text style={[styles.secondaryText, { color: colors.primary }]}>
            Already have an account? Sign In
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', paddingVertical: 50, paddingHorizontal: 24 },
  circle1: { position: 'absolute', width: width * 0.7, height: width * 0.7, borderRadius: width * 0.35, top: -width * 0.2, right: -width * 0.2 },
  circle2: { position: 'absolute', width: width * 0.5, height: width * 0.5, borderRadius: width * 0.25, bottom: height * 0.15, left: -width * 0.15 },
  circle3: { position: 'absolute', width: width * 0.3, height: width * 0.3, borderRadius: width * 0.15, top: height * 0.3, right: width * 0.1 },
  topSection: { alignItems: 'center', marginTop: 40 },
  logoContainer: { width: 160, height: 160, borderRadius: 80, justifyContent: 'center', alignItems: 'center', marginBottom: 24, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 8 },
  logo: { width: 100, height: 100, resizeMode: 'contain' },
  title: { fontSize: 24, fontFamily: 'Poppins-Bold', marginTop: 16, textAlign: 'center', lineHeight: 40 },
  subtitle: { fontSize: 14, marginTop: 12, fontFamily: 'Poppins-Regular', textAlign: 'center', lineHeight: 24, maxWidth: '90%' },
  bottomSection: { alignItems: 'center', width: '100%' },
  primaryBtn: { width: '100%', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8, marginBottom: 16 },
  primaryText: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Poppins-Bold' },
  secondaryBtn: { width: '100%', height: 56, borderWidth: 2, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  secondaryText: { fontSize: 16, fontFamily: 'Poppins-Bold' },
});