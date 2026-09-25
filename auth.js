const express = require('express');

const router = express.Router();

// Simple in-memory user store (for demo purposes)
const users = new Map();
const sessions = new Map();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, password, confirmPassword } = req.body;
    
    // Validate input
    if (!username || !password || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    if (username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }
    
    // Check if user already exists
    if (users.has(username)) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    // Create user (in a real app, hash the password)
    const userId = Date.now().toString();
    users.set(username, { id: userId, username, password });
    
    // Create session
    const sessionId = Date.now().toString();
    sessions.set(sessionId, { userId, username });
    
    // Set session cookie
    res.cookie('session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
    
    res.json({ user: { id: userId, username } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    // Check user credentials
    const user = users.get(username);
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    // Create session
    const sessionId = Date.now().toString();
    sessions.set(sessionId, { userId: user.id, username });
    
    // Set session cookie
    res.cookie('session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
    
    res.json({ user: { id: user.id, username } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const sessionId = req.cookies.session_id;
    if (sessionId) {
      sessions.delete(sessionId);
    }
    
    res.clearCookie('session_id');
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const sessionId = req.cookies.session_id;
    
    if (!sessionId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const session = sessions.get(sessionId);
    if (!session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const user = users.get(session.username);
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    res.json({ 
      user: { 
        id: user.id, 
        username: user.username,
        hasUsername: true
      } 
    });
  } catch (error) {
    console.error('Session check error:', error);
    res.status(401).json({ error: 'Not authenticated' });
  }
});

module.exports = router;
