import { useTheme } from '@/src/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Education({ navigation }: { navigation: any }) {
    const { colors } = useTheme();
    const styles = makeStyles(colors);

    const options = [
        {
            id: 'waec-registration',
            title: 'WAEC Registration PIN',
            image: require('../../../assets/images/waec-logo.png'),
            serviceID: 'waec-registration',
            serviceName: 'WAEC Registration',
        },
        {
            id: 'waec-result',
            title: 'WAEC Result Checker',
            image: require('../../../assets/images/waec-logo.png'),
            serviceID: 'waec',
            serviceName: 'WAEC Result Checker',
        },
    ];

    return (
        <View style={styles.container}>
            <View style={[styles.header, { borderBottomColor: colors.separator }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.textPrimary }]}>Education</Text>
                <View style={styles.placeholder} />
            </View>
            <View style={styles.content}>
                {options.map((option) => (
                    <TouchableOpacity
                        key={option.id}
                        style={[styles.optionCard, { backgroundColor: colors.card, borderColor: colors.divider }]}
                        onPress={() =>
                            navigation.navigate('WAECPurchase', {
                                serviceID: option.serviceID,
                                title: option.title,
                                type: option.serviceName,
                                serviceType: option.serviceName,
                                name: option.serviceName,
                            })
                        }
                    >
                        <Image source={option.image} style={styles.optionImage} resizeMode="contain" />
                        <Text style={[styles.optionTitle, { color: colors.textPrimary }]}>{option.title}</Text>
                        <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const makeStyles = (colors: any) =>
    StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingTop: 60,
            paddingBottom: 20,
            borderBottomWidth: 1,
        },
        backButton: { padding: 4 },
        title: { fontSize: 20, fontFamily: 'Poppins-SemiBold' },
        placeholder: { width: 32 },
        content: { padding: 20 },
        optionCard: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            borderRadius: 12,
            borderWidth: 1,
            marginBottom: 16,
            shadowColor: '#000',
            shadowOpacity: 0.02,
            shadowRadius: 4,
            elevation: 1,
        },
        optionImage: { width: 50, height: 50, marginRight: 16 },
        optionTitle: { flex: 1, fontSize: 16, fontFamily: 'Poppins-Medium' },
    });