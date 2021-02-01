import { ApiAchievement } from './api-achievement.model';
import { ApiGameInfo } from './api-game-info.model';

export interface ApiGameInfoExtended extends Partial<ApiGameInfo> {
  RichPresencePatch: string;
  Achievements:
    | any[]
    | {
        [name: string]: ApiAchievement;
      };

  ID?: number;
  IsFinal?: boolean;
  NumAchievements?: number;
  NumDistinctPlayersCasual?: string;
  NumDistinctPlayersHardcore?: string;
}
