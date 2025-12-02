import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';

interface FormTextAreaProps extends TextInputProps {
  label: string;
  error?: string;
  required?: boolean;
  rows?: number;
}

export function FormTextArea({ label, error, required, rows = 4, style, ...props }: FormTextAreaProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <TextInput
        style={[styles.input, { minHeight: rows * 24 }, error && styles.inputError, style]}
        placeholderTextColor="#9ca3af"
        multiline
        textAlignVertical="top"
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  required: {
    color: '#ef4444',
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
});

