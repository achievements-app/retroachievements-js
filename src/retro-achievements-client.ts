import urlcat from 'urlcat';
import fetch from 'cross-fetch';
import camelcaseKeys from 'camelcase-keys';

import * as fromModels from './models';
import { sanitizeProps } from './util/sanitizeProps';

export class RetroAchievementsClient {
  private baseUrl = 'https://retroachievements.org/API';
  private apiKey: string;
  private userName: string;

  constructor(options: { userName: string; apiKey: string }) {
    this.apiKey = options.apiKey;
    this.userName = options.userName;
  }

  async getConsoleIds(): Promise<fromModels.ConsoleId[] | void> {
    const requestUrl = urlcat(this.baseUrl, 'API_GetConsoleIDs.php', {
      ...this.buildAuthParameters(),
    });

    try {
      const httpResponse = await fetch(requestUrl);
      const responseBody = (await httpResponse.json()) as fromModels.ApiConsoleId[];

      return camelcaseKeys(
        sanitizeProps(responseBody)
      ) as fromModels.ConsoleId[];
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

      return camelcaseKeys(sanitizeProps(responseBody));
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

      return camelcaseKeys(sanitizeProps(responseBody));
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

  async getUserProgressForGames(
    userName: string,
    gameIds: number[]
  ): Promise<fromModels.UserProgressForGame[] | void> {
    const requestUrl = urlcat(this.baseUrl, 'API_GetUserProgress.php', {
      ...this.buildAuthParameters(),
      u: userName,
      i: gameIds.join(', '),
    });

    try {
      const httpResponse = await fetch(requestUrl);
      const responseBody = (await httpResponse.json()) as {
        [key: string]: fromModels.ApiUserProgressForGame;
      };

      const progressItems: fromModels.UserProgressForGame[] = [];

      for (const [key, value] of Object.entries(responseBody)) {
        // A key of 0 means the game couldn't be found in the RetroAchievements system.
        if (key !== '0') {
          progressItems.push({
            ...camelcaseKeys(sanitizeProps(value)),
            gameId: Number(key),
          });
        }
      }

      return progressItems;
    } catch (err) {
      console.error(
        'RetroAchievements API: There was a problem retrieving the progress for these games.',
        err
      );
    }
  }

  async getUserRecentlyPlayedGames(
    userName: string,
    count?: number
  ): Promise<fromModels.UserRecentlyPlayedGame[] | void> {
    const requestUrl = urlcat(
      this.baseUrl,
      'API_GetUserRecentlyPlayedGames.php',
      {
        ...this.buildAuthParameters(),
        u: userName,
        c: count,
      }
    );

    try {
      const httpResponse = await fetch(requestUrl);
      const responseBody = (await httpResponse.json()) as fromModels.ApiUserRecentlyPlayedGame[];

      return camelcaseKeys(sanitizeProps(responseBody));
    } catch (err) {
      console.error(
        `RetroAchievements API: There was a problem retrieving the recently played games for user ${userName}.`,
        err
      );
    }
  }

  async getUserGameCompletionStats(
    userName: string
  ): Promise<fromModels.UserGameCompletion[] | void> {
    const requestUrl = urlcat(this.baseUrl, 'API_GetUserCompletedGames.php', {
      ...this.buildAuthParameters(),
      u: userName,
    });

    try {
      const httpResponse = await fetch(requestUrl);
      const responseBody = (await httpResponse.json()) as fromModels.ApiUserGameCompletion[];

      return camelcaseKeys(
        sanitizeProps(responseBody)
      ) as fromModels.UserGameCompletion[];
    } catch (err) {
      console.error(
        `RetroAchievements API: There was a problem retrieving the game completion stats for user ${userName}`,
        err
      );
    }
  }

  async getUserAchievementsEarnedOnDate(
    userName: string,
    date: Date
  ): Promise<fromModels.DatedAchievement[] | void> {
    const requestUrl = urlcat(
      this.baseUrl,
      'API_GetAchievementsEarnedOnDay.php',
      {
        ...this.buildAuthParameters(),
        u: userName,
        d: `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`,
      }
    );

    try {
      const httpResponse = await fetch(requestUrl);
      const responseBody = (await httpResponse.json()) as fromModels.ApiDatedAchievement[];

      return camelcaseKeys(
        sanitizeProps(responseBody)
      ) as fromModels.DatedAchievement[];
    } catch (err) {
      console.error(
        `RetroAchievements API: There was a problem retrieving achievements for user ${userName}.`
      );
    }
  }

  async getUserProgressForGameId(
    userName: string,
    gameId: number
  ): Promise<fromModels.GameInfoAndUserProgress | void> {
    const requestUrl = urlcat(
      this.baseUrl,
      'API_GetGameInfoAndUserProgress.php',
      {
        ...this.buildAuthParameters(),
        u: userName,
        g: gameId,
      }
    );

    try {
      const httpResponse = await fetch(requestUrl);
      const responseBody = (await httpResponse.json()) as fromModels.ApiGameInfoAndUserProgress;

      const sanitizedAchievements = this.sanitizeAchievements(
        responseBody.Achievements
      );

      const modifiedResponse: Partial<fromModels.ApiGameInfoAndUserProgress> = {
        ...responseBody,
      };

      delete modifiedResponse.Achievements;

      modifiedResponse.UserCompletion = modifiedResponse.UserCompletion?.replace(
        '%',
        ''
      );

      modifiedResponse.UserCompletionHardcore = modifiedResponse.UserCompletionHardcore?.replace(
        '%',
        ''
      );

      const sanitizedResponse = camelcaseKeys(sanitizeProps(modifiedResponse));
      sanitizedResponse.achievements = sanitizedAchievements;

      return sanitizedResponse;
    } catch (err) {
      console.error(
        `RetroAchievements API: There was a problem retrieving game progress for user ${userName} on game id ${gameId}.`
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
      achievements.push(camelcaseKeys(sanitizeProps(apiAchievement)));
    }

    return achievements;
  }

  private sanitizeApiGameInfo(
    apiGame: fromModels.ApiGameInfo | fromModels.ApiGameInfoExtended
  ) {
    return camelcaseKeys(sanitizeProps(apiGame));
  }
}
