import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

export default function OutlinedButton({ title, onPress, color, style }) {
  const borderColor = color || Colors.ACCENT;
  return (
    <TouchableOpacity testID={`outlined-btn-${title.toLowerCase().replace(/\s+/g, '-')}`} style={[styles.btn, { borderColor }, style]} onPress={onPress} activeOpacity={0.7}>
      <Text style={[styles.text, { color: borderColor }]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { borderWidth: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  text: { fontFamily: 'DMSans_500Medium', fontSize: 14 },
});
