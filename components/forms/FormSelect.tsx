import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

interface Option {
  value: string | number;
  label: string;
}

interface FormSelectProps {
  label: string;
  value?: string | number;
  options: Option[];
  onChange: (value: string | number) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  searchable?: boolean;
}

export function FormSelect({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select...',
  error,
  required,
}: FormSelectProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (option: Option) => {
    onChange(option.value);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      <TouchableOpacity
        style={[styles.select, error && styles.selectError]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.selectText, !selectedOption && styles.placeholderText]}>
          {selectedOption?.label || placeholder}
        </Text>
        <Text style={styles.chevron}>▼</Text>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>Done</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={options}
              keyExtractor={(item) => String(item.value)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.option, item.value === value && styles.optionSelected]}
                  onPress={() => handleSelect(item)}
                >
                  <Text
                    style={[styles.optionText, item.value === value && styles.optionTextSelected]}
                  >
                    {item.label}
                  </Text>
                  {item.value === value && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </SafeAreaView>
        </View>
      </Modal>
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
  chevron: {
    fontSize: 12,
    color: '#9ca3af',
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
    maxHeight: '70%',
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
  closeButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e3a5f',
  },
  option: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionSelected: {
    backgroundColor: '#f0f9ff',
  },
  optionText: {
    fontSize: 16,
    color: '#1f2937',
  },
  optionTextSelected: {
    color: '#1e3a5f',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 16,
    color: '#1e3a5f',
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: '#f3f4f6',
  },
});

