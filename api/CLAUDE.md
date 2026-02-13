# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with hot reload using nodemon and ts-node
- `npm run build` - Compile TypeScript to JavaScript (outputs to dist/)
- `npm start` - Run compiled JavaScript from dist/app.js

## Architecture Overview

This is the KyberVision23 API. The project follows a clean separation between source (`src/`) and compiled output (`dist/`) directories.

### Key Dependencies

- **Express.js** - Web framework
- **KyberVision23Db** - Local database package (file:../db-models) providing Sequelize models
- **Sequelize** - ORM for database operations with SQLite
- **TypeScript** - Primary language with ts-node for development

### Project Structure

```
src/
├── app.ts           - Main application entry point with DB initialization
├── routes/          - Express route handlers
│   └── index.ts     - Basic route definitions
├── modules/         - Business logic modules (currently empty)
└── templates/       - Email template HTML files
    ├── registrationConfirmationEmail.html
    ├── requestToRegisterEmail.html
    ├── resetPasswordLinkEmail.html
    └── videoMontageCompleteNotificationEmail.html
```

### Database Integration

The API integrates with the KyberVision23Db package which provides:

- Sequelize models for all entities (Users, Teams, Players, Leagues, Sessions, Videos, etc.)
- Centralized model initialization via `initModels()`
- Type-safe database operations with TypeScript definitions
- SQLite database with comprehensive schema for sports team management

Key database entities include core tables (users, teams, players, leagues, sessions, videos, scripts) and contract/relationship tables that manage associations between entities.

- see the docs/DATABASE_OVERVIEW.md for a detailed overview of the database schema.

### Application Bootstrap

The main application (`src/app.ts`) follows this startup sequence:

1. Load environment variables from `.env`
2. Initialize database models via `initModels()`
3. Sync database schema with `sequelize.sync()`
4. Start Express server on configured port

### Development Notes

- The project uses CommonJS modules (not ES modules)
- Database models are strongly typed using Sequelize TypeScript patterns
- The codebase maintains references to KyberVision18 for migration context
- Email templates suggest user registration and video processing workflows
