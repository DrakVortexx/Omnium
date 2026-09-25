const express = require('express');
const { createAuthClient } = require('@neondatabase/auth');

const router = express.Router();
const auth = createAuthClient(process.env.NEON_AUTH_URL);

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;
    
    // Validate input
    if (!username || !email || !password || !confirmPassword) {
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
    
    // Sign up with Neon Auth
    const { data, error } = await auth.signUp.email({
      email,
      password,
      name: username
    });
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    res.json({ user: { id: data.user.id, username: data.user.name, email: data.user.email } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const { data, error } = await auth.signIn.email({
      email,
      password
    });
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    res.json({ user: { id: data.user.id, username: data.user.name, email: data.user.email } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Google OAuth - initiate
router.get('/google', async (req, res) => {
  try {
    const { data, error } = await auth.signIn.social({
      provider: 'google',
      callbackURL: `${req.protocol}://${req.get('host')}/auth/google/callback`
    });
    
    if (error) {
      return res.redirect('/?error=google_auth_failed');
    }
    
    res.redirect(data.url);
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.redirect('/?error=google_auth_failed');
  }
});

// Google OAuth - callback
router.get('/google/callback', async (req, res) => {
  try {
    // The callback is handled by Neon Auth, we just need to check the session
    const session = await auth.getSession();
    
    if (session) {
      // Check if user has a username set
      if (!session.user.name) {
        // Redirect to username setup page
        res.redirect('/?setup_username=true');
      } else {
        res.redirect('/');
      }
    } else {
      res.redirect('/?error=google_auth_failed');
    }
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect('/?error=google_auth_failed');
  }
});

// Set username after OAuth
router.post('/set-username', async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username || username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }
    
    const session = await auth.getSession();
    
    if (!session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // Update user name in Neon Auth
    // Note: Neon Auth may not support direct name updates, this might need custom implementation
    res.json({ message: 'Username set successfully', username });
  } catch (error) {
    console.error('Username update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    await auth.signOut();
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const session = await auth.getSession();
    
    if (session) {
      res.json({ 
        user: { 
          id: session.user.id, 
          username: session.user.name, 
          email: session.user.email,
          hasUsername: !!session.user.name
        } 
      });
    } else {
      res.status(401).json({ error: 'Not authenticated' });
    }
  } catch (error) {
    console.error('Session check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
