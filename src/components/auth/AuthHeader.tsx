import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

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
  return (
    <View style={styles.container}>
      {/* Back Button */}
      {showBackButton && (
        <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
      )}

      {/* Logo */}
      {logo && (
        <Image
          source={require('../../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      )}

      {/* Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Subtitle */}
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 30,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 60,
    padding: 4,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default AuthHeader;