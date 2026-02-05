import { StyleSheet } from "react-native";

export const sharedStyles = StyleSheet.create({
  // Layout
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: "#0F172A",
  },
  placeholder: {
    width: 32,
  },
  hintText: {
    color: '#64748B',
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    marginTop: 4,
    marginLeft: 4,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  eyeButton: {
    padding: 4,
    marginLeft: 8,
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  // Typography
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#0F172A",
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#64748B",
    lineHeight: 20,
  },

  // Forms
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#374151",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: "#0F172A",
    marginLeft: 12,
    padding: 0,
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: "#0F172A",
    marginLeft: 12,
  },

  // Buttons
  primaryButton: {
    backgroundColor: "#1F54DD",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
  },

  // Menu Items
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "#0F172A",
  },

  // Footer
  footer: {
    height: 20,
  },
});

// Screen-specific style extensions
export const profileStyles = StyleSheet.create({
  ...sharedStyles,
  dangerCard: {
    backgroundColor: "#FEF2F2",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  dangerTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#DC2626",
    marginBottom: 16,
  },
  dangerText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "#DC2626",
  },
  dangerItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  editableInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export const changePasswordStyles = StyleSheet.create({
  ...sharedStyles,
  inputError: {
    borderColor: "#DC2626",
  },
  errorText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#DC2626",
    marginTop: 4,
  },
});

export const supportStyles = StyleSheet.create({
  ...sharedStyles,
  supportHeader: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  supportTitle: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: "#0F172A",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  supportDescription: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },
  contactMethods: {
    marginBottom: 20,
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  contactLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  contactText: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#0F172A",
    marginBottom: 4,
  },
  contactDescription: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#64748B",
    lineHeight: 16,
  },
  infoCard: {
    backgroundColor: "#F0F9FF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E0F2FE",
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#0F172A",
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#64748B",
    marginLeft: 8,
  },
});