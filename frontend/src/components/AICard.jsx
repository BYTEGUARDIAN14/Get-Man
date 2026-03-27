import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

export default function AICard({ title, body, testID }) {
  return (
    <View testID={testID || 'ai-card'} style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.SURFACE, borderWidth: 1, borderColor: Colors.BORDER, borderRadius: 10,
    padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 4,
  },
  title: { fontFamily: 'DMSans_500Medium', fontSize: 13, color: Colors.TEXT_SECONDARY, textTransform: 'uppercase', marginBottom: 8 },
  body: { fontFamily: 'DMSans_400Regular', fontSize: 14, color: Colors.TEXT_PRIMARY, lineHeight: 22 },
});
