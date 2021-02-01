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
  });
});
