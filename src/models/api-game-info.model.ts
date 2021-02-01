export interface ApiGameInfo {
  GameTitle: string;
  ConsoleID: string | null;
  Console: string | null;
  ForumTopicID: string | null;
  Title?: string;
  ConsoleName?: string;
  Flags?: string | null;
  ImageIcon?: string;
  GameIcon?: string;
  ImageTitle?: string;
  ImageIngame?: string;
  ImageBoxArt?: string;
  Publisher?: string;
  Developer?: string;
  Genre?: string;
  Released?: string;
}
