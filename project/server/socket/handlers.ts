import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase';

export const setupSocketHandlers = (io: Server) => {
  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
      
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', decoded.userId)
        .single();

      if (error || !user) {
        return next(new Error('Authentication error'));
      }

      socket.userId = user.id;
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected`);

    // Join task rooms
    socket.on('join_task', (taskId: string) => {
      socket.join(`task_${taskId}`);
      console.log(`User ${socket.userId} joined task ${taskId}`);
    });

    // Leave task rooms
    socket.on('leave_task', (taskId: string) => {
      socket.leave(`task_${taskId}`);
      console.log(`User ${socket.userId} left task ${taskId}`);
    });

    // Handle typing indicators
    socket.on('typing_start', (data: { taskId: string; receiverId: string }) => {
      socket.to(`task_${data.taskId}`).emit('user_typing', {
        userId: socket.userId,
        taskId: data.taskId,
      });
    });

    socket.on('typing_stop', (data: { taskId: string }) => {
      socket.to(`task_${data.taskId}`).emit('user_stopped_typing', {
        userId: socket.userId,
        taskId: data.taskId,
      });
    });

    // Handle real-time notifications
    socket.on('join_notifications', () => {
      socket.join(`user_${socket.userId}`);
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
    });
  });

  // Helper function to send notifications
  const sendNotification = (userId: string, notification: any) => {
    io.to(`user_${userId}`).emit('notification', notification);
  };

  return { sendNotification };
};