// @ts-nocheck
import React, { useContext, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Switch, Modal, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, PencilSimple, Globe } from 'phosphor-react-native';
import { AppContext, useTheme } from '../../src/context/AppContext';
import { Colors } from '../../src/constants/colors';
import PrimaryButton from '../../src/components/PrimaryButton';

export default function EnvironmentsScreen() {
  const router = useRouter();
  const { state, dispatch } = useContext(AppContext);
  const { accent } = useTheme();
  const [expandedId, setExpandedId] = useState(null);
  const [showNewSheet, setShowNewSheet] = useState(false);
  const [newName, setNewName] = useState('');

  const handleToggle = (envId) => {
    dispatch({ type: 'SET_ACTIVE_ENV', payload: state.activeEnvId === envId ? null : envId });
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    const newEnv = { id: Date.now().toString(), name: newName.trim(), variables: [] };
    dispatch({ type: 'ADD_ENVIRONMENT', payload: newEnv });
    setNewName(''); setShowNewSheet(false);
  };

  const renderEnv = ({ item }) => {
    const isActive = state.activeEnvId === item.id;
    return (
      <View style={[styles.card, isActive && styles.activeCard]}>
        <TouchableOpacity testID={`env-${item.id}`} style={styles.cardHeader} onPress={() => setExpandedId(expandedId === item.id ? null : item.id)}>
          <View style={styles.cardLeft}>
            <Text style={styles.envName}>{item.name}</Text>
            <Text style={styles.envSub}>{item.variables.length} variables</Text>
          </View>
          <Switch testID={`env-toggle-${item.id}`} value={isActive} onValueChange={() => handleToggle(item.id)} trackColor={{ false: Colors.BORDER, true: accent }} thumbColor={Colors.TEXT_PRIMARY} />
        </TouchableOpacity>
        {expandedId === item.id && (
          <View style={styles.expanded}>
            {item.variables.map((v, i) => (
              <View key={i} style={styles.varRow}>
                <Text style={styles.varKey}>{'{' + v.key + '}'}</Text>
                <Text style={styles.varArrow}> → </Text>
                <Text style={styles.varValue} numberOfLines={1}>{v.value}</Text>
              </View>
            ))}
            <TouchableOpacity testID={`edit-env-${item.id}`} style={styles.editBtn} onPress={() => router.push({ pathname: '/environment-edit', params: { envId: item.id } })}>
              <PencilSimple size={14} color={accent} />
              <Text style={[styles.editText, { color: accent }]}>Edit Variables</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView testID="environments-screen" style={styles.safe}>
      <Text style={styles.title}>Environments</Text>
      <FlatList
        data={state.environments}
        keyExtractor={item => item.id}
        renderItem={renderEnv}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Globe size={48} color={Colors.TEXT_MUTED} />
            <Text style={styles.emptyText}>No environments</Text>
          </View>
        }
      />
      <TouchableOpacity testID="add-env-fab" style={[styles.fab, { backgroundColor: accent }]} onPress={() => setShowNewSheet(true)}>
        <Plus size={22} color={Colors.TEXT_PRIMARY} />
      </TouchableOpacity>

      <Modal visible={showNewSheet} transparent animationType="slide">
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowNewSheet(false)}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>New Environment</Text>
            <TextInput testID="new-env-name" style={styles.input} value={newName} onChangeText={setNewName} placeholder="Environment name" placeholderTextColor={Colors.TEXT_MUTED} />
            <PrimaryButton title="Create" onPress={handleCreate} disabled={!newName.trim()} />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.BACKGROUND_BASE },
  title: { fontFamily: 'IBMPlexMono_700Bold', fontSize: 22, color: Colors.TEXT_PRIMARY, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  list: { paddingHorizontal: 16, paddingBottom: 80 },
  card: { backgroundColor: Colors.SURFACE, borderWidth: 1, borderColor: Colors.BORDER, borderRadius: 10, marginBottom: 8, overflow: 'hidden' },
  activeCard: { borderLeftWidth: 3, borderLeftColor: Colors.ACCENT, backgroundColor: '#292520' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12 },
  cardLeft: { flex: 1 },
  envName: { fontFamily: 'IBMPlexMono_500Medium', fontSize: 14, color: Colors.TEXT_PRIMARY },
  envSub: { fontFamily: 'IBMPlexMono_400Regular', fontSize: 12, color: Colors.TEXT_MUTED, marginTop: 2 },
  expanded: { borderTopWidth: 1, borderTopColor: Colors.BORDER, padding: 12 },
  varRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  varKey: { fontFamily: 'IBMPlexMono_400Regular', fontSize: 12, color: Colors.TEXT_MUTED },
  varArrow: { fontFamily: 'IBMPlexMono_400Regular', fontSize: 12, color: Colors.TEXT_MUTED },
  varValue: { fontFamily: 'IBMPlexMono_400Regular', fontSize: 12, color: Colors.TEXT_PRIMARY, flex: 1 },
  editBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 },
  editText: { fontFamily: 'IBMPlexMono_500Medium', fontSize: 13, color: Colors.ACCENT },
  fab: { position: 'absolute', bottom: 80, right: 24, width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.ACCENT, alignItems: 'center', justifyContent: 'center', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  emptyWrap: { paddingVertical: 60, alignItems: 'center' },
  emptyText: { fontFamily: 'IBMPlexMono_400Regular', fontSize: 14, color: Colors.TEXT_MUTED, marginTop: 12 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: Colors.BACKGROUND_ELEVATED, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.BORDER, alignSelf: 'center', marginBottom: 16 },
  sheetTitle: { fontFamily: 'IBMPlexMono_500Medium', fontSize: 18, color: Colors.TEXT_PRIMARY, marginBottom: 16 },
  input: { backgroundColor: Colors.SURFACE, borderWidth: 1, borderColor: Colors.BORDER, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10, fontFamily: 'IBMPlexMono_400Regular', fontSize: 14, color: Colors.TEXT_PRIMARY, marginBottom: 16 },
});
