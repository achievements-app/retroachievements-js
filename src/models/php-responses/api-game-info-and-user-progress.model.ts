import { ApiAchievement } from './api-achievement.model';

export interface ApiGameInfoAndUserProgress {
  ID: number;
  Title: string;
  ConsoleID: number;
  ForumTopicID: number;
  Flags: string | number;
  ImageIcon: string;
  ImageTitle: string;
  ImageIngame: string;
  ImageBoxArt: string;
  Publisher: string;
  Developer: string;
  Genre: string;
  Released: string;
  IsFinal: boolean;
  ConsoleName: string;
  RichPresencePatch: string;
  NumAchievements: number;
  NumDistinctPlayersCasual: string;
  NumDistinctPlayersHardcore: string;
  Achievements: { [achievementId: string]: ApiAchievement };
  NumAwardedToUser: number;
  NumAwardedToUserHardcore: number;
  UserCompletion: string;
  UserCompletionHardcore: string;
}
