import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator, FlatList, Modal, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { formatAmount } from '../../helper/util';
import { DataPlan } from '../../services/billService';
import { useTheme } from '../../theme/ThemeContext';

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
  visible, onClose, dataPlans, selectedPlan, onSelectPlan, loading = false, isAwuf = false,
}) => {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlans = dataPlans.filter(plan =>
    isAwuf
      ? plan.package_name?.toLowerCase().includes(searchQuery.toLowerCase())
      : plan.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isPlanSelected = (item: DataPlan): boolean => {
    if (!selectedPlan) return false;
    return isAwuf
      ? selectedPlan.package_api_code === item.package_api_code
      : selectedPlan.variation_code === item.variation_code;
  };

  const getPlanName  = (item: DataPlan) => isAwuf ? item.package_name || 'Unknown Plan' : item.name || 'Unknown Plan';
  const getPlanAmount = (item: DataPlan) => parseFloat((isAwuf ? item.price : item.variation_amount)?.toString() || '0');

  const renderDataPlanItem = ({ item }: { item: DataPlan }) => {
    const selected = isPlanSelected(item);
    return (
      <TouchableOpacity
        style={[
          styles.planItem,
          { backgroundColor: colors.backgroundSecondary },
          selected && { borderColor: colors.primary, backgroundColor: colors.primaryLight },
        ]}
        onPress={() => onSelectPlan(item)}
        activeOpacity={0.7}
      >
        <View style={styles.planInfo}>
          <View style={styles.planNameContainer}>
            <Text style={[styles.planName, { color: colors.textPrimary }, selected && { color: colors.primary, fontFamily: 'Poppins-SemiBold' }]} numberOfLines={2}>
              {getPlanName(item)}
            </Text>
          </View>
          {!isAwuf && item.validity && (
            <Text style={[styles.planValidity, { color: colors.textMuted }]}>Validity: {item.validity}</Text>
          )}
        </View>
        <View style={styles.planPriceContainer}>
          <Text style={[styles.planPrice, selected && { color: colors.primary }]}>
            ₦{formatAmount(getPlanAmount(item))}
          </Text>
          {isAwuf && item.aidapay_price && item.aidapay_price !== item.price && (
            <Text style={[styles.originalPrice, { color: colors.textMuted }]}>₦{formatAmount(item.aidapay_price)}</Text>
          )}
        </View>
        {selected && <Ionicons name="checkmark-circle" size={24} color={colors.primary} style={styles.checkIcon} />}
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={onClose}>
        <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.separator }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              {isAwuf ? 'Select AWUF Data Plan' : 'Select Data Plan'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={[styles.searchContainer, { backgroundColor: colors.backgroundSecondary }]}>
            <Ionicons name="search" size={20} color={colors.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder={isAwuf ? 'Search AWUF plans...' : 'Search data plans...'}
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
          </View>

          {/* {isAwuf && (
            <View style={styles.infoContainer}>
              <Ionicons name="information-circle-outline" size={16} color="#F59E0B" />
              <Text style={styles.infoText}>AWUF data includes special bonus. Dial *323*4# or *323*1# to check balance.</Text>
            </View>
          )} */}

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                {isAwuf ? 'Loading AWUF plans...' : 'Loading data plans...'}
              </Text>
            </View>
          ) : filteredPlans.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="wifi" size={48} color={colors.divider} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                {searchQuery ? 'No matching plans found' : isAwuf ? 'No AWUF plans available' : 'No data plans available'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredPlans}
              renderItem={renderDataPlanItem}
              keyExtractor={(item, index) => isAwuf ? item.package_api_code || `awuf-${index}` : item.variation_code || `regular-${index}`}
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
  modalOverlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer:    { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%', paddingBottom: 20 },
  modalHeader:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, borderBottomWidth: 1 },
  modalTitle:        { fontSize: 18, fontFamily: 'Poppins-SemiBold' },
  closeButton:       { padding: 4 },
  searchContainer:   { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 16, height: 48, marginHorizontal: 20, marginTop: 16, marginBottom: 12 },
  searchInput:       { flex: 1, fontSize: 16, fontFamily: 'Poppins-Regular', marginLeft: 12, paddingVertical: 12 },
  infoContainer:     { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10, marginHorizontal: 20, marginBottom: 16 },
  infoText:          { flex: 1, fontSize: 12, fontFamily: 'Poppins-Regular', color: '#92400E', marginLeft: 8 },
  loadingContainer:  { padding: 40, alignItems: 'center', justifyContent: 'center' },
  loadingText:       { fontSize: 16, fontFamily: 'Poppins-Regular', marginTop: 12 },
  emptyContainer:    { padding: 60, alignItems: 'center', justifyContent: 'center' },
  emptyText:         { fontSize: 16, fontFamily: 'Poppins-Regular', marginTop: 12, textAlign: 'center' },
  listContent:       { paddingHorizontal: 20, paddingBottom: 20 },
  planItem:          { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 16, borderWidth: 2, borderColor: 'transparent' },
  planInfo:          { flex: 1, marginRight: 12 },
  planNameContainer: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 },
  planName:          { fontSize: 14, fontFamily: 'Poppins-Medium', flex: 1, marginRight: 8 },
  planValidity:      { fontSize: 11, fontFamily: 'Poppins-Regular', fontStyle: 'italic' },
  planPriceContainer:{ alignItems: 'flex-end' },
  planPrice:         { fontSize: 15, fontFamily: 'Poppins-SemiBold', color: '#10B981' },
  originalPrice:     { fontSize: 11, fontFamily: 'Poppins-Regular', textDecorationLine: 'line-through', marginTop: 2 },
  checkIcon:         { marginLeft: 8 },
  separator:         { height: 12 },
});