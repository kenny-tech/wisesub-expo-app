import { formatAmount } from '@/src/helper/util';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator, FlatList, Modal, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

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
  visible, onClose, cablePlans, selectedPlan, onSelectPlan, loading = false, providerName = 'Cable TV',
}) => {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlans = cablePlans.filter(plan =>
    plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.variation_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderCablePlanItem = ({ item }: { item: CablePlan }) => {
    const selected = selectedPlan?.variation_code === item.variation_code;
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
          <Text style={[styles.planName, { color: colors.textPrimary }]} numberOfLines={1}>{item.name}</Text>
          {item.description && (
            <Text style={[styles.planDescription, { color: colors.textSecondary }]} numberOfLines={2}>{item.description}</Text>
          )}
        </View>
        <View style={styles.planPriceContainer}>
          <Text style={[styles.planPrice, { color: colors.primary }]}>₦{formatAmount(item.variation_amount)}</Text>
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
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>{providerName} Plans</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={[styles.searchContainer, { backgroundColor: colors.backgroundSecondary }]}>
            <Ionicons name="search" size={20} color={colors.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder="Search cable plans..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading cable plans...</Text>
            </View>
          ) : filteredPlans.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="tv-outline" size={48} color={colors.divider} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
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
  modalOverlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer:    { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%', paddingBottom: 20 },
  modalHeader:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, borderBottomWidth: 1 },
  modalTitle:        { fontSize: 18, fontFamily: 'Poppins-SemiBold' },
  closeButton:       { padding: 4 },
  searchContainer:   { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 16, height: 48, marginHorizontal: 20, marginTop: 16, marginBottom: 20 },
  searchInput:       { flex: 1, fontSize: 16, fontFamily: 'Poppins-Regular', marginLeft: 12, paddingVertical: 12 },
  loadingContainer:  { padding: 40, alignItems: 'center', justifyContent: 'center' },
  loadingText:       { fontSize: 16, fontFamily: 'Poppins-Regular', marginTop: 12 },
  emptyContainer:    { padding: 60, alignItems: 'center', justifyContent: 'center' },
  emptyText:         { fontSize: 16, fontFamily: 'Poppins-Regular', marginTop: 12, textAlign: 'center' },
  listContent:       { paddingHorizontal: 20, paddingBottom: 20 },
  planItem:          { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 16, borderWidth: 2, borderColor: 'transparent' },
  planInfo:          { flex: 1, marginRight: 12 },
  planName:          { fontSize: 16, fontFamily: 'Poppins-Medium', marginBottom: 4 },
  planDescription:   { fontSize: 14, fontFamily: 'Poppins-Regular' },
  planPriceContainer:{ alignItems: 'flex-end' },
  planPrice:         { fontSize: 16, fontFamily: 'Poppins-SemiBold' },
  checkIcon:         { marginLeft: 12 },
  separator:         { height: 12 },
});