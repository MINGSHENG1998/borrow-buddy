import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { auth } from  "../firebaseConfig";
import {
  signInWithCredential,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
} from 'firebase/auth';

// Dark theme colors
const Colors = {
  background: '#1A1A1A',
  tint: '#00D1B2',
  tabIconDefault: '#8E8E93',
  text: '#FFFFFF',
  card: '#2C2C2E',
} as const;

// Configure WebBrowser for Google Sign-In
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false); // Toggle between login/signup
  const { login, loading } = useAuth();
  const router = useRouter();

  // Google Sign-In configuration
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: 'YOUR_GOOGLE_CLIENT_ID', // Replace with your Google Client ID from Firebase
    iosClientId: 'YOUR_IOS_CLIENT_ID', // Optional, for iOS
    androidClientId: 'YOUR_ANDROID_CLIENT_ID', // Optional, for Android
  });

  // Handle Google Sign-In response
  React.useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then((userCredential) => {
          router.replace('/(tabs)/dashboard');
        })
        .catch((error) => {
          console.error('Google Sign-In error:', error);
          Alert.alert('Error', 'Failed to sign in with Google.');
        });
    }
  }, [response]);

  // Handle email/password login or signup
  const handleAuth = async () => {
    try {
      if (isSignup) {
        // Signup
        await createUserWithEmailAndPassword(auth, email, password);
        router.replace('/(tabs)/dashboard');
      } else {
        // Login
        await login(email, password);
        router.replace('/(tabs)/dashboard');
      }
    } catch (error: any) {
      Alert.alert(
        isSignup ? 'Signup Failed' : 'Login Failed',
        error.message || 'An error occurred'
      );
    }
  };

  // Handle Google Sign-In button press
  const handleGoogleSignIn = () => {
    if (request) {
      promptAsync();
    } else {
      Alert.alert('Error', 'Google Sign-In is not ready yet.');
    }
  };

  return (
    <View style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        {isSignup ? 'Sign Up for Borrow Buddy' : 'Login to Borrow Buddy'}
      </ThemedText>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <ThemedText style={styles.label}>Email</ThemedText>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          placeholderTextColor={Colors.tabIconDefault}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <ThemedText style={styles.label}>Password</ThemedText>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          placeholderTextColor={Colors.tabIconDefault}
          secureTextEntry
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.authButton, loading && styles.disabledButton]}
        onPress={handleAuth}
        disabled={loading}
      >
        <ThemedText style={styles.authButtonText}>
          {loading ? (
            <ActivityIndicator size="small" color={Colors.background} />
          ) : isSignup ? (
            'Sign Up'
          ) : (
            'Log In'
          )}
        </ThemedText>
      </TouchableOpacity>

      {/* Google Sign-In Button */}
      <TouchableOpacity
        style={styles.googleButton}
        onPress={handleGoogleSignIn}
        disabled={!request || loading}
      >
        <ThemedText style={styles.googleButtonText}>Sign in with Google</ThemedText>
      </TouchableOpacity>

      {/* Toggle Login/Signup */}
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setIsSignup(!isSignup)}
      >
        <ThemedText style={styles.toggleText}>
          {isSignup
            ? 'Already have an account? Log In'
            : "Don't have an account? Sign Up"}
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
    justifyContent: 'center',
  },
  title: {
    color: Colors.text,
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.card,
    color: Colors.text,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  authButton: {
    backgroundColor: Colors.tint,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: Colors.tabIconDefault,
  },
  authButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  googleButton: {
    backgroundColor: '#4285F4', // Google blue
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  googleButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  toggleButton: {
    alignItems: 'center',
  },
  toggleText: {
    color: Colors.tint,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});