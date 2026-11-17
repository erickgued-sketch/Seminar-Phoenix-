// Per-weight imports: the package index would bundle every weight and italic (~3 MB of fonts).
import { Baloo2_700Bold } from '@expo-google-fonts/baloo-2/700Bold';
import { Baloo2_800ExtraBold } from '@expo-google-fonts/baloo-2/800ExtraBold';
import { Nunito_600SemiBold } from '@expo-google-fonts/nunito/600SemiBold';
import { Nunito_700Bold } from '@expo-google-fonts/nunito/700Bold';
import { Nunito_800ExtraBold } from '@expo-google-fonts/nunito/800ExtraBold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { ActivityIndicator, useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useStore } from '@/lib/store';
import { applyScheme, colors, type Scheme } from '@/theme/tokens';

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Baloo2_700Bold, Baloo2_800ExtraBold, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold });
  const hydrated = useStore((s) => s.hydrated);
  const theme = useStore((s) => s.profile.theme) ?? 'system';
  const system = useColorScheme();
  // Appearance: the user's choice wins; otherwise follow the OS. The palette is swapped before any child
  // renders, and the store value makes every screen (they all call useT) repaint.
  const scheme: Scheme = theme === 'system' ? (system === 'dark' ? 'dark' : 'light') : theme;
  applyScheme(scheme);
  useEffect(() => {
    if (useStore.getState().scheme !== scheme) useStore.setState({ scheme });
  }, [scheme]);

  // Loading state: wait for fonts and persisted data (fonts failing must not block the app).
  if (!(fontsLoaded || fontError) || !hydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primaryDeep} size="large" accessibilityLabel="Loading" />
      </View>
    );
  }
  return (
    <SafeAreaProvider>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg }, animation: 'slide_from_right' }} />
    </SafeAreaProvider>
  );
}
