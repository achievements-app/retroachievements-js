import { Achievement } from './achievement.model';

export interface GameInfoAndUserProgress {
  id: number;
  title: string;
  consoleId: number;
  forumTopicId: number;
  flags: number;
  imageIcon: string;
  imageTitle: string;
  imageIngame: string;
  publisher: string;
  developer: string;
  genre: string;
  released: Date;
  isFinal: boolean;
  consoleName: string;
  richPresencePatch: string;
  numAchievements: number;
  numDistinctPlayersCasual: number;
  numDistinctPlayersHardcore: number;
  achievements: Achievement[];
  numAwardedToUser: number;
  numAwardedToUserHardcore: number;
  userCompletion: number;
  userCompletionHardcore: number;
}
