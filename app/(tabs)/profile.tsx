import React, { useContext } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { auth } from "../../firebaseConfig";
import { signOut } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

// Dark theme colors (consistent with previous pages)
const Colors = {
  background: '#1A1A1A',
  tint: '#00D1B2',
  tabIconDefault: '#8E8E93',
  text: '#FFFFFF',
  card: '#2C2C2E',
} as const;

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth); // Firebase Auth logout
      if (logout) logout(); // Update context if available
      Alert.alert('Success', 'Logged out successfully.');
      router.replace('/login'); // Redirect to login screen (adjust route as needed)
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Error', 'Failed to log out.');
    }
  };

  return (
    <View style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Profile
      </ThemedText>

      {/* User Info Card */}
      <View style={styles.card}>
        <ThemedText style={styles.label}>Email</ThemedText>
        <ThemedText style={styles.value}>
          {user?.email || 'Not logged in'}
        </ThemedText>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <ThemedText style={styles.logoutButtonText}>Log Out</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
  },
  title: {
    color: Colors.text,
    marginBottom: 20,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  label: {
    color: Colors.tabIconDefault,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  value: {
    color: Colors.text,
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#FF3B30', // Red for logout
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
});