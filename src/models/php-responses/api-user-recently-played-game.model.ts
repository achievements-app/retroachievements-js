export interface ApiUserRecentlyPlayedGame {
  GameID: string;
  ConsoleID: string;
  ConsoleName: string;
  Title: string;
  ImageIcon: string;
  LastPlayed: string;
  MyVote: string | null;
  NumPossibleAchievements: string;
  PossibleScore: string;
  NumAchieved: string;
  ScoreAchieved: string;
  NumAchievedHardcore: string;
  ScoreAchievedHardcore: string;
}
