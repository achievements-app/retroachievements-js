import { Achievement } from './achievement.model';
import { GameInfo } from './game-info.model';

export interface GameInfoExtended extends Partial<GameInfo> {
  richPresencePatch: string;
  achievements: Achievement[];
  id?: number;
  isFinal?: boolean;
  numAchievements?: number;
  numDistinctPlayersCasual?: number;
  numDistinctPlayersHardcore?: number;
}
