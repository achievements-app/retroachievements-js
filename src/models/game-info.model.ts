export interface GameInfo {
  gameTitle: string;
  consoleId: number | null;
  console: string | null;
  forumTopicId: number | null;
  title?: string;
  consoleName?: string;
  flags?: number | null; // Should this be number[]?
  imageIcon?: string;
  gameIcon?: string;
  imageTitle?: string;
  imageIngame?: string;
  imageBoxArt?: string;
  publisher?: string;
  developer?: string;
  genre?: string;
  released?: Date;
}
