import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { sendFeedback } from '../api/feedback';

const FEEDBACK_TYPES = [
  { label: 'General thought', value: 'General' },
  { label: 'Idea', value: 'Idea' },
  { label: 'Bug or issue', value: 'Bug/Issue' },
  { label: 'Feature request', value: 'Feature Request' },
] as const;

type FeedbackModalProps = {
  onClose: () => void;
  visible: boolean;
};

export function FeedbackModal({ onClose, visible }: FeedbackModalProps) {
  const [type, setType] = useState<(typeof FEEDBACK_TYPES)[number]['value']>('General');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    const trimmed = message.trim();

    if (!trimmed) {
      Alert.alert('Message required', 'Please enter your feedback.');
      return;
    }

    setSending(true);

    try {
      await sendFeedback({ type, message: trimmed });
      setMessage('');
      setType('General');
      onClose();
      Alert.alert('Thanks!', 'Your feedback has been sent.');
    } catch (error) {
      const messageText = error instanceof Error ? error.message : 'Please try again later.';
      Alert.alert('Could not send', messageText);
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <Pressable onPress={onClose} style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlayInner}>
          <Pressable onPress={() => {}} style={styles.sheet}>
            <View style={styles.header}>
              <Text style={styles.title}>Send feedback</Text>
              <Pressable accessibilityLabel="Close feedback" hitSlop={12} onPress={onClose} style={styles.closeBtn}>
                <MaterialCommunityIcons color="#CBD5E1" name="close" size={24} />
              </Pressable>
            </View>
            <Text style={styles.subtitle}>
              Share your thoughts, ideas, or report issues. We read everything.
            </Text>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={styles.scroll}
            >
              <Text style={styles.label}>Type</Text>
              <View style={styles.typeRow}>
                {FEEDBACK_TYPES.map((feedbackType) => (
                  <Pressable
                    key={feedbackType.value}
                    onPress={() => setType(feedbackType.value)}
                    style={[styles.typeChip, type === feedbackType.value && styles.typeChipActive]}
                  >
                    <Text
                      style={[styles.typeChipText, type === feedbackType.value && styles.typeChipTextActive]}
                    >
                      {feedbackType.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.label}>Message</Text>
              <TextInput
                editable={!sending}
                multiline
                numberOfLines={4}
                onChangeText={setMessage}
                placeholder="Tell us what's on your mind..."
                placeholderTextColor="#64748B"
                returnKeyType="done"
                style={styles.input}
                value={message}
              />
            </ScrollView>

            <View style={styles.actions}>
              <Pressable disabled={sending} onPress={onClose} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                disabled={!message.trim() || sending}
                onPress={handleSend}
                style={[styles.sendBtn, (!message.trim() || sending) && styles.sendBtnDisabled]}
              >
                {sending ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.sendText}>Send</Text>
                )}
              </Pressable>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: 'rgba(2, 6, 23, 0.82)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlayInner: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#090D16',
    borderColor: 'rgba(229, 9, 20, 0.75)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 2,
    maxHeight: '85%',
    paddingBottom: 34,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  closeBtn: {
    padding: 4,
  },
  subtitle: {
    color: '#CBD5E1',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  scroll: {
    maxHeight: 360,
    paddingHorizontal: 20,
  },
  label: {
    color: '#F6C453',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.1,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  typeChip: {
    backgroundColor: '#101622',
    borderColor: 'rgba(246, 196, 83, 0.35)',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  typeChipActive: {
    backgroundColor: 'rgba(229, 9, 20, 0.18)',
    borderColor: '#E50914',
  },
  typeChipText: {
    color: '#CBD5E1',
    fontSize: 14,
    fontWeight: '600',
  },
  typeChipTextActive: {
    color: '#F6C453',
    fontWeight: '800',
  },
  input: {
    backgroundColor: '#101622',
    borderColor: 'rgba(246, 196, 83, 0.35)',
    borderRadius: 12,
    borderWidth: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    minHeight: 120,
    padding: 16,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  cancelText: {
    color: '#CBD5E1',
    fontSize: 17,
    fontWeight: '700',
  },
  sendBtn: {
    alignItems: 'center',
    backgroundColor: '#E50914',
    borderColor: '#F6C453',
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 88,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  sendBtnDisabled: {
    opacity: 0.55,
  },
  sendText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
});
