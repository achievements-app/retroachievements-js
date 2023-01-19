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
      apiKey: 'MockApiKey'
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
          Name: 'Mega Drive'
        },
        {
          ID: '2',
          Name: 'Nintendo 64'
        }
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
        name: 'Mega Drive'
      });
    });
  });

  describe('getUserRankAndScore', () => {
    it('gets the user rank and score', async () => {
      // ARRANGE
      const mockUserRankAndScore: fromModels.ApiUserRankAndScore = {
        Score: 6756,
        Rank: '4655',
        TotalRanked: '88613'
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
      const userRankAndScore = await client.getUserRankAndScore('MockUser');

      // ASSERT
      expect(userRankAndScore).toBeDefined();
      expect(userRankAndScore.score).toEqual(6756);
      expect(userRankAndScore.rank).toEqual(4655);
      expect(userRankAndScore.totalRanked).toEqual(88613);
    });

    it('throws an error if the requested user is not found', async () => {
      // ARRANGE
      const mockUserRankAndScore: fromModels.ApiUserRankAndScore = {
        Score: null,
        Rank: '1',
        TotalRanked: '88613'
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

      // ASSERT
      expect(
        async () => await client.getUserRankAndScore('MockUser')
      ).rejects.toThrowError();
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
        Console: 'Game Boy'
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
      const gameInfo = await client.getGameInfoByGameId(504);

      // ASSERT
      expect(gameInfo).toBeDefined();
      expect(gameInfo.consoleId).toEqual(4);
      expect(gameInfo.forumTopicId).toEqual(111);
      expect(gameInfo.gameTitle).toEqual('Super Mario Land');
    });

    it('throws an error and has no return if the game is not found', async () => {
      // ARRANGE
      const mockGameInfo: fromModels.ApiGameInfo = {
        GameTitle: 'UNRECOGNISED',
        ConsoleID: null,
        Console: null,
        ForumTopicID: null
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

      // ASSERT
      expect(
        async () => await client.getGameInfoByGameId(504)
      ).rejects.toThrow();
    });
  });

  describe('getAchievementDistributionForGameId', () => {
    it('given a game id and hardcore flag, returns the achievement distribution', async () => {
      // ARRANGE
      const mockResponse: Record<string, number> = {
        '1': 128,
        '2': 71,
        '3': 62,
        '4': 102,
        '5': 115,
        '6': 34,
        '7': 30,
        '8': 31,
        '9': 22,
        '10': 15
      };

      server = setupServer(
        rest.get(
          'https://retroachievements.org/API/API_GetAchievementDistribution.php',
          (_, res, ctx) => {
            return res(ctx.json(mockResponse));
          }
        )
      );

      server.listen();

      // ACT
      const achievementDistribution = await client.getAchievementDistributionForGameId(
        1471,
        true
      );

      // ASSERT
      expect(achievementDistribution).toBeDefined();
      expect(achievementDistribution['10']).toEqual(15);
    });
  });

  describe('getExtendedGameInfoByGameId', () => {
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
        MemAddr: 'ce2ebf6f40272f66b1c0dc972f18665d'
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
        MemAddr: '67f757eb24b56b2f0205ce502bcee91c'
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
          75397: mockAchievementTwo
        }
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
      const gameInfoExtended = await client.getExtendedGameInfoByGameId(504);

      // ASSERT
      expect(gameInfoExtended).toBeDefined();
      expect(gameInfoExtended.achievements).toHaveLength(2);
      expect(gameInfoExtended.consoleName).toEqual('Game Boy');
      expect(gameInfoExtended.id).toEqual(504);
      expect(gameInfoExtended.achievements[0].title).toEqual('Mushroom Man');
    });

    it('throws an error and has no return if the game is not found', async () => {
      // ARRANGE
      const mockGameInfoExtended: fromModels.ApiGameInfoExtended = {
        Achievements: [],
        RichPresencePatch: 'd41d8cd98f00b204e9800998ecf8427e'
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

      // ASSERT
      expect(
        async () => await client.getExtendedGameInfoByGameId(504)
      ).rejects.toThrow();
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
          ConsoleName: 'Mega Drive'
        },
        {
          Title: '3 Ninjas Kick Back',
          ID: '397',
          ConsoleID: '1',
          ImageIcon: '/Images/039030.png',
          ConsoleName: 'Mega Drive'
        }
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
          title: '16t'
        },
        {
          consoleId: 1,
          consoleName: 'Mega Drive',
          id: 397,
          imageIcon: '/Images/039030.png',
          title: '3 Ninjas Kick Back'
        }
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
          '3': '1445229'
        },
        {
          '1': 'HippopotamusRex',
          '2': '452006',
          '3': '1640777'
        },
        {
          '1': 'Wendigo',
          '2': '304245',
          '3': '1208458'
        },
        {
          '1': 'BerserkerBR',
          '2': '302996',
          '3': '908360'
        },
        {
          '1': 'Sarconius',
          '2': '290574',
          '3': '1229416'
        },
        {
          '1': 'Andrey199650',
          '2': '283193',
          '3': '636198'
        },
        {
          '1': 'Xymjak',
          '2': '260148',
          '3': '959388'
        },
        {
          '1': 'FabricioPrie',
          '2': '257027',
          '3': '615678'
        },
        {
          '1': 'Veritasu',
          '2': '250336',
          '3': '589807'
        },
        {
          '1': 'mikeisafighter',
          '2': '237742',
          '3': '837535'
        }
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
      const topTen = await client.getTopTenUsers();

      // ASSERT
      expect(topTen).toHaveLength(10);
      expect(topTen[0]).toEqual({
        points: 484223,
        retroRatioPoints: 1445229,
        userName: 'MaxMilyin'
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
          ScoreAchievedHardcore: 0
        },
        '1172': {
          NumPossibleAchievements: '76',
          PossibleScore: '520',
          NumAchieved: '76',
          ScoreAchieved: '520',
          NumAchievedHardcore: '76',
          ScoreAchievedHardcore: '520'
        },
        '1448': {
          NumPossibleAchievements: '50',
          PossibleScore: '490',
          NumAchieved: '17',
          ScoreAchieved: '115',
          NumAchievedHardcore: '17',
          ScoreAchievedHardcore: '115'
        }
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
      const userProgress = await client.getUserProgressForGames('WCopeland', [
        1,
        1172,
        1448
      ]);

      // ASSERT
      expect(userProgress).toHaveLength(3);

      expect(userProgress[0]).toEqual({
        gameId: 1,
        numAchieved: 0,
        numAchievedHardcore: 0,
        numPossibleAchievements: 24,
        possibleScore: 255,
        scoreAchieved: 0,
        scoreAchievedHardcore: 0
      });

      expect(userProgress[1]).toEqual({
        gameId: 1172,
        numAchieved: 76,
        numAchievedHardcore: 76,
        numPossibleAchievements: 76,
        possibleScore: 520,
        scoreAchieved: 520,
        scoreAchievedHardcore: 520
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
          NumAchievedHardcore: '17',
          ScoreAchievedHardcore: '115'
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
          NumAchievedHardcore: '0',
          ScoreAchievedHardcore: '0'
        }
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
          numAchievedHardcore: 17,
          scoreAchievedHardcore: 115
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
          numAchievedHardcore: 0,
          scoreAchievedHardcore: 0
        }
      ]);
    });
  });

  describe('getUserGameCompletionStats', () => {
    it('returns a list of stats for games played by a user', async () => {
      // ARRANGE
      const mockUserGameCompletions: fromModels.ApiUserGameCompletion[] = [
        {
          GameID: '11406',
          ConsoleName: 'PlayStation',
          ConsoleID: '12',
          ImageIcon: '/Images/042133.png',
          Title: 'Mortal Kombat 4',
          MaxPossible: '131',
          NumAwarded: '131',
          PctWon: '1.0000',
          HardcoreMode: '1'
        },
        {
          GameID: '10116',
          ConsoleName: 'Nintendo 64',
          ConsoleID: '2',
          ImageIcon: '/Images/042459.png',
          Title: 'Mortal Kombat 4',
          MaxPossible: '130',
          NumAwarded: '130',
          PctWon: '1.0000',
          HardcoreMode: '0'
        }
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
          gameId: 11406,
          consoleName: 'PlayStation',
          consoleId: 12,
          imageIcon: '/Images/042133.png',
          title: 'Mortal Kombat 4',
          maxPossible: 131,
          numAwarded: 131,
          pctWon: 1,
          hardcoreMode: 1
        },
        {
          gameId: 10116,
          consoleName: 'Nintendo 64',
          consoleId: 2,
          imageIcon: '/Images/042459.png',
          title: 'Mortal Kombat 4',
          maxPossible: 130,
          numAwarded: 130,
          pctWon: 1,
          hardcoreMode: 0
        }
      ]);
    });
  });

  describe('getUserAchievementsEarnedBetweenDates', () => {
    it('returns a list of achievements that a user earned within a given date range', async () => {
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
          GameURL: '/Game/9'
        },
        {
          Date: '2014-01-05 19:31:59',
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
          GameURL: '/Game/9'
        }
      ];

      server = setupServer(
        rest.get(
          'https://retroachievements.org/API/API_GetAchievementsEarnedBetween.php',
          (_, res, ctx) => {
            return res(ctx.json(mockEarnedAchievements));
          }
        )
      );

      server.listen();

      // ACT
      const earnedAchievements = await client.getUserAchievementsEarnedBetweenDates(
        'Scott',
        new Date('2014-01-04'),
        new Date('2014-01-05')
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
          title: 'Keeps The Doctor Away'
        },
        {
          achievementId: 4337,
          author: 'Scott',
          badgeName: '04971',
          badgeUrl: '/Badge/04971.png',
          consoleName: 'Mega Drive',
          cumulScore: 10,
          date: new Date('2014-01-05 19:31:59'),
          description: 'Collect the Red Gem',
          gameIcon: '/Images/000778.png',
          gameId: 9,
          gameTitle: 'Castle of Illusion starring Mickey Mouse',
          gameUrl: '/Game/9',
          hardcoreMode: 0,
          points: 5,
          title: 'Red Gem'
        }
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
          GameURL: '/Game/9'
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
          GameURL: '/Game/9'
        }
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
          title: 'Keeps The Doctor Away'
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
          title: 'Red Gem'
        }
      ]);
    });
  });

  describe('getUserProgressForGameId', () => {
    it("returns all of a given user's progress for a given game id", async () => {
      // ARRANGE
      const mockUserProgressForGameId: fromModels.ApiGameInfoAndUserProgress = {
        ID: 1448,
        Title: 'Mega Man',
        ConsoleID: 7,
        ForumTopicID: 363,
        Flags: 0,
        ImageIcon: '/Images/024519.png',
        ImageTitle: '/Images/000445.png',
        ImageIngame: '/Images/034071.png',
        ImageBoxArt: '/Images/012788.png',
        Publisher: 'Capcom',
        Developer: 'Capcom',
        Genre: 'Platformer (Side Scrolling)',
        Released: 'December 17, 1987',
        IsFinal: false,
        ConsoleName: 'NES',
        RichPresencePatch: '1639c64070f4a10c1006ab6bda70d766',
        NumAchievements: 50,
        NumDistinctPlayersCasual: '3213',
        NumDistinctPlayersHardcore: '2067',
        Achievements: {
          '54059': {
            ID: '54059',
            NumAwarded: '264',
            NumAwardedHardcore: '198',
            Title: 'Mega Meow One',
            Description: 'Have 9 lives',
            Points: '10',
            TrueRatio: '53',
            Author: 'Salsa',
            DateModified: '2019-10-17 20:09:01',
            DateCreated: '2017-10-29 19:02:40',
            BadgeName: '73832',
            DisplayOrder: '0',
            MemAddr: '92346871ff9c98cac45c0f42b911aedd'
          }
        },
        NumAwardedToUser: 17,
        NumAwardedToUserHardcore: 17,
        UserCompletion: '34.00%',
        UserCompletionHardcore: '34.00%'
      };

      server = setupServer(
        rest.get(
          'https://retroachievements.org/API/API_GetGameInfoAndUserProgress.php',
          (_, res, ctx) => {
            return res(ctx.json(mockUserProgressForGameId));
          }
        )
      );

      server.listen();

      // ACT
      const userProgressForGameId = await client.getUserProgressForGameId(
        'WCopeland',
        1448
      );

      // ASSERT
      expect(userProgressForGameId).toEqual({
        id: 1448,
        title: 'Mega Man',
        consoleId: 7,
        forumTopicId: 363,
        flags: 0,
        imageIcon: '/Images/024519.png',
        imageTitle: '/Images/000445.png',
        imageIngame: '/Images/034071.png',
        imageBoxArt: '/Images/012788.png',
        publisher: 'Capcom',
        developer: 'Capcom',
        genre: 'Platformer (Side Scrolling)',
        released: 'December 17, 1987',
        isFinal: false,
        consoleName: 'NES',
        richPresencePatch: '1639c64070f4a10c1006ab6bda70d766',
        numAchievements: 50,
        numDistinctPlayersCasual: 3213,
        numDistinctPlayersHardcore: 2067,
        numAwardedToUser: 17,
        numAwardedToUserHardcore: 17,
        userCompletion: 34,
        userCompletionHardcore: 34,
        achievements: [
          {
            id: 54059,
            numAwarded: 264,
            numAwardedHardcore: 198,
            title: 'Mega Meow One',
            description: 'Have 9 lives',
            points: 10,
            trueRatio: 53,
            author: 'Salsa',
            dateModified: new Date('2019-10-17 20:09:01'),
            dateCreated: new Date('2017-10-29 19:02:40'),
            badgeName: 73832,
            displayOrder: 0,
            memAddr: '92346871ff9c98cac45c0f42b911aedd'
          }
        ]
      });
    });
  });

  describe('getUserSummary', () => {
    it('returns a summary for the given username', async () => {
      // ARRANGE
      const mockUserSummary: fromModels.ApiUserSummary = {
        RecentlyPlayedCount: 29,
        RecentlyPlayed: [
          {
            GameID: '1448',
            ConsoleID: '7',
            ConsoleName: 'NES',
            Title: 'Mega Man',
            ImageIcon: '/Images/024519.png',
            LastPlayed: '2020-11-09 22:30:26',
            MyVote: null
          },
          {
            GameID: '1449',
            ConsoleID: '7',
            ConsoleName: 'NES',
            Title: 'Final Fantasy',
            ImageIcon: '/Images/024314.png',
            LastPlayed: '2020-11-03 03:08:42',
            MyVote: null
          }
        ],
        MemberSince: '2020-02-02 20:10:35',
        LastActivity: {
          ID: '26455336',
          timestamp: '2021-01-31 18:57:01',
          lastupdate: '2021-01-31 18:57:01',
          activitytype: '2',
          User: 'WCopeland',
          data: null,
          data2: null
        },
        RichPresenceMsg: 'Wily 1|🚶1|💯609500',
        LastGameID: '1448',
        LastGame: {
          ID: 1448,
          Title: 'Mega Man',
          ConsoleID: 7,
          ForumTopicID: 363,
          Flags: 0,
          ImageIcon: '/Images/024519.png',
          ImageTitle: '/Images/000445.png',
          ImageIngame: '/Images/034071.png',
          ImageBoxArt: '/Images/012788.png',
          Publisher: 'Capcom',
          Developer: 'Capcom',
          Genre: 'Platformer (Side Scrolling)',
          Released: 'December 17, 1987',
          IsFinal: false,
          ConsoleName: 'NES',
          RichPresencePatch:
            'Lookup:Stage\r\n0x00=Cutman\r\n0x01=Iceman\r\n0x02=Bombman\r\n0x03=Fireman\r\n0x04=Elecman\r\n0x05=Gutsman\r\n0x06=Wily 1\r\n0x07=Wily 2\r\n0x08=Wily 3\r\n0x09=Wily 4\r\n0x0a=Title Screen\r\n0x0b=The End\r\n\r\nFormat:Lives\r\nFormatType=VALUE\r\n\r\nFormat:Score\r\nFormatType=VALUE\r\n\r\nDisplay:\r\n?0xh0031=10?Rocking it on the title screen\r\n@Stage(0xh0031)|🚶@Lives(0xh00a6)|💯@Score(0xh0072*1_0xh0073*10_0xh0074*100_0xh0075*1000_0xh0076*10000_0xh0077*100000_0xh0078*1000000)'
        },
        ContribCount: '0',
        ContribYield: '0',
        TotalPoints: '6756',
        TotalTruePoints: '31058',
        Permissions: '1',
        Untracked: '0',
        UserWallActive: '1',
        Motto: '',
        Rank: '4674',
        Awarded: {
          '1448': {
            NumPossibleAchievements: '50',
            PossibleScore: '490',
            NumAchieved: '17',
            ScoreAchieved: '115',
            NumAchievedHardcore: '17',
            ScoreAchievedHardcore: '115'
          },
          '1449': {
            NumPossibleAchievements: '26',
            PossibleScore: '336',
            NumAchieved: '1',
            ScoreAchieved: '1',
            NumAchievedHardcore: '1',
            ScoreAchievedHardcore: '1'
          }
        },
        RecentAchievements: {
          '1448': {
            '3404': {
              ID: '3404',
              GameID: '1448',
              GameTitle: 'Mega Man',
              Title: 'Bombman',
              Description: 'Defeat Bombman and get his Power!',
              Points: '5',
              BadgeName: '73833',
              IsAwarded: '1',
              DateAwarded: '2020-11-09 23:08:08',
              HardcoreAchieved: '0'
            },
            '3472': {
              ID: '3472',
              GameID: '1448',
              GameTitle: 'Mega Man',
              Title: 'Blue Bomber',
              Description:
                'Defeat Bombman without taking damage (pause glitch not allowed)',
              Points: '10',
              BadgeName: '73852',
              IsAwarded: '1',
              DateAwarded: '2020-11-09 23:07:59',
              HardcoreAchieved: '0'
            }
          }
        },
        Points: '6756',
        UserPic: '/UserPic/WCopeland.png',
        TotalRanked: '89202',
        Status: 'Offline'
      };

      server = setupServer(
        rest.get(
          'https://retroachievements.org/API/API_GetUserSummary.php',
          (_, res, ctx) => {
            return res(ctx.json(mockUserSummary));
          }
        )
      );

      server.listen();

      // ACT
      const userSummary = await client.getUserSummary('WCopeland');

      // ASSERT
      expect(userSummary.awarded).toEqual([
        {
          gameId: 1448,
          numPossibleAchievements: 50,
          possibleScore: 490,
          numAchieved: 17,
          scoreAchieved: 115,
          numAchievedHardcore: 17,
          scoreAchievedHardcore: 115
        },
        {
          gameId: 1449,
          numPossibleAchievements: 26,
          possibleScore: 336,
          numAchieved: 1,
          scoreAchieved: 1,
          numAchievedHardcore: 1,
          scoreAchievedHardcore: 1
        }
      ]);

      expect(userSummary.recentAchievements).toEqual([
        {
          id: 3404,
          gameId: 1448,
          gameTitle: 'Mega Man',
          title: 'Bombman',
          description: 'Defeat Bombman and get his Power!',
          points: 5,
          badgeName: 73833,
          isAwarded: 1,
          dateAwarded: new Date('2020-11-09 23:08:08'),
          hardcoreAchieved: 0
        },
        {
          id: 3472,
          gameId: 1448,
          gameTitle: 'Mega Man',
          title: 'Blue Bomber',
          description:
            'Defeat Bombman without taking damage (pause glitch not allowed)',
          points: 10,
          badgeName: 73852,
          isAwarded: 1,
          dateAwarded: new Date('2020-11-09 23:07:59'),
          hardcoreAchieved: 0
        }
      ]);
    });
  });

  describe('getUserPoints', () => {
    it('returns points stats for the given username', async () => {
      // ARRANGE
      const mockUserPoints: fromModels.ApiUserPoints = {
        Points: 10_000,
        SoftcorePoints: 25
      };

      server = setupServer(
        rest.get(
          'https://retroachievements.org/API/API_GetUserPoints.php',
          (_, res, ctx) => {
            return res(ctx.json(mockUserPoints));
          }
        )
      );

      server.listen();

      // ACT
      const userPoints = await client.getUserPoints('xelnia');

      // ASSERT
      expect(userPoints.points).toEqual(10_000);
      expect(userPoints.softcorePoints).toEqual(25);
    });
  });
});
