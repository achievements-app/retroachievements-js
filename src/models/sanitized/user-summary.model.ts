import { GameInfoExtended } from './game-info-extended.model';
import { UserProgressForGame } from './user-progress-for-game.model';
import { UserRecentlyPlayedGame } from './user-recently-played-game.model';

export interface UserSummary {
  recentlyPlayedCount: number;
  recentlyPlayed: Partial<UserRecentlyPlayedGame>[];
  memberSince: Date;
  lastActivity: {
    id: number;
    timestamp: Date;
    lastUpdate: Date;
    activityType: number;
    user: string;
  };
  richPresenceMsg: string;
  lastGameId: number;
  lastGame: Partial<GameInfoExtended>;
  contribCount: number;
  contribYield: number;
  totalPoints: number;
  totalTruePoints: number;
  permissions: number;
  untracked: number;
  id: number;
  userWallActive: number;
  motto: string;
  rank: number;
  awarded: UserProgressForGame[];
  recentAchievements: {
    id: number;
    gameId: number;
    gameTitle: string;
    title: string;
    description: string;
    points: number;
    badgeName: number;
    isAwarded: number;
    dateAwarded: Date;
    hardcoreAchieved: number;
  }[];
  points: number;
  userPic: string;
  totalRanked: number;
  status: string;
}
