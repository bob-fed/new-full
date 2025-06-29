import express from 'express';
import { body } from 'express-validator';
import { supabase } from '../config/supabase';
import { authenticateToken } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validation';
import { io } from '../index';

const router = express.Router();

// Get conversations - moved to top to avoid conflicts with /:taskId route
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const { data: conversations, error } = await supabase
      .from('messages')
      .select(`
        task_id,
        task:tasks(id, title),
        sender:users!messages_sender_id_fkey(id, first_name, last_name, avatar_url),
        receiver:users!messages_receiver_id_fkey(id, first_name, last_name, avatar_url),
        content,
        created_at,
        is_read
      `)
      .or(`sender_id.eq.${req.user.id},receiver_id.eq.${req.user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Group by task and get latest message for each
    const groupedConversations = conversations.reduce((acc: any, message: any) => {
      if (!acc[message.task_id] || new Date(message.created_at) > new Date(acc[message.task_id].created_at)) {
        acc[message.task_id] = message;
      }
      return acc;
    }, {});

    res.json(Object.values(groupedConversations));
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Failed to get conversations' });
  }
});

// Get messages for a task
router.get('/:taskId', authenticateToken, async (req, res) => {
  try {
    const { taskId } = req.params;

    // Check if user is involved in the task
    const { data: task } = await supabase
      .from('tasks')
      .select('client_id')
      .eq('id', taskId)
      .single();

    const { data: application } = await supabase
      .from('task_applications')
      .select('provider_id')
      .eq('task_id', taskId)
      .eq('provider_id', req.user.id)
      .single();

    if (!task || (task.client_id !== req.user.id && !application)) {
      return res.status(403).json({ message: 'Not authorized to view messages' });
    }

    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!messages_sender_id_fkey(id, first_name, last_name, avatar_url),
        receiver:users!messages_receiver_id_fkey(id, first_name, last_name, avatar_url)
      `)
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Failed to get messages' });
  }
});

// Send message
router.post('/', authenticateToken, [
  body('taskId').isUUID(),
  body('receiverId').isUUID(),
  body('content').trim().isLength({ min: 1, max: 1000 }),
], handleValidationErrors, async (req, res) => {
  try {
    const { taskId, receiverId, content } = req.body;

    // Verify user can send message for this task
    const { data: task } = await supabase
      .from('tasks')
      .select('client_id')
      .eq('id', taskId)
      .single();

    const { data: application } = await supabase
      .from('task_applications')
      .select('provider_id')
      .eq('task_id', taskId)
      .eq('provider_id', req.user.id)
      .single();

    if (!task || (task.client_id !== req.user.id && !application)) {
      return res.status(403).json({ message: 'Not authorized to send message' });
    }

    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        task_id: taskId,
        sender_id: req.user.id,
        receiver_id: receiverId,
        content,
      })
      .select(`
        *,
        sender:users!messages_sender_id_fkey(id, first_name, last_name, avatar_url),
        receiver:users!messages_receiver_id_fkey(id, first_name, last_name, avatar_url)
      `)
      .single();

    if (error) {
      throw error;
    }

    // Emit to socket
    io.to(`task_${taskId}`).emit('new_message', message);

    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

// Mark message as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { data: message, error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('id', req.params.id)
      .eq('receiver_id', req.user.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json(message);
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Failed to mark as read' });
  }
});

export default router;