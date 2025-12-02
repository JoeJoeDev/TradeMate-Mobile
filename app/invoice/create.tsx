import { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { Stack, useRouter } from 'expo-router';
import { FormInput, FormSelect, FormDatePicker, FormCurrency } from '@/components/forms';
import { useCreateInvoice, useCustomers, useJobs } from '../../hooks/useApi';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  job_id?: number;
}

export default function CreateInvoiceScreen() {
  const router = useRouter();
  const createInvoice = useCreateInvoice();
  const { data: customersData } = useCustomers();
  const { data: jobsData } = useJobs({ status: 'complete' });

  const [form, setForm] = useState({
    customer_id: undefined as number | undefined,
    invoice_date: new Date(),
    due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    tax_rate: 15,
  });

  const [items, setItems] = useState<LineItem[]>([
    { id: '1', description: '', quantity: 1, unit_price: 0 },
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showJobSelector, setShowJobSelector] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<number | undefined>(undefined);

  const customerOptions = (customersData?.data || []).map((c) => ({
    value: c.id,
    label: c.customer_name,
  }));

  // Filter jobs by selected customer if customer is selected
  const availableJobs = (jobsData?.data || []).filter((j) => {
    if (j.invoiced) return false;
    if (!form.customer_id) return true;
    return j.customer?.id === form.customer_id;
  });

  const jobOptions = availableJobs.map((j) => ({
    value: j.id,
    label: `${j.title} - ${j.customer?.customer_name || 'No customer'}`,
  }));

  const updateField = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const updateItem = (id: string, field: keyof LineItem, value: any) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { id: Date.now().toString(), description: '', quantity: 1, unit_price: 0 },
    ]);
  };

  const addJobAsItem = (jobId: number) => {
    const job = availableJobs.find((j) => j.id === jobId);
    if (!job) return;

    const newItem: LineItem = {
      id: Date.now().toString(),
      description: job.title || job.description || '',
      quantity: 1,
      unit_price: job.price || 0,
      job_id: job.id,
    };

    setItems((prev) => [...prev, newItem]);
    setShowJobSelector(false);
    setSelectedJobId(undefined);
  };

  const handleAddJobClick = () => {
    if (jobOptions.length === 0) {
      Alert.alert('No Jobs Available', 'No completed jobs available to add. Please complete a job first.');
      return;
    }
    setShowJobSelector(true);
  };

  const removeItem = (id: string) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * (form.tax_rate / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.customer_id) {
      newErrors.customer_id = 'Customer is required';
    }
    if (items.some((item) => !item.description.trim())) {
      newErrors.items = 'All items must have a description';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await createInvoice.mutateAsync({
        customer_id: form.customer_id,
        invoice_date: form.invoice_date.toISOString().split('T')[0],
        due_date: form.due_date.toISOString().split('T')[0],
        tax_rate: form.tax_rate,
        items: items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          job_id: item.job_id || null,
        })),
      } as any);
      router.back();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to create invoice';
      Alert.alert('Error', message);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
    }).format(amount);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'New Invoice',
          headerStyle: { backgroundColor: '#1e3a5f' },
          headerTintColor: '#ffffff',
        }}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Invoice Details</Text>
            <FormSelect
              label="Customer"
              value={form.customer_id}
              options={customerOptions}
              onChange={(value) => updateField('customer_id', value)}
              placeholder="Select a customer..."
              error={errors.customer_id}
              required
            />
            <View style={styles.row}>
              <View style={styles.halfField}>
                <FormDatePicker
                  label="Invoice Date"
                  value={form.invoice_date}
                  onChange={(date) => updateField('invoice_date', date)}
                  mode="date"
                />
              </View>
              <View style={styles.halfField}>
                <FormDatePicker
                  label="Due Date"
                  value={form.due_date}
                  onChange={(date) => updateField('due_date', date)}
                  mode="date"
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Line Items</Text>
              <View style={styles.addItemButtons}>
                {jobOptions.length > 0 && (
                  <TouchableOpacity onPress={handleAddJobClick}>
                    <Text style={styles.addJobButton}>+ Add Job</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={addItem}>
                  <Text style={styles.addItemButton}>+ Add Item</Text>
                </TouchableOpacity>
              </View>
            </View>

            {errors.items && <Text style={styles.errorText}>{errors.items}</Text>}

            {showJobSelector && (
              <View style={styles.jobSelector}>
                <FormSelect
                  label="Select Job to Add"
                  value={selectedJobId}
                  options={jobOptions}
                  onChange={(value) => setSelectedJobId(value)}
                  placeholder="Choose a job..."
                />
                <View style={styles.jobSelectorActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setShowJobSelector(false);
                      setSelectedJobId(undefined);
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.addButton, !selectedJobId && styles.addButtonDisabled]}
                    onPress={() => {
                      if (selectedJobId) {
                        addJobAsItem(selectedJobId);
                      }
                    }}
                    disabled={!selectedJobId}
                  >
                    <Text style={styles.addButtonText}>Add Job</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {items.map((item, index) => (
              <View key={item.id} style={styles.lineItem}>
                <View style={styles.lineItemHeader}>
                  <Text style={styles.lineItemNumber}>
                    Item {index + 1}
                    {item.job_id && (
                      <Text style={styles.jobBadge}> • From Job</Text>
                    )}
                  </Text>
                  {items.length > 1 && (
                    <TouchableOpacity onPress={() => removeItem(item.id)}>
                      <Text style={styles.removeItemButton}>Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {item.job_id && (
                  <View style={styles.jobInfo}>
                    <Text style={styles.jobInfoText}>
                      Linked to Job #{item.job_id}
                    </Text>
                  </View>
                )}
                <FormInput
                  label="Description"
                  value={item.description}
                  onChangeText={(value) => updateItem(item.id, 'description', value)}
                  placeholder="What was provided?"
                />
                <View style={styles.row}>
                  <View style={styles.thirdField}>
                    <FormInput
                      label="Qty"
                      value={item.quantity.toString()}
                      onChangeText={(value) =>
                        updateItem(item.id, 'quantity', parseInt(value) || 0)
                      }
                      keyboardType="number-pad"
                    />
                  </View>
                  <View style={styles.twoThirdsField}>
                    <FormCurrency
                      label="Unit Price"
                      value={item.unit_price}
                      onChange={(value) => updateItem(item.id, 'unit_price', value)}
                    />
                  </View>
                </View>
                <View style={styles.lineItemTotal}>
                  <Text style={styles.lineItemTotalLabel}>Line Total:</Text>
                  <Text style={styles.lineItemTotalValue}>
                    {formatCurrency(item.quantity * item.unit_price)}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Totals</Text>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>{formatCurrency(calculateSubtotal())}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>GST ({form.tax_rate}%)</Text>
              <Text style={styles.totalValue}>{formatCurrency(calculateTax())}</Text>
            </View>
            <View style={[styles.totalRow, styles.grandTotalRow]}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalValue}>{formatCurrency(calculateTotal())}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, createInvoice.isPending && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={createInvoice.isPending}
          >
            {createInvoice.isPending ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitButtonText}>Create Invoice</Text>
            )}
          </TouchableOpacity>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  section: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1e3a5f' },
  addItemButtons: { flexDirection: 'row', gap: 12 },
  addItemButton: { fontSize: 14, fontWeight: '600', color: '#1e3a5f' },
  addJobButton: { fontSize: 14, fontWeight: '600', color: '#059669' },
  jobBadge: { fontSize: 12, fontWeight: '400', color: '#059669' },
  jobInfo: { backgroundColor: '#d1fae5', borderRadius: 6, padding: 8, marginBottom: 8 },
  jobInfoText: { fontSize: 12, color: '#065f46', fontWeight: '500' },
  jobSelector: { backgroundColor: '#f0fdf4', borderRadius: 8, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#86efac' },
  jobSelectorActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 12 },
  cancelButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
  cancelButtonText: { color: '#6b7280', fontSize: 14, fontWeight: '500' },
  addButton: { backgroundColor: '#059669', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
  addButtonDisabled: { backgroundColor: '#9ca3af', opacity: 0.5 },
  addButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
  row: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1 },
  thirdField: { flex: 1 },
  twoThirdsField: { flex: 2 },
  errorText: { fontSize: 12, color: '#ef4444', marginBottom: 12 },
  lineItem: { backgroundColor: '#f9fafb', borderRadius: 8, padding: 12, marginBottom: 12 },
  lineItemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  lineItemNumber: { fontSize: 14, fontWeight: '600', color: '#6b7280' },
  removeItemButton: { fontSize: 14, color: '#ef4444' },
  lineItemTotal: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  lineItemTotalLabel: { fontSize: 14, color: '#6b7280', marginRight: 8 },
  lineItemTotalValue: { fontSize: 14, fontWeight: '600' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  totalLabel: { fontSize: 14, color: '#6b7280' },
  totalValue: { fontSize: 14, fontWeight: '500' },
  grandTotalRow: { borderTopWidth: 1, borderTopColor: '#e5e7eb', marginTop: 8, paddingTop: 12 },
  grandTotalLabel: { fontSize: 18, fontWeight: '600' },
  grandTotalValue: { fontSize: 18, fontWeight: '700', color: '#1e3a5f' },
  submitButton: { backgroundColor: '#1e3a5f', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  bottomPadding: { height: 24 },
});

