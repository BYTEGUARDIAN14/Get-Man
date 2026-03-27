import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

export default function TabBar({ tabs, activeIndex, onTabPress }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container} contentContainerStyle={styles.content}>
      {tabs.map((tab, index) => (
        <TouchableOpacity
          testID={`tab-${tab.toLowerCase().replace(/\s/g, '-')}`}
          key={tab}
          onPress={() => onTabPress(index)}
          style={[styles.tab, activeIndex === index && styles.activeTab]}
        >
          <Text style={[styles.tabText, activeIndex === index && styles.activeTabText]}>{tab}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 0, borderBottomWidth: 1, borderBottomColor: Colors.BORDER },
  content: { paddingHorizontal: 16 },
  tab: { paddingVertical: 10, paddingHorizontal: 14, marginRight: 4 },
  activeTab: { borderBottomWidth: 2, borderBottomColor: Colors.ACCENT },
  tabText: { fontFamily: 'IBMPlexMono_400Regular', fontSize: 13, color: Colors.TEXT_MUTED },
  activeTabText: { color: Colors.TEXT_PRIMARY, fontFamily: 'IBMPlexMono_500Medium' },
});
