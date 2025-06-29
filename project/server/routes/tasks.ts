import express from 'express';
import { body, query } from 'express-validator';
import { supabase } from '../config/supabase';
import { authenticateToken } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validation';

const router = express.Router();

// Get tasks with filters and pagination
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('category').optional().isUUID(),
  query('minBudget').optional().isFloat({ min: 0 }),
  query('maxBudget').optional().isFloat({ min: 0 }),
  query('location').optional().trim(),
  query('search').optional().trim(),
  query('status').optional().isIn(['open', 'assigned', 'in_progress', 'completed', 'cancelled']),
], handleValidationErrors, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      minBudget,
      maxBudget,
      location,
      search,
      status = 'open'
    } = req.query;

    let query = supabase
      .from('tasks')
      .select(`
        *,
        client:users!tasks_client_id_fkey(id, first_name, last_name, rating, avatar_url),
        category:categories(id, name_en, name_he, name_ru, icon),
        applications:task_applications(count)
      `)
      .eq('status', status);

    // Apply filters
    if (category) {
      query = query.eq('category_id', category);
    }

    if (minBudget) {
      query = query.gte('budget', minBudget);
    }

    if (maxBudget) {
      query = query.lte('budget', maxBudget);
    }

    if (location) {
      query = query.ilike('location', `%${location}%`);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Get total count
    const { count } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('status', status);

    // Apply pagination
    const offset = (Number(page) - 1) * Number(limit);
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    const { data: tasks, error } = await query;

    if (error) {
      throw error;
    }

    // Transform data
    const transformedTasks = tasks.map(task => ({
      ...task,
      applicationsCount: task.applications?.[0]?.count || 0,
    }));

    res.json({
      data: transformedTasks,
      total: count || 0,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil((count || 0) / Number(limit)),
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Failed to get tasks' });
  }
});

// Get single task
router.get('/:id', async (req, res) => {
  try {
    console.log('Fetching task with ID:', req.params.id);
    
    const { data: task, error } = await supabase
      .from('tasks')
      .select(`
        *,
        client:users!tasks_client_id_fkey(
          id, 
          first_name, 
          last_name, 
          rating, 
          avatar_url, 
          phone, 
          total_reviews,
          is_verified
        ),
        category:categories(id, name_en, name_he, name_ru, icon)
      `)
      .eq('id', req.params.id)
      .single();

    console.log('Task query result:', { task, error });

    if (error) {
      console.error('Database error:', error);
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'Task not found' });
      }
      throw error;
    }

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Transform the response to match frontend expectations
    const transformedTask = {
      ...task,
      clientId: task.client_id,
      categoryId: task.category_id,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
      client: task.client ? {
        id: task.client.id,
        firstName: task.client.first_name,
        lastName: task.client.last_name,
        rating: task.client.rating || 0,
        avatarUrl: task.client.avatar_url,
        phone: task.client.phone,
        totalReviews: task.client.total_reviews || 0,
        isVerified: task.client.is_verified || false
      } : null,
      category: task.category ? {
        id: task.category.id,
        nameEn: task.category.name_en,
        nameHe: task.category.name_he,
        nameRu: task.category.name_ru,
        icon: task.category.icon
      } : null
    };

    console.log('Transformed task:', transformedTask);
    res.json(transformedTask);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Failed to get task' });
  }
});

// Create task
router.post('/', authenticateToken, [
  body('title').trim().isLength({ min: 1, max: 200 }),
  body('description').trim().isLength({ min: 10, max: 2000 }),
  body('budget').isFloat({ min: 1 }),
  body('location').trim().isLength({ min: 1 }),
  body('categoryId').isUUID(),
  body('deadline').optional().isISO8601(),
], handleValidationErrors, async (req, res) => {
  try {
    const { title, description, budget, location, categoryId, deadline } = req.body;

    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        client_id: req.user.id,
        category_id: categoryId,
        title,
        description,
        budget,
        location,
        deadline,
      })
      .select(`
        *,
        client:users!tasks_client_id_fkey(id, first_name, last_name, rating, avatar_url),
        category:categories(id, name_en, name_he, name_ru, icon)
      `)
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Failed to create task' });
  }
});

// Update task
router.put('/:id', authenticateToken, [
  body('title').optional().trim().isLength({ min: 1, max: 200 }),
  body('description').optional().trim().isLength({ min: 10, max: 2000 }),
  body('budget').optional().isFloat({ min: 1 }),
  body('location').optional().trim().isLength({ min: 1 }),
  body('status').optional().isIn(['open', 'assigned', 'in_progress', 'completed', 'cancelled']),
  body('deadline').optional().isISO8601(),
], handleValidationErrors, async (req, res) => {
  try {
    // Check if user owns the task
    const { data: existingTask } = await supabase
      .from('tasks')
      .select('client_id')
      .eq('id', req.params.id)
      .single();

    if (!existingTask || existingTask.client_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    const { data: task, error } = await supabase
      .from('tasks')
      .update({
        ...req.body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select(`
        *,
        client:users!tasks_client_id_fkey(id, first_name, last_name, rating, avatar_url),
        category:categories(id, name_en, name_he, name_ru, icon)
      `)
      .single();

    if (error) {
      throw error;
    }

    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Failed to update task' });
  }
});

// Delete task
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user owns the task
    const { data: existingTask } = await supabase
      .from('tasks')
      .select('client_id')
      .eq('id', req.params.id)
      .single();

    if (!existingTask || existingTask.client_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      throw error;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Failed to delete task' });
  }
});

// Apply to task
router.post('/:id/apply', authenticateToken, [
  body('message').optional().trim().isLength({ max: 1000 }),
  body('proposedPrice').optional().isFloat({ min: 1 }),
], handleValidationErrors, async (req, res) => {
  try {
    const { message, proposedPrice } = req.body;

    // Check if task exists and is open
    const { data: task } = await supabase
      .from('tasks')
      .select('id, status, client_id')
      .eq('id', req.params.id)
      .single();

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.status !== 'open') {
      return res.status(400).json({ message: 'Task is not open for applications' });
    }

    if (task.client_id === req.user.id) {
      return res.status(400).json({ message: 'Cannot apply to your own task' });
    }

    // Check if already applied
    const { data: existingApplication } = await supabase
      .from('task_applications')
      .select('id')
      .eq('task_id', req.params.id)
      .eq('provider_id', req.user.id)
      .single();

    if (existingApplication) {
      return res.status(409).json({ message: 'Already applied to this task' });
    }

    const { data: application, error } = await supabase
      .from('task_applications')
      .insert({
        task_id: req.params.id,
        provider_id: req.user.id,
        message,
        proposed_price: proposedPrice,
      })
      .select(`
        *,
        provider:users!task_applications_provider_id_fkey(id, first_name, last_name, rating, avatar_url),
        task:tasks(id, title)
      `)
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json(application);
  } catch (error) {
    console.error('Apply to task error:', error);
    res.status(500).json({ message: 'Failed to apply to task' });
  }
});

// Get task applications
router.get('/:id/applications', authenticateToken, async (req, res) => {
  try {
    // Check if user owns the task
    const { data: task } = await supabase
      .from('tasks')
      .select('client_id')
      .eq('id', req.params.id)
      .single();

    if (!task || task.client_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view applications' });
    }

    const { data: applications, error } = await supabase
      .from('task_applications')
      .select(`
        *,
        provider:users!task_applications_provider_id_fkey(id, first_name, last_name, rating, avatar_url, bio)
      `)
      .eq('task_id', req.params.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json(applications);
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ message: 'Failed to get applications' });
  }
});

// Update application status
router.put('/:id/applications/:applicationId', authenticateToken, [
  body('status').isIn(['accepted', 'rejected']),
], handleValidationErrors, async (req, res) => {
  try {
    const { status } = req.body;

    // Check if user owns the task
    const { data: task } = await supabase
      .from('tasks')
      .select('client_id')
      .eq('id', req.params.id)
      .single();

    if (!task || task.client_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update application' });
    }

    const { data: application, error } = await supabase
      .from('task_applications')
      .update({ status })
      .eq('id', req.params.applicationId)
      .eq('task_id', req.params.id)
      .select(`
        *,
        provider:users!task_applications_provider_id_fkey(id, first_name, last_name, rating, avatar_url)
      `)
      .single();

    if (error) {
      throw error;
    }

    // If accepted, update task status and reject other applications
    if (status === 'accepted') {
      await supabase
        .from('tasks')
        .update({ status: 'assigned' })
        .eq('id', req.params.id);

      await supabase
        .from('task_applications')
        .update({ status: 'rejected' })
        .eq('task_id', req.params.id)
        .neq('id', req.params.applicationId);
    }

    res.json(application);
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({ message: 'Failed to update application' });
  }
});

// Get user's tasks
router.get('/my/:role', authenticateToken, async (req, res) => {
  try {
    const { role } = req.params;
    
    if (!['client', 'provider'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    let query = supabase
      .from('tasks')
      .select(`
        *,
        client:users!tasks_client_id_fkey(id, first_name, last_name, rating, avatar_url),
        category:categories(id, name_en, name_he, name_ru, icon)
      `);

    if (role === 'client') {
      query = query.eq('client_id', req.user.id);
    } else {
      // For providers, first get the task IDs they've applied to
      const { data: applications, error: applicationsError } = await supabase
        .from('task_applications')
        .select('task_id')
        .eq('provider_id', req.user.id);

      if (applicationsError) {
        console.error('Get my tasks error:', applicationsError);
        throw applicationsError;
      }

      const taskIds = applications?.map(app => app.task_id) || [];
      
      if (taskIds.length === 0) {
        // No applications, return empty array
        return res.json([]);
      }

      query = query.in('id', taskIds);
    }

    const { data: tasks, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Get my tasks error:', error);
      throw error;
    }

    res.json(tasks || []);
  } catch (error) {
    console.error('Get my tasks error:', error);
    res.status(500).json({ message: 'Failed to get tasks' });
  }
});

export default router;