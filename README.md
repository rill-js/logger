[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![Chat about Rill at https://gitter.im/rill-js/rill](https://badges.gitter.im/rill-js/rill.svg)](https://gitter.im/rill-js/rill?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

# Rill Logger
Isomorphic request logging for Rill. With colors!

```console
<-- GET /
--> GET / 200 835ms 746b
<-- GET /
--> GET / 200 960ms 1.9kb
<-- GET /users
--> GET /users 200 357ms 922b
<-- GET /users?page=2
--> GET /users?page=2 200 466ms 4.66kb
```

# Installation

#### Npm
```console
npm install @rill/logger
```

# Example

```javascript
const app    = require("rill")();
const logger = require("@rill/logger");

app.use(logger());
```

# Options

```js
{
	group: false // If true, will use console.group instead of log. (Shims in node)
}
```

# Notes
Recommended that you `.use()` this middleware near the top to "wrap" all subsequent middleware.


### Contributions

* Use `npm test` to run tests.

Please feel free to create a PR!
