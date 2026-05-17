import { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { clearGameHistory, getGameHistory } from '../src/storage/gameHistory';
import type { GameRecord, TeamSide } from '../src/types/game';

function formatGameDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatWinner(winner: GameRecord['winner']) {
  if (winner === 'tie') {
    return 'Tie game';
  }

  return winner === 'left' ? 'Left side won' : 'Right side won';
}

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function HistoryScreen() {
  const [games, setGames] = useState<GameRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadGames = useCallback(async () => {
    setIsLoading(true);
    setGames(await getGameHistory());
    setIsLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadGames();
    }, [loadGames]),
  );

  const clearHistory = () => {
    Alert.alert('Clear history?', 'This removes all saved games on this device.', [
      { style: 'cancel', text: 'Cancel' },
      {
        onPress: async () => {
          await clearGameHistory();
          setGames([]);
        },
        style: 'destructive',
        text: 'Clear',
      },
    ]);
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {games.length === 1 ? '1 saved game' : `${games.length} saved games`}
        </Text>
        {games.length > 0 ? (
          <Pressable accessibilityRole="button" onPress={clearHistory} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </Pressable>
        ) : null}
      </View>

      <FlatList
        contentContainerStyle={[styles.listContent, games.length === 0 && styles.emptyListContent]}
        data={games}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>{isLoading ? 'Loading games...' : 'No games yet'}</Text>
            <Text style={styles.emptyBody}>Finish a game from the counter to save it here.</Text>
          </View>
        }
        renderItem={({ item }) => <GameHistoryCard game={item} />}
      />
    </SafeAreaView>
  );
}

function GameHistoryCard({ game }: { game: GameRecord }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardDate}>{formatGameDate(game.createdAt)}</Text>
        <Text style={styles.cardWinner}>{formatWinner(game.winner)}</Text>
        {game.durationSeconds ? (
          <Text style={styles.cardDuration}>Timer: {formatDuration(game.durationSeconds)}</Text>
        ) : null}
      </View>

      <View style={styles.scoreRow}>
        <TeamResult label="Left" side="left" game={game} />
        <Text style={styles.scoreDivider}>-</Text>
        <TeamResult label="Right" side="right" game={game} />
      </View>
    </View>
  );
}

function TeamResult({
  game,
  label,
  side,
}: {
  game: GameRecord;
  label: string;
  side: TeamSide;
}) {
  return (
    <View style={styles.teamResult}>
      <View style={[styles.colorSwatch, { backgroundColor: game.scores[side].color }]} />
      <Text style={styles.teamLabel}>{label}</Text>
      <Text style={styles.teamScore}>{game.scores[side].score}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 22,
    borderWidth: 1,
    gap: 20,
    padding: 18,
  },
  cardDate: {
    color: '#CBD5E1',
    fontSize: 14,
    fontWeight: '700',
  },
  cardHeader: {
    gap: 6,
  },
  cardDuration: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '800',
  },
  cardWinner: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  clearButton: {
    backgroundColor: '#334155',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  colorSwatch: {
    borderColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 999,
    borderWidth: 1,
    height: 22,
    width: 22,
  },
  emptyBody: {
    color: '#94A3B8',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyListContent: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    flex: 1,
    gap: 8,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 18,
  },
  headerText: {
    color: '#E5E7EB',
    fontSize: 18,
    fontWeight: '800',
  },
  listContent: {
    gap: 14,
    padding: 18,
    paddingTop: 0,
  },
  safeArea: {
    backgroundColor: '#0F172A',
    flex: 1,
  },
  scoreDivider: {
    color: '#64748B',
    fontSize: 36,
    fontWeight: '900',
  },
  scoreRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'space-between',
  },
  teamLabel: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  teamResult: {
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  teamScore: {
    color: '#FFFFFF',
    fontSize: 44,
    fontWeight: '900',
  },
});
