export type TeamSide = 'left' | 'right';

export const MAX_SCORE = 21;

export function clampScore(score: number) {
  return Math.min(MAX_SCORE, Math.max(0, score));
}

export type TeamScore = {
  score: number;
  color: string;
};

export type GameScores = Record<TeamSide, TeamScore>;

export type GameRecord = {
  id: string;
  createdAt: string;
  durationSeconds?: number;
  scores: GameScores;
  winner: TeamSide | 'tie';
};

export type ScoreAction = {
  side: TeamSide;
};
