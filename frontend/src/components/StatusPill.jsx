import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function getStatusColor(status) {
  if (status >= 200 && status < 300) return '#3D6B4F';
  if (status >= 300 && status < 500) return '#7A5C30';
  return '#7A3D3D';
}

export default function StatusPill({ status }) {
  if (!status) return null;
  return (
    <View testID="status-pill" style={[styles.pill, { backgroundColor: getStatusColor(status) }]}>
      <Text style={styles.text}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  text: { fontFamily: 'IBMPlexMono_400Regular', fontSize: 11, color: '#EDE8DF' },
});
