import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private token: string | null = null;

  connect(token: string) {
    if (this.socket?.connected) {
      return;
    }

    this.token = token;
    
    // Use the correct server URL - remove /api since socket.io runs on the main server
    const serverUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';
    
    this.socket = io(serverUrl, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      forceNew: true
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to socket server');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from socket server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔴 Socket connection error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Join a task room for real-time messaging
  joinTask(taskId: string) {
    if (this.socket) {
      console.log('🏠 Joining task room:', taskId);
      this.socket.emit('join_task', taskId);
    }
  }

  // Leave a task room
  leaveTask(taskId: string) {
    if (this.socket) {
      console.log('🚪 Leaving task room:', taskId);
      this.socket.emit('leave_task', taskId);
    }
  }

  // Listen for new messages
  onNewMessage(callback: (message: any) => void) {
    if (this.socket) {
      console.log('👂 Setting up new message listener');
      this.socket.on('new_message', (message) => {
        console.log('📨 Received new message:', message);
        callback(message);
      });
    }
  }

  // Remove message listener
  offNewMessage() {
    if (this.socket) {
      this.socket.off('new_message');
    }
  }

  // Send typing indicator
  startTyping(taskId: string, receiverId: string) {
    if (this.socket) {
      this.socket.emit('typing_start', { taskId, receiverId });
    }
  }

  // Stop typing indicator
  stopTyping(taskId: string) {
    if (this.socket) {
      this.socket.emit('typing_stop', { taskId });
    }
  }

  // Listen for typing indicators
  onUserTyping(callback: (data: { userId: string; taskId: string }) => void) {
    if (this.socket) {
      this.socket.on('user_typing', callback);
    }
  }

  onUserStoppedTyping(callback: (data: { userId: string; taskId: string }) => void) {
    if (this.socket) {
      this.socket.on('user_stopped_typing', callback);
    }
  }

  // Remove typing listeners
  offTypingEvents() {
    if (this.socket) {
      this.socket.off('user_typing');
      this.socket.off('user_stopped_typing');
    }
  }

  // Join notifications room
  joinNotifications() {
    if (this.socket) {
      console.log('🔔 Joining notifications room');
      this.socket.emit('join_notifications');
    }
  }

  // Listen for notifications
  onNotification(callback: (notification: any) => void) {
    if (this.socket) {
      this.socket.on('notification', callback);
    }
  }

  // Remove notification listener
  offNotification() {
    if (this.socket) {
      this.socket.off('notification');
    }
  }

  // Check if socket is connected
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();