# DB Package Transition: Naming Convention

## Questions Addressed

### 1. Should the `database/` directory be renamed?

**Recommendation: Yes — rename to `db-models/`**

The directory name should describe the _role_ of the package, not just the broad technology area. Naming it `database/` is too generic and creates ambiguity if a second database-related package is ever added (e.g., a Redis abstraction, a PostgreSQL layer, a cache package). When that happens, `database/` no longer clearly refers to this specific package.

`db-models/` communicates precisely what the package provides: Sequelize model definitions and the shared database connection layer. It is not tied to a specific database technology (SQLite today, could change later) and not tied to a version number.

---

### 2. What should replace `kybervision23db` as the package name?

**Recommendation: `@kybervision/db`**

Using a **scoped npm package** (`@scope/name`) is the standard convention for shared internal packages in a monorepo.

**Why not `kybervision23db`:**

- The version number (`23`) is embedded in the name, requiring a rename every major iteration
- Unscoped package names risk collisions with third-party packages on npm

**Why `@kybervision/db`:**

- `@kybervision` scopes it to this project — no collision risk
- Version is tracked in `package.json`, not the name
- Scales consistently: future packages follow the same pattern (`@kybervision/api-types`, `@kybervision/redis`, etc.)
- Import statements read cleanly:

```ts
import { User, League } from "@kybervision/db";
```

---

## Full Change Inventory

The following files must be updated when this rename is applied.

### Directory

| From        | To           |
| ----------- | ------------ |
| `database/` | `db-models/` |

### Package definition

| File                     | Field  | From              | To                |
| ------------------------ | ------ | ----------------- | ----------------- |
| `db-models/package.json` | `name` | `kybervision23db` | `@kybervision/db` |

### Dependency declarations

Both `api/` and `worker-node/` currently reference the database package with a broken path
(`../KyberVision23Db`) left over from KyberVision22. This rename corrects the path at the same time.

| File                       | From                                           | To                                       |
| -------------------------- | ---------------------------------------------- | ---------------------------------------- |
| `api/package.json`         | `"kybervision23db": "file:../KyberVision23Db"` | `"@kybervision/db": "file:../db-models"` |
| `worker-node/package.json` | `"kybervision23db": "file:../KyberVision23Db"` | `"@kybervision/db": "file:../db-models"` |

### Import / require statements

#### `api/` (14 occurrences)

| File                                     | Line | Statement                                                                         |
| ---------------------------------------- | ---- | --------------------------------------------------------------------------------- |
| `api/src/app.ts`                         | 12   | `import { initModels, sequelize } from "kybervision23db"`                         |
| `api/src/modules/common.ts`              | 3    | `import { Ping } from "kybervision23db"`                                          |
| `api/src/modules/videos.ts`              | 4    | `import { Video } from "kybervision23db"`                                         |
| `api/src/modules/userAuthentication.ts`  | 3    | `import { User } from "kybervision23db"`                                          |
| `api/src/modules/onStartUp.ts`           | 3    | `import { User, League } from "kybervision23db"`                                  |
| `api/src/modules/players.ts`             | 1    | `import { Player, ContractTeamPlayer } from "kybervision23db"`                    |
| `api/src/modules/sessions.ts`            | 1    | `import { ContractLeagueTeam, League, Session, Team } from "kybervision23db"`     |
| `api/src/routes/users.ts`                | 11   | `import { Video } from "kybervision23db"`                                         |
| `api/src/routes/users.ts`                | 15   | `import { User, ContractTeamUser, PendingInvitations } from "kybervision23db"`    |
| `api/src/routes/leagues.ts`              | 2    | `import { League, ContractLeagueTeam } from "kybervision23db"`                    |
| `api/src/routes/scripts.ts`              | 2    | `import { Action, Script, ContractUserAction, sequelize } from "kybervision23db"` |
| `api/src/routes/contractPlayerUsers.ts`  | 2    | `import { ContractPlayerUser } from "kybervision23db"`                            |
| `api/src/routes/contractUserActions.ts`  | 2    | `import { ContractUserAction } from "kybervision23db"`                            |
| `api/src/routes/contractVideoActions.ts` | 2    | `import { ContractVideoAction, Action } from "kybervision23db"`                   |

All 14 statements replace `"kybervision23db"` with `"@kybervision/db"`.

#### `worker-node/` (1 active occurrence)

| File                                    | Line | Statement                                      |
| --------------------------------------- | ---- | ---------------------------------------------- |
| `worker-node/routes/youtubeUploader.js` | 8    | `const { Video } = require("kybervision23db")` |

Replace `"kybervision23db"` with `"@kybervision/db"`.

> Note: `worker-node/docs/YouTubeUploaderRef/modules/uploader.js` also contains a reference on
> line 5, but this file is reference documentation — update it for consistency but it is not
> part of the active runtime.

---

## Summary

| Concern                        | Solution                                                                 |
| ------------------------------ | ------------------------------------------------------------------------ |
| Version number in package name | Scoped package `@kybervision/db` — version lives in `package.json` only  |
| Generic directory name         | `db-models/` — describes the architectural role, not just the technology |
| Broken `file:` paths from KV22 | Fixed as part of this rename (`file:../db-models`)                       |
| Future package naming pattern  | `@kybervision/<name>` for all internal shared packages                   |
