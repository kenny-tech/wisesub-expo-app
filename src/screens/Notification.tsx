import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNotifications } from "../redux/hooks/useNotifications";
import { useTheme } from '../theme/ThemeContext';

export default function Notification({ navigation }: { navigation: any }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const {
    notifications,
    stats,
    loading,
    error,
    markAllAsRead,
    refreshNotifications,
    formatDate,
    getIcon,
  } = useNotifications();

  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(useCallback(() => { refreshNotifications(); }, [refreshNotifications]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshNotifications();
    setRefreshing(false);
  }, [refreshNotifications]);

  const handleMarkAllAsRead = async () => {
    Alert.alert(
      "Mark All as Read",
      "Mark all notifications as read?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Mark Read", onPress: async () => { await markAllAsRead(); } },
      ]
    );
  };

  const renderNotification = ({ item }: { item: any }) => {
    const icon = getIcon(item.type);
    const isUnread = !item.read_at;

    return (
      <TouchableOpacity style={[styles.notificationItem, isUnread && styles.unreadNotification, isUnread && { backgroundColor: colors.backgroundSecondary, borderColor: colors.divider }]} activeOpacity={0.7}>
        <View style={styles.notificationLeft}>
          <View style={[styles.iconContainer, { backgroundColor: icon.bgColor }]}>
            <Ionicons name={icon.icon as any} size={20} color={icon.color} />
          </View>
          <View style={styles.notificationContent}>
            <View style={styles.notificationHeader}>
              <Text style={[styles.notificationTitle, { color: colors.textPrimary }]} numberOfLines={1}>{item.title}</Text>
            </View>
            <Text style={[styles.notificationMessage, { color: colors.textSecondary }]} numberOfLines={3}>{item.body}</Text>
            <Text style={[styles.notificationDate, { color: colors.textMuted }]}>{formatDate(item.created_at)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.empty}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>Loading notifications...</Text>
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.empty}>
          <Ionicons name="alert-circle" size={48} color={colors.error} />
          <Text style={[styles.emptyText, { color: colors.error }]}>{error}</Text>
          <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={refreshNotifications}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.empty}>
        <Ionicons name="notifications-off-outline" size={64} color={colors.textMuted} />
        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Notifications</Text>
        <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>No notifications yet.</Text>
      </View>
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.separator }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Notifications</Text>
        <View style={styles.headerActions}>
          {stats.unread > 0 && (
            <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.headerButton}>
              <Text style={[styles.markAllText, { color: colors.primary }]}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={[styles.separator, { height: 8 }]} />}
        ListEmptyComponent={renderEmptyState()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, borderBottomWidth: 1 },
  backButton: { padding: 4 },
  title: { fontSize: 18, fontFamily: 'Poppins-SemiBold' },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  headerButton: { paddingHorizontal: 12, paddingVertical: 6 },
  markAllText: { fontSize: 14, fontFamily: 'Poppins-Medium' },
  listContent: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 16 },
  separator: {},
  notificationItem: { borderRadius: 14, padding: 16, borderWidth: 1, borderColor: colors.divider, shadowColor: "#000", shadowOpacity: 0.02, shadowRadius: 12, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  unreadNotification: { backgroundColor: colors.backgroundSecondary },
  notificationLeft: { flexDirection: 'row', alignItems: 'flex-start' },
  iconContainer: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  notificationContent: { flex: 1 },
  notificationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  notificationTitle: { fontSize: 15, fontFamily: 'Poppins-SemiBold', flex: 1 },
  notificationMessage: { fontSize: 13, fontFamily: 'Poppins-Regular', lineHeight: 18, marginBottom: 6 },
  notificationDate: { fontSize: 11, fontFamily: 'Poppins-Regular' },
  empty: { flex: 1, padding: 40, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 18, fontFamily: 'Poppins-SemiBold', marginTop: 16, marginBottom: 8 },
  emptyDescription: { fontSize: 14, fontFamily: 'Poppins-Regular', textAlign: 'center', lineHeight: 20 },
  emptyText: { fontSize: 14, fontFamily: 'Poppins-Regular', marginTop: 8 },
  retryButton: { marginTop: 16, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryButtonText: { color: '#FFFFFF', fontSize: 14, fontFamily: 'Poppins-SemiBold' },
});