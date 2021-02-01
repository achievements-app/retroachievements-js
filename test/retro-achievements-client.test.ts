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
});
