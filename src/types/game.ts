export type TeamSide = 'left' | 'right';

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
