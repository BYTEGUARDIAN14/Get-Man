import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CaretRight } from 'phosphor-react-native';
import { Colors } from '../constants/colors';

export default function CollectionCard({ collection, onPress }) {
  return (
    <TouchableOpacity testID={`collection-card-${collection.id}`} style={styles.card} onPress={() => onPress && onPress(collection)} activeOpacity={0.7}>
      <View style={[styles.swatch, { backgroundColor: collection.color || Colors.ACCENT }]} />
      <View style={styles.info}>
        <Text style={styles.name}>{collection.name}</Text>
        <Text style={styles.sub}>{collection.requests?.length || 0} requests</Text>
      </View>
      <CaretRight size={16} color={Colors.TEXT_MUTED} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.SURFACE, borderWidth: 1, borderColor: Colors.BORDER, borderRadius: 10,
    padding: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 4,
  },
  swatch: { width: 10, height: 10, borderRadius: 2 },
  info: { flex: 1, marginLeft: 12 },
  name: { fontFamily: 'DMSans_500Medium', fontSize: 14, color: Colors.TEXT_PRIMARY },
  sub: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: Colors.TEXT_MUTED, marginTop: 2 },
});
