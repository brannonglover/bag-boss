import { RobotoMono_400Regular, useFonts } from '@expo-google-fonts/roboto-mono';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, Image, StyleSheet } from 'react-native';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    RobotoMono_400Regular,
  });

  const fontsReady = Platform.OS === 'ios' || fontsLoaded;

  if (!fontsReady) {
    return null;
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: '#090D16' },
          headerBackTitle: 'Back',
          headerStyle: { backgroundColor: '#090D16' },
          headerTintColor: '#F6C453',
          headerTitleStyle: { fontWeight: '800' },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerTitle: () => (
              <Image
                accessibilityIgnoresInvertColors
                accessibilityLabel="Bag Count"
                source={require('../assets/splash-icon.png')}
                style={styles.headerLogo}
              />
            ),
            headerTitleAlign: 'center',
          }}
        />
        <Stack.Screen
          name="history"
          options={{
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: '#090D16' },
            fullScreenGestureEnabled: true,
            fullScreenGestureShadowEnabled: false,
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  headerLogo: {
    height: 52,
    resizeMode: 'contain',
    width: 204,
  },
});
