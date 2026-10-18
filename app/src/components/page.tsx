import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Scrolling screen body. `top` is the gap below the status bar
 * (the prototype's 58/64px tops minus its 50px status bar).
 */
export function Page({ children, top = 14, bottom = 120, gap = 18, px = 20 }: { children: ReactNode; top?: number; bottom?: number; gap?: number; px?: number }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + top, paddingBottom: bottom + insets.bottom, paddingHorizontal: px, gap }}
      >
        {children}
      </ScrollView>
    </View>
  );
}

/** Horizontal chip/day strip that bleeds to the screen edges like the design's -20px margins. */
export function HStrip({ children, gap = 8 }: { children: ReactNode; gap?: number }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginHorizontal: -20, flexGrow: 0 }}
      contentContainerStyle={{ paddingHorizontal: 20, gap }}
    >
      {children}
    </ScrollView>
  );
}
