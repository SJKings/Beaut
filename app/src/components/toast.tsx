import * as Clipboard from 'expo-clipboard';
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../lib/theme';
import { T } from './ui';

const Ctx = createContext<(msg: string) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const insets = useSafeAreaInsets();
  const flash = useCallback((m: string) => {
    setMsg(m);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(''), 1800);
  }, []);
  return (
    <Ctx.Provider value={flash}>
      {children}
      {!!msg && (
        <View pointerEvents="none" style={{ position: 'absolute', top: insets.top + 8, left: 0, right: 0, alignItems: 'center', zIndex: 50 }}>
          <View style={{ backgroundColor: colors.ink, borderRadius: 999, paddingHorizontal: 18, paddingVertical: 10 }}>
            <T w={500} style={{ color: '#fff', fontSize: 13 }}>
              {msg}
            </T>
          </View>
        </View>
      )}
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);

export function useCopyCode() {
  const flash = useToast();
  return (code: string) => {
    Clipboard.setStringAsync(code).catch(() => {});
    flash('Code ' + code + ' copied');
  };
}
