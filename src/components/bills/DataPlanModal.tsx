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
import { formatAmount } from '../../helper/util';
import { DataPlan } from '../../services/billService';

interface DataPlanModalProps {
  visible: boolean;
  onClose: () => void;
  dataPlans: DataPlan[];
  selectedPlan: DataPlan | null;
  onSelectPlan: (plan: DataPlan) => void;
  loading?: boolean;
  isAwuf?: boolean;
}

export const DataPlanModal: React.FC<DataPlanModalProps> = ({
  visible,
  onClose,
  dataPlans,
  selectedPlan,
  onSelectPlan,
  loading = false,
  isAwuf = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter plans based on search query
  const filteredPlans = dataPlans.filter(plan => {
    if (isAwuf) {
      return plan.package_name?.toLowerCase().includes(searchQuery.toLowerCase());
    } else {
      return plan.name?.toLowerCase().includes(searchQuery.toLowerCase());
    }
  });

  // Check if a plan is selected
  const isPlanSelected = (item: DataPlan): boolean => {
    if (!selectedPlan) return false;

    if (isAwuf) {
      return selectedPlan.package_api_code === item.package_api_code;
    } else {
      return selectedPlan.variation_code === item.variation_code;
    }
  };

  // Get plan display name
  const getPlanName = (item: DataPlan): string => {
    if (isAwuf) {
      return item.package_name || 'Unknown Plan';
    }
    return item.name || 'Unknown Plan';
  };

  // Get plan amount
  const getPlanAmount = (item: DataPlan): number => {
    if (isAwuf) {
      return parseFloat(item.price?.toString() || '0');
    }
    return parseFloat(item.variation_amount?.toString() || '0');
  };

  const renderDataPlanItem = ({ item }: { item: DataPlan }) => {
    const selected = isPlanSelected(item);
    const planName = getPlanName(item);
    const planAmount = getPlanAmount(item);

    return (
      <TouchableOpacity
        style={[
          styles.planItem,
          selected && styles.planItemSelected
        ]}
        onPress={() => onSelectPlan(item)}
        activeOpacity={0.7}
      >
        <View style={styles.planInfo}>
          <View style={styles.planNameContainer}>
            <Text style={[styles.planName, selected && styles.planNameSelected]} numberOfLines={2}>
              {planName}
            </Text>
            {/* {isAwuf && planName.toLowerCase().includes('awuf') && (
              <View style={styles.awufBadge}>
                <Text style={styles.awufBadgeText}>AWUF</Text>
              </View>
            )} */}
          </View>

          {!isAwuf && item.validity && (
            <Text style={styles.planValidity}>Validity: {item.validity}</Text>
          )}
        </View>

        <View style={styles.planPriceContainer}>
          <Text style={[styles.planPrice, selected && styles.planPriceSelected]}>
            ₦{formatAmount(planAmount)}
          </Text>

          {isAwuf && item.aidapay_price && item.aidapay_price !== item.price && (
            <Text style={styles.originalPrice}>
              ₦{formatAmount(item.aidapay_price)}
            </Text>
          )}
        </View>

        {selected && (
          <Ionicons name="checkmark-circle" size={24} color="#1F54DD" style={styles.checkIcon} />
        )}
      </TouchableOpacity>
    );
  };

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
            <Text style={styles.modalTitle}>
              {isAwuf ? 'Select AWUF Data Plan' : 'Select Data Plan'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder={isAwuf ? "Search AWUF plans..." : "Search data plans..."}
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
          </View>

          {/* Info message for AWUF */}
          {isAwuf && (
            <View style={styles.infoContainer}>
              <Ionicons name="information-circle-outline" size={16} color="#F59E0B" />
              <Text style={styles.infoText}>
                AWUF data includes special bonus. Dial *323*4# or *323*1# to check balance.
              </Text>
            </View>
          )}

          {/* Data Plans List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1F54DD" />
              <Text style={styles.loadingText}>
                {isAwuf ? 'Loading AWUF plans...' : 'Loading data plans...'}
              </Text>
            </View>
          ) : filteredPlans.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="wifi" size={48} color="#CBD5E1" />
              <Text style={styles.emptyText}>
                {searchQuery
                  ? 'No matching plans found'
                  : isAwuf
                    ? 'No AWUF plans available'
                    : 'No data plans available'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredPlans}
              renderItem={renderDataPlanItem}
              keyExtractor={(item, index) => {
                if (isAwuf) {
                  return item.package_api_code || `awuf-${index}`;
                }
                return item.variation_code || `regular-${index}`;
              }}
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
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#0F172A',
    marginLeft: 12,
    paddingVertical: 12,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#92400E',
    marginLeft: 8,
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
  planNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  planName: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  planNameSelected: {
    color: '#1F54DD',
    fontFamily: 'Poppins-SemiBold',
  },
  awufBadge: {
    backgroundColor: '#F59E0B',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  awufBadgeText: {
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
  },
  planValidity: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  planPriceContainer: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: '#10B981',
  },
  planPriceSelected: {
    color: '#1F54DD',
  },
  originalPrice: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  checkIcon: {
    marginLeft: 8,
  },
  separator: {
    height: 12,
  },
});