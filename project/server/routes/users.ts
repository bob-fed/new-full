import express from 'express';
import { body } from 'express-validator';
import { supabase } from '../config/supabase';
import { authenticateToken, requireRole } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validation';

const router = express.Router();

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id, first_name, last_name, avatar_url, bio, location, rating, total_reviews, 
        is_verified, role, created_at
      `)
      .eq('id', req.params.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's reviews
    const { data: reviews } = await supabase
      .from('reviews')
      .select(`
        id, rating, comment, created_at,
        reviewer:users!reviews_reviewer_id_fkey(id, first_name, last_name, avatar_url),
        task:tasks(id, title)
      `)
      .eq('reviewee_id', req.params.id)
      .order('created_at', { ascending: false })
      .limit(10);

    res.json({
      ...user,
      firstName: user.first_name,
      lastName: user.last_name,
      isVerified: user.is_verified,
      avatarUrl: user.avatar_url,
      totalReviews: user.total_reviews,
      createdAt: user.created_at,
      reviews: reviews || [],
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Failed to get user' });
  }
});

// Update user verification status (admin only)
router.put('/:id/verify', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .update({ is_verified: true })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({ message: 'User verified successfully' });
  } catch (error) {
    console.error('Verify user error:', error);
    res.status(500).json({ message: 'Failed to verify user' });
  }
});

// Get all users (admin only)
router.get('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        id, email, first_name, last_name, role, is_verified, rating, total_reviews, created_at
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    const transformedUsers = users.map(user => ({
      ...user,
      firstName: user.first_name,
      lastName: user.last_name,
      isVerified: user.is_verified,
      totalReviews: user.total_reviews,
      createdAt: user.created_at,
    }));

    res.json(transformedUsers);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Failed to get users' });
  }
});

export default router;