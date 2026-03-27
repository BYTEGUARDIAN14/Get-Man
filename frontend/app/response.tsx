// @ts-nocheck
import React, { useContext, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, StyleSheet, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CaretLeft, Copy, MagnifyingGlass } from 'phosphor-react-native';
import * as Clipboard from 'expo-clipboard';
import { AppContext, useTheme } from '../src/context/AppContext';
import { Colors } from '../src/constants/colors';
import { formatTime, formatBytes } from '../src/utils/formatResponse';
import { tokenizeJSON, TOKEN_COLORS } from '../src/utils/syntaxHighlight';
import { useAI } from '../src/hooks/useAI';
import TabBar from '../src/components/TabBar';
import AICard from '../src/components/AICard';

const TABS = ['Body', 'Headers', 'AI Explain'];

function getStatusColor(status, accent) {
  if (status >= 200 && status < 300) return accent;
  if (status >= 300 && status < 500) return Colors.WARNING;
  return Colors.ERROR;
}

export default function ResponseScreen() {
  const router = useRouter();
  const { state, dispatch } = useContext(AppContext);
  const { explain, explanation, loading: aiLoading } = useAI();
  const { accent } = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiRequested, setAiRequested] = useState(false);

  const response = state.currentResponse;
  const request = state.currentRequest;

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  useEffect(() => {
    if (activeTab === 2 && !aiRequested && response && state.settings.aiEnabled) {
      setAiRequested(true);
      explain({ status: response.status, headers: response.headers, body: response.body, method: request?.method, url: request?.url });
    }
  }, [activeTab]);

  if (!response) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={handleBack}><CaretLeft size={24} color={Colors.TEXT_PRIMARY} /></TouchableOpacity>
          <Text style={styles.title}>Response</Text>
        </View>
        <View style={styles.emptyWrap}><Text style={styles.emptyText}>No response data</Text></View>
      </SafeAreaView>
    );
  }

  const bodyStr = typeof response.body === 'string' ? response.body : JSON.stringify(response.body, null, 2);
  const tokens = tokenizeJSON(bodyStr);
  const headersArr = response.headers ? Object.entries(response.headers) : [];

  const copyBody = async () => { await Clipboard.setStringAsync(bodyStr); };
  const shareResponse = async () => { await Share.share({ message: bodyStr }); };
  const replay = () => {
    if (request) router.push({ pathname: '/request-builder', params: { method: request.method, url: request.url } });
  };

  const renderBody = () => (
    <View>
      <View style={styles.searchRow}>
        <MagnifyingGlass size={16} color={Colors.TEXT_MUTED} />
        <TextInput testID="response-search-input" style={styles.searchInput} value={searchQuery} onChangeText={setSearchQuery} placeholder="Search JSON..." placeholderTextColor={Colors.TEXT_MUTED} autoCapitalize="none" />
        <TouchableOpacity testID="copy-response-btn" onPress={copyBody} style={styles.iconBtn}><Copy size={18} color={Colors.TEXT_PRIMARY} /></TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Text style={styles.jsonContainer}>
          {tokens.map((token, i) => {
            if (searchQuery && token.type === 'key' && !token.value.toLowerCase().includes(searchQuery.toLowerCase())) return null;
            return <Text key={i} style={{ color: TOKEN_COLORS[token.type] || Colors.TEXT_PRIMARY, fontFamily: 'IBMPlexMono_400Regular', fontSize: 13 }}>{token.value}</Text>;
          })}
        </Text>
      </ScrollView>
    </View>
  );

  const renderHeaders = () => (
    <View>
      {headersArr.map(([key, value], i) => (
        <View key={i} style={styles.headerRow}>
          <Text style={styles.headerKey}>{key}</Text>
          <Text style={styles.headerColon}>: </Text>
          <Text style={styles.headerValue} numberOfLines={2}>{String(value)}</Text>
        </View>
      ))}
    </View>
  );

  const renderAI = () => {
    if (aiLoading) return (
      <View>
        <Text style={styles.aiLabel}>AI ANALYSIS</Text>
        {[1, 2, 3, 4].map(i => (
          <View key={i} style={styles.skeleton}><ActivityIndicator color={accent} /></View>
        ))}
      </View>
    );
    if (!explanation) return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyText}>{state.settings.aiEnabled ? 'AI analysis unavailable' : 'AI explanations disabled'}</Text>
      </View>
    );
    return (
      <View>
        <Text style={styles.aiLabel}>AI ANALYSIS</Text>
        <AICard testID="ai-card-what" title="What This Means" body={explanation.whatItMeans || ''} />
        <AICard testID="ai-card-why" title="Why This Happened" body={explanation.whyItHappened || ''} />
        {response.status >= 400 && explanation.howToFix ? (
          <AICard testID="ai-card-fix" title="How To Fix It" body={explanation.howToFix} />
        ) : null}
        <AICard testID="ai-card-tests" title="Suggested Test Cases" body={(explanation.testCases || []).map(t => '→ ' + t).join('\n')} />
      </View>
    );
  };

  return (
    <SafeAreaView testID="response-screen" style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity testID="response-back-btn" onPress={handleBack} style={styles.backBtn}><CaretLeft size={24} color={Colors.TEXT_PRIMARY} /></TouchableOpacity>
        <Text style={styles.title}>Response</Text>
      </View>

      <View style={styles.summary}>
        <Text style={[styles.statusCode, { color: getStatusColor(response.status, accent) }]}>{response.status} {response.statusText}</Text>
        <Text style={styles.meta}>{formatTime(response.time)} · {formatBytes(response.size)}</Text>
      </View>

      <TabBar tabs={TABS} activeIndex={activeTab} onTabPress={setActiveTab} />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentPad} showsVerticalScrollIndicator={false}>
        {activeTab === 0 && renderBody()}
        {activeTab === 1 && renderHeaders()}
        {activeTab === 2 && renderAI()}
      </ScrollView>

      <View style={styles.actionRow}>
        <TouchableOpacity testID="save-request-btn" onPress={copyBody}><Text style={styles.actionText}>Save Request</Text></TouchableOpacity>
        <Text style={styles.actionDot}>·</Text>
        <TouchableOpacity testID="share-btn" onPress={shareResponse}><Text style={styles.actionText}>Share</Text></TouchableOpacity>
        <Text style={styles.actionDot}>·</Text>
        <TouchableOpacity testID="replay-btn" onPress={replay}><Text style={styles.actionText}>Replay</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.BACKGROUND_BASE },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { marginRight: 12 },
  title: { fontFamily: 'Lora_700Bold', fontSize: 18, color: Colors.TEXT_PRIMARY },
  summary: { paddingHorizontal: 16, paddingBottom: 12 },
  statusCode: { fontFamily: 'Lora_700Bold', fontSize: 28, marginBottom: 4 },
  meta: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: Colors.TEXT_MUTED },
  content: { flex: 1 },
  contentPad: { padding: 16 },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.BACKGROUND_ELEVATED, borderWidth: 1, borderColor: Colors.BORDER, borderRadius: 6, paddingHorizontal: 10, marginBottom: 12 },
  searchInput: { flex: 1, paddingVertical: 8, marginLeft: 8, fontFamily: 'IBMPlexMono_400Regular', fontSize: 13, color: Colors.TEXT_PRIMARY },
  iconBtn: { padding: 6 },
  jsonContainer: { fontFamily: 'IBMPlexMono_400Regular', fontSize: 13, lineHeight: 20 },
  headerRow: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.BORDER },
  headerKey: { fontFamily: 'IBMPlexMono_400Regular', fontSize: 12, color: Colors.TEXT_MUTED },
  headerColon: { fontFamily: 'IBMPlexMono_400Regular', fontSize: 12, color: Colors.TEXT_MUTED },
  headerValue: { fontFamily: 'IBMPlexMono_400Regular', fontSize: 12, color: Colors.TEXT_PRIMARY, flex: 1 },
  aiLabel: { fontFamily: 'DMSans_500Medium', fontSize: 11, color: Colors.TEXT_MUTED, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 },
  skeleton: { backgroundColor: Colors.SURFACE, borderRadius: 10, height: 80, marginBottom: 12, justifyContent: 'center', alignItems: 'center' },
  actionRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: Colors.BORDER },
  actionText: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: Colors.TEXT_PRIMARY },
  actionDot: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: Colors.TEXT_MUTED, marginHorizontal: 12 },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontFamily: 'DMSans_400Regular', fontSize: 14, color: Colors.TEXT_MUTED },
});
