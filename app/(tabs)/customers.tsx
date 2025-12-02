import { useState } from 'react';
import {
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { useCustomers } from '../../hooks/useApi';
import { Customer } from '../../types';

function CustomerCard({ customer, onPress }: { customer: Customer; onPress: () => void }) {
  const handleCall = (e: any) => {
    e.stopPropagation();
    const phone = customer.primary_phone || customer.phone_number || customer.mobile_number;
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  const handleEmail = (e: any) => {
    e.stopPropagation();
    if (customer.email_address) Linking.openURL(`mailto:${customer.email_address}`);
  };

  return (
    <TouchableOpacity style={styles.customerCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.customerHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {customer.customer_name?.charAt(0)?.toUpperCase() || '?'}
          </Text>
        </View>
        <View style={styles.customerInfo}>
          <Text style={styles.customerName} numberOfLines={1}>
            {customer.customer_name}
          </Text>
          {customer.contact_name && (
            <Text style={styles.contactName} numberOfLines={1}>
              {customer.contact_name}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.customerDetails}>
        {customer.email_address && (
          <Text style={styles.detailText} numberOfLines={1}>✉️ {customer.email_address}</Text>
        )}
        {customer.primary_phone && (
          <Text style={styles.detailText}>📞 {customer.primary_phone}</Text>
        )}
        {customer.physical_address?.formatted && (
          <Text style={styles.detailText} numberOfLines={1}>📍 {customer.physical_address.formatted}</Text>
        )}
      </View>

      <View style={styles.customerActions}>
        {customer.primary_phone && (
          <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
            <Text style={styles.actionText}>📞 Call</Text>
          </TouchableOpacity>
        )}
        {customer.email_address && (
          <TouchableOpacity style={styles.actionButton} onPress={handleEmail}>
            <Text style={styles.actionText}>✉️ Email</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function CustomersScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const { data, isLoading, refetch, isRefetching } = useCustomers({
    search: search || undefined,
  });

  const customers = data?.data || [];

  const renderCustomer = ({ item }: { item: Customer }) => (
    <CustomerCard
      customer={item}
      onPress={() => router.push(`/customer/${item.id}`)}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search customers..."
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {isLoading && !isRefetching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1e3a5f" />
        </View>
      ) : (
        <FlatList
          data={customers}
          renderItem={renderCustomer}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No customers found</Text>
              <Text style={styles.emptySubtitle}>
                {search ? 'Try a different search' : 'Add a customer to get started'}
              </Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/customer/create')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: { padding: 16, paddingBottom: 8 },
  searchInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1f2937',
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16, paddingTop: 8 },
  customerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  customerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1e3a5f',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 20, fontWeight: '700', color: '#ffffff' },
  customerInfo: { flex: 1 },
  customerName: { fontSize: 16, fontWeight: '600' },
  contactName: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  customerDetails: { marginBottom: 12, gap: 4 },
  detailText: { fontSize: 13, color: '#6b7280' },
  customerActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
    gap: 16,
  },
  actionButton: { flexDirection: 'row', alignItems: 'center' },
  actionText: { fontSize: 14, fontWeight: '500', color: '#1e3a5f' },
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#6b7280' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1e3a5f',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  fabText: {
    fontSize: 28,
    color: '#ffffff',
    fontWeight: '300',
    marginTop: -2,
  },
});
