import urlcat from 'urlcat';
import fetch from 'cross-fetch';

import * as fromModels from './models';

export class RetroAchievementsClient {
  private baseUrl = 'https://retroachievements.org/API';

  constructor(private userName: string, private apiKey: string) {}

  async getConsoleIds(): Promise<fromModels.ConsoleId[] | void> {
    const requestUrl = urlcat(this.baseUrl, 'API_GetConsoleIDs.php', {
      ...this.buildAuthParameters(),
    });

    try {
      const httpResponse = await fetch(requestUrl);
      const responseBody = (await httpResponse.json()) as fromModels.ApiConsoleId[];

      return responseBody.map(apiConsoleId => ({
        id: Number(apiConsoleId.ID),
        name: apiConsoleId.Name,
      }));
    } catch (err) {
      console.error(
        'RetroAchievements API: There was a problem retrieving the console IDs.',
        err
      );
    }
  }

  async getUserRankAndScore(
    userName: string
  ): Promise<fromModels.UserRankAndScore | null | void> {
    const requestUrl = urlcat(this.baseUrl, 'API_GetUserRankAndScore.php', {
      ...this.buildAuthParameters(),
      u: userName,
    });

    try {
      const httpResponse = await fetch(requestUrl);
      const responseBody = (await httpResponse.json()) as fromModels.ApiUserRankAndScore;

      if (responseBody.Score === null) {
        throw 'User not found';
      }

      return {
        score: responseBody.Score,
        rank: Number(responseBody.Rank),
        totalRanked: Number(responseBody.TotalRanked),
      };
    } catch (err) {
      console.error(
        `RetroAchievements API: There was a problem retrieving the rank and score for user ${userName}.`,
        err
      );
    }
  }

  async getGameInfoByGameId(
    gameId: number
  ): Promise<fromModels.GameInfo | void> {
    const requestUrl = urlcat(this.baseUrl, 'API_GetGame.php', {
      ...this.buildAuthParameters(),
      i: gameId,
    });

    try {
      const httpResponse = await fetch(requestUrl);
      const responseBody = (await httpResponse.json()) as fromModels.ApiGameInfo;

      if (responseBody.GameTitle === 'UNRECOGNISED') {
        throw 'Game not found';
      }

      return this.sanitizeApiGameInfo(responseBody) as fromModels.GameInfo;
    } catch (err) {
      console.error(
        `RetroAchievements API: There was a problem retrieving the game info for ID ${gameId}`,
        err
      );
    }
  }

  async getGameInfoExtendedByGameId(
    gameId: number
  ): Promise<fromModels.GameInfoExtended | void> {
    const requestUrl = urlcat(this.baseUrl, 'API_GetGameExtended.php', {
      ...this.buildAuthParameters(),
      i: gameId,
    });

    try {
      const httpResponse = await fetch(requestUrl);
      const responseBody = (await httpResponse.json()) as fromModels.ApiGameInfoExtended;

      if (responseBody.ID === undefined) {
        throw 'Game not found';
      }

      return {
        ...this.sanitizeApiGameInfo(responseBody),
        achievements: this.sanitizeAchievements(responseBody.Achievements),
        richPresencePatch: responseBody.RichPresencePatch,
        id: responseBody.ID ? Number(responseBody.ID) : undefined,
        isFinal: responseBody?.IsFinal,
        numAchievements: responseBody.NumAchievements
          ? Number(responseBody.NumAchievements)
          : undefined,
        numDistinctPlayersCasual: responseBody.NumDistinctPlayersCasual
          ? Number(responseBody.NumDistinctPlayersCasual)
          : undefined,
        numDistinctPlayersHardcore: responseBody.NumDistinctPlayersHardcore
          ? Number(responseBody.NumDistinctPlayersHardcore)
          : undefined,
      };
    } catch (err) {
      console.error(
        `RetroAchievements API: There was a problem retrieving the extended game info for ID ${gameId}`,
        err
      );
    }
  }

  async getGameListByConsoleId(
    consoleId: number
  ): Promise<fromModels.GameListEntity[] | void> {
    const requestUrl = urlcat(this.baseUrl, 'API_GetGameList.php', {
      ...this.buildAuthParameters(),
      i: consoleId,
    });

    try {
      const httpResponse = await fetch(requestUrl);
      const responseBody = (await httpResponse.json()) as fromModels.ApiGameListEntity[];

      return responseBody.map(apiGameListEntity => ({
        title: apiGameListEntity.Title,
        id: Number(apiGameListEntity.ID),
        consoleId: Number(apiGameListEntity.ConsoleID),
        imageIcon: apiGameListEntity.ImageIcon,
        consoleName: apiGameListEntity.ConsoleName,
      }));
    } catch (err) {
      console.error(
        'RetroAchievements API: There was a problem retrieving the console game list.',
        err
      );
    }
  }

  async getTopTenUsers(): Promise<fromModels.TopTenUser[] | void> {
    const requestUrl = urlcat(this.baseUrl, 'API_GetTopTenUsers.php', {
      ...this.buildAuthParameters(),
    });

    try {
      const httpResponse = await fetch(requestUrl);
      const responseBody = (await httpResponse.json()) as fromModels.ApiTopTenUser[];

      return responseBody.map(apiUser => ({
        userName: apiUser['1'],
        points: Number(apiUser['2']),
        retroRatioPoints: Number(apiUser['3']),
      }));
    } catch (err) {
      console.error(
        'RetroAchievements API: There was a problem retrieving the top ten users.',
        err
      );
    }
  }

  private buildAuthParameters() {
    return {
      z: this.userName,
      y: this.apiKey,
    };
  }

  private sanitizeAchievements(
    apiAchievements:
      | any[]
      | {
          [name: string]: fromModels.ApiAchievement;
        }
  ) {
    const achievements: fromModels.Achievement[] = [];

    for (const [_, apiAchievement] of Object.entries(apiAchievements)) {
      achievements.push({
        id: Number(apiAchievement.ID),
        numAwarded: Number(apiAchievement.NumAwarded),
        numAwardedHardcore: Number(apiAchievement.NumAwardedHardcore),
        title: apiAchievement.Title,
        description: apiAchievement.Description,
        points: Number(apiAchievement.Points),
        trueRatio: Number(apiAchievement.TrueRatio),
        author: apiAchievement.Author,
        dateModified: new Date(apiAchievement.DateModified),
        dateCreated: new Date(apiAchievement.DateCreated),
        badgeName: Number(apiAchievement.BadgeName),
        displayOrder: Number(apiAchievement.DisplayOrder),
        memAddr: apiAchievement.MemAddr,
      });
    }

    return achievements;
  }

  private sanitizeApiGameInfo(
    apiGame: fromModels.ApiGameInfo | fromModels.ApiGameInfoExtended
  ) {
    return {
      gameTitle: apiGame.GameTitle,
      consoleId: apiGame.ConsoleID ? Number(apiGame.ConsoleID) : null,
      console: apiGame.Console,
      forumTopicId: apiGame.ForumTopicID ? Number(apiGame.ForumTopicID) : null,
      title: apiGame?.Title,
      consoleName: apiGame?.ConsoleName,
      flags: apiGame.Flags ? Number(apiGame.Flags) : null,
      imageIcon: apiGame?.ImageIcon,
      gameIcon: apiGame?.GameIcon,
      imageTitle: apiGame?.ImageTitle,
      imageIngame: apiGame?.ImageIngame,
      imageBoxArt: apiGame?.ImageBoxArt,
      publisher: apiGame?.Publisher,
      developer: apiGame?.Developer,
      genre: apiGame?.Genre,
      released: apiGame.Released ? new Date(apiGame.Released) : undefined,
    };
  }
}
