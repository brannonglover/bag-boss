import { Platform, type TextStyle } from 'react-native';

/** Must match the key passed to useFonts in app/_layout.tsx (Android/web). */
export const bundledMonospaceFontFamily = 'RobotoMono_400Regular';

/**
 * iOS: system Courier — plain zero, no slash/dot; no expo-font load required.
 * Android/web: Roboto Mono Regular — plain oval zero.
 */
export const monospaceFontFamily = Platform.select({
  ios: 'Courier-Bold',
  android: bundledMonospaceFontFamily,
  default: bundledMonospaceFontFamily,
})!;

/** Scores, timers, and other numeric UI. Never set fontWeight here or on these styles. */
export const monospaceDigits: TextStyle = Platform.select({
  ios: {
    fontFamily: monospaceFontFamily,
    fontStyle: 'normal',
  },
  default: {
    fontFamily: monospaceFontFamily,
    fontStyle: 'normal',
    fontWeight: 'normal',
  },
})!;
