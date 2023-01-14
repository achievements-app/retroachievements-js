export interface UserRecentlyPlayedGame {
  gameId: number;
  consoleId: number;
  consoleName: string;
  title: string;
  imageIcon: string;
  lastPlayed: Date;
  myVote: number | null;
  numPossibleAchievements: number;
  possibleScore: number;
  numAchieved: number;
  scoreAchieved: number;
  numAchievedHardcore: number;
  scoreAchievedHardcore: string;
}
