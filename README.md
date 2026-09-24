# Omnium - Multiplayer Story MMO Economy Game

A browser-based multiplayer story MMO with an economy system, built with Node.js, Express, and Socket.io.

## Features

- **Multiplayer**: Real-time multiplayer with player movement and interaction
- **Economy System**: Buy and sell items in a dynamic market
- **Inventory Management**: Track and manage your items
- **Story Progress**: Advance through story chapters to earn rewards
- **Chat System**: Real-time chat with other players
- **Single HTML Client**: All client-side code in one file

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

## How to Play

1. **Enter your name** on the login screen
2. **Move** by clicking anywhere in the game world
3. **Buy items** from the market using gold
4. **Sell items** from your inventory for 70% of their value
5. **Advance story** by clicking the "Advance Story" button to earn rewards
6. **Chat** with other players using the chat panel

## Game Mechanics

### Starting Gold
Each player starts with 100 gold.

### Market
- Items are sold by the system and other players
- Prices vary based on the item type
- You can sell your items to the market for 70% of their value

### Story Progress
- Progress through 10 story chapters
- Reach chapter 5 to earn 50 gold
- Reach chapter 10 to earn 100 gold

### Items
- **Iron Sword**: 100 gold (weapon)
- **Wooden Shield**: 75 gold (armor)
- **Health Potion**: 25 gold (consumable)

## Technologies Used

- **Node.js**: Server runtime
- **Express**: Web server framework
- **Socket.io**: Real-time WebSocket communication
- **HTML5 Canvas**: Game world rendering
- **Vanilla JavaScript**: Client-side logic

## Project Structure

```
Omnium/
├── package.json       # Dependencies and scripts
├── server.js          # Node.js server with game logic
├── index.html         # Single-file client with UI and game logic
└── README.md          # This file
```

## Development

The server runs on port 3000 by default. You can change this by setting the PORT environment variable:

```bash
PORT=8080 npm start
```

## Future Enhancements

- Player combat system
- Quest system
- Guild/clan system
- More items and equipment
- Player stats and leveling
- Save game progress
- Database integration
