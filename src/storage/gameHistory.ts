import AsyncStorage from '@react-native-async-storage/async-storage';

import type { GameRecord } from '../types/game';

const GAME_HISTORY_KEY = 'cornhole-counter:game-history';

export async function getGameHistory(): Promise<GameRecord[]> {
  const value = await AsyncStorage.getItem(GAME_HISTORY_KEY);

  if (!value) {
    return [];
  }

  try {
    const games = JSON.parse(value) as GameRecord[];
    return Array.isArray(games) ? games : [];
  } catch {
    return [];
  }
}

export async function saveGame(game: GameRecord): Promise<void> {
  const games = await getGameHistory();
  await AsyncStorage.setItem(GAME_HISTORY_KEY, JSON.stringify([game, ...games]));
}

export async function clearGameHistory(): Promise<void> {
  await AsyncStorage.removeItem(GAME_HISTORY_KEY);
}
