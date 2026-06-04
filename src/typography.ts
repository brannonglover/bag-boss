import { Platform, type TextStyle } from 'react-native';

/** Must match the key passed to useFonts in app/_layout.tsx (Android/web). */
export const bundledRoundedDigitFontFamily = 'MPLUSRounded1c_700Bold';

/**
 * iOS: SF Pro Rounded via system `ui-rounded` (RN 0.81+).
 * Android/web: M PLUS Rounded 1c Bold — close match to SF Pro Rounded for score digits.
 */
export const roundedDigitFontFamily = Platform.select({
  ios: 'ui-rounded',
  android: bundledRoundedDigitFontFamily,
  default: bundledRoundedDigitFontFamily,
})!;

/** Scores, timers, and other numeric UI. Do not set fontWeight on Android (breaks bundled faces). */
export const roundedDigitText: TextStyle = {
  fontFamily: roundedDigitFontFamily,
  fontStyle: 'normal',
  ...(Platform.OS === 'ios' ? { fontWeight: '700' as const } : {}),
};
