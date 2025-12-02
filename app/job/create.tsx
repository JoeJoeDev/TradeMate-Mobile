import { useState, useEffect } from 'react';
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
import { FormInput, FormTextArea, FormSelect, FormDatePicker, FormCurrency } from '@/components/forms';
import { useCreateJob, useCustomers } from '../../hooks/useApi';

const statusOptions = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'complete', label: 'Complete' },
];

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export default function CreateJobScreen() {
  const router = useRouter();
  const createJob = useCreateJob();
  const { data: customersData } = useCustomers();

  const customers = customersData?.data || [];

  const [form, setForm] = useState({
    title: '',
    description: '',
    customer_id: undefined as number | undefined,
    status: 'scheduled',
    priority: 'normal',
    scheduled_at: undefined as Date | undefined,
    price: 0,
    job_address: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const customerOptions = customers.map((c) => ({
    value: c.id,
    label: c.customer_name,
  }));

  const updateField = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Auto-populate address when customer is selected
  const handleCustomerChange = (customerId: number) => {
    updateField('customer_id', customerId);
    
    const selectedCustomer = customers.find((c) => c.id === customerId);
    const address = selectedCustomer?.physical_address?.formatted || '';
    updateField('job_address', address);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) {
      newErrors.title = 'Job title is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await createJob.mutateAsync({
        title: form.title,
        description: form.description || undefined,
        customer_id: form.customer_id,
        status: form.status as any,
        priority: form.priority as any,
        scheduled_at: form.scheduled_at?.toISOString(),
        price: form.price,
        job_address: form.job_address || undefined,
      });
      router.back();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to create job';
      Alert.alert('Error', message);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'New Job',
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
            <Text style={styles.sectionTitle}>Job Details</Text>
            <FormInput
              label="Job Title"
              value={form.title}
              onChangeText={(value) => updateField('title', value)}
              placeholder="What needs to be done?"
              error={errors.title}
              required
            />
            <FormTextArea
              label="Description"
              value={form.description}
              onChangeText={(value) => updateField('description', value)}
              placeholder="Detailed description of the work..."
              rows={4}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer & Location</Text>
            <FormSelect
              label="Customer"
              value={form.customer_id}
              options={customerOptions}
              onChange={(value) => handleCustomerChange(value as number)}
              placeholder="Select a customer..."
            />
            <FormInput
              label="Job Address"
              value={form.job_address}
              onChangeText={(value) => updateField('job_address', value)}
              placeholder="Address where work will be done"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Scheduling</Text>
            <FormDatePicker
              label="Scheduled Date & Time"
              value={form.scheduled_at}
              onChange={(date) => updateField('scheduled_at', date)}
              mode="datetime"
              placeholder="When is this job scheduled?"
            />
            <View style={styles.row}>
              <View style={styles.halfField}>
                <FormSelect
                  label="Status"
                  value={form.status}
                  options={statusOptions}
                  onChange={(value) => updateField('status', value)}
                />
              </View>
              <View style={styles.halfField}>
                <FormSelect
                  label="Priority"
                  value={form.priority}
                  options={priorityOptions}
                  onChange={(value) => updateField('priority', value)}
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pricing</Text>
            <FormCurrency
              label="Price"
              value={form.price}
              onChange={(value) => updateField('price', value)}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, createJob.isPending && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={createJob.isPending}
          >
            {createJob.isPending ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitButtonText}>Create Job</Text>
            )}
          </TouchableOpacity>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1e3a5f',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#1e3a5f',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 24,
  },
});

