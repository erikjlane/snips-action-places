# snips-action-places

Snips action code for the Places app

[![Build Status](https://travis-ci.org/snipsco/snips-action-places.svg?branch=master)](https://travis-ci.org/snipsco/snips-action-places)

## Setup

```sh
sh setup.sh
```

Don't forget to edit the `config.ini` file.

To be able to make calls to the API, you must have a [Google Places API key](https://developers.google.com/places/web-service/get-api-key).

An assistant containing the intents listed below must be installed on your system. Deploy it following [these instructions](https://docs.snips.ai/articles/console/actions/deploy-your-assistant).

## Run

- Dev mode:

```sh
# Dev mode watches for file changes and restarts the action.
npm run dev
```

- Prod mode:

```sh
# 1) Lint, transpile and test.
npm start
# 2) Run the action.
npm run launch
```

## Test & Demo cases

This app only supports french 🇫🇷 and english 🇬🇧.

### `CheckAround`

#### Get local businesses around

Get details about places in the surroundings
> *Hey Snips, is there any top rated sushi place in this area?*
> *Hey Snips, is there a gas station that is open nearby?*

### `FindContact`

#### Get the contact details of a given local business

Get the phone number of a given place
> *Hey Snips, can you tell me the phone number for the most popular spanish restaurant in Beaver Street?*

Get the address of a given place
> *Hey Snips, what's the address of the closest Domino's Pizza?*

### `CheckDistance`

#### Get the distance to a given local business

Get the distance to the given place
> *Hey Snips, how far away is the best rated park?*

### `CheckHours`

#### Get the opening hours of a given local business

Get the opening hours of the given place
> *Hey Snips, is the pharmacy below open this weekend?*

## Debug

In the `src/index.ts` file:

```js
// Uncomment this line to print everything
// debug.enable(name + ':*')
```

## Test & Lint

*Requires [mosquitto](https://mosquitto.org/download/) to be installed.*

```sh
npm start
```

**In test mode, i18n output and http calls are mocked.**

- **http**: mocks are written in `tests/httpMocks/index.ts`
- **i18n**: mocked by `snips-toolkit`, see the [documentation](https://github.com/snipsco/snips-javascript-toolkit#i18n).

## Contributing

Please see the [Contribution Guidelines](https://github.com/snipsco/snips-action-places/blob/master/CONTRIBUTING.md).

## Copyright

This library is provided by [Snips](https://snips.ai) as Open Source software. See [LICENSE](https://github.com/snipsco/snips-action-places/blob/master/LICENSE) for more information.
