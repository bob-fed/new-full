import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  MessageCircle, 
  User, 
  ArrowLeft, 
  Phone, 
  Video, 
  MoreVertical,
  Search,
  Paperclip,
  Smile,
  Check,
  CheckCheck
} from 'lucide-react';
import { Layout } from '../../components/Layout/Layout';
import { Button } from '../../components/UI/Button';
import { useAuth } from '../../contexts/AuthContext';
import { Message } from '../../types';
import { chatService } from '../../services/chatService';
import { socketService } from '../../services/socketService';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';

// Helper function to safely format dates
const safeFormatDistanceToNow = (date: string | Date | null | undefined): string => {
  if (!date) return 'Unknown time';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Unknown time';
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch (error) {
    return 'Unknown time';
  }
};

const formatMessageTime = (date: string | Date | null | undefined): string => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '';
    
    if (isToday(dateObj)) {
      return format(dateObj, 'HH:mm');
    } else if (isYesterday(dateObj)) {
      return 'Yesterday';
    } else {
      return format(dateObj, 'MMM dd');
    }
  } catch (error) {
    return '';
  }
};

export const Chat: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [conversations, setConversations] = React.useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = React.useState<any>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [newMessage, setNewMessage] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSending, setIsSending] = React.useState(false);
  const [typingUsers, setTypingUsers] = React.useState<Set<string>>(new Set());
  const [typingTimeout, setTypingTimeout] = React.useState<NodeJS.Timeout | null>(null);
  const [showConversations, setShowConversations] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isOnline, setIsOnline] = React.useState(true);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    loadConversations();
    
    // Set up socket listeners
    socketService.onNewMessage(handleNewMessage);
    socketService.onUserTyping(handleUserTyping);
    socketService.onUserStoppedTyping(handleUserStoppedTyping);

    // Handle online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      socketService.offNewMessage();
      socketService.offTypingEvents();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (selectedConversation) {
        socketService.leaveTask(selectedConversation.task_id);
      }
    };
  }, []);

  React.useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.task_id);
      socketService.joinTask(selectedConversation.task_id);
      
      // Hide conversations on mobile when chat is selected
      if (window.innerWidth < 1024) {
        setShowConversations(false);
      }
      
      return () => {
        socketService.leaveTask(selectedConversation.task_id);
      };
    }
  }, [selectedConversation]);

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [newMessage]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  const handleNewMessage = (message: any) => {
    console.log('Received new message via socket:', message);
    
    if (selectedConversation && message.task_id === selectedConversation.task_id) {
      setMessages(prev => {
        const exists = prev.some(m => m.id === message.id);
        if (exists) return prev;
        
        const transformedMessage = {
          id: message.id,
          taskId: message.task_id,
          senderId: message.sender_id,
          receiverId: message.receiver_id,
          content: message.content,
          isRead: message.is_read,
          createdAt: message.created_at,
          sender: message.sender,
          receiver: message.receiver
        };
        
        return [...prev, transformedMessage];
      });
    }
    
    loadConversations();
  };

  const handleUserTyping = (data: { userId: string; taskId: string }) => {
    if (selectedConversation && data.taskId === selectedConversation.task_id && data.userId !== user?.id) {
      setTypingUsers(prev => new Set([...prev, data.userId]));
    }
  };

  const handleUserStoppedTyping = (data: { userId: string; taskId: string }) => {
    if (selectedConversation && data.taskId === selectedConversation.task_id) {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    }
  };

  const loadConversations = async () => {
    try {
      const conversationsData = await chatService.getConversations();
      setConversations(conversationsData);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (taskId: string) => {
    try {
      const messagesData = await chatService.getMessages(taskId);
      setMessages(messagesData);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || isSending) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setIsSending(true);

    try {
      const otherUser = selectedConversation.sender.id === user?.id 
        ? selectedConversation.receiver 
        : selectedConversation.sender;

      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        taskId: selectedConversation.task_id,
        senderId: user!.id,
        receiverId: otherUser.id,
        content: messageContent,
        isRead: false,
        createdAt: new Date().toISOString(),
        sender: {
          id: user!.id,
          first_name: user!.firstName,
          last_name: user!.lastName,
          avatar_url: user!.avatarUrl
        },
        status: 'sending'
      };

      setMessages(prev => [...prev, optimisticMessage]);

      const sentMessage = await chatService.sendMessage({
        taskId: selectedConversation.task_id,
        receiverId: otherUser.id,
        content: messageContent,
      });

      setMessages(prev => 
        prev.map(msg => 
          msg.id === optimisticMessage.id 
            ? { ...sentMessage, senderId: sentMessage.sender_id || sentMessage.senderId, status: 'sent' }
            : msg
        )
      );

      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      socketService.stopTyping(selectedConversation.task_id);
      
      loadConversations();
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => 
        prev.map(msg => 
          msg.id.startsWith('temp-') 
            ? { ...msg, status: 'failed' }
            : msg
        )
      );
      setNewMessage(messageContent);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    
    if (selectedConversation && e.target.value.trim()) {
      const otherUser = selectedConversation.sender.id === user?.id 
        ? selectedConversation.receiver 
        : selectedConversation.sender;
      
      socketService.startTyping(selectedConversation.task_id, otherUser.id);
      
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      
      const timeout = setTimeout(() => {
        socketService.stopTyping(selectedConversation.task_id);
      }, 1000);
      
      setTypingTimeout(timeout);
    }
  };

  const handleBackToConversations = () => {
    setShowConversations(true);
    setSelectedConversation(null);
  };

  const filteredConversations = conversations.filter(conversation => {
    if (!searchQuery) return true;
    
    const otherUser = conversation.sender.id === user?.id 
      ? conversation.receiver 
      : conversation.sender;
    
    const userName = `${otherUser.first_name} ${otherUser.last_name}`.toLowerCase();
    const taskTitle = conversation.task.title.toLowerCase();
    
    return userName.includes(searchQuery.toLowerCase()) || 
           taskTitle.includes(searchQuery.toLowerCase());
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="h-screen bg-gray-50 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
          {selectedConversation ? (
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToConversations}
                className="p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-semibold text-gray-900 truncate">
                  {selectedConversation.sender.id === user?.id 
                    ? `${selectedConversation.receiver.first_name} ${selectedConversation.receiver.last_name}`
                    : `${selectedConversation.sender.first_name} ${selectedConversation.sender.last_name}`
                  }
                </h1>
                <p className="text-sm text-gray-500">
                  {isOnline ? 'Online' : 'Offline'}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="p-2">
                  <Phone className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2">
                  <Video className="w-5 h-5" />
                </Button>
              </div>
            </div>
          ) : (
            <h1 className="text-xl font-bold text-gray-900">{t('chat.title')}</h1>
          )}
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Conversations Sidebar */}
          <div className={`${showConversations ? 'flex' : 'hidden'} lg:flex flex-col w-full lg:w-80 bg-white border-r border-gray-200`}>
            {/* Desktop Header */}
            <div className="hidden lg:block p-6 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('chat.title')}</h1>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {filteredConversations.map((conversation) => {
                    const otherUser = conversation.sender.id === user?.id 
                      ? conversation.receiver 
                      : conversation.sender;
                    
                    const isSelected = selectedConversation?.task_id === conversation.task_id;
                    
                    return (
                      <motion.div
                        key={conversation.task_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        whileHover={{ backgroundColor: '#f9fafb' }}
                        onClick={() => setSelectedConversation(conversation)}
                        className={`p-4 cursor-pointer transition-all duration-200 ${
                          isSelected 
                            ? 'bg-blue-50 border-r-2 border-blue-500' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              {otherUser.avatar_url ? (
                                <img
                                  src={otherUser.avatar_url}
                                  alt={otherUser.first_name}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <User className="w-6 h-6 text-white" />
                              )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {otherUser.first_name} {otherUser.last_name}
                              </h3>
                              <span className="text-xs text-gray-500">
                                {formatMessageTime(conversation.created_at)}
                              </span>
                            </div>
                            
                            <p className="text-sm text-gray-600 truncate mb-1">
                              {conversation.content || 'No messages yet'}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500 truncate">
                                Task: {conversation.task.title}
                              </span>
                              {!conversation.is_read && conversation.sender.id !== user?.id && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <MessageCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations</h3>
                  <p className="text-gray-500">
                    {searchQuery ? 'No conversations match your search' : 'Start by applying to a task'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`${!showConversations ? 'flex' : 'hidden'} lg:flex flex-col flex-1 bg-white`}>
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="hidden lg:flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900">
                        {selectedConversation.sender.id === user?.id 
                          ? `${selectedConversation.receiver.first_name} ${selectedConversation.receiver.last_name}`
                          : `${selectedConversation.sender.first_name} ${selectedConversation.sender.last_name}`
                        }
                      </h2>
                      <p className="text-sm text-gray-500">
                        Task: {selectedConversation.task.title}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" className="p-2">
                      <Phone className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="p-2">
                      <Video className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="p-2">
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Messages Area */}
                <div 
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white"
                  style={{ height: 'calc(100vh - 200px)' }}
                >
                  <AnimatePresence>
                    {messages.map((message, index) => {
                      const isMyMessage = message.senderId === user?.id || message.sender_id === user?.id;
                      const showAvatar = index === 0 || 
                        messages[index - 1]?.senderId !== message.senderId;
                      
                      return (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} ${
                            showAvatar ? 'mt-4' : 'mt-1'
                          }`}
                        >
                          <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${
                            isMyMessage ? 'flex-row-reverse space-x-reverse' : ''
                          }`}>
                            {!isMyMessage && showAvatar && (
                              <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-white" />
                              </div>
                            )}
                            
                            <div className={`relative px-4 py-2 rounded-2xl ${
                              isMyMessage
                                ? 'bg-blue-600 text-white rounded-br-md'
                                : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md shadow-sm'
                            }`}>
                              <p className="text-sm break-words">{message.content}</p>
                              
                              <div className={`flex items-center justify-end mt-1 space-x-1 ${
                                isMyMessage ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                                <span className="text-xs">
                                  {formatMessageTime(message.createdAt || message.created_at)}
                                </span>
                                {isMyMessage && (
                                  <div className="flex">
                                    {message.status === 'sending' ? (
                                      <div className="w-3 h-3 border border-blue-200 border-t-transparent rounded-full animate-spin"></div>
                                    ) : message.status === 'failed' ? (
                                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                    ) : message.isRead ? (
                                      <CheckCheck className="w-3 h-3" />
                                    ) : (
                                      <Check className="w-3 h-3" />
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  
                  {/* Typing Indicator */}
                  <AnimatePresence>
                    {typingUsers.size > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex justify-start"
                      >
                        <div className="flex items-end space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <div className="bg-white border border-gray-200 px-4 py-2 rounded-2xl rounded-bl-md shadow-sm">
                            <div className="flex items-center space-x-1">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 bg-white border-t border-gray-200">
                  <div className="flex items-end space-x-3">
                    <Button variant="ghost" size="sm" className="p-2 text-gray-500">
                      <Paperclip className="w-5 h-5" />
                    </Button>
                    
                    <div className="flex-1 relative">
                      <textarea
                        ref={textareaRef}
                        value={newMessage}
                        onChange={handleTyping}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        rows={1}
                        className="w-full px-4 py-3 pr-12 bg-gray-100 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none transition-all"
                        style={{ maxHeight: '120px' }}
                        disabled={isSending}
                      />
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-500"
                      >
                        <Smile className="w-5 h-5" />
                      </Button>
                    </div>
                    
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || isSending}
                      className="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full p-0 flex items-center justify-center"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageCircle className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to Chat</h3>
                  <p className="text-gray-500 max-w-sm">
                    Select a conversation from the sidebar to start messaging with task providers and clients.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};