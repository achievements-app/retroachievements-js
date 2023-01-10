export interface ApiUserGameCompletion {
  GameID: string;
  ConsoleName: string;
  ConsoleID: string;
  ImageIcon: string;
  Title: string;
  MaxPossible: string;
  'MAX(aw.HardcoreMode)': string;
  NumAwarded: string;
  NumAwardedHC: string;
  PctWon: string;
  PctWonHC: string;
}
