import React, { useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CaretRight, ArrowSquareOut } from 'phosphor-react-native';
import * as Linking from 'expo-linking';
import { AppContext, useTheme } from '../../src/context/AppContext';
import { Colors } from '../../src/constants/colors';
import SectionHeader from '../../src/components/SectionHeader';

const ACCENT_COLORS = [
  { name: 'Sage', color: '#5A7A5C' }, { name: 'Slate', color: '#3D5470' },
  { name: 'Amber', color: '#A07840' }, { name: 'Rose', color: '#8C5A5A' },
  { name: 'Gray', color: '#5A5A6E' }, { name: 'Terra', color: '#7A5040' },
];


export default function SettingsScreen() {
  const router = useRouter();
  const { state, dispatch } = useContext(AppContext);
  const { accent } = useTheme();
  const s = state.settings;

  const updateSetting = (key, value) => dispatch({ type: 'UPDATE_SETTINGS', payload: { [key]: value } });

  const handleClearHistory = () => {
    Alert.alert('Clear History', 'This will delete all request history.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => dispatch({ type: 'CLEAR_HISTORY' }) },
    ]);
  };

  const Row = ({ label, right, onPress = null, color = null }) => (
    <TouchableOpacity testID={`setting-${label.toLowerCase().replace(/\s+/g, '-')}`} style={styles.row} onPress={onPress} disabled={!onPress} activeOpacity={onPress ? 0.7 : 1}>
      <Text style={[styles.rowLabel, color && { color }]}>{label}</Text>
      {right}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView testID="settings-screen" style={styles.safe}>
      <Text style={styles.title}>Settings</Text>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SectionHeader title="APPEARANCE" />
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Accent Color</Text>
            <View style={styles.swatchRow}>
              {ACCENT_COLORS.map(ac => (
                <TouchableOpacity key={ac.color} testID={`accent-${ac.name.toLowerCase()}`} onPress={() => updateSetting('accentColor', ac.color)} style={[styles.swatch, { backgroundColor: ac.color }, s.accentColor === ac.color && styles.swatchSelected]} />
              ))}
            </View>
          </View>
        </View>

        <SectionHeader title="REQUESTS" />
        <View style={styles.section}>
          <Row label="Default Timeout" right={<Text style={styles.rowValue}>{s.timeout}s</Text>} />
          <Row label="SSL Verification" right={<Switch value={s.sslVerification} onValueChange={v => updateSetting('sslVerification', v)} trackColor={{ false: Colors.BORDER, true: accent }} thumbColor={Colors.TEXT_PRIMARY} />} />
          <Row label="Follow Redirects" right={<Switch value={s.followRedirects} onValueChange={v => updateSetting('followRedirects', v)} trackColor={{ false: Colors.BORDER, true: accent }} thumbColor={Colors.TEXT_PRIMARY} />} />
        </View>

        <SectionHeader title="AI" />
        <View style={styles.section}>
          <Row label="AI Explanations" right={<Switch value={s.aiEnabled} onValueChange={v => updateSetting('aiEnabled', v)} trackColor={{ false: Colors.BORDER, true: accent }} thumbColor={Colors.TEXT_PRIMARY} />} />
          <Row label="AI Model" right={<View style={styles.rowRight}><Text style={styles.rowValue}>Gemini Flash</Text><CaretRight size={14} color={Colors.TEXT_MUTED} /></View>} />

        </View>

        <SectionHeader title="DATA" />
        <View style={styles.section}>
          <Row label="Clear History" color={Colors.ERROR} onPress={handleClearHistory} />
          <Row label="Export All Data" right={<CaretRight size={14} color={Colors.TEXT_MUTED} />} onPress={() => Alert.alert('Export', 'Data export coming soon')} />
        </View>

        <SectionHeader title="ABOUT" />
        <View style={styles.section}>
          <Row label="App Version" right={<Text style={styles.rowValue}>v1.0.0</Text>} />
          <Row label="WebSocket Client" right={<CaretRight size={14} color={Colors.TEXT_MUTED} />} onPress={() => router.push('/(tabs)/websocket')} />
          <Row label="GitHub" right={<ArrowSquareOut size={14} color={Colors.TEXT_MUTED} />} onPress={() => Linking.openURL('https://github.com/BYTEGUARDIAN14/Get-Man')} />
          <Row label="Send Feedback" right={<CaretRight size={14} color={Colors.TEXT_MUTED} />} onPress={() => Linking.openURL('mailto:byteaegis@gmail.com')} />
        </View>
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.BACKGROUND_BASE },
  title: { fontFamily: 'IBMPlexMono_700Bold', fontSize: 24, color: Colors.TEXT_PRIMARY, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4, letterSpacing: -0.5 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16 },
  section: { backgroundColor: Colors.SURFACE, borderWidth: 1, borderColor: Colors.BORDER, borderRadius: 10, overflow: 'hidden' },
  row: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: Colors.BORDER },
  rowLabel: { fontFamily: 'IBMPlexMono_400Regular', fontSize: 14, color: Colors.TEXT_PRIMARY },
  rowValue: { fontFamily: 'IBMPlexMono_400Regular', fontSize: 14, color: Colors.TEXT_MUTED },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatchRow: { flexDirection: 'row', gap: 8 },
  swatch: { width: 28, height: 28, borderRadius: 14 },
  swatchSelected: { borderWidth: 2, borderColor: Colors.TEXT_PRIMARY },
});
