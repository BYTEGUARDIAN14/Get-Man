import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

export default function SectionHeader({ title }) {
  return (
    <View testID={`section-${title}`} style={styles.container}>
      <Text style={styles.text}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 12, paddingHorizontal: 0 },
  text: { fontFamily: 'IBMPlexMono_500Medium', fontSize: 11, color: Colors.TEXT_MUTED, letterSpacing: 1.5, textTransform: 'uppercase' },
});
