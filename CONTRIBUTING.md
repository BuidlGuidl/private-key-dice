# Welcome to PKDice Contributing Guide

This guide aims to provide an overview of understanding the backend configuration and its connection with the frontend to help us make the contribution process effective.

## About the Project

PKDice is a game designed to demonstrate the difficulty of guessing or brute-forcing a wallet's private key.

Read the [README](README.md) to get an overview of the project.

## Understanding the Project

### Backend Setup Guide

The backend uses MongoDB for the database and Ably for real-time communication with the frontend. This guide provides comprehensive instructions on setting up MongoDB and Ably Realtime for the backend server. Follow the instructions carefully to get your development environment up and running.

**Project Structure**

```plaintext
.
├── controllers
│   ├── Admin.ts
│   └── Player.ts
├── middleware
│   └── auth.ts
├── models
│   └── Game.ts
├── routes
│   ├── admin.ts
│   ├── player.ts
│   └── game.ts
├── .env
├── backend.config.ts
├── index.ts
└── package.json
```

### Prerequisites

Ensure you have the following:

- Node.js 
- yarn (Node Package Manager)
- [MongoDB Cluster](https://www.mongodb.com/)
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

3. Configure Environment Variables(optional)
Create a `.env` file in the directory `packages/backend` and add your MongoDB connection string and Ably API key:

```env
PORT=6001
MONGO_URL=your_mongo_connection_string
ABLY_API_KEY=your_ably_api_key
```
Alternatively, you can stick with values of backend.config.ts for testing

- Get a `mongo_url` by signing up at [MongoDB](https://www.mongodb.com/) and creating an cluster. [Learn More](https://www.mongodb.com/docs/drivers/node/v3.6/fundamentals/connection/connect/)
- Get an `ablyApiKey` by signing up at [Ably](https://ably.com/) and creating an application. [Learn More](https://ably.com/docs/connect)

4. Run the Server
Start the server using the following command:

```
yarn backend
```

The server will automatically attempt to connect to MongoDB and Ably. If the connection fails, it will retry every 3 seconds until successful.
The complete setup is in `packages/backend/index.ts`.

### MongoDB Setup

The server uses Mongoose to connect to MongoDB. Ensure your MongoDB URL is correctly set in the .env file or backend.config.ts. The connection logic includes an automatic retry mechanism in case the initial connection fails.

```typescript
const connectWithRetry = async () => {
  await ably.connection.once("connected");
  ably.channels.get(`gameUpdate`);
  console.log("connecting");
  mongoose
    .connect(MONGO_URL)
    .then(() => {
      server.listen(PORT, () => console.log(`Server Connected, Port: ${PORT}`));
    })
    .catch(error => {
      console.log(`${error} did not connect`);
      setTimeout(connectWithRetry, 3000);
    });
};

connectWithRetry();
```

### Ably Realtime Setup

Ably is configured to publish real-time updates to the `gameUpdate` channel whenever a game state is updated. This allows clients to receive updates instantaneously.

### Backend Ably Setup
The Ably client is initialized with your API key:

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

Ensure your frontend application includes the Ably JavaScript SDK and correctly initializes the ablyApiKey.

### Additional Information

- Controllers: Game logic for admin and player operations.
- Middleware: Authentication logic.
- Models: Mongoose schemas for the game model.
- Routes: API endpoints for admin and player interactions.
For more details on specific implementations, refer to the respective files within the project at `packages/backend`.

With these instructions, you should be able to set up and run the backend server with MongoDB and Ably Realtime integration. If you encounter any issues, consult the respective documentation for [Mongoose](https://mongoosejs.com/docs/) and [Ably](https://ably.com/docs).