import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Linking,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { supportStyles as styles } from '../styles/sharedStyles';

export default function Support({ navigation }: { navigation: any }) {
  const contactMethods = [
    {
      id: 1,
      title: "WhatsApp Support",
      description: "Chat with us directly on WhatsApp",
      icon: "logo-whatsapp" as const,
      color: "#25D366",
      backgroundColor: "#DCF8C6",
      onPress: () => Linking.openURL('https://wa.me/1234567890?text=Hello%20I%20need%20support')
    },
    {
      id: 2,
      title: "Email Support",
      description: "Send us an email and we'll respond within 24 hours",
      icon: "mail" as const,
      color: "#EA4335",
      backgroundColor: "#FCE8E6",
      onPress: () => Linking.openURL('mailto:support@yourapp.com?subject=Support%20Request')
    },
    {
      id: 3,
      title: "Phone Support",
      description: "Call us during business hours (9AM - 5PM)",
      icon: "call" as const,
      color: "#34A853",
      backgroundColor: "#E6F4EA",
      onPress: () => Linking.openURL('tel:+1234567890')
    },
    {
      id: 4,
      title: "FAQ & Help Center",
      description: "Find answers to common questions",
      icon: "help-circle" as const,
      color: "#1F54DD",
      backgroundColor: "#E0E7FF",
      onPress: () => console.log('Navigate to FAQ')
    }
  ];

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.title}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Support Header */}
        <View style={styles.supportHeader}>
          <Ionicons name="help-buoy" size={64} color="#1F54DD" />
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
              <Ionicons name="chevron-forward" size={20} color="#64748B" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Additional Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Support Hours</Text>
          <View style={styles.infoItem}>
            <Ionicons name="time" size={16} color="#64748B" />
            <Text style={styles.infoText}>Monday - Friday: 9:00 AM - 6:00 PM</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="time" size={16} color="#64748B" />
            <Text style={styles.infoText}>Saturday: 10:00 AM - 4:00 PM</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="time" size={16} color="#64748B" />
            <Text style={styles.infoText}>Sunday: Closed</Text>
          </View>
        </View>

        <View style={styles.footer} />
      </ScrollView>
    </View>
  );
}