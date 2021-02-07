export interface Achievement {
  id: number;
  numAwarded: number;
  numAwardedHardcore: number;
  title: string;
  description: string;
  points: number;
  trueRatio: number;
  author: string;
  dateModified: Date;
  dateCreated: Date;
  badgeName: number;
  displayOrder: number;
  memAddr: string;
  gameId?: number;
  gameTitle?: string;
  isAwarded?: number;
  dateAwarded?: Date;
  hardcoreAchieved?: number;
}
