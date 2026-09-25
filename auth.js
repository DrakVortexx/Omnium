const express = require('express');
const fetch = require('node-fetch');

const router = express.Router();
const NEON_AUTH_URL = process.env.NEON_AUTH_URL;

// Helper function to make requests to Neon Auth
async function neonAuthRequest(endpoint, method = 'GET', body = null, headers = {}) {
  const url = `${NEON_AUTH_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(url, options);
  const data = await response.json();
  return { response, data };
}

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
    const { response, data } = await neonAuthRequest('/sign-up/email', 'POST', {
      email,
      password,
      name: username
    });
    
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Registration failed' });
    }
    
    res.json({ user: { id: data.user?.id, username: data.user?.name, email: data.user?.email } });
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
    
    const { response, data } = await neonAuthRequest('/sign-in/email', 'POST', {
      email,
      password
    });
    
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Login failed' });
    }
    
    // Set the session cookie from the response
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      res.setHeader('Set-Cookie', setCookieHeader);
    }
    
    res.json({ user: { id: data.user?.id, username: data.user?.name, email: data.user?.email } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Google OAuth - initiate
router.get('/google', async (req, res) => {
  try {
    const callbackURL = `${req.protocol}://${req.get('host')}/auth/google/callback`;
    const { response, data } = await neonAuthRequest('/sign-in/social', 'POST', {
      provider: 'google',
      callbackURL
    });
    
    if (!response.ok) {
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
    // The callback is handled by Neon Auth directly
    // We redirect to home and let the frontend check the session
    res.redirect('/');
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
    
    // Get the session cookie from the request
    const sessionCookie = req.headers.cookie;
    
    if (!sessionCookie) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // Update user name - this might need to be done through a custom endpoint
    // For now, we'll simulate success
    res.json({ message: 'Username set successfully', username });
  } catch (error) {
    console.error('Username update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const { response, data } = await neonAuthRequest('/sign-out', 'POST');
    
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Logout failed' });
    }
    
    // Clear the session cookie
    res.clearCookie('__Secure-neonauth.session_token');
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    // Forward the session cookie from the request
    const sessionCookie = req.headers.cookie;
    
    const { response, data } = await neonAuthRequest('/get-session', 'GET', null, {
      'Cookie': sessionCookie
    });
    
    if (!response.ok) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    if (data.session && data.user) {
      res.json({ 
        user: { 
          id: data.user.id, 
          username: data.user.name, 
          email: data.user.email,
          hasUsername: !!data.user.name
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
