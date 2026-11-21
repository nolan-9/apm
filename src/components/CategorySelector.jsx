import { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import theme from '../styles/theme';

export default function CategorySelector({
  categories = [],
  value,
  onChange,
  disabled = false,
}) {
  const [visible, setVisible] = useState(false);

  function selectCategory(category) {
    onChange(category.name);
    setVisible(false);
  }

  return (
    <View>
      <Pressable
        style={[
          styles.selector,
          disabled && styles.disabled,
        ]}
        onPress={() => setVisible(true)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel="Seleccionar categoría"
      >
        <Text style={styles.selectedText}>
          {value || 'Selecciona una categoría'}
        </Text>

        <Text style={styles.arrow}>⌄</Text>
      </Pressable>

      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={() => setVisible(false)}
      >
        <SafeAreaView style={styles.overlay}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.title}>
                Seleccionar categoría
              </Text>

              <Pressable onPress={() => setVisible(false)}>
                <Text style={styles.close}>Cerrar</Text>
              </Pressable>
            </View>

            <FlatList
              data={categories}
              keyExtractor={(item) => item._id}
              ListEmptyComponent={
                <Text style={styles.empty}>
                  No hay categorías disponibles.
                </Text>
              }
              renderItem={({ item }) => (
                <Pressable
                  style={[
                    styles.option,
                    value === item.name && styles.selectedOption,
                  ]}
                  onPress={() => selectCategory(item)}
                >
                  <Text style={styles.optionText}>
                    {item.name}
                  </Text>

                  {value === item.name && (
                    <Text style={styles.check}>✓</Text>
                  )}
                </Pressable>
              )}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  selector: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    minHeight: 52,
    paddingHorizontal: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  disabled: {
    opacity: 0.5,
  },
  selectedText: {
    color: theme.colors.text,
    fontSize: 16,
  },
  arrow: {
    color: theme.colors.muted,
    fontSize: 24,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    maxHeight: '70%',
    padding: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    color: theme.colors.text,
    fontSize: 19,
    fontWeight: '700',
  },
  close: {
    color: theme.colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  option: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  selectedOption: {
    backgroundColor: '#F3F4F6',
  },
  optionText: {
    color: theme.colors.text,
    fontSize: 16,
  },
  check: {
    color: theme.colors.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  empty: {
    color: theme.colors.muted,
    textAlign: 'center',
    padding: 20,
  },
});
