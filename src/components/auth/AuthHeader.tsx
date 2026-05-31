import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface AuthHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  logo?: boolean;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({
  title,
  subtitle,
  showBackButton = true,
  onBackPress,
  logo = true,
}) => {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.container}>
      {showBackButton && (
        <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      )}
      {logo && (
        <Image
          source={
            isDark
              ? require('../../../assets/images/logo_white.png')
              : require('../../../assets/images/logo_black.png')
          }
          style={styles.logo}
          resizeMode="contain"
        />
      )}
      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container:   { alignItems: 'center', paddingHorizontal: 20, paddingTop: 30, paddingBottom: 10 },
  backButton:  { position: 'absolute', left: 20, top: 60, padding: 4 },
  logo:        { width: 120, height: 100, marginBottom: 10 },
  title:       { fontSize: 24, fontFamily: 'Poppins-Bold', textAlign: 'center', marginBottom: 8 },
  subtitle:    { fontSize: 16, fontFamily: 'Poppins-Regular', textAlign: 'center', lineHeight: 24 },
});

export default AuthHeader;