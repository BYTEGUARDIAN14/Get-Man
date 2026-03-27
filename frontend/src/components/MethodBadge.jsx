import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MethodColors } from '../constants/colors';

export default function MethodBadge({ method, size = 'small' }) {
  const color = MethodColors[method] || '#5C5750';
  return (
    <View testID={`method-badge-${method}`} style={[styles.badge, { backgroundColor: color }, size === 'large' && styles.large]}>
      <Text style={[styles.text, size === 'large' && styles.largeText]}>{method}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, alignSelf: 'flex-start' },
  large: { paddingHorizontal: 12, paddingVertical: 5 },
  text: { fontFamily: 'IBMPlexMono_400Regular', fontSize: 11, color: '#EDE8DF', fontWeight: '600' },
  largeText: { fontSize: 12 },
});
