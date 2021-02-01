import { rest } from 'msw';
import { setupServer, SetupServerApi } from 'msw/node';

import * as fromModels from '../src/models';
import { RetroAchievementsClient } from '../src/retro-achievements-client';

describe('RetroAchievementsClient', () => {
  let client: RetroAchievementsClient;
  let server: SetupServerApi;

  beforeEach(() => {
    client = new RetroAchievementsClient('mockUserName', 'mockApiKey');
  });

  afterEach(() => {
    if (server) {
      server.close();
    }
  });

  it('instantiates without crashing', () => {
    // ASSERT
    expect(client).toBeDefined();
  });

  describe('getConsoleIds', () => {
    it('gets a list of all the console ids', async () => {
      // ARRANGE
      const mockConsoleIds: fromModels.ApiConsoleId[] = [
        {
          ID: '1',
          Name: 'Mega Drive',
        },
        {
          ID: '2',
          Name: 'Nintendo 64',
        },
      ];

      server = setupServer(
        rest.get(
          'https://retroachievements.org/API/API_GetConsoleIDs.php',
          (_, res, ctx) => {
            return res(ctx.json(mockConsoleIds));
          }
        )
      );

      server.listen();

      // ACT
      const consoleIds = await client.getConsoleIds();

      // ASSERT
      expect(consoleIds).toHaveLength(2);
      expect(consoleIds).toContainEqual({
        id: 1,
        name: 'Mega Drive',
      });
    });
  });

  describe('getUserRankAndScore', () => {
    it('gets the user rank and score', async () => {
      // ARRANGE
      const mockUserRankAndScore: fromModels.ApiUserRankAndScore = {
        Score: 6756,
        Rank: '4655',
        TotalRanked: '88613',
      };

      server = setupServer(
        rest.get(
          'https://retroachievements.org/API/API_GetUserRankAndScore.php',
          (_, res, ctx) => {
            return res(ctx.json(mockUserRankAndScore));
          }
        )
      );

      server.listen();

      // ACT
      const userRankAndScore = (await client.getUserRankAndScore(
        'MockUser'
      )) as fromModels.UserRankAndScore;

      // ASSERT
      expect(userRankAndScore).toBeDefined();
      expect(userRankAndScore.score).toEqual(6756);
      expect(userRankAndScore.rank).toEqual(4655);
      expect(userRankAndScore.totalRanked).toEqual(88613);
    });

    it('returns null if the requested user is not found', async () => {
      // ARRANGE
      const consoleErrorSpy = spyOn(console, 'error');

      const mockUserRankAndScore: fromModels.ApiUserRankAndScore = {
        Score: null,
        Rank: '1',
        TotalRanked: '88613',
      };

      server = setupServer(
        rest.get(
          'https://retroachievements.org/API/API_GetUserRankAndScore.php',
          (_, res, ctx) => {
            return res(ctx.json(mockUserRankAndScore));
          }
        )
      );

      server.listen();

      // ACT
      const userRankAndScore = (await client.getUserRankAndScore(
        'MockUser'
      )) as fromModels.UserRankAndScore;

      // ASSERT
      expect(userRankAndScore).toBeUndefined();
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('getGameInfoByGameId', () => {
    it('given a game id, returns the game info', async () => {
      // ARRANGE
      const mockGameInfo: fromModels.ApiGameInfo = {
        Title: 'Super Mario Land',
        ForumTopicID: '111',
        ConsoleID: '4',
        ConsoleName: 'Game Boy',
        Flags: null,
        ImageIcon: '/Images/024529.png',
        GameIcon: '/Images/024529.png',
        ImageTitle: '/Images/033032.png',
        ImageIngame: '/Images/033033.png',
        ImageBoxArt: '/Images/024327.png',
        Publisher: 'Nintendo',
        Developer: 'Nintendo',
        Genre: 'Platformer',
        Released: 'April 21, 1989',
        GameTitle: 'Super Mario Land',
        Console: 'Game Boy',
      };

      server = setupServer(
        rest.get(
          'https://retroachievements.org/API/API_GetGame.php',
          (_, res, ctx) => {
            return res(ctx.json(mockGameInfo));
          }
        )
      );

      server.listen();

      // ACT
      const gameInfo = (await client.getGameInfoByGameId(
        504
      )) as fromModels.GameInfo;

      // ASSERT
      expect(gameInfo).toBeDefined();
      expect(gameInfo.consoleId).toEqual(4);
      expect(gameInfo.forumTopicId).toEqual(111);
      expect(gameInfo.gameTitle).toEqual('Super Mario Land');
    });

    it('throws an error and has no return if the game is not found', async () => {
      // ARRANGE
      const consoleErrorSpy = spyOn(console, 'error');

      const mockGameInfo: fromModels.ApiGameInfo = {
        GameTitle: 'UNRECOGNISED',
        ConsoleID: null,
        Console: null,
        ForumTopicID: null,
      };

      server = setupServer(
        rest.get(
          'https://retroachievements.org/API/API_GetGame.php',
          (_, res, ctx) => {
            return res(ctx.json(mockGameInfo));
          }
        )
      );

      server.listen();

      // ACT
      const gameInfo = (await client.getGameInfoByGameId(
        504
      )) as fromModels.GameInfo;

      // ASSERT
      expect(gameInfo).not.toBeDefined();
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('getGameInfoExtendedByGameId', () => {
    it('given a game id, returns the extended game info', async () => {
      // ARRANGE
      const mockAchievementOne: fromModels.ApiAchievement = {
        ID: '1144',
        NumAwarded: '5632',
        NumAwardedHardcore: '2604',
        Title: 'Mushroom Man',
        Description: 'Grab a mushroom',
        Points: '1',
        TrueRatio: '1',
        Author: 'qwe',
        DateModified: '2020-02-24 20:25:25',
        DateCreated: '2013-05-22 13:12:10',
        BadgeName: '109695',
        DisplayOrder: '1',
        MemAddr: 'ce2ebf6f40272f66b1c0dc972f18665d',
      };

      const mockAchievementTwo: fromModels.ApiAchievement = {
        ID: '75397',
        NumAwarded: '3071',
        NumAwardedHardcore: '1408',
        Title: 'Weaponized Balls',
        Description:
          'Grab a Superball Flower from an item box and obtain the Superball ability',
        Points: '2',
        TrueRatio: '2',
        Author: 'stfN1337',
        DateModified: '2020-02-24 20:25:27',
        DateCreated: '2019-04-11 22:41:01',
        BadgeName: '109696',
        DisplayOrder: '2',
        MemAddr: '67f757eb24b56b2f0205ce502bcee91c',
      };

      const mockGameInfoExtended: fromModels.ApiGameInfoExtended = {
        ID: 504,
        Title: 'Super Mario Land',
        ConsoleID: 4,
        ForumTopicID: 111,
        Flags: 0,
        ImageIcon: '/Images/024529.png',
        ImageTitle: '/Images/033032.png',
        ImageIngame: '/Images/033033.png',
        ImageBoxArt: '/Images/024327.png',
        Publisher: 'Nintendo',
        Developer: 'Nintendo',
        Genre: 'Platformer',
        Released: 'April 21, 1989',
        IsFinal: false,
        ConsoleName: 'Game Boy',
        RichPresencePatch: 'c8803c3f8aa144cdcce92e96b7abedfb',
        NumAchievements: 37,
        NumDistinctPlayersCasual: '5632',
        NumDistinctPlayersHardcore: '2604',
        Achievements: {
          1144: mockAchievementOne,
          75397: mockAchievementTwo,
        },
      };

      server = setupServer(
        rest.get(
          'https://retroachievements.org/API/API_GetGameExtended.php',
          (_, res, ctx) => {
            return res(ctx.json(mockGameInfoExtended));
          }
        )
      );

      server.listen();

      // ACT
      const gameInfoExtended = (await client.getGameInfoExtendedByGameId(
        504
      )) as fromModels.GameInfoExtended;

      // ASSERT
      expect(gameInfoExtended).toBeDefined();
      expect(gameInfoExtended.achievements).toHaveLength(2);
      expect(gameInfoExtended.consoleName).toEqual('Game Boy');
      expect(gameInfoExtended.id).toEqual(504);
      expect(gameInfoExtended.achievements[0].title).toEqual('Mushroom Man');
    });

    it('throws an error and has no return if the game is not found', async () => {
      // ARRANGE
      const consoleErrorSpy = spyOn(console, 'error');

      const mockGameInfoExtended: fromModels.ApiGameInfoExtended = {
        Achievements: [],
        RichPresencePatch: 'd41d8cd98f00b204e9800998ecf8427e',
      };

      server = setupServer(
        rest.get(
          'https://retroachievements.org/API/API_GetGameExtended.php',
          (_, res, ctx) => {
            return res(ctx.json(mockGameInfoExtended));
          }
        )
      );

      server.listen();

      // ACT
      const gameInfoExtended = (await client.getGameInfoExtendedByGameId(
        504
      )) as fromModels.GameInfoExtended;

      // ASSERT
      expect(gameInfoExtended).not.toBeDefined();
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });
  });
});
