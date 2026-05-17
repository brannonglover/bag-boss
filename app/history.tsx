import { useNavigation, useRouter } from 'expo-router';

import { HistoryPanel } from '../src/components/HistoryPanel';

export default function HistoryScreen() {
  const navigation = useNavigation();
  const router = useRouter();

  const goHome = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      router.replace('/');
    }
  };

  return <HistoryPanel onClose={goHome} visible />;
}
