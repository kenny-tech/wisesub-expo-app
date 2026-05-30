import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { makeSupportStyles } from '../styles/sharedStyles';
import { useTheme } from "../theme/ThemeContext";

export default function Support({ navigation }: { navigation: any }) {
  const { colors } = useTheme();
  const styles = makeSupportStyles(colors);

  const contactMethods = [
    {
      id: 1,
      title: "WhatsApp Support",
      description: "Chat with us directly on WhatsApp",
      icon: "logo-whatsapp" as const,
      color: "#25D366",
      backgroundColor: "#DCF8C6",
      onPress: () => Linking.openURL('https://wa.me/message/PVDYVHNOSSEEF1?text=Hello%20from%20WiseSub')
    },
    {
      id: 2,
      title: "Email Support",
      description: "Send us an email and we'll respond within 24 hours",
      icon: "mail" as const,
      color: "#EA4335",
      backgroundColor: "#FCE8E6",
      onPress: () => Linking.openURL('mailto:support@wisesub.com.ng?subject=Support%20Request')
    },
  ];

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Support Header */}
        <View style={styles.supportHeader}>
          <Ionicons name="help-buoy" size={64} color={colors.primary} />
          <Text style={styles.supportTitle}>How can we help you?</Text>
          <Text style={styles.supportDescription}>
            Get in touch with our support team through any of the channels below. We're here to help!
          </Text>
        </View>

        {/* Contact Methods */}
        <View style={styles.contactMethods}>
          {contactMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={styles.contactCard}
              onPress={method.onPress}
            >
              <View style={styles.contactLeft}>
                <View 
                  style={[
                    styles.contactIcon, 
                    { backgroundColor: method.backgroundColor }
                  ]}
                >
                  <Ionicons name={method.icon} size={24} color={method.color} />
                </View>
                <View style={styles.contactText}>
                  <Text style={styles.contactTitle}>{method.title}</Text>
                  <Text style={styles.contactDescription}>{method.description}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Additional Info */}
        {/* <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Support Hours</Text>
          <View style={styles.infoItem}>
            <Ionicons name="time" size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>Monday - Friday: 9:00 AM - 6:00 PM</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="time" size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>Saturday: 10:00 AM - 4:00 PM</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="time" size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>Sunday: Closed</Text>
          </View>
        </View> */}

        <View style={styles.footer} />
      </ScrollView>
    </View>
  );
}