export interface UserGameCompletion {
  gameId: number;
  consoleName: string;
  consoleId: number;
  imageIcon: string;
  title: string;
  maxPossible: number;
  'max(awHardcoreMode)': number;
  numAwarded: number;
  numAwardedHc: number;
  pctWon: number;
  pctWonHc: number;
}
