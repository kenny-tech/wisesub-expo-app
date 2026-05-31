import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NetworkProvider } from '../../services/billService';
import { useTheme } from '../../theme/ThemeContext';

interface NetworkCardProps {
  network: NetworkProvider;
  isSelected: boolean;
  onSelect: (network: NetworkProvider) => void;
}

export const NetworkCard: React.FC<NetworkCardProps> = ({ network, isSelected, onSelect }) => {
  const { colors } = useTheme();

  const getNetworkLogo = (): ImageSourcePropType => {
    switch (network.value) {
      case 'mtn':      return require('../../../assets/images/mtn.png');
      case 'airtel':   return require('../../../assets/images/airtel.png');
      case 'glo':      return require('../../../assets/images/glo.png');
      case '9mobile':  return require('../../../assets/images/ninemobile.png');
      default:         return require('../../../assets/images/mtn.png');
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.networkCard,
        { backgroundColor: colors.backgroundSecondary },
        isSelected && { borderColor: colors.primary, backgroundColor: colors.primaryLight },
      ]}
      onPress={() => onSelect(network)}
      activeOpacity={0.7}
    >
      <View style={[styles.networkLogoContainer, { backgroundColor: colors.card }]}>
        <Image source={getNetworkLogo()} style={styles.networkLogo} resizeMode="contain" />
      </View>
      <Text
        style={[
          styles.networkName,
          { color: colors.textSecondary },
          isSelected && { color: colors.primary, fontFamily: 'Poppins-SemiBold' },
        ]}
        numberOfLines={1}
      >
        {network.name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  networkCard: {
    alignItems: 'center', borderRadius: 12, padding: 12,
    width: 80, height: 90, borderWidth: 2, borderColor: 'transparent',
  },
  networkLogoContainer: {
    width: 48, height: 48, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 2, elevation: 2,
  },
  networkLogo:  { width: 36, height: 36 },
  networkName:  { fontSize: 12, fontFamily: 'Poppins-Medium', textAlign: 'center' },
});