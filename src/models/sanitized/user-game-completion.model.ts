export interface UserGameCompletion {
  gameId: number;
  consoleName: string;
  consoleId: number;
  imageIcon: string;
  title: string;
  maxPossible: number;
  numAwarded: number;
  pctWon: number;
  hardcoreMode: number;
}
