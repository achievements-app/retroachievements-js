import urlcat from 'urlcat';
import fetch from 'isomorphic-unfetch';
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

  async getConsoleIds(): Promise<fromModels.ConsoleId[]> {
    const requestUrl = urlcat(this.baseUrl, 'API_GetConsoleIDs.php', {
      ...this.buildAuthParameters()
    });

    try {
      const responseBody = await this.loadResponseBody<
        fromModels.ApiConsoleId[]
      >(requestUrl);

      return camelcaseKeys(
        sanitizeProps(responseBody)
      ) as fromModels.ConsoleId[];
    } catch (err) {
      throw new Error(
        `RetroAchievements API: There was a problem retrieving the console IDs. ${err}`
      );
    }
  }

  async getUserRankAndScore(
    userName: string
  ): Promise<fromModels.UserRankAndScore> {
    const requestUrl = urlcat(this.baseUrl, 'API_GetUserRankAndScore.php', {
      ...this.buildAuthParameters(),
      u: userName
    });

    try {
      const responseBody = await this.loadResponseBody<
        fromModels.ApiUserRankAndScore
      >(requestUrl);

      if (responseBody.Score === null) {
        throw new Error(
          `RetroAchievements API: User ${userName} was not found.`
        );
      }

      return camelcaseKeys(sanitizeProps(responseBody));
    } catch (err) {
      throw new Error(
        `RetroAchievements API: There was a problem retrieving the rank and score for user ${userName}. ${err}`
      );
    }
  }

  async getGameInfoByGameId(gameId: number): Promise<fromModels.GameInfo> {
    const requestUrl = urlcat(this.baseUrl, 'API_GetGame.php', {
      ...this.buildAuthParameters(),
      i: gameId
    });

    try {
      const responseBody = await this.loadResponseBody<fromModels.ApiGameInfo>(
        requestUrl
      );

      if (responseBody.GameTitle === 'UNRECOGNISED') {
        throw 'Game not found';
      }

      return this.sanitizeApiGameInfo(responseBody) as fromModels.GameInfo;
    } catch (err) {
      throw new Error(
        `RetroAchievements API: There was a problem retrieving the game info for ID ${gameId}. ${err}`
      );
    }
  }

  async getExtendedGameInfoByGameId(
    gameId: number
  ): Promise<fromModels.GameInfoExtended> {
    const requestUrl = urlcat(this.baseUrl, 'API_GetGameExtended.php', {
      ...this.buildAuthParameters(),
      i: gameId
    });

    try {
      const responseBody = await this.loadResponseBody<
        fromModels.ApiGameInfoExtended
      >(requestUrl);

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
          : undefined
      };
    } catch (err) {
      throw new Error(
        `RetroAchievements API: There was a problem retrieving the extended game info for ID ${gameId}. ${err}`
      );
    }
  }

  async getGameListByConsoleId(
    consoleId: number
  ): Promise<fromModels.GameListEntity[]> {
    const requestUrl = urlcat(this.baseUrl, 'API_GetGameList.php', {
      ...this.buildAuthParameters(),
      i: consoleId
    });

    try {
      const responseBody = await this.loadResponseBody<
        fromModels.ApiGameListEntity[]
      >(requestUrl);

      return camelcaseKeys(sanitizeProps(responseBody));
    } catch (err) {
      throw new Error(
        `RetroAchievements API: There was a problem retrieving the game list for console ID ${consoleId}. ${err}`
      );
    }
  }

  async getTopTenUsers(): Promise<fromModels.TopTenUser[]> {
    const requestUrl = urlcat(this.baseUrl, 'API_GetTopTenUsers.php', {
      ...this.buildAuthParameters()
    });

    try {
      const responseBody = await this.loadResponseBody<
        fromModels.ApiTopTenUser[]
      >(requestUrl);

      return responseBody.map(apiUser => ({
        userName: apiUser['1'],
        points: Number(apiUser['2']),
        retroRatioPoints: Number(apiUser['3'])
      }));
    } catch (err) {
      throw new Error(
        `RetroAchievements API: There was a problem retrieving the top ten users. ${err}`
      );
    }
  }

  async getUserProgressForGames(
    userName: string,
    gameIds: number[]
  ): Promise<fromModels.UserProgressForGame[]> {
    const requestUrl = urlcat(this.baseUrl, 'API_GetUserProgress.php', {
      ...this.buildAuthParameters(),
      u: userName,
      i: gameIds.join(', ')
    });

    try {
      const responseBody = await this.loadResponseBody<{
        [key: string]: fromModels.ApiUserProgressForGame;
      }>(requestUrl);

      const progressItems: fromModels.UserProgressForGame[] = [];

      for (const [key, value] of Object.entries(responseBody)) {
        // A key of 0 means the game couldn't be found in the RetroAchievements system.
        if (key !== '0') {
          progressItems.push({
            ...camelcaseKeys(sanitizeProps(value)),
            gameId: Number(key)
          });
        }
      }

      return progressItems;
    } catch (err) {
      throw new Error(
        `RetroAchievements API: There was a problem retrieving the progress for games ${gameIds.join(
          ', '
        )}. ${err}`
      );
    }
  }

  async getUserRecentlyPlayedGames(
    userName: string,
    count?: number
  ): Promise<fromModels.UserRecentlyPlayedGame[]> {
    const requestUrl = urlcat(
      this.baseUrl,
      'API_GetUserRecentlyPlayedGames.php',
      {
        ...this.buildAuthParameters(),
        u: userName,
        c: count
      }
    );

    try {
      const responseBody = await this.loadResponseBody<
        fromModels.ApiUserRecentlyPlayedGame[]
      >(requestUrl);

      return camelcaseKeys(sanitizeProps(responseBody));
    } catch (err) {
      throw new Error(
        `RetroAchievements API: There was a problem retrieving the recently played games for user ${userName}. ${err}`
      );
    }
  }

  async getUserGameCompletionStats(
    userName: string
  ): Promise<fromModels.UserGameCompletion[]> {
    const requestUrl = urlcat(this.baseUrl, 'API_GetUserCompletedGames.php', {
      ...this.buildAuthParameters(),
      u: userName
    });

    try {
      const responseBody = await this.loadResponseBody<
        fromModels.ApiUserGameCompletion[]
      >(requestUrl);

      return camelcaseKeys(
        sanitizeProps(responseBody)
      ) as fromModels.UserGameCompletion[];
    } catch (err) {
      throw new Error(
        `RetroAchievements API: There was a problem retrieving the game completion stats for user ${userName}. ${err}`
      );
    }
  }

  async getAchievementDistributionForGameId(
    gameId: number,
    isHardcoreOnly: boolean
  ): Promise<Record<string, number>> {
    const requestUrl = urlcat(
      this.baseUrl,
      'API_GetAchievementDistribution.php',
      {
        ...this.buildAuthParameters(),
        i: gameId,
        h: isHardcoreOnly ? 1 : 0
      }
    );

    return await this.loadResponseBody<Record<string, number>>(requestUrl);
  }

  async getUserAchievementsEarnedBetweenDates(
    userName: string,
    dateFrom: Date,
    dateTo: Date
  ): Promise<fromModels.DatedAchievement[]> {
    const requestUrl = urlcat(
      this.baseUrl,
      'API_GetAchievementsEarnedBetween.php',
      {
        ...this.buildAuthParameters(),
        u: userName,
        f: `${dateFrom.getUTCFullYear()}-${dateFrom.getUTCMonth()}-${dateFrom.getUTCDate()}`,
        t: `${dateTo.getUTCFullYear()}-${dateTo.getUTCMonth()}-${dateTo.getUTCDate()}`
      }
    );

    try {
      const responseBody = await this.loadResponseBody<
        fromModels.ApiDatedAchievement[]
      >(requestUrl);

      return camelcaseKeys(
        sanitizeProps(responseBody)
      ) as fromModels.DatedAchievement[];
    } catch (err) {
      throw new Error(
        `RetroAchievements API: There was a problem retrieving achievements for user ${userName}. ${err}`
      );
    }
  }

  async getUserAchievementsEarnedOnDate(
    userName: string,
    date: Date
  ): Promise<fromModels.DatedAchievement[]> {
    const requestUrl = urlcat(
      this.baseUrl,
      'API_GetAchievementsEarnedOnDay.php',
      {
        ...this.buildAuthParameters(),
        u: userName,
        d: `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`
      }
    );

    try {
      const responseBody = await this.loadResponseBody<
        fromModels.ApiDatedAchievement[]
      >(requestUrl);

      return camelcaseKeys(
        sanitizeProps(responseBody)
      ) as fromModels.DatedAchievement[];
    } catch (err) {
      throw new Error(
        `RetroAchievements API: There was a problem retrieving achievements for user ${userName}. ${err}`
      );
    }
  }

  async getUserProgressForGameId(
    userName: string,
    gameId: number
  ): Promise<fromModels.GameInfoAndUserProgress> {
    const requestUrl = urlcat(
      this.baseUrl,
      'API_GetGameInfoAndUserProgress.php',
      {
        ...this.buildAuthParameters(),
        u: userName,
        g: gameId
      }
    );

    try {
      const responseBody = await this.loadResponseBody<
        fromModels.ApiGameInfoAndUserProgress
      >(requestUrl);

      const sanitizedAchievements = this.sanitizeAchievements(
        responseBody.Achievements
      );

      const modifiedResponse: Partial<fromModels.ApiGameInfoAndUserProgress> = {
        ...responseBody
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
      throw new Error(
        `RetroAchievements API: There was a problem retrieving game progress for user ${userName} on game id ${gameId}. ${err}`
      );
    }
  }

  async getUserSummary(
    userName: string,
    numberOfRecentGames?: number
  ): Promise<fromModels.UserSummary> {
    const requestUrl = urlcat(this.baseUrl, 'API_GetUserSummary.php', {
      ...this.buildAuthParameters(),
      u: userName,
      g: numberOfRecentGames
    });

    try {
      const responseBody = await this.loadResponseBody<
        fromModels.ApiUserSummary
      >(requestUrl);

      const sanitizedRecentlyPlayed = camelcaseKeys(
        sanitizeProps(responseBody.RecentlyPlayed)
      );

      const sanitizedAwarded = this.sanitizeAwarded(responseBody.Awarded);

      const sanitizedRecentAchievements = this.sanitizeRecentAchievements(
        responseBody.RecentAchievements
      );

      const modifiedResponse: Partial<fromModels.ApiUserSummary> = {
        ...responseBody
      };

      delete modifiedResponse.RecentlyPlayed;
      delete modifiedResponse.Awarded;
      delete modifiedResponse.RecentAchievements;

      const sanitizedResponse = {
        ...camelcaseKeys(sanitizeProps(modifiedResponse)),
        recentlyPlayed: sanitizedRecentlyPlayed,
        recentAchievements: sanitizedRecentAchievements,
        awarded: sanitizedAwarded
      };

      return sanitizedResponse;
    } catch (err) {
      throw new Error(
        `RetroAchievements API: There was a problem retrieving the user summary for user ${userName}. ${err}`
      );
    }
  }

  private buildAuthParameters() {
    return {
      z: this.userName,
      y: this.apiKey
    };
  }

  private async loadResponseBody<T>(requestUrl: string): Promise<T> {
    const httpResponse = await fetch(requestUrl);
    const responseBody = (await httpResponse.json()) as T;

    return responseBody;
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

  private sanitizeAwarded(apiAwardedList: {
    [gameId: string]: fromModels.ApiUserProgressForGame;
  }) {
    const awarded: fromModels.UserProgressForGame[] = [];

    for (const [gameId, apiAwarded] of Object.entries(apiAwardedList)) {
      awarded.push({
        gameId: Number(gameId),
        ...camelcaseKeys(sanitizeProps(apiAwarded))
      });
    }

    return awarded;
  }

  private sanitizeApiGameInfo(
    apiGame: fromModels.ApiGameInfo | fromModels.ApiGameInfoExtended
  ) {
    return camelcaseKeys(sanitizeProps(apiGame));
  }

  private sanitizeRecentAchievements(apiRecentAchievements: {
    [gameId: string]: {
      [achievementId: string]: fromModels.ApiAchievement;
    };
  }) {
    const recentAchievements: fromModels.Achievement[] = [];

    for (const [_, apiGameAchievements] of Object.entries(
      apiRecentAchievements
    )) {
      for (const [_, apiAchievement] of Object.entries(apiGameAchievements)) {
        recentAchievements.push(camelcaseKeys(sanitizeProps(apiAchievement)));
      }
    }

    return recentAchievements;
  }
}
