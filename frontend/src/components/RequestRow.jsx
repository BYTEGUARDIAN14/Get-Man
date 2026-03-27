import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import MethodBadge from './MethodBadge';
import StatusPill from './StatusPill';
import { timeAgo } from '../utils/formatResponse';

export default function RequestRow({ item, onPress }) {
  return (
    <TouchableOpacity testID={`request-row-${item.id}`} style={styles.card} onPress={() => onPress && onPress(item)} activeOpacity={0.7}>
      <MethodBadge method={item.method} />
      <View style={styles.center}>
        <Text style={styles.url} numberOfLines={1}>{item.url}</Text>
        <Text style={styles.time}>{timeAgo(item.timestamp)}</Text>
      </View>
      <StatusPill status={item.status} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.SURFACE, borderWidth: 1, borderColor: Colors.BORDER, borderRadius: 10,
    padding: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 4,
  },
  center: { flex: 1, marginHorizontal: 10 },
  url: { fontFamily: 'IBMPlexMono_400Regular', fontSize: 12, color: Colors.TEXT_PRIMARY },
  time: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: Colors.TEXT_MUTED, marginTop: 2 },
});
