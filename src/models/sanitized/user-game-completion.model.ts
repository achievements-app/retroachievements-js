export interface UserGameCompletion {
  gameId: number;
  consoleName: string;
  imageIcon: string;
  title: string;
  numAwarded: number;
  maxPossible: number;
  pctWon: number;
  hardcoreMode: number;
}
