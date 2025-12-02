import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

interface FormDatePickerProps {
  label: string;
  value?: Date;
  onChange: (date: Date) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  mode?: 'date' | 'time' | 'datetime';
  minimumDate?: Date;
  maximumDate?: Date;
}

export function FormDatePicker({
  label,
  value,
  onChange,
  placeholder = 'Select date...',
  error,
  required,
  mode = 'date',
  minimumDate,
  maximumDate,
}: FormDatePickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(value || new Date());

  const formatDate = (date: Date) => {
    if (mode === 'time') {
      return date.toLocaleTimeString('en-NZ', { hour: '2-digit', minute: '2-digit' });
    }
    if (mode === 'datetime') {
      return date.toLocaleString('en-NZ', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    }
    return date.toLocaleDateString('en-NZ', { dateStyle: 'medium' });
  };

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      if (event.type === 'set' && selectedDate) {
        onChange(selectedDate);
      }
    } else {
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const handleConfirm = () => {
    onChange(tempDate);
    setShowPicker(false);
  };

  const handleCancel = () => {
    setTempDate(value || new Date());
    setShowPicker(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      <TouchableOpacity
        style={[styles.select, error && styles.selectError]}
        onPress={() => setShowPicker(true)}
      >
        <Text style={[styles.selectText, !value && styles.placeholderText]}>
          {value ? formatDate(value) : placeholder}
        </Text>
        <Text style={styles.icon}>📅</Text>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {Platform.OS === 'ios' ? (
        <Modal visible={showPicker} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={handleCancel}>
                  <Text style={styles.cancelButton}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>{label}</Text>
                <TouchableOpacity onPress={handleConfirm}>
                  <Text style={styles.doneButton}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode={mode === 'datetime' ? 'datetime' : mode}
                display="spinner"
                onChange={handleChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                style={styles.picker}
              />
            </View>
          </View>
        </Modal>
      ) : (
        showPicker && (
          <DateTimePicker
            value={value || new Date()}
            mode={mode === 'datetime' ? 'datetime' : mode}
            display="default"
            onChange={handleChange}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
          />
        )
      )}
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
  select: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectError: {
    borderColor: '#ef4444',
  },
  selectText: {
    fontSize: 16,
    color: '#1f2937',
    flex: 1,
  },
  placeholderText: {
    color: '#9ca3af',
  },
  icon: {
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  cancelButton: {
    fontSize: 16,
    color: '#6b7280',
  },
  doneButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e3a5f',
  },
  picker: {
    height: 200,
  },
});

