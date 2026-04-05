# uangku-app

A monorepo for the **Uangku** personal finance app, consisting of a mobile app (Expo/React Native) and a backend server (NestJS).

## Project Structure

uangku-app/
├── apps/
│ ├── mobile/ # Expo React Native app
│ └── server/ # NestJS backend
├── package.json
├── pnpm-workspace.yaml
└── .npmrc

## Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) >= 20
- [pnpm](https://pnpm.io/) >= 10.6.1 — `npm install -g pnpm`
- [Expo Go](https://expo.dev/go) on your phone (for scanning QR code)
- [PostgreSQL](https://www.postgresql.org/)

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

> Dependencies are hoisted to the root `node_modules`. Each app may also have its own `node_modules` with symlinks — this is expected behavior with pnpm workspaces.

### 2. Configure environment variables

Ask a teammate for the `.env` files, then place them as follows:

- `apps/server/.env`
- `apps/mobile/.env` _(if needed)_

> For the mobile app, make sure `API_URL` points to your **local machine IP**, not `localhost`, so your phone can reach the server.

## Running the App

Open **two separate terminals** from the project root:

**Terminal 1 — Start the server:**

```bash
pnpm start:server
```

**Terminal 2 — Start the mobile app:**

```bash
pnpm start:mobile
```

Then scan the QR code from Terminal 2 using the **Expo Go** app on your phone.

## Available Scripts

| Script              | Description                       |
| ------------------- | --------------------------------- |
| `pnpm start:server` | Start NestJS server in watch mode |
| `pnpm start:mobile` | Start Expo dev server             |
| `pnpm lint`         | Run linter across all apps        |

## Database

```bash
# Run migrations
pnpm --filter uangku-server migration:run

# Revert last migration
pnpm --filter uangku-server migration:revert

# Generate new migration
pnpm --filter uangku-server migration:generate

# Seed database
pnpm --filter uangku-server seed:run

# Full reset (drop → migrate → seed)
pnpm --filter uangku-server migration:reset
```

## Tech Stack

|                 | Technology                                |
| --------------- | ----------------------------------------- |
| Mobile          | React Native, Expo, Expo Router, Zustand  |
| Server          | NestJS, TypeORM, PostgreSQL, Passport JWT |
| Package Manager | pnpm workspaces                           |
