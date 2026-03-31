// @ts-nocheck
import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, FlatList, KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CaretLeft, BookmarkSimple, Check, DotsThreeVertical, ClipboardText, DownloadSimple } from 'phosphor-react-native';
import * as Clipboard from 'expo-clipboard';
import { parseCurl, generateCurl } from '../src/utils/curlUtils';
import { AppContext, useTheme } from '../src/context/AppContext';
import { Colors, MethodColors } from '../src/constants/colors';
import { HTTP_METHODS } from '../src/constants/methods';
import { useRequest } from '../src/hooks/useRequest';
import TabBar from '../src/components/TabBar';
import KeyValueEditor from '../src/components/KeyValueEditor';
import PrimaryButton from '../src/components/PrimaryButton';

const TABS = ['Params', 'Headers', 'Body', 'Auth', 'Variables'];
const HEADER_CHIPS = ['Content-Type', 'Authorization', 'Accept'];
const AUTH_TYPES = ['No Auth', 'Bearer Token', 'Basic Auth', 'API Key'];

export default function RequestBuilderScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { state, dispatch } = useContext(AppContext);
  const { sendRequest, loading } = useRequest();
  const { accent } = useTheme();

  const [method, setMethod] = useState(params.method || 'GET');
  const [url, setUrl] = useState(params.url || '');
  const [reqParams, setReqParams] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [bodyType, setBodyType] = useState('json');
  const [bodyRaw, setBodyRaw] = useState('');
  const [bodyFormData, setBodyFormData] = useState([]);
  const [authType, setAuthType] = useState('No Auth');
  const [authValues, setAuthValues] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  const [showMethodSheet, setShowMethodSheet] = useState(false);
  const [showSaveSheet, setShowSaveSheet] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveCollectionId, setSaveCollectionId] = useState('');
  const [showOptionsSheet, setShowOptionsSheet] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [curlInput, setCurlInput] = useState('');
  const [graphqlQuery, setGraphqlQuery] = useState('');
  const [graphqlVariables, setGraphqlVariables] = useState('');

  useEffect(() => {
    if (params.method) setMethod(params.method);
    if (params.url) setUrl(params.url);
  }, [params.method, params.url]);

  const handleSend = async () => {
    if (!url.trim()) return;
    const headersObj = {};
    headers.filter(h => h.enabled && h.key).forEach(h => { headersObj[h.key] = h.value; });
    const paramsObj = {};
    reqParams.filter(p => p.enabled && p.key).forEach(p => { paramsObj[p.key] = p.value; });

    let bodyData = null;
    if (bodyType === 'json' && bodyRaw) bodyData = bodyRaw;
    else if (bodyType === 'formdata') {
      const fd = {};
      bodyFormData.filter(f => f.enabled && f.key).forEach(f => { fd[f.key] = f.value; });
      bodyData = fd;
    }
    else if (bodyType === 'graphql') {
      const variables = graphqlVariables.trim() ? JSON.parse(graphqlVariables) : {};
      bodyData = JSON.stringify({ query: graphqlQuery, variables });
    }

    const authMap = {};
    if (authType === 'Bearer Token') { authMap.token = authValues.token; }
    else if (authType === 'Basic Auth') { authMap.username = authValues.username; authMap.password = authValues.password; }
    else if (authType === 'API Key') { authMap.keyName = authValues.keyName; authMap.key = authValues.key; authMap.location = authValues.location || 'Header'; }

    const result = await sendRequest({
      method, url: url.trim(), headers: headersObj, params: paramsObj,
      body: bodyData, authType: authType === 'No Auth' ? 'none' : authType.toLowerCase().replace(' ', ''),
      authValues: authMap,
    });

    dispatch({ type: 'SET_CURRENT_RESPONSE', payload: result.response });
    dispatch({ type: 'SET_CURRENT_REQUEST', payload: { method, url: url.trim() } });
    router.push('/response');
  };

  const handleSave = () => {
    if (!saveName.trim() || !saveCollectionId) return;
    dispatch({
      type: 'ADD_REQUEST_TO_COLLECTION',
      payload: { collectionId: saveCollectionId, request: { id: Date.now().toString(), method, url, name: saveName } },
    });
    setShowSaveSheet(false);
    setSaveName('');
  };

  const handleImportCurl = () => {
    const parsed = parseCurl(curlInput);
    if (parsed) {
      setMethod(parsed.method);
      setUrl(parsed.url);
      setHeaders(parsed.headers);
      if (parsed.body) {
        setBodyRaw(parsed.body);
        setBodyType('json'); // Default to JSON if body is present
      }
      setShowImportModal(false);
      setCurlInput('');
    } else {
      alert('Invalid cURL command');
    }
  };

  const handleCopyCurl = async () => {
    const curl = generateCurl({ method, url, headers, body: bodyType === 'json' ? bodyRaw : '' });
    await Clipboard.setStringAsync(curl);
    setShowOptionsSheet(false);
    alert('cURL copied to clipboard');
  };

  const addHeaderChip = (key) => {
    setHeaders([...headers, { key, value: '', enabled: true, id: Date.now().toString() }]);
  };

  const activeEnv = state.environments.find(e => e.id === state.activeEnvId);

  const renderContent = () => {
    switch (activeTab) {
      case 0: return <KeyValueEditor data={reqParams} onChange={setReqParams} />;
      case 1: return (
        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            {HEADER_CHIPS.map(chip => (
              <TouchableOpacity key={chip} style={styles.chip} onPress={() => addHeaderChip(chip)}>
                <Text style={styles.chipText}>{chip}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <KeyValueEditor data={headers} onChange={setHeaders} />
        </View>
      );
      case 2: return (
        <View>
          <View style={styles.segmentRow}>
            {['json', 'formdata', 'graphql'].map(t => (
              <TouchableOpacity key={t} style={[styles.segment, bodyType === t && styles.segmentActive, bodyType === t && { borderBottomColor: accent }]} onPress={() => setBodyType(t)}>
                <Text style={[styles.segmentText, bodyType === t && styles.segmentTextActive, bodyType === t && { color: accent }]}>{t === 'json' ? 'JSON' : t === 'formdata' ? 'Form Data' : 'GraphQL'}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {bodyType === 'json' ? (
            <TextInput testID="body-json-input" style={styles.jsonInput} value={bodyRaw} onChangeText={setBodyRaw} multiline placeholder='{"key": "value"}' placeholderTextColor={Colors.TEXT_MUTED} autoCapitalize="none" autoCorrect={false} />
          ) : bodyType === 'graphql' ? (
            <View>
              <Text style={styles.fieldLabel}>QUERY</Text>
              <TextInput style={[styles.jsonInput, { minHeight: 180, marginBottom: 12 }]} value={graphqlQuery} onChangeText={setGraphqlQuery} multiline placeholder='query { ... }' placeholderTextColor={Colors.TEXT_MUTED} autoCapitalize="none" autoCorrect={false} />
              <Text style={styles.fieldLabel}>VARIABLES (JSON)</Text>
              <TextInput style={[styles.jsonInput, { minHeight: 100 }]} value={graphqlVariables} onChangeText={setGraphqlVariables} multiline placeholder='{ "id": 1 }' placeholderTextColor={Colors.TEXT_MUTED} autoCapitalize="none" autoCorrect={false} />
            </View>
          ) : (
            <KeyValueEditor data={bodyFormData} onChange={setBodyFormData} />
          )}
        </View>
      );
      case 3: return (
        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            {AUTH_TYPES.map(t => (
              <TouchableOpacity key={t} style={[styles.chip, authType === t && styles.chipActive, authType === t && { borderColor: accent }]} onPress={() => setAuthType(t)}>
                <Text style={[styles.chipText, authType === t && styles.chipTextActive, authType === t && { color: accent }]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {authType === 'Bearer Token' && (
            <TextInput testID="auth-bearer-input" style={styles.authInput} value={authValues.token || ''} onChangeText={v => setAuthValues({ ...authValues, token: v })} placeholder="Token" placeholderTextColor={Colors.TEXT_MUTED} autoCapitalize="none" />
          )}
          {authType === 'Basic Auth' && (
            <View>
              <TextInput testID="auth-username-input" style={[styles.authInput, { marginBottom: 8 }]} value={authValues.username || ''} onChangeText={v => setAuthValues({ ...authValues, username: v })} placeholder="Username" placeholderTextColor={Colors.TEXT_MUTED} autoCapitalize="none" />
              <TextInput testID="auth-password-input" style={styles.authInput} value={authValues.password || ''} onChangeText={v => setAuthValues({ ...authValues, password: v })} placeholder="Password" placeholderTextColor={Colors.TEXT_MUTED} secureTextEntry autoCapitalize="none" />
            </View>
          )}
          {authType === 'API Key' && (
            <View>
              <TextInput testID="auth-keyname-input" style={[styles.authInput, { marginBottom: 8 }]} value={authValues.keyName || ''} onChangeText={v => setAuthValues({ ...authValues, keyName: v })} placeholder="Key Name" placeholderTextColor={Colors.TEXT_MUTED} autoCapitalize="none" />
              <TextInput testID="auth-keyvalue-input" style={[styles.authInput, { marginBottom: 8 }]} value={authValues.key || ''} onChangeText={v => setAuthValues({ ...authValues, key: v })} placeholder="Key Value" placeholderTextColor={Colors.TEXT_MUTED} autoCapitalize="none" />
              <View style={styles.segmentRow}>
                {['Header', 'Query'].map(loc => (
                  <TouchableOpacity key={loc} style={[styles.segment, authValues.location === loc && styles.segmentActive, authValues.location === loc && { borderBottomColor: accent }]} onPress={() => setAuthValues({ ...authValues, location: loc })}>
                    <Text style={[styles.segmentText, authValues.location === loc && styles.segmentTextActive, authValues.location === loc && { color: accent }]}>{loc}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      );
      case 4: return (
        <View>
          {activeEnv && (
            <View style={[styles.envBadge, { borderColor: accent }]}><Text style={[styles.envBadgeText, { color: accent }]}>{activeEnv.name}</Text></View>
          )}
          {activeEnv?.variables.map((v, i) => (
            <View key={i} style={styles.envRow}>
              <Text style={styles.envKey}>{'{' + v.key + '}'}</Text>
              <Text style={styles.envArrow}> → </Text>
              <Text style={styles.envVal}>{v.value}</Text>
            </View>
          ))}
          <TouchableOpacity onPress={() => router.push('/(tabs)/environments')}>
            <Text style={[styles.editEnvLink, { color: accent }]}>Edit in Environments →</Text>
          </TouchableOpacity>
        </View>
      );
      default: return null;
    }
  };

  return (
    <SafeAreaView testID="request-builder-screen" style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.topBar}>
          <TouchableOpacity testID="request-builder-back-btn" onPress={() => router.back()} style={styles.backBtn}>
            <CaretLeft size={24} color={Colors.TEXT_PRIMARY} />
          </TouchableOpacity>
          <Text style={styles.title}>New Request</Text>
          <TouchableOpacity testID="more-options-btn" onPress={() => setShowOptionsSheet(true)}>
            <DotsThreeVertical size={24} color={Colors.TEXT_PRIMARY} />
          </TouchableOpacity>
        </View>

        <View style={styles.urlBar}>
          <TouchableOpacity testID="method-selector-btn" style={[styles.methodBtn, { backgroundColor: MethodColors[method] }]} onPress={() => setShowMethodSheet(true)}>
            <Text style={styles.methodBtnText}>{method}</Text>
          </TouchableOpacity>
          <TextInput testID="url-input" style={styles.urlInput} value={url} onChangeText={setUrl} placeholder="https://api.example.com" placeholderTextColor={Colors.TEXT_MUTED} autoCapitalize="none" autoCorrect={false} keyboardType="url" />
          <TouchableOpacity testID="send-btn" style={[styles.sendBtn, { backgroundColor: accent }]} onPress={handleSend} disabled={loading}>
            {loading ? <ActivityIndicator size="small" color={Colors.TEXT_PRIMARY} /> : <Text style={styles.sendBtnText}>Send</Text>}
          </TouchableOpacity>
        </View>

        <TabBar tabs={TABS} activeIndex={activeTab} onTabPress={setActiveTab} />

        <ScrollView style={styles.contentArea} contentContainerStyle={styles.contentPad} keyboardShouldPersistTaps="handled">
          {renderContent()}
        </ScrollView>

        <TouchableOpacity testID="save-fab" style={[styles.fab, { backgroundColor: accent }]} onPress={() => setShowSaveSheet(true)}>
          <BookmarkSimple size={22} color={Colors.TEXT_PRIMARY} weight="fill" />
        </TouchableOpacity>

        <Modal visible={showMethodSheet} transparent animationType="slide">
          <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowMethodSheet(false)}>
            <View style={styles.sheet}>
              <View style={styles.handle} />
              {HTTP_METHODS.map(m => (
                <TouchableOpacity testID={`method-option-${m}`} key={m} style={styles.methodOption} onPress={() => { setMethod(m); setShowMethodSheet(false); }}>
                  <View style={[styles.methodDot, { backgroundColor: MethodColors[m] }]} />
                  <Text style={styles.methodOptionText}>{m}</Text>
                  {method === m && <Check size={18} color={accent} style={{ marginLeft: 'auto' }} />}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        <Modal visible={showSaveSheet} transparent animationType="slide">
          <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowSaveSheet(false)}>
            <View style={styles.sheet}>
              <View style={styles.handle} />
              <Text style={styles.sheetTitle}>Save Request</Text>
              <TextInput testID="save-name-input" style={styles.authInput} value={saveName} onChangeText={setSaveName} placeholder="Request name" placeholderTextColor={Colors.TEXT_MUTED} />
              <Text style={styles.sheetLabel}>Collection</Text>
              {state.collections.map(c => (
                <TouchableOpacity key={c.id} style={[styles.collOption, saveCollectionId === c.id && styles.collOptionActive]} onPress={() => setSaveCollectionId(c.id)}>
                  <View style={[styles.methodDot, { backgroundColor: c.color }]} />
                  <Text style={styles.methodOptionText}>{c.name}</Text>
                  {saveCollectionId === c.id && <Check size={18} color={accent} style={{ marginLeft: 'auto' }} />}
                </TouchableOpacity>
              ))}
              <PrimaryButton title="Save" onPress={handleSave} style={{ marginTop: 16 }} disabled={!saveName.trim() || !saveCollectionId} />
            </View>
          </TouchableOpacity>
        </Modal>

        <Modal visible={showOptionsSheet} transparent animationType="slide">
          <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowOptionsSheet(false)}>
            <View style={styles.sheet}>
              <View style={styles.handle} />
              <Text style={styles.sheetTitle}>Request Options</Text>
              <TouchableOpacity style={styles.methodOption} onPress={() => { setShowOptionsSheet(false); setShowImportModal(true); }}>
                <DownloadSimple size={20} color={Colors.TEXT_PRIMARY} style={{ marginRight: 12 }} />
                <Text style={styles.methodOptionText}>Import from cURL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.methodOption} onPress={handleCopyCurl}>
                <ClipboardText size={20} color={Colors.TEXT_PRIMARY} style={{ marginRight: 12 }} />
                <Text style={styles.methodOptionText}>Copy as cURL</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        <Modal visible={showImportModal} transparent animationType="slide">
          <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowImportModal(false)}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'flex-end' }}>
              <View style={styles.sheet}>
                <View style={styles.handle} />
                <Text style={styles.sheetTitle}>Import cURL</Text>
                <TextInput
                  style={[styles.jsonInput, { minHeight: 150, marginBottom: 16 }]}
                  value={curlInput}
                  onChangeText={setCurlInput}
                  multiline
                  placeholder="Paste cURL command here..."
                  placeholderTextColor={Colors.TEXT_MUTED}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <PrimaryButton title="Import" onPress={handleImportCurl} disabled={!curlInput.trim()} />
              </View>
            </KeyboardAvoidingView>
          </TouchableOpacity>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.BACKGROUND_BASE },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { marginRight: 12 },
  title: { fontFamily: 'IBMPlexMono_700Bold', fontSize: 18, color: Colors.TEXT_PRIMARY, flex: 1 },
  urlBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 8, gap: 8 },
  methodBtn: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  methodBtnText: { fontFamily: 'IBMPlexMono_400Regular', fontSize: 12, color: Colors.TEXT_PRIMARY, fontWeight: '600' },
  urlInput: { flex: 1, backgroundColor: Colors.BACKGROUND_ELEVATED, borderWidth: 1, borderColor: Colors.BORDER, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10, fontFamily: 'IBMPlexMono_400Regular', fontSize: 13, color: Colors.TEXT_PRIMARY },
  sendBtn: { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  sendBtnText: { fontFamily: 'IBMPlexMono_500Medium', fontSize: 14, color: Colors.TEXT_PRIMARY },
  contentArea: { flex: 1 },
  contentPad: { padding: 16 },
  chipRow: { flexGrow: 0, marginBottom: 12 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: Colors.BORDER, marginRight: 8 },
  chipActive: { borderColor: Colors.ACCENT },
  chipText: { fontFamily: 'IBMPlexMono_400Regular', fontSize: 12, color: Colors.TEXT_MUTED },
  chipTextActive: { color: Colors.ACCENT },
  segmentRow: { flexDirection: 'row', marginBottom: 12, gap: 8 },
  segment: { paddingVertical: 8, paddingHorizontal: 16 },
  segmentActive: { borderBottomWidth: 2, borderBottomColor: Colors.ACCENT },
  segmentText: { fontFamily: 'IBMPlexMono_400Regular', fontSize: 13, color: Colors.TEXT_MUTED },
  segmentTextActive: { color: Colors.ACCENT, fontFamily: 'IBMPlexMono_500Medium' },
  jsonInput: { backgroundColor: Colors.BACKGROUND_ELEVATED, borderWidth: 1, borderColor: Colors.BORDER, borderRadius: 6, padding: 12, fontFamily: 'IBMPlexMono_400Regular', fontSize: 13, color: Colors.TEXT_PRIMARY, minHeight: 200, textAlignVertical: 'top' },
  authInput: { backgroundColor: Colors.BACKGROUND_ELEVATED, borderWidth: 1, borderColor: Colors.BORDER, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10, fontFamily: 'IBMPlexMono_400Regular', fontSize: 13, color: Colors.TEXT_PRIMARY },
  envBadge: { borderWidth: 1, borderColor: Colors.ACCENT, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: 12 },
  envBadgeText: { fontFamily: 'IBMPlexMono_500Medium', fontSize: 12, color: Colors.ACCENT },
  envRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  envKey: { fontFamily: 'IBMPlexMono_400Regular', fontSize: 12, color: Colors.TEXT_MUTED },
  envArrow: { fontFamily: 'IBMPlexMono_400Regular', fontSize: 12, color: Colors.TEXT_MUTED },
  envVal: { fontFamily: 'IBMPlexMono_400Regular', fontSize: 12, color: Colors.TEXT_PRIMARY, flex: 1 },
  editEnvLink: { fontFamily: 'IBMPlexMono_500Medium', fontSize: 13, color: Colors.ACCENT, marginTop: 16 },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.ACCENT, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: Colors.BACKGROUND_ELEVATED, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.BORDER, alignSelf: 'center', marginBottom: 16 },
  sheetTitle: { fontFamily: 'IBMPlexMono_700Bold', fontSize: 18, color: Colors.TEXT_PRIMARY, marginBottom: 16 },
  sheetLabel: { fontFamily: 'IBMPlexMono_500Medium', fontSize: 13, color: Colors.TEXT_MUTED, marginTop: 12, marginBottom: 8 },
  fieldLabel: { fontFamily: 'IBMPlexMono_500Medium', fontSize: 10, color: Colors.TEXT_MUTED, marginBottom: 6, letterSpacing: 1 },
  methodOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.BORDER },
  methodDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  methodOptionText: { fontFamily: 'IBMPlexMono_400Regular', fontSize: 14, color: Colors.TEXT_PRIMARY },
  collOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 8, borderRadius: 8, marginBottom: 4 },
  collOptionActive: { backgroundColor: Colors.SURFACE },
});
