import { rest } from 'msw';
import { setupServer, SetupServerApi } from 'msw/node';

import * as fromModels from '../src/models';
import { RetroAchievementsClient } from '../src/retro-achievements-client';

describe('RetroAchievementsClient', () => {
  let client: RetroAchievementsClient;
  let server: SetupServerApi;

  beforeEach(() => {
    client = new RetroAchievementsClient({
      userName: 'MockUserName',
      apiKey: 'MockApiKey',
    });
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

  describe('getGameListByConsoleId', () => {
    it('gets a list of all the console ids', async () => {
      // ARRANGE
      const mockGameList: fromModels.ApiGameListEntity[] = [
        {
          Title: '16t',
          ID: '8265',
          ConsoleID: '1',
          ImageIcon: '/Images/000001.png',
          ConsoleName: 'Mega Drive',
        },
        {
          Title: '3 Ninjas Kick Back',
          ID: '397',
          ConsoleID: '1',
          ImageIcon: '/Images/039030.png',
          ConsoleName: 'Mega Drive',
        },
      ];

      server = setupServer(
        rest.get(
          'https://retroachievements.org/API/API_GetGameList.php',
          (_, res, ctx) => {
            return res(ctx.json(mockGameList));
          }
        )
      );

      server.listen();

      // ACT
      const gameList = await client.getGameListByConsoleId(1);

      // ASSERT
      expect(gameList).toHaveLength(2);
      expect(gameList).toEqual([
        {
          consoleId: 1,
          consoleName: 'Mega Drive',
          id: 8265,
          imageIcon: '/Images/000001.png',
          title: '16t',
        },
        {
          consoleId: 1,
          consoleName: 'Mega Drive',
          id: 397,
          imageIcon: '/Images/039030.png',
          title: '3 Ninjas Kick Back',
        },
      ]);
    });
  });

  describe('getTopTenUsers', () => {
    it('gets a list of the top ten users on the site', async () => {
      // ARRANGE
      const mockTopTen: fromModels.ApiTopTenUser[] = [
        {
          '1': 'MaxMilyin',
          '2': '484223',
          '3': '1445229',
        },
        {
          '1': 'HippopotamusRex',
          '2': '452006',
          '3': '1640777',
        },
        {
          '1': 'Wendigo',
          '2': '304245',
          '3': '1208458',
        },
        {
          '1': 'BerserkerBR',
          '2': '302996',
          '3': '908360',
        },
        {
          '1': 'Sarconius',
          '2': '290574',
          '3': '1229416',
        },
        {
          '1': 'Andrey199650',
          '2': '283193',
          '3': '636198',
        },
        {
          '1': 'Xymjak',
          '2': '260148',
          '3': '959388',
        },
        {
          '1': 'FabricioPrie',
          '2': '257027',
          '3': '615678',
        },
        {
          '1': 'Veritasu',
          '2': '250336',
          '3': '589807',
        },
        {
          '1': 'mikeisafighter',
          '2': '237742',
          '3': '837535',
        },
      ];

      server = setupServer(
        rest.get(
          'https://retroachievements.org/API/API_GetTopTenUsers.php',
          (_, res, ctx) => {
            return res(ctx.json(mockTopTen));
          }
        )
      );

      server.listen();

      // ACT
      const topTen = (await client.getTopTenUsers()) as fromModels.TopTenUser[];

      // ASSERT
      expect(topTen).toHaveLength(10);
      expect(topTen[0]).toEqual({
        points: 484223,
        retroRatioPoints: 1445229,
        userName: 'MaxMilyin',
      });
    });
  });

  describe('getUserProgressForGames', () => {
    it("returns a user's progress for a list of game ids", async () => {
      // ARRANGE
      const mockUserProgress: {
        [gameId: string]: fromModels.ApiUserProgressForGame;
      } = {
        '1': {
          NumPossibleAchievements: '24',
          PossibleScore: '255',
          NumAchieved: 0,
          ScoreAchieved: 0,
          NumAchievedHardcore: 0,
          ScoreAchievedHardcore: 0,
        },
        '1172': {
          NumPossibleAchievements: '76',
          PossibleScore: '520',
          NumAchieved: '76',
          ScoreAchieved: '520',
          NumAchievedHardcore: '76',
          ScoreAchievedHardcore: '520',
        },
        '1448': {
          NumPossibleAchievements: '50',
          PossibleScore: '490',
          NumAchieved: '17',
          ScoreAchieved: '115',
          NumAchievedHardcore: '17',
          ScoreAchievedHardcore: '115',
        },
      };

      server = setupServer(
        rest.get(
          'https://retroachievements.org/API/API_GetUserProgress.php',
          (_, res, ctx) => {
            return res(ctx.json(mockUserProgress));
          }
        )
      );

      server.listen();

      // ACT
      const userProgress = (await client.getUserProgressForGames('WCopeland', [
        1,
        1172,
        1448,
      ])) as fromModels.UserProgressForGame[];

      // ASSERT
      expect(userProgress).toHaveLength(3);

      expect(userProgress[0]).toEqual({
        gameId: 1,
        numAchieved: 0,
        numAchievedHardcore: 0,
        numPossibleAchievements: 24,
        possibleScore: 255,
        scoreAchieved: 0,
        scoreAchievedHardcore: 0,
      });

      expect(userProgress[1]).toEqual({
        gameId: 1172,
        numAchieved: 76,
        numAchievedHardcore: 76,
        numPossibleAchievements: 76,
        possibleScore: 520,
        scoreAchieved: 520,
        scoreAchievedHardcore: 520,
      });
    });
  });

  describe('getUserRecentlyPlayedGames', () => {
    it('returns a list of recently played games for a user', async () => {
      // ARRANGE
      const mockUserRecentlyPlayedGames: fromModels.ApiUserRecentlyPlayedGame[] = [
        {
          GameID: '1448',
          ConsoleID: '7',
          ConsoleName: 'NES',
          Title: 'Mega Man',
          ImageIcon: '/Images/024519.png',
          LastPlayed: '2020-11-09 22:30:26',
          MyVote: null,
          NumPossibleAchievements: '50',
          PossibleScore: '490',
          NumAchieved: '17',
          ScoreAchieved: '115',
        },
        {
          GameID: '1449',
          ConsoleID: '7',
          ConsoleName: 'NES',
          Title: 'Final Fantasy',
          ImageIcon: '/Images/024314.png',
          LastPlayed: '2020-11-03 03:08:42',
          MyVote: null,
          NumPossibleAchievements: '26',
          PossibleScore: '336',
          NumAchieved: '1',
          ScoreAchieved: '1',
        },
      ];

      server = setupServer(
        rest.get(
          'https://retroachievements.org/API/API_GetUserRecentlyPlayedGames.php',
          (_, res, ctx) => {
            return res(ctx.json(mockUserRecentlyPlayedGames));
          }
        )
      );

      server.listen();

      // ACT
      const userRecentlyPlayedGames = await client.getUserRecentlyPlayedGames(
        'WCopeland',
        2
      );

      // ASSERT
      expect(userRecentlyPlayedGames).toHaveLength(2);
      expect(userRecentlyPlayedGames).toEqual([
        {
          consoleId: 7,
          consoleName: 'NES',
          gameId: 1448,
          imageIcon: '/Images/024519.png',
          lastPlayed: new Date('2020-11-09 22:30:26'),
          myVote: null,
          numAchieved: 17,
          numPossibleAchievements: 50,
          possibleScore: 490,
          scoreAchieved: 115,
          title: 'Mega Man',
        },
        {
          consoleId: 7,
          consoleName: 'NES',
          gameId: 1449,
          imageIcon: '/Images/024314.png',
          lastPlayed: new Date('2020-11-03 03:08:42'),
          myVote: null,
          numAchieved: 1,
          numPossibleAchievements: 26,
          possibleScore: 336,
          scoreAchieved: 1,
          title: 'Final Fantasy',
        },
      ]);
    });
  });

  describe('getUserGameCompletionStats', () => {
    it('returns a list of stats for games played by a user', async () => {
      // ARRANGE
      const mockUserGameCompletions: fromModels.ApiUserGameCompletion[] = [
        {
          GameID: '1465',
          ConsoleName: 'NES',
          ImageIcon: '/Images/024531.png',
          Title: 'Donkey Kong Jr.',
          NumAwarded: '13',
          MaxPossible: '13',
          PctWon: '1.0000',
          HardcoreMode: '0',
        },
        {
          GameID: '1446',
          ConsoleName: 'NES',
          ImageIcon: '/Images/036035.png',
          Title: 'Super Mario Bros.',
          NumAwarded: '72',
          MaxPossible: '78',
          PctWon: '0.9231',
          HardcoreMode: '0',
        },
      ];

      server = setupServer(
        rest.get(
          'https://retroachievements.org/API/API_GetUserCompletedGames.php',
          (_, res, ctx) => {
            return res(ctx.json(mockUserGameCompletions));
          }
        )
      );

      server.listen();

      // ACT
      const userGameCompletions = await client.getUserGameCompletionStats(
        'WCopeland'
      );

      // ASSERT
      expect(userGameCompletions).toHaveLength(2);
      expect(userGameCompletions).toEqual([
        {
          consoleName: 'NES',
          gameId: 1465,
          hardcoreMode: 0,
          imageIcon: '/Images/024531.png',
          maxPossible: 13,
          numAwarded: 13,
          pctWon: 1,
          title: 'Donkey Kong Jr.',
        },
        {
          consoleName: 'NES',
          gameId: 1446,
          hardcoreMode: 0,
          imageIcon: '/Images/036035.png',
          maxPossible: 78,
          numAwarded: 72,
          pctWon: 0.9231,
          title: 'Super Mario Bros.',
        },
      ]);
    });
  });

  describe('getUserAchievementsEarnedOnDate', () => {
    it('returns a list of achievements that a user earned on an exact date', async () => {
      // ARRANGE
      const mockEarnedAchievements: fromModels.ApiDatedAchievement[] = [
        {
          Date: '2014-01-04 19:31:23',
          HardcoreMode: '0',
          AchievementID: '58',
          Title: 'Keeps The Doctor Away',
          Description: 'Collect 30 apples',
          BadgeName: '04983',
          Points: '5',
          Author: 'Scott',
          GameTitle: 'Castle of Illusion starring Mickey Mouse',
          GameIcon: '/Images/000778.png',
          GameID: '9',
          ConsoleName: 'Mega Drive',
          CumulScore: 5,
          BadgeURL: '/Badge/04983.png',
          GameURL: '/Game/9',
        },
        {
          Date: '2014-01-04 19:31:59',
          HardcoreMode: '0',
          AchievementID: '4337',
          Title: 'Red Gem',
          Description: 'Collect the Red Gem',
          BadgeName: '04971',
          Points: '5',
          Author: 'Scott',
          GameTitle: 'Castle of Illusion starring Mickey Mouse',
          GameIcon: '/Images/000778.png',
          GameID: '9',
          ConsoleName: 'Mega Drive',
          CumulScore: 10,
          BadgeURL: '/Badge/04971.png',
          GameURL: '/Game/9',
        },
      ];

      server = setupServer(
        rest.get(
          'https://retroachievements.org/API/API_GetAchievementsEarnedOnDay.php',
          (_, res, ctx) => {
            return res(ctx.json(mockEarnedAchievements));
          }
        )
      );

      server.listen();

      // ACT
      const earnedAchievements = await client.getUserAchievementsEarnedOnDate(
        'Scott',
        new Date('2014-01-04')
      );

      // ASSERT
      expect(earnedAchievements).toHaveLength(2);
      expect(earnedAchievements).toEqual([
        {
          achievementId: 58,
          author: 'Scott',
          badgeName: '04983',
          badgeUrl: '/Badge/04983.png',
          consoleName: 'Mega Drive',
          cumulScore: 5,
          date: new Date('2014-01-04 19:31:23'),
          description: 'Collect 30 apples',
          gameIcon: '/Images/000778.png',
          gameId: 9,
          gameTitle: 'Castle of Illusion starring Mickey Mouse',
          gameUrl: '/Game/9',
          hardcoreMode: 0,
          points: 5,
          title: 'Keeps The Doctor Away',
        },
        {
          achievementId: 4337,
          author: 'Scott',
          badgeName: '04971',
          badgeUrl: '/Badge/04971.png',
          consoleName: 'Mega Drive',
          cumulScore: 10,
          date: new Date('2014-01-04 19:31:59'),
          description: 'Collect the Red Gem',
          gameIcon: '/Images/000778.png',
          gameId: 9,
          gameTitle: 'Castle of Illusion starring Mickey Mouse',
          gameUrl: '/Game/9',
          hardcoreMode: 0,
          points: 5,
          title: 'Red Gem',
        },
      ]);
    });
  });
});
