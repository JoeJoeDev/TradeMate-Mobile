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
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { FormInput, FormTextArea, FormSelect, FormDatePicker, FormCurrency } from '@/components/forms';
import { useJob, useUpdateJob, useStartJob, useCompleteJob, useCustomers } from '../../hooks/useApi';

const statusOptions = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'complete', label: 'Complete' },
  { value: 'cancelled', label: 'Cancelled' },
];

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const statusColors: Record<string, string> = {
  scheduled: '#3b82f6',
  in_progress: '#f59e0b',
  complete: '#10b981',
  cancelled: '#6b7280',
};

export default function JobDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const jobId = parseInt(id || '0', 10);

  const { data, isLoading, refetch } = useJob(jobId);
  const { data: customersData } = useCustomers();
  const updateJob = useUpdateJob();
  const startJob = useStartJob();
  const completeJob = useCompleteJob();

  const [isEditing, setIsEditing] = useState(false);
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

  const job = data?.data;

  const customerOptions = (customersData?.data || []).map((c) => ({
    value: c.id,
    label: c.customer_name,
  }));

  useEffect(() => {
    if (job) {
      setForm({
        title: job.title || '',
        description: job.description || '',
        customer_id: job.customer?.id,
        status: job.status || 'scheduled',
        priority: job.priority || 'normal',
        scheduled_at: job.scheduled_at ? new Date(job.scheduled_at) : undefined,
        price: job.price || 0,
        job_address: job.job_address || '',
      });
    }
  }, [job]);

  const updateField = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) {
      newErrors.title = 'Job title is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      await updateJob.mutateAsync({
        id: jobId,
        title: form.title,
        description: form.description || undefined,
        customer_id: form.customer_id,
        status: form.status as any,
        priority: form.priority as any,
        scheduled_at: form.scheduled_at?.toISOString(),
        price: form.price,
        job_address: form.job_address || undefined,
      });
      setIsEditing(false);
      refetch();
      Alert.alert('Success', 'Job updated successfully');
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to update job';
      Alert.alert('Error', message);
    }
  };

  const handleStartJob = () => {
    Alert.alert('Start Job', 'Start working on this job?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Start',
        onPress: async () => {
          try {
            await startJob.mutateAsync(jobId);
            refetch();
          } catch (error: any) {
            Alert.alert('Error', error?.response?.data?.message || 'Failed to start job');
          }
        },
      },
    ]);
  };

  const handleCompleteJob = () => {
    Alert.alert('Complete Job', 'Mark this job as complete?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Complete',
        onPress: async () => {
          try {
            await completeJob.mutateAsync(jobId);
            refetch();
          } catch (error: any) {
            Alert.alert('Error', error?.response?.data?.message || 'Failed to complete job');
          }
        },
      },
    ]);
  };

  const formatDate = (date?: string) => {
    if (!date) return '—';
    return new Date(date).toLocaleString('en-NZ', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
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
            title: 'Job',
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
          title: isEditing ? 'Edit Job' : job?.title || 'Job',
          headerStyle: { backgroundColor: '#1e3a5f' },
          headerTintColor: '#ffffff',
          headerRight: () => (
            <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
              <Text style={styles.headerButton}>{isEditing ? 'Cancel' : 'Edit'}</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {!isEditing && job && (
            <>
              <View style={styles.statusHeader}>
                <View style={[styles.statusBadge, { backgroundColor: statusColors[job.status] }]}>
                  <Text style={styles.statusText}>{job.status?.replace('_', ' ')}</Text>
                </View>
                {job.job_number && <Text style={styles.jobNumber}>#{job.job_number}</Text>}
              </View>

              {(job.status === 'scheduled' || job.status === 'in_progress') && (
                <View style={styles.quickActions}>
                  {job.status === 'scheduled' && (
                    <TouchableOpacity
                      style={[styles.quickAction, styles.startAction]}
                      onPress={handleStartJob}
                    >
                      <Text style={styles.quickActionText}>▶ Start Job</Text>
                    </TouchableOpacity>
                  )}
                  {job.status === 'in_progress' && (
                    <TouchableOpacity
                      style={[styles.quickAction, styles.completeAction]}
                      onPress={handleCompleteJob}
                    >
                      <Text style={styles.quickActionText}>✓ Complete Job</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Job Details</Text>
            {isEditing ? (
              <>
                <FormInput
                  label="Job Title"
                  value={form.title}
                  onChangeText={(value) => updateField('title', value)}
                  error={errors.title}
                  required
                />
                <FormTextArea
                  label="Description"
                  value={form.description}
                  onChangeText={(value) => updateField('description', value)}
                  rows={4}
                />
              </>
            ) : (
              <>
                <DetailRow label="Title" value={job?.title} />
                <DetailRow label="Description" value={job?.description} />
              </>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer & Location</Text>
            {isEditing ? (
              <>
                <FormSelect
                  label="Customer"
                  value={form.customer_id}
                  options={customerOptions}
                  onChange={(value) => updateField('customer_id', value as number)}
                />
                <FormInput
                  label="Job Address"
                  value={form.job_address}
                  onChangeText={(value) => updateField('job_address', value)}
                />
              </>
            ) : (
              <>
                <DetailRow label="Customer" value={job?.customer?.customer_name} />
                <DetailRow label="Address" value={job?.formatted_address || job?.job_address} />
              </>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Scheduling</Text>
            {isEditing ? (
              <>
                <FormDatePicker
                  label="Scheduled Date & Time"
                  value={form.scheduled_at}
                  onChange={(date) => updateField('scheduled_at', date)}
                  mode="datetime"
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
              </>
            ) : (
              <>
                <DetailRow label="Scheduled" value={formatDate(job?.scheduled_at)} />
                <DetailRow label="Started" value={formatDate(job?.started_at)} />
                <DetailRow label="Completed" value={formatDate(job?.completed_at)} />
                <DetailRow label="Priority" value={job?.priority} />
              </>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pricing</Text>
            {isEditing ? (
              <FormCurrency
                label="Price"
                value={form.price}
                onChange={(value) => updateField('price', value)}
              />
            ) : (
              <DetailRow label="Price" value={formatCurrency(job?.price || 0)} />
            )}
          </View>

          {isEditing && (
            <TouchableOpacity
              style={[styles.submitButton, updateJob.isPending && styles.submitButtonDisabled]}
              onPress={handleSave}
              disabled={updateJob.isPending}
            >
              {updateJob.isPending ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.submitButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          )}

          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

function DetailRow({ label, value }: { label: string; value?: string | number }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || '—'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  headerButton: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  jobNumber: {
    fontSize: 14,
    color: '#6b7280',
  },
  quickActions: {
    marginBottom: 16,
  },
  quickAction: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  startAction: {
    backgroundColor: '#3b82f6',
  },
  completeAction: {
    backgroundColor: '#10b981',
  },
  quickActionText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
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
  detailRow: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: '#1f2937',
    textTransform: 'capitalize',
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

