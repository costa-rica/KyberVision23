![Logo](./docs/images/kyberVisionLogo01.png)

# v23

Kyber Vision 23 is a unified monorepo powering a complete ecosystem for volleyball performance analysis and sharing. It brings together the API, database models, web manager, and background workers into a single, maintainable architecture, while the mobile app (data collection tool) remains separate for now.

Athletes and coaches use the mobile app to script live matches or review recorded sessions, capturing detailed action data such as player involvement, rotation, score, and quality. This data flows through a centralized API and structured SQLite schema, enabling rich analysis across teams, sessions, and videos.

The integrated worker-node service consolidates queue management and media processing, handling automated video montage creation and YouTube uploads. Through the web manager, users can review plays, sync actions to video, generate highlights, and share key moments—turning raw match data into collaborative, social performance insights that drive continuous improvement.

## Directory Structure

```
.
├── CLAUDE.md
├── README.md
├── api
│   ├── CLAUDE.md
│   ├── README.md
│   ├── dist
│   ├── docs
│   ├── node_modules
│   ├── package-lock.json
│   ├── package.json
│   ├── src
│   └── tsconfig.json
├── db-models
│   ├── README.md
│   ├── dist
│   ├── docs
│   ├── node_modules
│   ├── package-lock.json
│   ├── package.json
│   ├── src
│   ├── tsconfig.json
│   └── tsconfig.tsbuildinfo
├── docs
│   ├── API_REFERENCE.md
│   ├── PROJECT_OVERVIEW.md
│   ├── api
│   ├── images
│   ├── references
│   ├── requirements
│   └── transition-to-kv23
├── web-manager
│   ├── README.md
│   ├── components
│   ├── jest.config.js
│   ├── next.config.js
│   ├── node_modules
│   ├── package-lock.json
│   ├── package.json
│   ├── pages
│   ├── public
│   ├── reducers
│   └── styles
└── worker-node
    ├── CLAUDE.md
    ├── README.md
    ├── assets
    ├── dist
    ├── docs
    ├── node_modules
    ├── package-lock.json
    ├── package.json
    ├── public
    ├── scripts
    ├── src
    └── tsconfig.json
```
