import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body } from 'express-validator';
import { supabase } from '../config/supabase';
import { authenticateToken } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validation';

const router = express.Router();

// Register
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().isLength({ min: 1 }),
  body('lastName').trim().isLength({ min: 1 }),
  body('role').isIn(['client', 'provider']),
], handleValidationErrors, async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, role } = req.body;

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        first_name: firstName,
        last_name: lastName,
        phone,
        role,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Remove password hash from response
    const { password_hash, ...userResponse } = user;

    res.status(201).json({
      user: {
        ...userResponse,
        firstName: user.first_name,
        lastName: user.last_name,
        isVerified: user.is_verified,
        avatarUrl: user.avatar_url,
        totalReviews: user.total_reviews,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists(),
], handleValidationErrors, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Remove password hash from response
    const { password_hash, ...userResponse } = user;

    res.json({
      user: {
        ...userResponse,
        firstName: user.first_name,
        lastName: user.last_name,
        isVerified: user.is_verified,
        avatarUrl: user.avatar_url,
        totalReviews: user.total_reviews,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const { password_hash, ...userResponse } = req.user;
    
    res.json({
      ...userResponse,
      firstName: req.user.first_name,
      lastName: req.user.last_name,
      isVerified: req.user.is_verified,
      avatarUrl: req.user.avatar_url,
      totalReviews: req.user.total_reviews,
      createdAt: req.user.created_at,
      updatedAt: req.user.updated_at,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Failed to get user' });
  }
});

// Update profile
router.put('/profile', authenticateToken, [
  body('firstName').optional().trim().isLength({ min: 1 }),
  body('lastName').optional().trim().isLength({ min: 1 }),
  body('phone').optional(),
  body('bio').optional(),
  body('location').optional(),
], handleValidationErrors, async (req, res) => {
  try {
    const { firstName, lastName, phone, bio, location } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .update({
        first_name: firstName,
        last_name: lastName,
        phone,
        bio,
        location,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    const { password_hash, ...userResponse } = user;

    res.json({
      ...userResponse,
      firstName: user.first_name,
      lastName: user.last_name,
      isVerified: user.is_verified,
      avatarUrl: user.avatar_url,
      totalReviews: user.total_reviews,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

export default router;