import { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { FormInput, FormTextArea } from '@/components/forms';
import { useCustomer, useUpdateCustomer } from '../../hooks/useApi';

export default function CustomerDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const customerId = parseInt(id || '0', 10);

  const { data, isLoading } = useCustomer(customerId);
  const updateCustomer = useUpdateCustomer();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    customer_name: '',
    contact_name: '',
    email_address: '',
    phone_number: '',
    mobile_number: '',
    street: '',
    city: '',
    region: '',
    postal_code: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const customer = data?.data;

  useEffect(() => {
    if (customer) {
      setForm({
        customer_name: customer.customer_name || '',
        contact_name: customer.contact_name || '',
        email_address: customer.email_address || '',
        phone_number: customer.phone_number || '',
        mobile_number: customer.mobile_number || '',
        street: customer.physical_address?.street || '',
        city: customer.physical_address?.city || '',
        region: customer.physical_address?.region || '',
        postal_code: customer.physical_address?.postal_code || '',
        notes: (customer as any).notes || '',
      });
    }
  }, [customer]);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.customer_name.trim()) {
      newErrors.customer_name = 'Customer name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      await updateCustomer.mutateAsync({
        id: customerId,
        customer_name: form.customer_name,
        contact_name: form.contact_name || undefined,
        email_address: form.email_address || undefined,
        phone_number: form.phone_number || undefined,
        mobile_number: form.mobile_number || undefined,
        physical_address: {
          street: form.street || undefined,
          city: form.city || undefined,
          region: form.region || undefined,
          postal_code: form.postal_code || undefined,
        },
        notes: form.notes || undefined,
      });
      setIsEditing(false);
      Alert.alert('Success', 'Customer updated successfully');
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to update customer';
      Alert.alert('Error', message);
    }
  };

  const handleCall = () => {
    const phone = customer?.phone_number || customer?.mobile_number;
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  const handleEmail = () => {
    if (customer?.email_address) Linking.openURL(`mailto:${customer.email_address}`);
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Customer',
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
          title: isEditing ? 'Edit Customer' : customer?.customer_name || 'Customer',
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
          {!isEditing && (
            <View style={styles.quickActions}>
              {(customer?.phone_number || customer?.mobile_number) && (
                <TouchableOpacity style={styles.quickAction} onPress={handleCall}>
                  <Text style={styles.quickActionIcon}>📞</Text>
                  <Text style={styles.quickActionText}>Call</Text>
                </TouchableOpacity>
              )}
              {customer?.email_address && (
                <TouchableOpacity style={styles.quickAction} onPress={handleEmail}>
                  <Text style={styles.quickActionIcon}>✉️</Text>
                  <Text style={styles.quickActionText}>Email</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            {isEditing ? (
              <>
                <FormInput
                  label="Customer Name"
                  value={form.customer_name}
                  onChangeText={(value) => updateField('customer_name', value)}
                  error={errors.customer_name}
                  required
                />
                <FormInput
                  label="Contact Name"
                  value={form.contact_name}
                  onChangeText={(value) => updateField('contact_name', value)}
                />
              </>
            ) : (
              <>
                <DetailRow label="Customer Name" value={customer?.customer_name} />
                <DetailRow label="Contact Name" value={customer?.contact_name} />
              </>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Details</Text>
            {isEditing ? (
              <>
                <FormInput
                  label="Email"
                  value={form.email_address}
                  onChangeText={(value) => updateField('email_address', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <FormInput
                  label="Phone"
                  value={form.phone_number}
                  onChangeText={(value) => updateField('phone_number', value)}
                  keyboardType="phone-pad"
                />
                <FormInput
                  label="Mobile"
                  value={form.mobile_number}
                  onChangeText={(value) => updateField('mobile_number', value)}
                  keyboardType="phone-pad"
                />
              </>
            ) : (
              <>
                <DetailRow label="Email" value={customer?.email_address} />
                <DetailRow label="Phone" value={customer?.phone_number} />
                <DetailRow label="Mobile" value={customer?.mobile_number} />
              </>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Address</Text>
            {isEditing ? (
              <>
                <FormInput
                  label="Street"
                  value={form.street}
                  onChangeText={(value) => updateField('street', value)}
                />
                <FormInput
                  label="City"
                  value={form.city}
                  onChangeText={(value) => updateField('city', value)}
                />
                <View style={styles.row}>
                  <View style={styles.halfField}>
                    <FormInput
                      label="Region"
                      value={form.region}
                      onChangeText={(value) => updateField('region', value)}
                    />
                  </View>
                  <View style={styles.halfField}>
                    <FormInput
                      label="Post Code"
                      value={form.postal_code}
                      onChangeText={(value) => updateField('postal_code', value)}
                      keyboardType="number-pad"
                    />
                  </View>
                </View>
              </>
            ) : (
              <DetailRow label="Address" value={customer?.physical_address?.formatted} />
            )}
          </View>

          {isEditing && (
            <TouchableOpacity
              style={[styles.submitButton, updateCustomer.isPending && styles.submitButtonDisabled]}
              onPress={handleSave}
              disabled={updateCustomer.isPending}
            >
              {updateCustomer.isPending ? (
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

function DetailRow({ label, value }: { label: string; value?: string }) {
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
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  quickAction: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e3a5f',
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

