<h1 align="center">
  retroachievements-js
</h1>

<h4 align="center">🎮 &nbsp; A universal JavaScript wrapper for the RetroAchievements PHP API.</h4>

<p align="center">
  <a href="https://github.com/prettier/prettier">
    <img src="https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square" alt="Styled with Prettier">
  </a>

  <a href="https://github.com/semantic-release/semantic-release">
    <img src="https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg" alt="Semantic Release">
  </a>

  <a href="http://commitizen.github.io/cz-cli/">
    <img src="https://img.shields.io/badge/commitizen-friendly-brightgreen.svg" alt="Commitizen Friendly">
  </a>

  <a href="https://bundlephobia.com/result?p=retroachievements-js">
    <img src="https://badgen.net/bundlephobia/minzip/retroachievements-js" alt="minzipped size">
  </a>

  <a href="https://codeclimate.com/github/wescopeland/retroachievements-js/maintainability">
    <img src="https://api.codeclimate.com/v1/badges/60d0877dfbb6b27db65e/maintainability" alt="Codeclimate Maintainability">
  </a>

  <a href="https://codeclimate.com/github/wescopeland/retroachievements-js/test_coverage">
    <img src="https://api.codeclimate.com/v1/badges/60d0877dfbb6b27db65e/test_coverage" alt="Code Coverage">
  </a>
</p>

<hr />

## Features

- Aligns with the [official RetroAchievements web API](http://retroachievements.org/APIDemo.php).
- Is promise-based.
- Supports Node environments.
- Supports browsers.
- Supports TypeScript.
- Small, <10Kb.

## Contents

- [Getting started](#getting-started)
- [Examples](#examples)
  - [Initializing the client](#initializing-the-client)
  - [Top ten users by points](#top-ten-users-by-points)
  - [Get all console IDs](#get-all-console-ids)
  - [Get list of all registered Gameboy games](#get-list-of-all-registered-gameboy-games)
  - [Basic game information for Super Mario Land (GB)](<#basic-game-information-for-super-mario-land-(gb)>)
  - [Full game information for Super Mario Land (GB)](<#full-game-information-for-super-mario-land-(gb)>)
  - [Complete summary of Scott's progress for game ID 3](#complete-summary-of-scott's-progress-for-game-id-3)
  - [Scott's global rank and score](#scott's-global-rank-and-score)
  - [Scott's 10 most recently played games](#scott's-10-most-recently-played-games)
  - [Scott's progress on games with IDs 2, 3, and 75](#scott's-progress-on-games-with-ids-2-3-and-75)
  - [Scott's user summary](#scott's-user-summary)
  - [Achievements earned by Scott on January 4th, 2014](#achievements-earned-by-scott-on-january-4th-2014)
  - [Scott's game completion progress](#scott's-game-completion-progress)

## Getting started

### Install

```
npm install --save retroachievements-js
```

OR

```
yarn add retroachievements-js
```

### Usage with Node

Node 10 and above are officially supported. The package can be imported via:

```javascript
const RetroAchievementsClient = require('retroachievements-js');
```

### Usage with TypeScript

You can use `import` syntax to utilize the package in your app. This library provides its own type definitions. "It just works", no need to install anything from `@types`.

```typescript
import { RetroAchievementsClient } from 'retroachievements-js';
```

### Understanding the Promise-based API

All methods in the API are async and return a [native Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

These methods can be used with the native Promise API or the more modern async/await syntax.

```typescript
// Native Promise API.
client.getTopTen().then(topTen => {
  console.log({ topTen });
});

// async/await syntax.
const logTopTenUsers = async () => {
  const topTen = await client.getTopTen();
  console.log({ topTen });
};
```

## Examples

### Initializing the Client

To initialize the client, you will need your username and your RetroAchievements Web API key. To get your Web API key, visit [your control panel](http://retroachievements.org/controlpanel.php) on the RetroAchievements website.

You can initialize the client like so:

```typescript
import { RetroAchievementsClient } from 'retroachievements-js';

const client = new RetroAchievementsClient({
  userName: 'MyUserName', // this is your actual account name on the site
  apiKey: 'MyApiKey'
});
```

Please note **if you are using this library in the browser then your API key will be exposed.** This is not destructive, as the API is read-only, but that could change at any time. For this reason, I recommend only using the library on the server where your API key can be kept a secret.

### Top ten users by points

```typescript
const printTopTenUsers = async () => {
  const topTen = await client.getTopTenUsers();
  console.log({ topTen });
};
```

### Get all console IDs

```typescript
const printAllConsoleIds = async () => {
  const allConsoleIds = await client.getConsoleIds();
  console.log({ allConsoleIds });
};
```

### Get list of all registered Gameboy games

```typescript
const printAllGameboyGames = async () => {
  const allGameboyGames = await client.getGameListByConsoleId(4);
  console.log({ allGameboyGames });
};
```

### Basic game information for Super Mario Land (GB)

```typescript
const printGameInfo = async () => {
  const superMarioLandInfo = await client.getGameInfoByGameId(504);
  console.log({ superMarioLandInfo });
};
```

### Full game information for Super Mario Land (GB)

```typescript
const printExtendedGameInfo = async () => {
  const superMarioLandExtendedInfo = await client.getExtendedGameInfoByGameId(
    504
  );

  console.log({ superMarioLandExtendedInfo });
};
```

### Complete summary of Scott's progress for game ID 3

```typescript
const printUserGameProgress = async () => {
  const userGameProgress = await client.getUserProgressForGameId('Scott', 3);
  console.log({ userGameProgress });
};
```

### Scott's global rank and score

```typescript
const printUserGlobalRankAndScore = async () => {
  const userRankAndScore = await client.getUserRankAndScore('Scott');
  console.log({ userRankAndScore });
};
```

### Scott's 10 most recently played games

```typescript
const printUserRecentGames = async () => {
  const userRecentGames = await client.getUserRecentlyPlayedGames('Scott', 10);
  console.log({ userRecentGames });
};
```

### Scott's progress on games with IDs 2, 3, and 75

```typescript
const printUserMultipleGameProgress = async () => {
  const userProgress = await client.getUserProgressForGames('Scott', [
    2,
    3,
    75
  ]);

  console.log({ userProgress });
};
```

### Scott's user summary

```typescript
const printUserSummary = async () => {
  const userSummary = await client.getUserSummary('Scott');
  console.log({ userSummary });
};
```

### Achievements earned by Scott on January 4th, 2014

```typescript
const printUserAchievementsOnDate = async () => {
  const achievementsOnDate = await client.getUserAchievementsEarnedOnDate(
    'Scott',
    new Date('01-04-2014')
  );

  console.log({ achievementsOnDate });
};
```

### Scott's game completion progress

```typescript
const printUserCompletionProgress = async () => {
  const completionProgress = await client.getUserGameCompletionStats('Scott');
  console.log({ completionProgress });
};
```
