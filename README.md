# Rill Logger
Isomorphic request logging for Rill.

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

# Notes
Recommended that you `.use()` this middleware near the top to "wrap" all subsequent middleware.


### Contributions

* Use gulp to run tests.

Please feel free to create a PR!
