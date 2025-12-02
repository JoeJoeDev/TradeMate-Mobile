import { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useInvoice, useSendInvoice, useAddPayment } from '../../hooks/useApi';
import { FormInput, FormSelect, FormCurrency } from '@/components/forms';

const statusColors: Record<string, { bg: string; text: string }> = {
  draft: { bg: '#f3f4f6', text: '#6b7280' },
  sent: { bg: '#dbeafe', text: '#1e40af' },
  paid: { bg: '#d1fae5', text: '#065f46' },
  overdue: { bg: '#fee2e2', text: '#991b1b' },
};

const paymentMethods = [
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'cheque', label: 'Cheque' },
];

export default function InvoiceDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const invoiceId = parseInt(id || '0', 10);

  const { data, isLoading, refetch } = useInvoice(invoiceId);
  const sendInvoice = useSendInvoice();
  const addPayment = useAddPayment();

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');

  const invoice = data?.data;
  const statusStyle = statusColors[invoice?.status || 'draft'];

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

  const handleSend = () => {
    Alert.alert('Send Invoice', 'Send this invoice to the customer?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Send',
        onPress: async () => {
          try {
            await sendInvoice.mutateAsync(invoiceId);
            refetch();
            Alert.alert('Success', 'Invoice sent to customer');
          } catch (error: any) {
            Alert.alert('Error', error?.response?.data?.message || 'Failed to send invoice');
          }
        },
      },
    ]);
  };

  const handleAddPayment = async () => {
    if (paymentAmount <= 0) {
      Alert.alert('Error', 'Payment amount must be greater than 0');
      return;
    }

    try {
      await addPayment.mutateAsync({
        id: invoiceId,
        amount: paymentAmount,
        method: paymentMethod,
      });
      setShowPaymentForm(false);
      setPaymentAmount(0);
      refetch();
      Alert.alert('Success', 'Payment recorded');
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to record payment');
    }
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Invoice',
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
          title: `Invoice #${invoice?.invoice_number || ''}`,
          headerStyle: { backgroundColor: '#1e3a5f' },
          headerTintColor: '#ffffff',
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.statusHeader}>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle?.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle?.text }]}>
              {invoice?.status}
            </Text>
          </View>
          <Text style={styles.invoiceNumber}>#{invoice?.invoice_number}</Text>
        </View>

        {/* Quick Actions */}
        {invoice?.status === 'draft' && (
          <TouchableOpacity style={styles.actionButton} onPress={handleSend}>
            <Text style={styles.actionButtonText}>📤 Send Invoice</Text>
          </TouchableOpacity>
        )}

        {(invoice?.status === 'sent' || invoice?.status === 'overdue') &&
          invoice?.outstanding > 0 && (
            <TouchableOpacity
              style={[styles.actionButton, styles.paymentButton]}
              onPress={() => {
                setPaymentAmount(invoice.outstanding);
                setShowPaymentForm(!showPaymentForm);
              }}
            >
              <Text style={styles.actionButtonText}>💳 Record Payment</Text>
            </TouchableOpacity>
          )}

        {/* Payment Form */}
        {showPaymentForm && (
          <View style={styles.paymentForm}>
            <Text style={styles.paymentFormTitle}>Record Payment</Text>
            <FormCurrency
              label="Amount"
              value={paymentAmount}
              onChange={setPaymentAmount}
            />
            <FormSelect
              label="Payment Method"
              value={paymentMethod}
              options={paymentMethods}
              onChange={(value) => setPaymentMethod(value as string)}
            />
            <View style={styles.paymentFormActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowPaymentForm(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, addPayment.isPending && styles.confirmButtonDisabled]}
                onPress={handleAddPayment}
                disabled={addPayment.isPending}
              >
                {addPayment.isPending ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.confirmButtonText}>Confirm Payment</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Customer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer</Text>
          <Text style={styles.customerName}>{invoice?.customer?.customer_name}</Text>
          {invoice?.customer?.email_address && (
            <Text style={styles.customerEmail}>{invoice.customer.email_address}</Text>
          )}
        </View>

        {/* Dates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dates</Text>
          <DetailRow label="Invoice Date" value={formatDate(invoice?.invoice_date)} />
          <DetailRow
            label="Due Date"
            value={formatDate(invoice?.due_date)}
            highlight={invoice?.is_overdue}
          />
        </View>

        {/* Line Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>
          {invoice?.items?.map((item, index) => (
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
          <Text style={styles.sectionTitle}>Totals</Text>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatCurrency(invoice?.subtotal || 0)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>GST ({invoice?.tax_rate || 0}%)</Text>
            <Text style={styles.totalValue}>{formatCurrency(invoice?.tax_amount || 0)}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>
              {formatCurrency(invoice?.total_amount || 0)}
            </Text>
          </View>
          {invoice?.outstanding !== undefined && invoice.outstanding > 0 && (
            <View style={[styles.totalRow, styles.outstandingRow]}>
              <Text style={styles.outstandingLabel}>Outstanding</Text>
              <Text style={styles.outstandingValue}>
                {formatCurrency(invoice.outstanding)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </>
  );
}

function DetailRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value?: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, highlight && styles.highlightValue]}>
        {value || '—'}
      </Text>
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
  invoiceNumber: { fontSize: 14, color: '#6b7280' },
  actionButton: { backgroundColor: '#1e3a5f', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 16 },
  paymentButton: { backgroundColor: '#10b981' },
  actionButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  paymentForm: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 16 },
  paymentFormTitle: { fontSize: 16, fontWeight: '600', marginBottom: 16, color: '#1e3a5f' },
  paymentFormActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelButton: { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 8, padding: 12, alignItems: 'center' },
  cancelButtonText: { fontSize: 14, fontWeight: '600', color: '#6b7280' },
  confirmButton: { flex: 2, backgroundColor: '#10b981', borderRadius: 8, padding: 12, alignItems: 'center' },
  confirmButtonDisabled: { opacity: 0.7 },
  confirmButtonText: { fontSize: 14, fontWeight: '600', color: '#ffffff' },
  section: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#1e3a5f' },
  customerName: { fontSize: 18, fontWeight: '600' },
  customerEmail: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  detailLabel: { fontSize: 14, color: '#6b7280' },
  detailValue: { fontSize: 14, fontWeight: '500' },
  highlightValue: { color: '#dc2626' },
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
  outstandingRow: { backgroundColor: '#fef2f2', marginHorizontal: -16, paddingHorizontal: 16, marginBottom: -16, paddingBottom: 16, borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
  outstandingLabel: { fontSize: 16, fontWeight: '600', color: '#dc2626' },
  outstandingValue: { fontSize: 16, fontWeight: '700', color: '#dc2626' },
  bottomPadding: { height: 24 },
});

