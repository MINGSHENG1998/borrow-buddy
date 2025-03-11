import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from 'expo-router'; // Expo Router's navigation hook

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';

// Define dark theme colors
const Colors = {
  background: '#1A1A1A',
  tint: '#00D1B2',
  tabIconDefault: '#8E8E93',
  text: '#FFFFFF',
  card: '#2C2C2E',
} as const; // 'as const' for literal type inference

// Define tab navigation param list
type TabParamList = {
  dashboard: undefined;
  transactions: undefined;
  addEntry: undefined;
  profile: undefined;
};

// Extend global navigation types (optional, for better IDE support)
declare global {
  namespace ReactNavigation {
    interface RootParamList extends TabParamList {}
  }
}

export default function TabLayout() {
  const navigation = useNavigation(); // Untyped by default, but works with Expo Router

  const handleAddEntry = () => {
    // TypeScript should infer 'addEntry' from file-based routing
    navigation.navigate('addEntry');
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.tint,
        tabBarInactiveTintColor: Colors.tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            height: 80,
            paddingBottom: 20,
          },
          android: {
            backgroundColor: Colors.background,
            elevation: 8,
            height: 60,
          },
        }),
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginBottom: 4,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }: { color: string }) => (
            <IconSymbol size={28} name="wallet.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ color }: { color: string }) => (
            <IconSymbol size={28} name="list.bullet.rectangle.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="addEntry"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }: { color: string }) => (
            <IconSymbol size={28} name="person.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 20 : 10,
    alignSelf: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
});