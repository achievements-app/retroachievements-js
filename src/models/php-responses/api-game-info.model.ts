export interface ApiGameInfo {
  GameTitle: string;
  ConsoleID: string | number | null;
  Console: string | null;
  ForumTopicID: string | number | null;
  Title?: string;
  ConsoleName?: string;
  Flags?: string | number | null;
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
