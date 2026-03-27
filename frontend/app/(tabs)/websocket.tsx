// @ts-nocheck
import React, { useState, useRef, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../src/constants/colors';
import { useTheme } from '../../src/context/AppContext';
import OutlinedButton from '../../src/components/OutlinedButton';

export default function WebSocketScreen() {
  const { accent } = useTheme();
  const [wsUrl, setWsUrl] = useState('');
  const [connected, setConnected] = useState(false);
  const [messageLog, setMessageLog] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const socketRef = useRef(null);
  const flatListRef = useRef(null);

  const addLog = useCallback((direction, message) => {
    const ts = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const uniqueId = Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);
    setMessageLog(prev => [...prev, { id: uniqueId, direction, message, timestamp: ts }]);
  }, []);

  const handleConnect = () => {
    if (connected) {
      socketRef.current?.close();
      setConnected(false);
      addLog('system', 'Disconnected');
      return;
    }
    if (!wsUrl.trim()) return;
    try {
      const ws = new WebSocket(wsUrl.trim());
      ws.onopen = () => { setConnected(true); addLog('system', 'Connected'); };
      ws.onmessage = (e) => { addLog('recv', e.data); };
      ws.onclose = () => { setConnected(false); addLog('system', 'Connection closed'); };
      ws.onerror = (e) => { addLog('system', 'Error: ' + (e.message || 'Unknown error')); };
      socketRef.current = ws;
    } catch (e) {
      addLog('system', 'Failed to connect: ' + e.message);
    }
  };

  const handleSend = () => {
    if (!inputMessage.trim() || !connected) return;
    socketRef.current?.send(inputMessage);
    addLog('sent', inputMessage);
    setInputMessage('');
  };

  const clearLog = () => setMessageLog([]);

  const renderMessage = ({ item }) => {
    const prefix = item.direction === 'sent' ? '▶ sent  ' : item.direction === 'recv' ? '◀ recv  ' : '● ';
    const color = item.direction === 'recv' ? '#7A9E7C' : item.direction === 'sent' ? Colors.TEXT_PRIMARY : Colors.TEXT_MUTED;
    return (
      <Text testID={`ws-msg-${item.id}`} style={[styles.logLine, { color }]}>
        {prefix}{item.message} <Text style={styles.logTime}>{item.timestamp}</Text>
      </Text>
    );
  };

  return (
    <SafeAreaView testID="websocket-screen" style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.title}>WebSocket</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: connected ? accent : Colors.ERROR }]} />
            <Text style={styles.statusText}>{connected ? 'Connected' : 'Disconnected'}</Text>
          </View>
          <TouchableOpacity testID="ws-clear-btn" onPress={clearLog}><Text style={styles.clearText}>Clear</Text></TouchableOpacity>
        </View>

        <View style={styles.urlRow}>
          <TextInput testID="ws-url-input" style={styles.urlInput} value={wsUrl} onChangeText={setWsUrl} placeholder="wss://echo.websocket.org" placeholderTextColor={Colors.TEXT_MUTED} autoCapitalize="none" autoCorrect={false} />
          <OutlinedButton title={connected ? 'Disconnect' : 'Connect'} onPress={handleConnect} color={connected ? Colors.ERROR : accent} style={styles.connectBtn} />
        </View>

        <FlatList
          ref={flatListRef}
          data={messageLog}
          keyExtractor={(item, index) => `${item.id}_${index}`}
          renderItem={renderMessage}
          style={styles.logArea}
          contentContainerStyle={styles.logContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={<Text style={styles.emptyText}>Messages will appear here...</Text>}
        />

        <View style={styles.sendRow}>
          <TextInput testID="ws-message-input" style={styles.sendInput} value={inputMessage} onChangeText={setInputMessage} placeholder="Type a message..." placeholderTextColor={Colors.TEXT_MUTED} autoCapitalize="none" autoCorrect={false} />
          <TouchableOpacity testID="ws-send-btn" style={[styles.sendBtn, { backgroundColor: accent }, !connected && styles.sendBtnDisabled]} onPress={handleSend} disabled={!connected}>
            <Text style={styles.sendBtnText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.BACKGROUND_BASE },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  title: { fontFamily: 'IBMPlexMono_700Bold', fontSize: 22, color: Colors.TEXT_PRIMARY, flex: 1 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { fontFamily: 'IBMPlexMono_400Regular', fontSize: 12, color: Colors.TEXT_MUTED },
  clearText: { fontFamily: 'IBMPlexMono_400Regular', fontSize: 12, color: Colors.TEXT_MUTED },
  urlRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 8, gap: 8 },
  urlInput: { flex: 1, backgroundColor: Colors.BACKGROUND_ELEVATED, borderWidth: 1, borderColor: Colors.BORDER, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10, fontFamily: 'IBMPlexMono_400Regular', fontSize: 13, color: Colors.TEXT_PRIMARY },
  connectBtn: { paddingHorizontal: 16, paddingVertical: 10 },
  logArea: { flex: 1, backgroundColor: Colors.BACKGROUND_ELEVATED, marginHorizontal: 16, borderRadius: 10, borderWidth: 1, borderColor: Colors.BORDER },
  logContent: { padding: 12 },
  logLine: { fontFamily: 'IBMPlexMono_400Regular', fontSize: 12, lineHeight: 20 },
  logTime: { color: Colors.TEXT_MUTED, fontSize: 10 },
  emptyText: { fontFamily: 'IBMPlexMono_400Regular', fontSize: 12, color: Colors.TEXT_MUTED },
  sendRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  sendInput: { flex: 1, backgroundColor: Colors.BACKGROUND_ELEVATED, borderWidth: 1, borderColor: Colors.BORDER, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10, fontFamily: 'IBMPlexMono_400Regular', fontSize: 13, color: Colors.TEXT_PRIMARY },
  sendBtn: { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { fontFamily: 'IBMPlexMono_500Medium', fontSize: 14, color: Colors.TEXT_PRIMARY },
});
