import { RetroAchievementsClient } from './src/index';

async function main() {
  const client = new RetroAchievementsClient(
    'WCopeland',
    'gYPwmMOAIiGkOmk1qpNDrTfqBiGIeh7X'
  );

  const res = await client.gameInfoExtendedByGameId(504);
  console.log({ res });
}

main();
