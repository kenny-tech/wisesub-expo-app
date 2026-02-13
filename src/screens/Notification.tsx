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

export default function Notification({ navigation }: { navigation: any }) {
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

  useFocusEffect(
    useCallback(() => {
      refreshNotifications();
    }, [refreshNotifications])
  );

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
        { 
          text: "Mark Read", 
          onPress: async () => {
            await markAllAsRead();
          }
        },
      ]
    );
  };

  const renderNotification = ({ item }: { item: any }) => {
    const icon = getIcon(item.type);
    const isUnread = !item.read_at;

    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          isUnread && styles.unreadNotification
        ]}
        activeOpacity={0.7}
      >
        <View style={styles.notificationLeft}>
          <View style={[styles.iconContainer, { backgroundColor: icon.bgColor }]}>
            <Ionicons name={icon.icon as any} size={20} color={icon.color} />
          </View>
          
          <View style={styles.notificationContent}>
            <View style={styles.notificationHeader}>
              <Text style={styles.notificationTitle} numberOfLines={1}>
                {item.title}
              </Text>
            </View>
            <Text style={styles.notificationMessage} numberOfLines={3}>
              {item.body}
            </Text>
            <Text style={styles.notificationDate}>
              {formatDate(item.created_at)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.empty}>
          <ActivityIndicator size="large" color="#1F54DD" />
          <Text style={styles.emptyText}>Loading notifications...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.empty}>
          <Ionicons name="alert-circle" size={48} color="#EF4444" />
          <Text style={[styles.emptyText, { color: '#EF4444' }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={refreshNotifications}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.empty}>
        <Ionicons name="notifications-off-outline" size={64} color="#94A3B8" />
        <Text style={styles.emptyTitle}>No Notifications</Text>
        <Text style={styles.emptyDescription}>
          No notifications yet.
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <View style={styles.headerActions}>
          {stats.unread > 0 && (
            <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.headerButton}>
              <Text style={styles.markAllText}>Mark all read</Text>
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
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={renderEmptyState()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#1F54DD"]}
            tintColor="#1F54DD"
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: "#0F172A",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  markAllText: {
    color: "#1F54DD",
    fontSize: 14,
    fontFamily: "Poppins-Medium",
  },
  
  // Stats
  statsContainer: {
    backgroundColor: "#F8FAFC",
    paddingVertical: 16,
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 12,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: "#0F172A",
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#64748B",
    marginTop: 4,
  },

  // Notifications List
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 16,
  },
  separator: {
    height: 8,
  },
  notificationItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  unreadNotification: {
    backgroundColor: "#F8FAFC",
    borderColor: '#E2E8F0',
  },
  notificationLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
    color: "#0F172A",
    flex: 1,
  },
  notificationMessage: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: "#64748B",
    lineHeight: 18,
    marginBottom: 6,
  },
  notificationDate: {
    fontSize: 11,
    color: "#94A3B8",
    fontFamily: "Poppins-Regular",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#1F54DD",
    marginLeft: 8,
  },

  // Empty State
  empty: {
    flex: 1,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: "#0F172A",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },
  emptyText: {
    color: "#94A3B8",
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    marginTop: 8,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#1F54DD",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
  },
});