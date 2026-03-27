import React from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Trash } from 'phosphor-react-native';
import { Colors } from '../constants/colors';

export default function KeyValueEditor({ data, onChange, readOnly = false }) {
  const updateItem = (index, field, value) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const toggleItem = (index) => {
    const updated = [...data];
    updated[index] = { ...updated[index], enabled: !updated[index].enabled };
    onChange(updated);
  };

  const removeItem = (index) => {
    const updated = data.filter((_, i) => i !== index);
    onChange(updated);
  };

  const addItem = () => {
    onChange([...data, { key: '', value: '', enabled: true, id: Date.now().toString() }]);
  };

  const renderItem = ({ item, index }) => (
    <View testID={`kv-row-${index}`} style={styles.row}>
      {!readOnly && (
        <TouchableOpacity testID={`kv-toggle-${index}`} onPress={() => toggleItem(index)} style={styles.checkbox}>
          <View style={[styles.check, item.enabled && styles.checkActive]} />
        </TouchableOpacity>
      )}
      <TextInput
        testID={`kv-key-${index}`}
        style={[styles.input, styles.keyInput]}
        value={item.key}
        onChangeText={(v) => updateItem(index, 'key', v)}
        placeholder="Key"
        placeholderTextColor={Colors.TEXT_MUTED}
        autoCapitalize="none"
        autoCorrect={false}
        editable={!readOnly}
      />
      <TextInput
        testID={`kv-value-${index}`}
        style={[styles.input, styles.valueInput]}
        value={item.value}
        onChangeText={(v) => updateItem(index, 'value', v)}
        placeholder="Value"
        placeholderTextColor={Colors.TEXT_MUTED}
        autoCapitalize="none"
        autoCorrect={false}
        editable={!readOnly}
      />
      {!readOnly && (
        <TouchableOpacity testID={`kv-delete-${index}`} onPress={() => removeItem(index)} style={styles.deleteBtn}>
          <Trash size={16} color={Colors.TEXT_MUTED} />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View testID="key-value-editor">
      <FlatList
        data={data}
        keyExtractor={(item, i) => item.id || i.toString()}
        renderItem={renderItem}
        scrollEnabled={false}
      />
      {!readOnly && (
        <TouchableOpacity testID="kv-add-btn" onPress={addItem} style={styles.addBtn}>
          <Text style={styles.addText}>+ Add</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  checkbox: { marginRight: 8 },
  check: { width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: Colors.BORDER },
  checkActive: { backgroundColor: Colors.ACCENT, borderColor: Colors.ACCENT },
  input: {
    flex: 1, backgroundColor: Colors.BACKGROUND_ELEVATED, borderWidth: 1, borderColor: Colors.BORDER,
    borderRadius: 6, paddingHorizontal: 10, paddingVertical: 8, fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 12, color: Colors.TEXT_PRIMARY,
  },
  keyInput: { marginRight: 6 },
  valueInput: { marginRight: 6 },
  deleteBtn: { padding: 8 },
  addBtn: { paddingVertical: 8 },
  addText: { fontFamily: 'IBMPlexMono_500Medium', fontSize: 13, color: Colors.ACCENT },
});
