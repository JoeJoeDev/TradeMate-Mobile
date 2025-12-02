import {
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useQuote } from '../../hooks/useApi';

const statusColors: Record<string, { bg: string; text: string }> = {
  draft: { bg: '#f3f4f6', text: '#6b7280' },
  sent: { bg: '#dbeafe', text: '#1e40af' },
  accepted: { bg: '#d1fae5', text: '#065f46' },
  declined: { bg: '#fee2e2', text: '#991b1b' },
  expired: { bg: '#fef3c7', text: '#92400e' },
};

export default function QuoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const quoteId = parseInt(id || '0', 10);

  const { data, isLoading } = useQuote(quoteId);

  const quote = data?.data;
  const statusStyle = statusColors[quote?.status || 'draft'];

  const formatDate = (date?: string) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-NZ', { dateStyle: 'medium' });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Quote',
            headerStyle: { backgroundColor: '#1e3a5f' },
            headerTintColor: '#ffffff',
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1e3a5f" />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: `Quote #${quote?.quote_number || ''}`,
          headerStyle: { backgroundColor: '#1e3a5f' },
          headerTintColor: '#ffffff',
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.statusHeader}>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle?.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle?.text }]}>
              {quote?.status}
            </Text>
          </View>
          <Text style={styles.quoteNumber}>#{quote?.quote_number}</Text>
        </View>

        {/* Customer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer</Text>
          <Text style={styles.customerName}>{quote?.customer?.customer_name}</Text>
          {quote?.customer?.email_address && (
            <Text style={styles.customerEmail}>{quote.customer.email_address}</Text>
          )}
        </View>

        {/* Dates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dates</Text>
          <DetailRow label="Quote Date" value={formatDate(quote?.quote_date)} />
          <DetailRow label="Valid Until" value={formatDate(quote?.due_date)} />
        </View>

        {/* Line Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>
          {quote?.items?.map((item, index) => (
            <View key={item.id || index} style={styles.lineItem}>
              <Text style={styles.itemDescription}>{item.description}</Text>
              <View style={styles.itemDetails}>
                <Text style={styles.itemQty}>
                  {item.quantity} × {formatCurrency(item.unit_price)}
                </Text>
                <Text style={styles.itemTotal}>{formatCurrency(item.total_price)}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Total</Text>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatCurrency(quote?.subtotal || 0)}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Quote Total</Text>
            <Text style={styles.grandTotalValue}>
              {formatCurrency(quote?.total_amount || 0)}
            </Text>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </>
  );
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || '—'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 16 },
  statusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  statusText: { fontSize: 14, fontWeight: '600', textTransform: 'capitalize' },
  quoteNumber: { fontSize: 14, color: '#6b7280' },
  section: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#1e3a5f' },
  customerName: { fontSize: 18, fontWeight: '600' },
  customerEmail: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  detailLabel: { fontSize: 14, color: '#6b7280' },
  detailValue: { fontSize: 14, fontWeight: '500' },
  lineItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  itemDescription: { fontSize: 15, fontWeight: '500', marginBottom: 4 },
  itemDetails: { flexDirection: 'row', justifyContent: 'space-between' },
  itemQty: { fontSize: 14, color: '#6b7280' },
  itemTotal: { fontSize: 14, fontWeight: '600' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  totalLabel: { fontSize: 14, color: '#6b7280' },
  totalValue: { fontSize: 14, fontWeight: '500' },
  grandTotalRow: { borderTopWidth: 1, borderTopColor: '#e5e7eb', marginTop: 8, paddingTop: 12 },
  grandTotalLabel: { fontSize: 18, fontWeight: '600' },
  grandTotalValue: { fontSize: 18, fontWeight: '700', color: '#1e3a5f' },
  bottomPadding: { height: 24 },
});

