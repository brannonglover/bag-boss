import { Stack } from 'expo-router';
import { Alert, Animated, Image, PanResponder, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ColorPicker } from '../src/components/ColorPicker';
import { FireworksOverlay } from '../src/components/FireworksOverlay';
import { HistoryPanel } from '../src/components/HistoryPanel';
import { saveGame } from '../src/storage/gameHistory';
import type { GameScores, ScoreAction, TeamSide } from '../src/types/game';

const DEFAULT_SCORES: GameScores = {
  left: { score: 0, color: '#F97316' },
  right: { score: 0, color: '#2563EB' },
};

function getWinner(scores: GameScores) {
  if (scores.left.score === scores.right.score) {
    return 'tie';
  }

  return scores.left.score > scores.right.score ? 'left' : 'right';
}

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function CounterScreen() {
  const { height, width } = useWindowDimensions();
  const [scores, setScores] = useState<GameScores>(DEFAULT_SCORES);
  const [actions, setActions] = useState<ScoreAction[]>([]);
  const [isEmptyScoreModalVisible, setIsEmptyScoreModalVisible] = useState(false);
  const [isFinishModalVisible, setIsFinishModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [fireworksTrigger, setFireworksTrigger] = useState(0);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const historyPanelTranslateX = useRef(new Animated.Value(width)).current;
  const previousScoresRef = useRef({ left: 0, right: 0 });
  const isLandscape = width > height;
  const winner = getWinner(scores);
  const canSwipeToHistory = !isEmptyScoreModalVisible && !isFinishModalVisible && !isHistoryVisible;

  useEffect(() => {
    if (!isHistoryVisible) {
      historyPanelTranslateX.setValue(width);
    }
  }, [historyPanelTranslateX, isHistoryVisible, width]);

  const openHistory = useCallback(() => {
    setIsHistoryVisible(true);
    historyPanelTranslateX.setValue(width);
    Animated.timing(historyPanelTranslateX, {
      duration: 260,
      toValue: 0,
      useNativeDriver: true,
    }).start();
  }, [historyPanelTranslateX, width]);

  const closeHistory = useCallback(() => {
    Animated.timing(historyPanelTranslateX, {
      duration: 240,
      toValue: width,
      useNativeDriver: true,
    }).start(() => setIsHistoryVisible(false));
  }, [historyPanelTranslateX, width]);

  const swipeResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_event, gestureState) =>
          canSwipeToHistory &&
          gestureState.dx < -28 &&
          Math.abs(gestureState.dy) < 40,
        onPanResponderRelease: (_event, gestureState) => {
          if (gestureState.dx < -90 && Math.abs(gestureState.dy) < 70) {
            openHistory();
          }
        },
      }),
    [canSwipeToHistory, openHistory],
  );

  useEffect(() => {
    if (!isTimerRunning) {
      return;
    }

    const intervalId = setInterval(() => {
      setTimerSeconds((currentSeconds) => currentSeconds + 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isTimerRunning]);

  useEffect(() => {
    if (
      (scores.left.score === 21 && previousScoresRef.current.left !== 21) ||
      (scores.right.score === 21 && previousScoresRef.current.right !== 21)
    ) {
      setFireworksTrigger((currentTrigger) => currentTrigger + 1);
    }

    previousScoresRef.current = {
      left: scores.left.score,
      right: scores.right.score,
    };
  }, [scores.left.score, scores.right.score]);

  const incrementScore = (side: TeamSide) => {
    setScores((currentScores) => ({
      ...currentScores,
      [side]: {
        ...currentScores[side],
        score: currentScores[side].score + 1,
      },
    }));
    setActions((currentActions) => [...currentActions, { side }]);
  };

  const undoSideScore = (side: TeamSide) => {
    if (scores[side].score === 0) {
      return;
    }

    setScores((currentScores) => ({
      ...currentScores,
      [side]: {
        ...currentScores[side],
        score: Math.max(0, currentScores[side].score - 1),
      },
    }));
    setActions((currentActions) => {
      const actionIndex = currentActions.findLastIndex((action) => action.side === side);

      if (actionIndex === -1) {
        return currentActions;
      }

      return [
        ...currentActions.slice(0, actionIndex),
        ...currentActions.slice(actionIndex + 1),
      ];
    });
  };

  const resetScores = () => {
    setScores((currentScores) => ({
      left: { ...currentScores.left, score: 0 },
      right: { ...currentScores.right, score: 0 },
    }));
    setActions([]);
    setIsTimerRunning(false);
    setTimerSeconds(0);
  };

  const setTeamColor = (side: TeamSide, color: string) => {
    setScores((currentScores) => ({
      ...currentScores,
      [side]: {
        ...currentScores[side],
        color,
      },
    }));
  };

  const finishGame = () => {
    if (scores.left.score === 0 && scores.right.score === 0) {
      setIsEmptyScoreModalVisible(true);
      return;
    }

    setIsTimerRunning(false);
    setIsFinishModalVisible(true);
  };

  const saveFinishedGame = async () => {
    setIsSaving(true);

    try {
      await saveGame({
        createdAt: new Date().toISOString(),
        durationSeconds: timerSeconds,
        id: `${Date.now()}`,
        scores,
        winner,
      });
      setIsFinishModalVisible(false);
      resetScores();
    } catch {
      Alert.alert('Unable to save game', 'Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView edges={isLandscape ? [] : ['top', 'bottom']} style={styles.safeArea} {...swipeResponder.panHandlers}>
      <Stack.Screen options={{ headerShown: false }} />
      {!isLandscape ? (
        <View style={styles.homeHeader}>
          <Image
            accessibilityIgnoresInvertColors
            accessibilityLabel="Bag Boss"
            source={require('../assets/splash-icon.png')}
            style={styles.homeHeaderLogo}
          />
        </View>
      ) : null}
      {!isLandscape ? (
        <View style={styles.topBar}>
          <Text style={styles.instructions}>Tap a score to add a point.</Text>
          <TimerPill
            isRunning={isTimerRunning}
            isLandscape={false}
            onLongPressReset={() => {
              setIsTimerRunning(false);
              setTimerSeconds(0);
            }}
            onToggle={() => setIsTimerRunning((currentValue) => !currentValue)}
            seconds={timerSeconds}
          />
          <Pressable accessibilityRole="button" onPress={openHistory} style={styles.historyButton}>
            <Text style={styles.historyButtonText}>History</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.scoreboard}>
        <ScorePanel
          label="Left"
          score={scores.left.score}
          backgroundColor={scores.left.color}
          isLandscape={isLandscape}
          onPress={() => incrementScore('left')}
          onUndo={() => undoSideScore('left')}
        />
        <ScorePanel
          label="Right"
          score={scores.right.score}
          backgroundColor={scores.right.color}
          isLandscape={isLandscape}
          onPress={() => incrementScore('right')}
          onUndo={() => undoSideScore('right')}
        />
      </View>

      {isLandscape && isTimerRunning ? (
        <TimerPill
          isRunning={isTimerRunning}
          isLandscape
          onLongPressReset={() => {
            setIsTimerRunning(false);
            setTimerSeconds(0);
          }}
          onToggle={() => setIsTimerRunning((currentValue) => !currentValue)}
          seconds={timerSeconds}
        />
      ) : null}

      {!isLandscape ? (
      <View style={styles.controls}>
        <View style={styles.colorPickers}>
          <ColorPicker
            label="Left bags"
            onSelectColor={(color) => setTeamColor('left', color)}
            selectedColor={scores.left.color}
          />
          <ColorPicker
            label="Right bags"
            onSelectColor={(color) => setTeamColor('right', color)}
            selectedColor={scores.right.color}
          />
        </View>

        <View style={styles.actions}>
          <Pressable accessibilityRole="button" onPress={resetScores} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Reset</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={isSaving}
            onPress={finishGame}
            style={[styles.primaryButton, isSaving && styles.disabledButton]}
          >
            <Text style={styles.primaryButtonText}>{isSaving ? 'Saving...' : 'Finish Game'}</Text>
          </Pressable>
        </View>
      </View>
      ) : null}
      <FinishGameModal
        isSaving={isSaving}
        onCancel={() => setIsFinishModalVisible(false)}
        onSave={saveFinishedGame}
        scores={scores}
        timerSeconds={timerSeconds}
        visible={isFinishModalVisible}
        winner={winner}
      />
      <EmptyScoreModal
        onClose={() => setIsEmptyScoreModalVisible(false)}
        visible={isEmptyScoreModalVisible}
      />
      <FireworksOverlay trigger={fireworksTrigger} />
      {isHistoryVisible ? (
        <Animated.View
          style={[
            styles.historyPanel,
            {
              transform: [{ translateX: historyPanelTranslateX }],
            },
          ]}
        >
          <HistoryPanel onClose={closeHistory} visible={isHistoryVisible} />
        </Animated.View>
      ) : null}
    </SafeAreaView>
  );
}

type TimerPillProps = {
  isLandscape: boolean;
  isRunning: boolean;
  onLongPressReset: () => void;
  onToggle: () => void;
  seconds: number;
};

function TimerPill({
  isLandscape,
  isRunning,
  onLongPressReset,
  onToggle,
  seconds,
}: TimerPillProps) {
  const lastLongPressAtRef = useRef(0);

  const handlePress = () => {
    if (Date.now() - lastLongPressAtRef.current < 750) {
      return;
    }

    onToggle();
  };

  const handleLongPress = () => {
    lastLongPressAtRef.current = Date.now();
    onLongPressReset();
  };

  return (
    <Pressable
      accessibilityLabel={`Game timer ${formatDuration(seconds)}. Tap to ${isRunning ? 'pause' : 'start'}. Long press to reset.`}
      accessibilityRole="button"
      delayLongPress={450}
      onLongPress={handleLongPress}
      onPress={handlePress}
      style={[styles.timerPill, isLandscape && styles.timerPillLandscape]}
    >
      <View style={[styles.timerDot, isRunning && styles.timerDotRunning]} />
      <Text style={styles.timerText}>{formatDuration(seconds)}</Text>
    </Pressable>
  );
}

function EmptyScoreModal({
  onClose,
  visible,
}: {
  onClose: () => void;
  visible: boolean;
}) {
  if (!visible) {
    return null;
  }

  return (
    <View accessibilityViewIsModal style={styles.modalBackdrop}>
      <View style={styles.finishModal}>
        <Text style={styles.modalEyebrow}>Finish Game</Text>
        <Text style={styles.modalTitle}>Add a score first</Text>
        <Text style={styles.modalBody}>Score at least one point before saving a game.</Text>

        <Pressable accessibilityRole="button" onPress={onClose} style={styles.modalPrimaryButton}>
          <Text style={styles.modalPrimaryButtonText}>Keep Scoring</Text>
        </Pressable>
      </View>
    </View>
  );
}

type FinishGameModalProps = {
  isSaving: boolean;
  onCancel: () => void;
  onSave: () => void;
  scores: GameScores;
  timerSeconds: number;
  visible: boolean;
  winner: TeamSide | 'tie';
};

function FinishGameModal({
  isSaving,
  onCancel,
  onSave,
  scores,
  timerSeconds,
  visible,
  winner,
}: FinishGameModalProps) {
  const winnerText = winner === 'tie' ? 'Tie game' : `${winner === 'left' ? 'Left' : 'Right'} side wins`;

  if (!visible) {
    return null;
  }

  return (
    <View accessibilityViewIsModal style={styles.modalBackdrop}>
      <View style={styles.finishModal}>
        <Text style={styles.modalEyebrow}>Finish Game</Text>
        <Text style={styles.modalTitle}>{winnerText}</Text>
        <Text style={styles.modalBody}>
          Save this game to your local history?
          {timerSeconds > 0 ? ` Timer: ${formatDuration(timerSeconds)}.` : ''}
        </Text>

        <View style={styles.modalScoreRow}>
          <ModalTeamScore color={scores.left.color} label="Left" score={scores.left.score} />
          <Text style={styles.modalScoreDivider}>-</Text>
          <ModalTeamScore color={scores.right.color} label="Right" score={scores.right.score} />
        </View>

        <View style={styles.modalActions}>
          <Pressable
            accessibilityRole="button"
            disabled={isSaving}
            onPress={onCancel}
            style={[styles.modalSecondaryButton, isSaving && styles.disabledButton]}
          >
            <Text style={styles.modalSecondaryButtonText}>Keep Scoring</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={isSaving}
            onPress={onSave}
            style={[styles.modalPrimaryButton, isSaving && styles.disabledButton]}
          >
            <Text style={styles.modalPrimaryButtonText}>{isSaving ? 'Saving...' : 'Save Game'}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function ModalTeamScore({
  color,
  label,
  score,
}: {
  color: string;
  label: string;
  score: number;
}) {
  return (
    <View style={styles.modalTeamScore}>
      <View style={[styles.modalColorSwatch, { backgroundColor: color }]} />
      <Text style={styles.modalTeamLabel}>{label}</Text>
      <Text style={styles.modalScore}>{score}</Text>
    </View>
  );
}

type ScorePanelProps = {
  backgroundColor: string;
  isLandscape: boolean;
  label: string;
  onUndo: () => void;
  onPress: () => void;
  score: number;
};

function ScorePanel({
  backgroundColor,
  isLandscape,
  label,
  onPress,
  onUndo,
  score,
}: ScorePanelProps) {
  const textColor = backgroundColor === '#F8FAFC' || backgroundColor === '#FACC15' ? '#111827' : '#FFFFFF';
  const lastLongPressAtRef = useRef(0);

  const handlePress = () => {
    if (Date.now() - lastLongPressAtRef.current < 750) {
      return;
    }

    onPress();
  };

  const handleLongPress = () => {
    lastLongPressAtRef.current = Date.now();
    onUndo();
  };

  return (
    <View style={[styles.scorePanel, { backgroundColor }]}>
      <Pressable
        accessibilityLabel={`${label} score, ${score}. Tap to increment. Long press to undo.`}
        accessibilityRole="button"
        delayLongPress={350}
        onLongPress={handleLongPress}
        onPress={handlePress}
        style={styles.scoreTouchTarget}
      >
        <View style={styles.scoreFrame}>
          <Text
            allowFontScaling={false}
            numberOfLines={1}
            style={[styles.score, isLandscape && styles.scoreLandscape, { color: textColor }]}
          >
            {score}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  colorPickers: {
    gap: 18,
  },
  controls: {
    backgroundColor: '#090D16',
    borderTopColor: 'rgba(229, 9, 20, 0.35)',
    borderTopWidth: 1,
    gap: 24,
    padding: 18,
  },
  disabledButton: {
    opacity: 0.45,
  },
  historyButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.14)',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  historyPanel: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#090D16',
    zIndex: 20,
  },
  historyButtonText: {
    color: '#CBD5E1',
    fontSize: 14,
    fontWeight: '700',
  },
  homeHeader: {
    alignItems: 'center',
    backgroundColor: '#090D16',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  homeHeaderLogo: {
    height: 52,
    resizeMode: 'contain',
    width: 204,
  },
  instructions: {
    color: '#F8FAFC',
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#E50914',
    borderColor: '#F6C453',
    borderWidth: 1,
    borderRadius: 14,
    flex: 1.4,
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  safeArea: {
    backgroundColor: '#090D16',
    flex: 1,
  },
  scoreboard: {
    flex: 1,
    flexDirection: 'row',
  },
  score: {
    fontSize: 128,
    fontWeight: '900',
    includeFontPadding: false,
    lineHeight: 142,
    textAlign: 'center',
  },
  scoreFrame: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  scoreLandscape: {
    fontSize: 230,
    lineHeight: 250,
  },
  scorePanel: {
    flex: 1,
  },
  scoreTouchTarget: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    overflow: 'visible',
    paddingVertical: 16,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: '#101622',
    borderColor: 'rgba(246, 196, 83, 0.35)',
    borderWidth: 1,
    borderRadius: 14,
    flex: 1,
    paddingVertical: 14,
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  modalActions: {
    gap: 10,
    width: '100%',
  },
  modalBackdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(2, 6, 23, 0.82)',
    justifyContent: 'center',
    padding: 22,
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  modalBody: {
    color: '#E5E7EB',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalColorSwatch: {
    borderColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 999,
    borderWidth: 1,
    height: 24,
    width: 24,
  },
  modalEyebrow: {
    color: '#F6C453',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  modalPrimaryButton: {
    alignItems: 'center',
    backgroundColor: '#E50914',
    borderColor: '#F6C453',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    width: '100%',
  },
  modalPrimaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  modalScore: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '900',
  },
  modalScoreDivider: {
    color: '#E50914',
    fontSize: 34,
    fontWeight: '900',
  },
  modalScoreRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'space-between',
    width: '100%',
  },
  modalSecondaryButton: {
    alignItems: 'center',
    backgroundColor: '#101622',
    borderColor: 'rgba(246, 196, 83, 0.35)',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    width: '100%',
  },
  modalSecondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  modalTeamLabel: {
    color: '#F6C453',
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  modalTeamScore: {
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'center',
  },
  finishModal: {
    alignItems: 'center',
    backgroundColor: '#090D16',
    borderColor: 'rgba(229, 9, 20, 0.75)',
    borderRadius: 28,
    borderWidth: 2,
    gap: 18,
    maxWidth: 430,
    padding: 22,
    width: '100%',
  },
  topBar: {
    alignItems: 'center',
    backgroundColor: '#090D16',
    borderBottomColor: 'rgba(229, 9, 20, 0.32)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 16,
    padding: 16,
  },
  timerDot: {
    backgroundColor: '#F6C453',
    borderRadius: 999,
    height: 7,
    width: 7,
  },
  timerDotRunning: {
    backgroundColor: '#E50914',
  },
  timerPill: {
    alignItems: 'center',
    backgroundColor: '#101622',
    borderColor: 'rgba(246, 196, 83, 0.45)',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  timerPillLandscape: {
    opacity: 0.86,
    position: 'absolute',
    right: 14,
    top: 14,
    zIndex: 2,
  },
  timerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontVariant: ['tabular-nums'],
    fontWeight: '900',
  },
});
