// @ts-nocheck
import React, { useContext, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CaretLeft } from 'phosphor-react-native';
import { AppContext } from '../src/context/AppContext';
import { Colors } from '../src/constants/colors';
import { computeDiff } from '../src/utils/diffUtils';

export default function ResponseDiffScreen() {
  const router = useRouter();
  const { compareId } = useLocalSearchParams();
  const { state } = useContext(AppContext);

  const currentResponse = state.currentResponse;
  const historyItem = state.history.find(h => h.id === compareId);
  const compareResponse = historyItem?.responseData;

  const diff = useMemo(() => {
    if (!currentResponse || !compareResponse) return [];
    
    const currentStr = typeof currentResponse.body === 'string' 
      ? currentResponse.body 
      : JSON.stringify(currentResponse.body, null, 2);
    
    const compareStr = typeof compareResponse.body === 'string'
      ? compareResponse.body
      : JSON.stringify(compareResponse.body, null, 2);
      
    // Note: We compare "history" (old) with "current" (new)
    return computeDiff(compareStr, currentStr);
  }, [currentResponse, compareResponse]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <CaretLeft size={24} color={Colors.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.title}>Response Diff</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Comparing history ({new Date(historyItem?.timestamp).toLocaleTimeString()}) → Current</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {diff.map((line, idx) => {
          let bgColor = 'transparent';
          let textColor = Colors.TEXT_PRIMARY;
          let prefix = ' ';

          if (line.type === 'added') {
            bgColor = 'rgba(76, 175, 80, 0.15)';
            textColor = '#81C784';
            prefix = '+';
          } else if (line.type === 'removed') {
            bgColor = 'rgba(244, 67, 54, 0.15)';
            textColor = '#E57373';
            prefix = '-';
          }

          return (
            <View key={idx} style={[styles.line, { backgroundColor: bgColor }]}>
              <Text style={[styles.lineText, { color: textColor }]}>
                {prefix} {line.value}
              </Text>
            </View>
          );
        })}
        {diff.length === 0 && (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Text style={{ color: Colors.TEXT_MUTED, fontFamily: 'IBMPlexMono_400Regular' }}>No differences found</Text>
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.BACKGROUND_BASE },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.BORDER },
  backBtn: { marginRight: 12 },
  title: { fontFamily: 'IBMPlexMono_700Bold', fontSize: 18, color: Colors.TEXT_PRIMARY },
  infoRow: { padding: 16, backgroundColor: Colors.BACKGROUND_ELEVATED },
  infoLabel: { fontFamily: 'IBMPlexMono_400Regular', fontSize: 12, color: Colors.TEXT_MUTED },
  content: { flex: 1 },
  line: { paddingHorizontal: 16, paddingVertical: 1 },
  lineText: { fontFamily: 'IBMPlexMono_400Regular', fontSize: 12, lineHeight: 18 },
});
