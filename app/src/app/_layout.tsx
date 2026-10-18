import { JetBrainsMono_500Medium, JetBrainsMono_600SemiBold } from '@expo-google-fonts/jetbrains-mono';
import { Outfit_300Light, Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold, useFonts } from '@expo-google-fonts/outfit';
import { SplashScreen, Stack } from 'expo-router';
import { useEffect, type ReactNode } from 'react';
import { ToastProvider } from '../components/toast';
import { StoreProvider, useStore } from '../lib/store';
import { colors } from '../lib/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

function Gate({ fontsLoaded, children }: { fontsLoaded: boolean; children: ReactNode }) {
  const { ready } = useStore();
  const show = ready && fontsLoaded;
  useEffect(() => {
    if (show) SplashScreen.hideAsync().catch(() => {});
  }, [show]);
  return show ? children : null;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Outfit_300Light,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    JetBrainsMono_500Medium,
    JetBrainsMono_600SemiBold,
  });
  return (
    <StoreProvider>
      <ToastProvider>
        <Gate fontsLoaded={fontsLoaded || !!fontError}>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
            <Stack.Screen name="index" options={{ contentStyle: { backgroundColor: colors.ink } }} />
            <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
            <Stack.Screen name="confirmed" options={{ gestureEnabled: false, animation: 'fade' }} />
          </Stack>
        </Gate>
      </ToastProvider>
    </StoreProvider>
  );
}
