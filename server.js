const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Game State
const gameState = {
  players: new Map(),
  items: {
    'sword': { id: 'sword', name: 'Iron Sword', price: 100, type: 'weapon' },
    'shield': { id: 'shield', name: 'Wooden Shield', price: 75, type: 'armor' },
    'potion': { id: 'potion', name: 'Health Potion', price: 25, type: 'consumable' },
    'gold': { id: 'gold', name: 'Gold Coin', price: 1, type: 'currency' }
  },
  market: [],
  storyProgress: new Map()
};

// Initialize market with some items
function initializeMarket() {
  gameState.market = [
    { id: 1, itemId: 'sword', seller: 'system', price: 100, quantity: 5 },
    { id: 2, itemId: 'shield', seller: 'system', price: 75, quantity: 5 },
    { id: 3, itemId: 'potion', seller: 'system', price: 25, quantity: 20 }
  ];
}

initializeMarket();

// Serve static files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  // Player joins
  socket.on('player_join', (data) => {
    const player = {
      id: socket.id,
      name: data.name || 'Anonymous',
      x: Math.random() * 800,
      y: Math.random() * 600,
      gold: 100,
      inventory: {},
      storyProgress: 0
    };
    
    gameState.players.set(socket.id, player);
    gameState.storyProgress.set(socket.id, 0);
    
    // Send player their data
    socket.emit('player_init', player);
    
    // Broadcast to all players
    io.emit('players_update', Array.from(gameState.players.values()));
    io.emit('market_update', gameState.market);
    
    console.log(`Player ${player.name} joined the game`);
  });

  // Player movement
  socket.on('player_move', (data) => {
    const player = gameState.players.get(socket.id);
    if (player) {
      player.x = data.x;
      player.y = data.y;
      io.emit('player_moved', { id: socket.id, x: player.x, y: player.y });
    }
  });

  // Buy item from market
  socket.on('buy_item', (data) => {
    const player = gameState.players.get(socket.id);
    const marketItem = gameState.market.find(m => m.id === data.marketId);
    
    if (player && marketItem && marketItem.quantity > 0) {
      const item = gameState.items[marketItem.itemId];
      
      if (player.gold >= marketItem.price) {
        player.gold -= marketItem.price;
        player.inventory[marketItem.itemId] = (player.inventory[marketItem.itemId] || 0) + 1;
        marketItem.quantity--;
        
        if (marketItem.quantity <= 0) {
          gameState.market = gameState.market.filter(m => m.id !== data.marketId);
        }
        
        socket.emit('purchase_success', { item, remainingGold: player.gold });
        io.emit('market_update', gameState.market);
        io.emit('players_update', Array.from(gameState.players.values()));
      } else {
        socket.emit('purchase_failed', { reason: 'Not enough gold' });
      }
    }
  });

  // Sell item to market
  socket.on('sell_item', (data) => {
    const player = gameState.players.get(socket.id);
    const item = gameState.items[data.itemId];
    
    if (player && item && player.inventory[data.itemId] > 0) {
      const sellPrice = Math.floor(item.price * 0.7); // Sell for 70% of value
      
      player.inventory[data.itemId]--;
      if (player.inventory[data.itemId] <= 0) {
        delete player.inventory[data.itemId];
      }
      
      player.gold += sellPrice;
      
      // Add to market
      const newMarketItem = {
        id: Date.now(),
        itemId: data.itemId,
        seller: player.name,
        price: item.price,
        quantity: 1
      };
      gameState.market.push(newMarketItem);
      
      socket.emit('sell_success', { item, goldGained: sellPrice });
      io.emit('market_update', gameState.market);
      io.emit('players_update', Array.from(gameState.players.values()));
    }
  });

  // Story progress
  socket.on('story_progress', (data) => {
    const progress = gameState.storyProgress.get(socket.id) || 0;
    const newProgress = Math.min(progress + 1, 10);
    gameState.storyProgress.set(socket.id, newProgress);
    
    socket.emit('story_update', { progress: newProgress });
    
    // Reward for story milestones
    if (newProgress === 5 || newProgress === 10) {
      const player = gameState.players.get(socket.id);
      if (player) {
        const reward = newProgress === 5 ? 50 : 100;
        player.gold += reward;
        socket.emit('story_reward', { progress: newProgress, reward });
        io.emit('players_update', Array.from(gameState.players.values()));
      }
    }
  });

  // Chat message
  socket.on('chat_message', (data) => {
    const player = gameState.players.get(socket.id);
    if (player) {
      io.emit('chat_broadcast', {
        player: player.name,
        message: data.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Player disconnect
  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    gameState.players.delete(socket.id);
    gameState.storyProgress.delete(socket.id);
    io.emit('players_update', Array.from(gameState.players.values()));
  });
});

server.listen(PORT, () => {
  console.log(`Omnium MMO server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});
