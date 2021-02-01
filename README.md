<h1 align="center">
  retroachievements-js
</h1>

<h4 align="center">🎮 &nbsp; A universal JavaScript wrapper for the RetroAchievements PHP API.</h4>

<p align="center">
  <a href="https://github.com/prettier/prettier">
    <img src="https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square" alt="Styled with Prettier">
  </a>

  <a href="http://commitizen.github.io/cz-cli/">
    <img src="https://img.shields.io/badge/commitizen-friendly-brightgreen.svg" alt="Commitizen Friendly">
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
- Supports Node environments.
- Supports browsers.
- Supports TypeScript.
- Small, <10Kb.

## Contents

1. [Getting started](#getting-started)
2. [Examples](#examples)
3. [API Reference](#api-reference)

## Getting started

### Install

TODO

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

## Examples

### Initializing the Client

To initialize the client, you will need your username and your RetroAchievements Web API key. To get your Web API key, visit [your control panel](http://retroachievements.org/controlpanel.php) on the RetroAchievements website.

You can initialize the client like so:

```typescript
import { RetroAchievementsClient } from 'retroachievements-js';

const client = new RetroAchievementsClient({
  userName: 'MyUserName', // this is your actual account name on the site
  apiKey: 'MyApiKey',
});
```

Please note **if you are using this library in the browser then your API key will be exposed.** This is not destructive, as the API is read-only, but this could change at any time. For this reason, I recommend only using this library on the server where your API key can be kept a secret.

## API Reference

TODO
