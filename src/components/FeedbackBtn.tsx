import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { FeedbackModal } from './FeedbackModal';

type FeedbackBtnProps = {
  color?: string;
  size?: number;
};

export function FeedbackBtn({ color = '#CBD5E1', size = 22 }: FeedbackBtnProps) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <Pressable
        accessibilityLabel="Send feedback"
        accessibilityRole="button"
        hitSlop={12}
        onPress={() => setModalVisible(true)}
        style={styles.btn}
      >
        <MaterialCommunityIcons color={color} name="message-text-outline" size={size} />
      </Pressable>
      <FeedbackModal onClose={() => setModalVisible(false)} visible={modalVisible} />
    </>
  );
}

const styles = StyleSheet.create({
  btn: {
    padding: 6,
  },
});
