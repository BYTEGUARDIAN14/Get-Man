// @ts-nocheck
import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Modal, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MagnifyingGlass, CaretRight, Play, Plus } from 'phosphor-react-native';
import { AppContext } from '../../src/context/AppContext';
import { Colors } from '../../src/constants/colors';
import { useRequest } from '../../src/hooks/useRequest';
import MethodBadge from '../../src/components/MethodBadge';
import PrimaryButton from '../../src/components/PrimaryButton';

const SWATCH_COLORS = ['#3D6B4F', '#3D5470', '#7A5C30', '#5C3D70', '#7A3D3D', '#5A5A6E'];

export default function CollectionsScreen() {
  const router = useRouter();
  const { state, dispatch } = useContext(AppContext);
  const { sendRequest } = useRequest();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [showNewSheet, setShowNewSheet] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(SWATCH_COLORS[0]);

  const filtered = state.collections.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleCreate = () => {
    if (!newName.trim()) return;
    dispatch({ type: 'ADD_COLLECTION', payload: { id: Date.now().toString(), name: newName.trim(), color: newColor, requests: [] } });
    setNewName(''); setShowNewSheet(false);
  };

  const handlePlayRequest = async (req) => {
    const result = await sendRequest({ method: req.method, url: req.url });
    dispatch({ type: 'SET_CURRENT_RESPONSE', payload: result.response });
    dispatch({ type: 'SET_CURRENT_REQUEST', payload: { method: req.method, url: req.url } });
    router.push('/response');
  };

  const renderCollection = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity testID={`collection-${item.id}`} style={styles.cardHeader} onPress={() => setExpandedId(expandedId === item.id ? null : item.id)}>
        <View style={[styles.swatch, { backgroundColor: item.color }]} />
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{item.name}</Text>
          <Text style={styles.cardSub}>{item.requests?.length || 0} requests</Text>
        </View>
        <CaretRight size={16} color={Colors.TEXT_MUTED} style={{ transform: [{ rotate: expandedId === item.id ? '90deg' : '0deg' }] }} />
      </TouchableOpacity>
      {expandedId === item.id && (
        <View style={styles.expanded}>
          {item.requests?.map(req => (
            <View key={req.id} style={styles.reqRow}>
              <MethodBadge method={req.method} />
              <Text style={styles.reqName} numberOfLines={1}>{req.name || req.url}</Text>
              <TouchableOpacity testID={`play-${req.id}`} onPress={() => handlePlayRequest(req)}><Play size={18} color={Colors.ACCENT} /></TouchableOpacity>
            </View>
          ))}
          {(!item.requests || item.requests.length === 0) && <Text style={styles.emptyText}>No requests in this collection</Text>}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView testID="collections-screen" style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Collections</Text>
        <TouchableOpacity testID="new-collection-btn" onPress={() => setShowNewSheet(true)}>
          <Text style={styles.newBtn}>+ New</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.searchRow}>
        <MagnifyingGlass size={16} color={Colors.TEXT_MUTED} />
        <TextInput testID="collections-search" style={styles.searchInput} value={searchQuery} onChangeText={setSearchQuery} placeholder="Search collections..." placeholderTextColor={Colors.TEXT_MUTED} autoCapitalize="none" />
      </View>
      <FlatList data={filtered} keyExtractor={item => item.id} renderItem={renderCollection} contentContainerStyle={styles.list} ListEmptyComponent={<View style={styles.emptyWrap}><Text style={styles.emptyText}>No collections</Text></View>} />

      <Modal visible={showNewSheet} transparent animationType="slide">
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowNewSheet(false)}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>New Collection</Text>
            <TextInput testID="new-collection-name" style={styles.input} value={newName} onChangeText={setNewName} placeholder="Collection name" placeholderTextColor={Colors.TEXT_MUTED} />
            <View style={styles.swatchRow}>
              {SWATCH_COLORS.map(c => (
                <TouchableOpacity key={c} onPress={() => setNewColor(c)} style={[styles.swatchBtn, { backgroundColor: c }, newColor === c && styles.swatchActive]} />
              ))}
            </View>
            <PrimaryButton title="Create" onPress={handleCreate} disabled={!newName.trim()} />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.BACKGROUND_BASE },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  title: { fontFamily: 'Lora_700Bold', fontSize: 22, color: Colors.TEXT_PRIMARY },
  newBtn: { fontFamily: 'DMSans_500Medium', fontSize: 14, color: Colors.ACCENT },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 12, backgroundColor: Colors.BACKGROUND_ELEVATED, borderWidth: 1, borderColor: Colors.BORDER, borderRadius: 6, paddingHorizontal: 10 },
  searchInput: { flex: 1, paddingVertical: 8, marginLeft: 8, fontFamily: 'DMSans_400Regular', fontSize: 14, color: Colors.TEXT_PRIMARY },
  list: { paddingHorizontal: 16, paddingBottom: 80 },
  card: { backgroundColor: Colors.SURFACE, borderWidth: 1, borderColor: Colors.BORDER, borderRadius: 10, marginBottom: 8, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  swatch: { width: 10, height: 10, borderRadius: 2 },
  cardInfo: { flex: 1, marginLeft: 12 },
  cardName: { fontFamily: 'DMSans_500Medium', fontSize: 14, color: Colors.TEXT_PRIMARY },
  cardSub: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: Colors.TEXT_MUTED, marginTop: 2 },
  expanded: { borderTopWidth: 1, borderTopColor: Colors.BORDER, paddingLeft: 16, borderLeftWidth: 2, borderLeftColor: Colors.ACCENT, marginLeft: 16 },
  reqRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 8, gap: 10 },
  reqName: { flex: 1, fontFamily: 'DMSans_400Regular', fontSize: 13, color: Colors.TEXT_PRIMARY },
  emptyWrap: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { fontFamily: 'DMSans_400Regular', fontSize: 14, color: Colors.TEXT_MUTED },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: Colors.BACKGROUND_ELEVATED, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.BORDER, alignSelf: 'center', marginBottom: 16 },
  sheetTitle: { fontFamily: 'Lora_500Medium', fontSize: 18, color: Colors.TEXT_PRIMARY, marginBottom: 16 },
  input: { backgroundColor: Colors.SURFACE, borderWidth: 1, borderColor: Colors.BORDER, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10, fontFamily: 'DMSans_400Regular', fontSize: 14, color: Colors.TEXT_PRIMARY, marginBottom: 16 },
  swatchRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  swatchBtn: { width: 28, height: 28, borderRadius: 14 },
  swatchActive: { borderWidth: 2, borderColor: Colors.TEXT_PRIMARY },
});
