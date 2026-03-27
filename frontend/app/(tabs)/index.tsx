import React, { useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { GearSix } from 'phosphor-react-native';
import { AppContext, useTheme } from '../../src/context/AppContext';
import { Colors, MethodColors } from '../../src/constants/colors';
import RequestRow from '../../src/components/RequestRow';
import CollectionCard from '../../src/components/CollectionCard';
import SectionHeader from '../../src/components/SectionHeader';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

export default function HomeScreen() {
  const router = useRouter();
  const { state, dispatch } = useContext(AppContext);
  const { accent } = useTheme();
  const recentHistory = state.history.slice(0, 5);
  const topCollections = state.collections.slice(0, 3);

  const handleRequestPress = (item) => {
    dispatch({ type: 'SET_CURRENT_RESPONSE', payload: item.responseData });
    dispatch({ type: 'SET_CURRENT_REQUEST', payload: item.requestData || { method: item.method, url: item.url } });
    router.push('/response');
  };

  return (
    <SafeAreaView testID="home-screen" style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.appName}>APIPlayground</Text>
          <TouchableOpacity testID="home-settings-btn" onPress={() => router.push('/(tabs)/settings')}>
            <GearSix size={24} color={Colors.TEXT_PRIMARY} />
          </TouchableOpacity>
        </View>

        <Text style={styles.greeting}>{getGreeting()}, Dev</Text>
        <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>

        <TouchableOpacity testID="btn-+-new-request" style={[styles.newBtn, { backgroundColor: accent }]} onPress={() => router.push('/request-builder')} activeOpacity={0.7}>
          <Text style={styles.newBtnText}>+ New Request</Text>
        </TouchableOpacity>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.methodRow} contentContainerStyle={styles.methodRowContent}>
          {METHODS.map((m) => (
            <TouchableOpacity
              testID={`method-pill-${m}`}
              key={m}
              style={[styles.methodPill, { backgroundColor: MethodColors[m] }]}
              onPress={() => router.push({ pathname: '/request-builder', params: { method: m } })}
            >
              <Text style={styles.methodPillText}>{m}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <SectionHeader title="RECENT" />
        {recentHistory.length > 0 ? (
          recentHistory.map((item) => (
            <RequestRow key={item.id} item={item} onPress={handleRequestPress} />
          ))
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No recent requests</Text>
          </View>
        )}

        <SectionHeader title="COLLECTIONS" />
        {topCollections.length > 0 ? (
          topCollections.map((col) => (
            <CollectionCard key={col.id} collection={col} onPress={() => router.push('/(tabs)/collections')} />
          ))
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No collections yet</Text>
          </View>
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.BACKGROUND_BASE },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, paddingBottom: 16 },
  appName: { fontFamily: 'Lora_700Bold', fontSize: 24, color: Colors.TEXT_PRIMARY, letterSpacing: -0.5 },
  greeting: { fontFamily: 'Lora_600SemiBold', fontSize: 22, color: Colors.TEXT_PRIMARY },
  date: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: Colors.TEXT_MUTED, marginTop: 4, marginBottom: 20 },
  newBtn: { borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginBottom: 16 },
  newBtnText: { fontFamily: 'DMSans_600SemiBold', fontSize: 15, color: Colors.TEXT_PRIMARY },
  methodRow: { flexGrow: 0, marginBottom: 8 },
  methodRowContent: { gap: 8 },
  methodPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, height: 36, justifyContent: 'center' },
  methodPillText: { fontFamily: 'IBMPlexMono_500Medium', fontSize: 12, color: Colors.TEXT_PRIMARY },
  empty: { paddingVertical: 24, alignItems: 'center' },
  emptyText: { fontFamily: 'DMSans_400Regular', fontSize: 14, color: Colors.TEXT_MUTED },
  bottomSpace: { height: 80 },
});
