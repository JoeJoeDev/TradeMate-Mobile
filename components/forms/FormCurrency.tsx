import { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

interface FormCurrencyProps {
  label: string;
  value?: number;
  onChange: (value: number) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  currency?: string;
}

export function FormCurrency({
  label,
  value,
  onChange,
  placeholder = '0.00',
  error,
  required,
  currency = '$',
}: FormCurrencyProps) {
  const [displayValue, setDisplayValue] = useState(
    value !== undefined ? value.toFixed(2) : ''
  );

  const handleChange = (text: string) => {
    // Remove non-numeric characters except decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleaned.split('.');
    let formatted = parts[0];
    if (parts.length > 1) {
      formatted += '.' + parts[1].slice(0, 2);
    }
    
    setDisplayValue(formatted);
    
    const numValue = parseFloat(formatted);
    if (!isNaN(numValue)) {
      onChange(numValue);
    } else if (formatted === '' || formatted === '.') {
      onChange(0);
    }
  };

  const handleBlur = () => {
    if (displayValue) {
      const numValue = parseFloat(displayValue);
      if (!isNaN(numValue)) {
        setDisplayValue(numValue.toFixed(2));
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <View style={[styles.inputContainer, error && styles.inputError]}>
        <Text style={styles.currency}>{currency}</Text>
        <TextInput
          style={styles.input}
          value={displayValue}
          onChangeText={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          keyboardType="decimal-pad"
        />
      </View>
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
  inputContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  currency: {
    fontSize: 16,
    color: '#6b7280',
    marginRight: 4,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
});

