# yahoo-oauth-bot

## Features

* Get Yahoo! API access token using Yahoo ID and password.

## Installation

1. Copy `.env.dist` to `.env` and edit it.
2. Run `yarn`
3. Run `yarn bin:install`


## Usage

```
yahoo auth
```

## Tips

### Tips 1: Import access token to shell environment variables

By running the following command, two environment variables will be declared.
`YAHOO_ACCESS_TOKEN` is for the access token and `YAHOO_REFRESH_TOKEN` is for the refresh token.

```bash
$ eval $(./bin/run auth --style=export_env)
```

You would see two environment variables:

```console
$ env | grep YAHOO
YAHOO_ACCESS_TOKEN=...
YAHOO_REFRESH_TOKEN=...
```
