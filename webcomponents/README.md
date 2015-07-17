# PolyAuth WebComponents Example

## Getting started

Install dependencies:

``sh
$ npm install
$ bower install
``

Configure the application by changing values in the `../config.json`.

```json
{
	"realm_id": "Your Realm ID",
	"realm_secret": "Your Realm Secret",
	"redirect_uri": "https://localhost:9000",
	"apiv": "v1"
}
```

Build and run the application:

```sh
$ gulp develop
```

Open the URI `https://localhost:9000` in your browser.

