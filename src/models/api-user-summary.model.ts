import { ApiAchievement } from './api-achievement.model';
import { ApiGameInfoExtended } from './api-game-info-extended.model';
import { ApiUserProgressForGame } from './api-user-progress-for-game.model';
import { ApiUserRecentlyPlayedGame } from './api-user-recently-played-game.model';

export interface ApiUserSummary {
  RecentlyPlayedCount: number;
  RecentlyPlayed: Partial<ApiUserRecentlyPlayedGame>[];
  MemberSince: string;
  LastActivity: {
    ID: string;
    timestamp: string;
    lastupdate: string;
    activitytype: string;
    User: string;
    data: any;
    data2: any;
  };
  RichPresenceMsg: string;
  LastGameID: string;
  LastGame: Partial<ApiGameInfoExtended>;
  ContribCount: string;
  ContribYield: string;
  TotalPoints: string;
  TotalTruePoints: string;
  Permissions: string;
  Untracked: string;
  ID: string;
  UserWallActive: string;
  Motto: string;
  Rank: string;
  Awarded: {
    [gameId: string]: ApiUserProgressForGame;
  }[];
  RecentAchievements: {
    [gameId: string]: {
      [achievementId: string]: ApiAchievement;
    };
  };
  Points: string;
  UserPic: string;
  TotalRanked: string;
  Status: string;
}
