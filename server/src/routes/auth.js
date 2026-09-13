const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Users, PasswordResets } = require('../db');
const { JWT_SECRET, authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Helper to generate JWT
function generateToken(user) {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    }, 
    JWT_SECRET, 
    { expiresIn: '7d' }
  );
}

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Please provide your full name.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ error: 'Invalid email address format.' });
    }

    // Check if user already exists
    const existing = Users.findByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists. Please log in instead.' });
    }

    // Hash password with bcrypt (salt rounds 10)
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create user (defaults to role 'user')
    const newUser = Users.create({
      name,
      email,
      password_hash,
      role: 'user'
    });

    const token = generateToken(newUser);

    res.status(201).json({
      message: 'Account created successfully!',
      user: newUser,
      token
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Internal server error during account creation.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide both email and password.' });
    }

    // Fetch user including hash for verification
    const user = Users.findByEmail(email, true);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ error: 'This account has been deactivated. Please contact support.' });
    }

    // Compare bcrypt hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Update last login timestamp
    Users.updateLastLogin(user.id);

    // Generate token
    const token = generateToken(user);

    // Return safe user object (exclude password_hash)
    const { password_hash: _, ...safeUser } = user;

    res.json({
      message: 'Logged in successfully!',
      user: safeUser,
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// GET /api/auth/me - Current user profile
router.get('/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Please provide your account email.' });
    }

    const user = Users.findByEmail(email);
    // For privacy, we always return a positive message, but generate token if user exists
    if (!user) {
      return res.json({ 
        message: 'If an account exists with that email, a password reset link has been generated.',
        resetLink: null
      });
    }

    // Generate secure token
    const token = PasswordResets.create(user.id);
    const resetUrl = `/reset-password?token=${token}`;

    res.json({
      message: 'Password reset link generated successfully.',
      resetToken: token,
      resetUrl,
      // Provide simulated email notice for effortless testing
      simulatedNotice: `In a production environment, an email is dispatched to ${user.email}. For local testing, follow the generated link below.`
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Error generating password reset request.' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Missing password reset token.' });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const resetRecord = PasswordResets.findByToken(token);
    if (!resetRecord) {
      return res.status(400).json({ error: 'Invalid or expired password reset link. Please request a new one.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    // Update user password
    const success = Users.updatePassword(resetRecord.user_id, password_hash);
    if (!success) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Invalidate reset token
    PasswordResets.markUsed(token);

    res.json({ message: 'Your password has been successfully reset. You can now log in.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Error resetting password.' });
  }
});

module.exports = router;
