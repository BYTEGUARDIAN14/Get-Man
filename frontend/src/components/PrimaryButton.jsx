import React, { useContext } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { AppContext } from '../context/AppContext';
import { Colors } from '../constants/colors';

export default function PrimaryButton({ title, onPress, loading = false, disabled = false, style }) {
  const { state } = useContext(AppContext);
  const accent = state?.settings?.accentColor || Colors.ACCENT;

  return (
    <TouchableOpacity
      testID={`btn-${title.toLowerCase().replace(/\s+/g, '-')}`}
      style={[styles.btn, { backgroundColor: accent }, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color={Colors.TEXT_PRIMARY} />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: Colors.ACCENT, borderRadius: 10, paddingVertical: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  disabled: { opacity: 0.5 },
  text: { fontFamily: 'IBMPlexMono_500Medium', fontSize: 15, color: Colors.TEXT_PRIMARY },
});
