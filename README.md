# snips-action-places

Snips action code for the Places app

[![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/facebook/jest)

## Setup

```sh
sh setup.sh
```

Don't forget to edit the `config.ini` file.

To be able to make calls to the API, you must have a [Google Places API key](https://developers.google.com/places/web-service/get-api-key).

An assistant containing the intents listed below must be installed on your system. Deploy it following [these instructions](https://docs.snips.ai/articles/console/actions/deploy-your-assistant).

## Run

```sh
node action-places.js
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

In the `action-places.js` file:

```js
// Uncomment this line to print everything
// debug.enable(name + ':*')
```

When running from the terminal, to enable full depth object printing:

```bash
env DEBUG_DEPTH=null node action-places.js
```

## Test & Lint

*Requires [mosquitto](https://mosquitto.org/download/) to be installed.*

```sh
npm start
```

**In test mode, i18n output and http calls are mocked.**

- **http**: see `tests/httpMocks/index.js`
- **i18n**: see `src/factories/i18nFactory.js`

## Contributing

Please see the [Contribution Guidelines](https://github.com/snipsco/snips-action-places/blob/master/CONTRIBUTING.md).

## Copyright

This library is provided by [Snips](https://snips.ai) as Open Source software. See [LICENSE](https://github.com/snipsco/snips-action-places/blob/master/LICENSE) for more information.
