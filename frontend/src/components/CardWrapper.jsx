import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

export default function CardWrapper({ children, style, active = false }) {
  return (
    <View style={[styles.card, active && styles.activeCard, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.SURFACE, borderWidth: 1, borderColor: Colors.BORDER, borderRadius: 10,
    padding: 16, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 4,
  },
  activeCard: { borderLeftWidth: 3, borderLeftColor: Colors.ACCENT, backgroundColor: '#292520' },
});
