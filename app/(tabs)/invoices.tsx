import { useState } from 'react';
import {
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { useInvoices } from '../../hooks/useApi';
import { Invoice } from '../../types';

const statusColors: Record<string, { bg: string; text: string }> = {
  draft: { bg: '#f3f4f6', text: '#6b7280' },
  sent: { bg: '#dbeafe', text: '#1e40af' },
  paid: { bg: '#d1fae5', text: '#065f46' },
  overdue: { bg: '#fee2e2', text: '#991b1b' },
};

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.filterChip, active && styles.filterChipActive]}
      onPress={onPress}
    >
      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function InvoiceCard({ invoice, onPress }: { invoice: Invoice; onPress: () => void }) {
  const statusStyle = statusColors[invoice.status] || statusColors.draft;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD' }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-NZ', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <TouchableOpacity style={styles.invoiceCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.invoiceHeader}>
        <View>
          <Text style={styles.invoiceNumber}>#{invoice.invoice_number}</Text>
          <Text style={styles.customerName} numberOfLines={1}>
            {invoice.customer?.customer_name || 'No customer'}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusText, { color: statusStyle.text }]}>{invoice.status}</Text>
        </View>
      </View>

      <View style={styles.invoiceDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date</Text>
          <Text style={styles.detailValue}>{formatDate(invoice.invoice_date)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Due</Text>
          <Text style={[styles.detailValue, invoice.is_overdue && styles.overdueText]}>
            {formatDate(invoice.due_date)}
          </Text>
        </View>
      </View>

      <View style={styles.invoiceFooter}>
        <View>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>{formatCurrency(invoice.total_amount)}</Text>
        </View>
        {invoice.outstanding > 0 && invoice.status !== 'draft' && (
          <View>
            <Text style={styles.outstandingLabel}>Outstanding</Text>
            <Text style={styles.outstandingAmount}>{formatCurrency(invoice.outstanding)}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function InvoicesScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const { data, isLoading, refetch, isRefetching } = useInvoices({
    search: search || undefined,
    status: statusFilter,
  });

  const invoices = data?.data || [];

  const renderInvoice = ({ item }: { item: Invoice }) => (
    <InvoiceCard invoice={item} onPress={() => router.push(`/invoice/${item.id}`)} />
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search invoices..."
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.filtersContainer}>
        <FilterChip label="All" active={!statusFilter} onPress={() => setStatusFilter(undefined)} />
        <FilterChip label="Draft" active={statusFilter === 'draft'} onPress={() => setStatusFilter('draft')} />
        <FilterChip label="Sent" active={statusFilter === 'sent'} onPress={() => setStatusFilter('sent')} />
        <FilterChip label="Paid" active={statusFilter === 'paid'} onPress={() => setStatusFilter('paid')} />
      </View>

      {isLoading && !isRefetching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1e3a5f" />
        </View>
      ) : (
        <FlatList
          data={invoices}
          renderItem={renderInvoice}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No invoices found</Text>
              <Text style={styles.emptySubtitle}>
                {search ? 'Try a different search' : 'Create an invoice to get started'}
              </Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/invoice/create')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: { padding: 16, paddingBottom: 8 },
  searchInput: { backgroundColor: '#ffffff', borderRadius: 12, padding: 14, fontSize: 16, color: '#1f2937' },
  filtersContainer: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb' },
  filterChipActive: { backgroundColor: '#1e3a5f', borderColor: '#1e3a5f' },
  filterChipText: { fontSize: 13, fontWeight: '500', color: '#6b7280' },
  filterChipTextActive: { color: '#ffffff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16, paddingTop: 8 },
  invoiceCard: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 12 },
  invoiceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  invoiceNumber: { fontSize: 16, fontWeight: '700' },
  customerName: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  invoiceDetails: { marginBottom: 12, gap: 4 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailLabel: { fontSize: 13, color: '#6b7280' },
  detailValue: { fontSize: 13, color: '#374151', fontWeight: '500' },
  overdueText: { color: '#dc2626' },
  invoiceFooter: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 12 },
  totalLabel: { fontSize: 12, color: '#6b7280' },
  totalAmount: { fontSize: 18, fontWeight: '700' },
  outstandingLabel: { fontSize: 12, color: '#dc2626', textAlign: 'right' },
  outstandingAmount: { fontSize: 18, fontWeight: '700', color: '#dc2626' },
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
