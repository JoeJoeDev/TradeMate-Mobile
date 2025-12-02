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
import { FormInput, FormTextArea } from '@/components/forms';
import { useCreateCustomer } from '../../hooks/useApi';

export default function CreateCustomerScreen() {
  const router = useRouter();
  const createCustomer = useCreateCustomer();

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

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await createCustomer.mutateAsync({
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
      router.back();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to create customer';
      Alert.alert('Error', message);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'New Customer',
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
            <Text style={styles.sectionTitle}>Basic Information</Text>
            <FormInput
              label="Customer Name"
              value={form.customer_name}
              onChangeText={(value) => updateField('customer_name', value)}
              placeholder="Company or individual name"
              error={errors.customer_name}
              required
            />
            <FormInput
              label="Contact Name"
              value={form.contact_name}
              onChangeText={(value) => updateField('contact_name', value)}
              placeholder="Primary contact person"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Details</Text>
            <FormInput
              label="Email"
              value={form.email_address}
              onChangeText={(value) => updateField('email_address', value)}
              placeholder="email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <FormInput
              label="Phone"
              value={form.phone_number}
              onChangeText={(value) => updateField('phone_number', value)}
              placeholder="Landline number"
              keyboardType="phone-pad"
            />
            <FormInput
              label="Mobile"
              value={form.mobile_number}
              onChangeText={(value) => updateField('mobile_number', value)}
              placeholder="Mobile number"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Address</Text>
            <FormInput
              label="Street"
              value={form.street}
              onChangeText={(value) => updateField('street', value)}
              placeholder="Street address"
            />
            <FormInput
              label="City"
              value={form.city}
              onChangeText={(value) => updateField('city', value)}
              placeholder="City"
            />
            <View style={styles.row}>
              <View style={styles.halfField}>
                <FormInput
                  label="Region"
                  value={form.region}
                  onChangeText={(value) => updateField('region', value)}
                  placeholder="Region"
                />
              </View>
              <View style={styles.halfField}>
                <FormInput
                  label="Post Code"
                  value={form.postal_code}
                  onChangeText={(value) => updateField('postal_code', value)}
                  placeholder="Post code"
                  keyboardType="number-pad"
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <FormTextArea
              label="Notes"
              value={form.notes}
              onChangeText={(value) => updateField('notes', value)}
              placeholder="Any additional notes about this customer..."
              rows={4}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, createCustomer.isPending && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={createCustomer.isPending}
          >
            {createCustomer.isPending ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitButtonText}>Create Customer</Text>
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

