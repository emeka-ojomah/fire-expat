const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabaseClient');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/test', (req, res) => {
  res.json({ message: 'Auth route is alive' });
});

router.get('/me', authMiddleware, (req, res) => {
  return res.status(200).json({ user: req.user });
});

router.post('/register', async (req, res) => {
  const { email, password, full_name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name }
      }
    });

    if (error) return res.status(400).json({ error: error.message });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: data.user
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) return res.status(401).json({ error: error.message });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: data.user,
      session: data.session
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/logout', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const { error } = await supabase.auth.admin.signOut(token);

    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;