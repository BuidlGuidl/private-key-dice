# Welcome to PKDice Contributing Guide

This guide aims to provide an overview of understanding the backend configuration and its connection with the frontend to help us make the contribution process effective.

## About the Project

PKDice is a game designed to demonstrate the difficulty of guessing or brute-forcing a wallet's private key.

Read the [README](README.md) to get an overview of the project.

## Understanding the Project

### Backend Setup Guide

The backend is implemented using **Next.js App Router API routes** (under `packages/nextjs/app/api`) with **Prisma** as the ORM and **PostgreSQL** as the primary database. Ably is still used for real-time communication with the frontend.

**Current Backend Structure (Next.js + Prisma + PostgreSQL)**

```plaintext
packages/nextjs
├── app
│   └── api
│       ├── admin
│       │   ├── changemode
│       │   ├── create
│       │   ├── kickplayer
│       │   ├── pauseresumegame
│       │   └── varyhiddenprivatekey
│       ├── game
│       │   ├── [inviteCode]
│       │   └── endgame
│       └── player
│           └── join
├── lib
│   ├── ably.ts
│   ├── auth.ts
│   └── db.ts        # PrismaClient (PostgreSQL)
├── prisma
│   └── schema.prisma # Prisma data models for Game, Invites, Player
└── .env              # DATABASE_URL, ABLY_API_KEY, JWT_SECRET, etc.
```

### Prerequisites

Ensure you have the following:

- Node.js 
- yarn (Node Package Manager)
- A PostgreSQL database (local or managed, e.g., Supabase, Railway, Neon)
- [Ably Application (For realtime connection)](https://ably.com/)

Setup Instructions

1. Clone the Repository
Clone the repository to your local machine using the following command:

```
git clone https://github.com/BuidlGuidl/private-key-dice.git
cd private-key-dice
```

2. Install Dependencies

Install the necessary dependencies by running:

```
yarn install
```

3. Configure Environment Variables (Next.js backend)

Create a `.env` file in the directory `packages/nextjs` and add your PostgreSQL connection string and Ably API key:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB_NAME?schema=public"
ABLY_API_KEY=your_ably_api_key
JWT_SECRET=your_jwt_secret
```

- Get a `DATABASE_URL` by setting up a PostgreSQL database (local or managed).
- Get an `ABLY_API_KEY` by signing up at [Ably](https://ably.com/) and creating an application. [Learn More](https://ably.com/docs/connect)

4. Run the Next.js App (Backend + Frontend)

From the repository root:

```
yarn start
```

This starts the Next.js development server, which serves both the frontend and the backend API routes. Prisma connects to PostgreSQL via `DATABASE_URL`, and Ably is used from the Next.js API layer for real-time updates.

### Ably Realtime Setup

Ably is configured to publish real-time updates to the `gameUpdate` channel whenever a game state is updated. This allows clients to receive updates instantaneously.

### Backend Ably Setup
The Ably client is initialized with the API key at `packages/backend/index.ts`:


```typescript
export const ably = new Ably.Realtime({ key: process.env.ABLY_API_KEY || backendConfig.ablyApi });
```

Whenever an API call updates the game, Ably publishes the changes:

The code snippet below is used after an API call that updates the data of a game. See controller functions in `packages/backend/controllers`.

```typescript
const channel = ably.channels.get(`gameUpdate`);
channel.publish(`gameUpdate`, updatedGame);
```

### Frontend Ably Integration

The frontend subscribes to the `gameUpdate` channel to receive real-time updates. Here's a React useEffect hook snippet in  `packages/nextjs/pages/game/[id].tsx` for subscribing to the updates:

```typescript
useEffect(() => {
  if (!ablyApiKey) return;
  const ably = new Ably.Realtime({ key: ablyApiKey });
  const channel = ably.channels.get(`gameUpdate`);

  channel.subscribe(message => {
    if (game?._id === message.data._id) {
      setGame(message.data);
      updateGameState(JSON.stringify(message.data));
    }
  });

  return () => {
    channel.unsubscribe(`gameUpdate`);
    ably.close();
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [game, ablyApiKey]);
```

### Additional Information

- API routes: Game logic for admin and player operations lives in `packages/nextjs/app/api`.
- Database access: Implemented with Prisma and PostgreSQL, via `packages/nextjs/lib/db.ts` and `packages/nextjs/prisma/schema.prisma`.
- Realtime: Ably is used by the API routes to broadcast game updates to clients.

With these instructions, you should be able to set up and run the backend server with PostgreSQL, Prisma, and Ably Realtime integration. If you encounter any issues, consult the respective documentation for [Prisma](https://www.prisma.io/docs), [PostgreSQL](https://www.postgresql.org/docs/), and [Ably](https://ably.com/docs).