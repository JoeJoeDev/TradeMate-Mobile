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
import { useCreateQuote, useCustomers } from '../../hooks/useApi';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
}

export default function CreateQuoteScreen() {
  const router = useRouter();
  const createQuote = useCreateQuote();
  const { data: customersData } = useCustomers();

  const [form, setForm] = useState({
    customer_id: undefined as number | undefined,
    quote_date: new Date(),
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days validity
  });

  const [items, setItems] = useState<LineItem[]>([
    { id: '1', description: '', quantity: 1, unit_price: 0 },
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const customerOptions = (customersData?.data || []).map((c) => ({
    value: c.id,
    label: c.customer_name,
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

  const removeItem = (id: string) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
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
      await createQuote.mutateAsync({
        customer_id: form.customer_id,
        quote_date: form.quote_date.toISOString().split('T')[0],
        due_date: form.due_date.toISOString().split('T')[0],
        items: items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
      } as any);
      router.back();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to create quote';
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
          title: 'New Quote',
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
            <Text style={styles.sectionTitle}>Quote Details</Text>
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
                  label="Quote Date"
                  value={form.quote_date}
                  onChange={(date) => updateField('quote_date', date)}
                  mode="date"
                />
              </View>
              <View style={styles.halfField}>
                <FormDatePicker
                  label="Valid Until"
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
              <TouchableOpacity onPress={addItem}>
                <Text style={styles.addItemButton}>+ Add Item</Text>
              </TouchableOpacity>
            </View>

            {errors.items && <Text style={styles.errorText}>{errors.items}</Text>}

            {items.map((item, index) => (
              <View key={item.id} style={styles.lineItem}>
                <View style={styles.lineItemHeader}>
                  <Text style={styles.lineItemNumber}>Item {index + 1}</Text>
                  {items.length > 1 && (
                    <TouchableOpacity onPress={() => removeItem(item.id)}>
                      <Text style={styles.removeItemButton}>Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <FormInput
                  label="Description"
                  value={item.description}
                  onChangeText={(value) => updateItem(item.id, 'description', value)}
                  placeholder="What will be provided?"
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
            <Text style={styles.sectionTitle}>Total</Text>
            <View style={[styles.totalRow, styles.grandTotalRow]}>
              <Text style={styles.grandTotalLabel}>Quote Total</Text>
              <Text style={styles.grandTotalValue}>{formatCurrency(calculateSubtotal())}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, createQuote.isPending && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={createQuote.isPending}
          >
            {createQuote.isPending ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitButtonText}>Create Quote</Text>
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
  addItemButton: { fontSize: 14, fontWeight: '600', color: '#1e3a5f' },
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
  grandTotalRow: { paddingTop: 0 },
  grandTotalLabel: { fontSize: 18, fontWeight: '600' },
  grandTotalValue: { fontSize: 18, fontWeight: '700', color: '#1e3a5f' },
  submitButton: { backgroundColor: '#1e3a5f', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  bottomPadding: { height: 24 },
});

