import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

// Ads
import mobileAds from 'react-native-google-mobile-ads';

// Tracking
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';

// Component library
import { PaperProvider } from 'react-native-paper';

// Auth context
import { AuthProvider, useAuth } from '@/context/AuthContext'; // Adjust path

import { useColorScheme } from '@/hooks/useColorScheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Inner layout component to handle auth redirects
function RootLayoutNav() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (loading) return; // Wait for auth state to resolve

    const inTabsGroup = segments[0] === '(tabs)';

    if (!user && !inTabsGroup) {
      // If not authenticated and not already in tabs, redirect to login
      router.replace('/login');
    } else if (user && !inTabsGroup) {
      // If authenticated and not in tabs, redirect to dashboard
      router.replace('/(tabs)/dashboard');
    }
  }, [user, loading, segments]);

  if (loading) {
    return null; // Keep splash screen up while auth is loading
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Hide splash screen when fonts are loaded
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Initialize Google Mobile Ads SDK and tracking
  useEffect(() => {
    (async () => {
      const { status: trackingStatus } = await requestTrackingPermissionsAsync();
      if (trackingStatus !== 'granted') {
        console.log('Tracking permission denied:', trackingStatus);
      }

      await mobileAds().initialize();
    })();
  }, []);

  if (!loaded) {
    return null; // Wait for fonts to load
  }

  return (
    <PaperProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </PaperProvider>
  );
}