import { formatAmount } from '@/src/helper/util';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export interface CablePlan {
  variation_code: string;
  name: string;
  variation_amount: string | number;
  description?: string;
}

interface CablePlanModalProps {
  visible: boolean;
  onClose: () => void;
  cablePlans: CablePlan[];
  selectedPlan: CablePlan | null;
  onSelectPlan: (plan: CablePlan) => void;
  loading?: boolean;
  providerName?: string;
}

export const CablePlanModal: React.FC<CablePlanModalProps> = ({
  visible,
  onClose,
  cablePlans,
  selectedPlan,
  onSelectPlan,
  loading = false,
  providerName = 'Cable TV'
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlans = cablePlans.filter(plan =>
    plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.variation_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderCablePlanItem = ({ item }: { item: CablePlan }) => (
    <TouchableOpacity
      style={[
        styles.planItem,
        selectedPlan?.variation_code === item.variation_code && styles.planItemSelected
      ]}
      onPress={() => onSelectPlan(item)}
      activeOpacity={0.7}
    >
      <View style={styles.planInfo}>
        <Text style={styles.planName} numberOfLines={1}>
          {item.name}
        </Text>
        {item.description && (
          <Text style={styles.planDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
      </View>
      <View style={styles.planPriceContainer}>
        <Text style={styles.planPrice}>₦{formatAmount(item.variation_amount)}</Text>
      </View>
      {selectedPlan?.variation_code === item.variation_code && (
        <Ionicons name="checkmark-circle" size={24} color="#1F54DD" style={styles.checkIcon} />
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPressOut={onClose}
      >
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{providerName} Plans</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search cable plans..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
          </View>

          {/* Cable Plans List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1F54DD" />
              <Text style={styles.loadingText}>Loading cable plans...</Text>
            </View>
          ) : filteredPlans.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="tv-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyText}>
                {searchQuery ? 'No matching cable plans found' : 'No cable plans available'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredPlans}
              renderItem={renderCablePlanItem}
              keyExtractor={(item) => item.variation_code}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F172A',
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#0F172A',
    marginLeft: 12,
    paddingVertical: 12,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
    marginTop: 12,
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#94A3B8',
    marginTop: 12,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  planItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  planItemSelected: {
    borderColor: '#1F54DD',
    backgroundColor: '#F1F6FF',
  },
  planInfo: {
    flex: 1,
    marginRight: 12,
  },
  planName: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#0F172A',
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
  },
  planPriceContainer: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1F54DD',
  },
  checkIcon: {
    marginLeft: 12,
  },
  separator: {
    height: 12,
  },
});