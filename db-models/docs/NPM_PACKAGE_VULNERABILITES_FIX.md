# NPM Package Vulnerabilities Fix

## Overview

After running `npm install`, you may see up to **5 high-severity vulnerabilities** that persist even after running `npm audit fix`. This document explains the root cause and the correct fix.

---

## The Problem

The vulnerability chain originates from `sqlite3`'s **build-time** dependencies:

```
sqlite3 >= 5.0.0
  └── node-gyp <= 10.3.1
        ├── tar <= 7.5.6           ← vulnerable
        └── make-fetch-happen 7.1.1 - 14.0.0
              └── cacache 14.0.0 - 18.0.4
                    └── tar <= 7.5.6  ← vulnerable
```

The root package at fault is `tar <= 7.5.6`, which has three known high-severity CVEs:

| Advisory                                                                 | Description                                                   |
| ------------------------------------------------------------------------ | ------------------------------------------------------------- |
| [GHSA-8qq5-rm4j-mr97](https://github.com/advisories/GHSA-8qq5-rm4j-mr97) | Arbitrary File Overwrite via Insufficient Path Sanitization   |
| [GHSA-r6q2-hw4h-h46w](https://github.com/advisories/GHSA-r6q2-hw4h-h46w) | Race Condition via Unicode Ligature Collisions on macOS APFS  |
| [GHSA-34x7-hfp2-rc4v](https://github.com/advisories/GHSA-34x7-hfp2-rc4v) | Arbitrary File Creation/Overwrite via Hardlink Path Traversal |

> **Note:** These are **install-time** vulnerabilities, not runtime ones. The vulnerable packages are only used when `npm install` compiles the `sqlite3` native addon — they are not present in the deployed application.

---

## Why the Standard Fixes Don't Work

| Command                 | Outcome                                                                                                            |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `npm audit fix`         | Does not resolve the remaining 5 high vulnerabilities                                                              |
| `npm audit fix --force` | **Do not use.** This downgrades `sqlite3` to `5.0.2`, which is a breaking change and will break the database layer |

---

## The Correct Fix

Use npm's [`overrides`](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#overrides) field to force `tar` to a patched version (`>= 7.5.7`) across the entire dependency tree, without touching `sqlite3`.

### Step 1 — Add the override to `package.json`

Open `package.json` and add the following `overrides` field at the top level (alongside `dependencies` and `devDependencies`):

```json
"overrides": {
  "tar": "^7.5.7"
}
```

Your `package.json` should look like this:

```json
{
  "name": "@kybervision/db",
  ...
  "dependencies": {
    "sequelize": "^6.37.7",
    "sqlite3": "^5.1.7"
  },
  "overrides": {
    "tar": "^7.5.7"
  },
  "devDependencies": {
    ...
  }
}
```

### Step 2 — Reinstall packages

```bash
npm install
```

### Step 3 — Verify

```bash
npm audit
```

Expected output:

```
found 0 vulnerabilities
```

---

## Summary

|                   | Before fix | After fix |
| ----------------- | ---------- | --------- |
| Vulnerabilities   | 5 high     | 0         |
| `sqlite3` version | unchanged  | unchanged |
| Runtime impact    | none       | none      |
