import React, { useContext } from 'react';
import { View, Text, SectionList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ClockClockwise, Trash, BookmarkSimple } from 'phosphor-react-native';
import { AppContext } from '../../src/context/AppContext';
import { Colors } from '../../src/constants/colors';
import { getDateLabel } from '../../src/utils/formatResponse';
import RequestRow from '../../src/components/RequestRow';

export default function HistoryScreen() {
  const router = useRouter();
  const { state, dispatch } = useContext(AppContext);

  const grouped = {};
  state.history.forEach(item => {
    const label = getDateLabel(item.timestamp);
    if (!grouped[label]) grouped[label] = [];
    grouped[label].push(item);
  });
  const sections = Object.entries(grouped).map(([title, data]) => ({ title, data }));

  const handlePress = (item) => {
    dispatch({ type: 'SET_CURRENT_RESPONSE', payload: item.responseData });
    dispatch({ type: 'SET_CURRENT_REQUEST', payload: item.requestData || { method: item.method, url: item.url } });
    router.push('/response');
  };

  const handleDelete = (id) => { dispatch({ type: 'DELETE_HISTORY_ITEM', payload: id }); };

  const handleClearAll = () => {
    Alert.alert('Clear History', 'Delete all history?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => dispatch({ type: 'CLEAR_HISTORY' }) },
    ]);
  };

  if (state.history.length === 0) {
    return (
      <SafeAreaView testID="history-screen-empty" style={styles.safe}>
        <Text style={styles.title}>History</Text>
        <View style={styles.emptyWrap}>
          <ClockClockwise size={48} color={Colors.TEXT_MUTED} />
          <Text style={styles.emptyText}>No history yet</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView testID="history-screen" style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
      </View>
      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionTitle}>{title}</Text>
        )}
        renderItem={({ item }) => (
          <View style={styles.rowContainer}>
            <RequestRow item={item} onPress={handlePress} />
            <TouchableOpacity testID={`delete-history-${item.id}`} style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
              <Trash size={16} color={Colors.ERROR} />
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.list}
      />
      <TouchableOpacity testID="clear-all-history-btn" style={styles.clearBtn} onPress={handleClearAll}>
        <Text style={styles.clearText}>Clear All History</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.BACKGROUND_BASE },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  title: { fontFamily: 'Lora_700Bold', fontSize: 22, color: Colors.TEXT_PRIMARY, paddingHorizontal: 16, paddingTop: 8 },
  sectionTitle: { fontFamily: 'DMSans_500Medium', fontSize: 13, color: Colors.TEXT_MUTED, paddingVertical: 8, paddingHorizontal: 16, backgroundColor: Colors.BACKGROUND_BASE },
  list: { paddingHorizontal: 16, paddingBottom: 80 },
  rowContainer: { flexDirection: 'row', alignItems: 'center' },
  deleteBtn: { padding: 8, marginLeft: -4 },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontFamily: 'DMSans_400Regular', fontSize: 14, color: Colors.TEXT_MUTED, marginTop: 12 },
  clearBtn: { paddingVertical: 16, alignItems: 'center', borderTopWidth: 1, borderTopColor: Colors.BORDER },
  clearText: { fontFamily: 'DMSans_500Medium', fontSize: 14, color: Colors.ERROR },
});
