import { Tabs } from 'expo-router';
import { useContext } from 'react';
import { House, FolderOpen, ClockClockwise, Globe, GearSix, WifiHigh } from 'phosphor-react-native';
import { AppContext } from '../../src/context/AppContext';
import { Colors } from '../../src/constants/colors';
import { StyleSheet } from 'react-native';

export default function TabLayout() {
  const { state } = useContext(AppContext);
  const accent = state.settings?.accentColor || Colors.ACCENT;

  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: styles.tabBar,
      tabBarActiveTintColor: accent,
      tabBarInactiveTintColor: Colors.TEXT_MUTED,
      tabBarLabelStyle: styles.tabLabel,
    }}>
      <Tabs.Screen name="index" options={{
        title: 'Home',
        tabBarIcon: ({ color }) => <House size={22} color={color} />,
      }} />
      <Tabs.Screen name="collections" options={{
        title: 'Collections',
        tabBarIcon: ({ color }) => <FolderOpen size={22} color={color} />,
      }} />
      <Tabs.Screen name="history" options={{
        title: 'History',
        tabBarIcon: ({ color }) => <ClockClockwise size={22} color={color} />,
      }} />
      <Tabs.Screen name="environments" options={{
        title: 'Envs',
        tabBarIcon: ({ color }) => <Globe size={22} color={color} />,
      }} />
      <Tabs.Screen name="websocket" options={{
        title: '',
        tabBarIcon: ({ color }) => <WifiHigh size={22} color={color} />,
      }} />
      <Tabs.Screen name="settings" options={{
        title: 'Settings',
        tabBarIcon: ({ color }) => <GearSix size={22} color={color} />,
      }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.BACKGROUND_ELEVATED,
    borderTopWidth: 1,
    borderTopColor: Colors.BORDER,
    height: 60,
    paddingBottom: 6,
    paddingTop: 6,
  },
  tabLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 10,
  },
});
