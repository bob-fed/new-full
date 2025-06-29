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
  CheckCheck,
  Settings,
  Plus,
  X,
  Image,
  File,
  Camera,
  Mic
} from 'lucide-react';
import { Layout } from '../../components/Layout/Layout';
import { Modal } from '../../components/UI/Modal';
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
  
  // Modal states
  const [showEmojiModal, setShowEmojiModal] = React.useState(false);
  const [showAttachmentModal, setShowAttachmentModal] = React.useState(false);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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

  // Working button handlers
  const handlePhoneCall = () => {
    console.log('📞 Phone call initiated');
    alert('📞 Phone call feature will be available soon!');
  };

  const handleVideoCall = () => {
    console.log('📹 Video call initiated');
    alert('📹 Video call feature will be available soon!');
  };

  const handleMoreOptions = () => {
    console.log('⚙️ More options clicked');
    alert('⚙️ More options menu will be available soon!');
  };

  const handleAttachment = () => {
    console.log('📎 Attachment clicked');
    setShowAttachmentModal(true);
  };

  const handleFileSelect = (type: string) => {
    console.log(`📁 ${type} selected`);
    setShowAttachmentModal(false);
    
    if (fileInputRef.current) {
      if (type === 'image') {
        fileInputRef.current.accept = 'image/*';
      } else if (type === 'document') {
        fileInputRef.current.accept = '.pdf,.doc,.docx,.txt';
      } else {
        fileInputRef.current.accept = '*';
      }
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      console.log('Files selected:', Array.from(files).map(f => f.name));
      alert(`📁 Selected ${files.length} file(s). File upload feature coming soon!`);
    }
  };

  const handleEmoji = () => {
    console.log('😊 Emoji clicked');
    setShowEmojiModal(true);
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiModal(false);
    textareaRef.current?.focus();
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
        <div className="h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
            <p className="text-white font-medium text-lg">Loading conversations...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="h-screen flex flex-col bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Mobile Header */}
        <div className="lg:hidden bg-black/20 backdrop-blur-xl border-b border-white/10 px-4 py-3">
          {selectedConversation ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleBackToConversations}
                  className="p-2 hover:bg-white/10 rounded-xl transition-all duration-200 active:scale-95"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold text-white">
                      {selectedConversation.sender.id === user?.id 
                        ? `${selectedConversation.receiver.first_name} ${selectedConversation.receiver.last_name}`
                        : `${selectedConversation.sender.first_name} ${selectedConversation.sender.last_name}`
                      }
                    </h1>
                    <p className="text-sm text-green-400 font-medium">
                      {isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={handlePhoneCall}
                  className="p-2.5 hover:bg-white/10 rounded-xl transition-all duration-200 active:scale-95"
                >
                  <Phone className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={handleVideoCall}
                  className="p-2.5 hover:bg-white/10 rounded-xl transition-all duration-200 active:scale-95"
                >
                  <Video className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={handleMoreOptions}
                  className="p-2.5 hover:bg-white/10 rounded-xl transition-all duration-200 active:scale-95"
                >
                  <MoreVertical className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-white">{t('chat.title')}</h1>
              <button
                onClick={() => console.log('New chat')}
                className="p-2 hover:bg-white/10 rounded-xl transition-all duration-200 active:scale-95"
              >
                <Plus className="w-5 h-5 text-white" />
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Conversations Sidebar */}
          <div className={`${showConversations ? 'flex' : 'hidden'} lg:flex flex-col w-full lg:w-96 bg-black/20 backdrop-blur-xl border-r border-white/10`}>
            {/* Desktop Header */}
            <div className="hidden lg:block p-6 border-b border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-white">
                  {t('chat.title')}
                </h1>
                <div className="flex space-x-2">
                  <button
                    onClick={() => console.log('New chat')}
                    className="p-2 hover:bg-white/10 rounded-xl transition-all duration-200 active:scale-95"
                  >
                    <Plus className="w-5 h-5 text-white" />
                  </button>
                  <button
                    onClick={() => console.log('Settings')}
                    className="p-2 hover:bg-white/10 rounded-xl transition-all duration-200 active:scale-95"
                  >
                    <Settings className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:bg-white/20 transition-all duration-200 placeholder-white/60 text-white backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length > 0 ? (
                <div className="p-2">
                  {filteredConversations.map((conversation, index) => {
                    const otherUser = conversation.sender.id === user?.id 
                      ? conversation.receiver 
                      : conversation.sender;
                    
                    const isSelected = selectedConversation?.task_id === conversation.task_id;
                    
                    return (
                      <motion.button
                        key={conversation.task_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedConversation(conversation)}
                        className={`w-full p-4 mb-2 text-left rounded-2xl transition-all duration-200 ${
                          isSelected 
                            ? 'bg-white/20 backdrop-blur-md shadow-lg border border-white/30' 
                            : 'hover:bg-white/10 hover:backdrop-blur-md'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md ${
                              isSelected 
                                ? 'bg-gradient-to-br from-cyan-400 to-blue-500' 
                                : 'bg-gradient-to-br from-purple-400 to-pink-500'
                            }`}>
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
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold truncate text-white">
                                {otherUser.first_name} {otherUser.last_name}
                              </h3>
                              <span className="text-xs text-white/70">
                                {formatMessageTime(conversation.created_at)}
                              </span>
                            </div>
                            
                            <p className="text-sm truncate mb-1 text-white/80">
                              {conversation.content || 'No messages yet'}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-xs truncate text-white/60">
                                Task: {conversation.task.title}
                              </span>
                              {!conversation.is_read && conversation.sender.id !== user?.id && !isSelected && (
                                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6">
                    <MessageCircle className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">No conversations</h3>
                  <p className="text-white/70 max-w-sm">
                    {searchQuery ? 'No conversations match your search' : 'Start by applying to a task to begin chatting'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`${!showConversations ? 'flex' : 'hidden'} lg:flex flex-col flex-1 bg-black/10 backdrop-blur-sm`}>
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="hidden lg:flex items-center justify-between p-6 border-b border-white/10 bg-black/20 backdrop-blur-xl">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">
                        {selectedConversation.sender.id === user?.id 
                          ? `${selectedConversation.receiver.first_name} ${selectedConversation.receiver.last_name}`
                          : `${selectedConversation.sender.first_name} ${selectedConversation.sender.last_name}`
                        }
                      </h2>
                      <p className="text-sm text-white/70">
                        Task: {selectedConversation.task.title}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handlePhoneCall}
                      className="p-3 hover:bg-white/10 rounded-xl transition-all duration-200 active:scale-95"
                    >
                      <Phone className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={handleVideoCall}
                      className="p-3 hover:bg-white/10 rounded-xl transition-all duration-200 active:scale-95"
                    >
                      <Video className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={handleMoreOptions}
                      className="p-3 hover:bg-white/10 rounded-xl transition-all duration-200 active:scale-95"
                    >
                      <MoreVertical className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>

                {/* Messages Area */}
                <div 
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto p-6 space-y-4"
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
                          transition={{ duration: 0.3 }}
                          className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} ${
                            showAvatar ? 'mt-6' : 'mt-2'
                          }`}
                        >
                          <div className={`flex items-end space-x-3 max-w-xs lg:max-w-md ${
                            isMyMessage ? 'flex-row-reverse space-x-reverse' : ''
                          }`}>
                            {!isMyMessage && showAvatar && (
                              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center shadow-md">
                                <User className="w-4 h-4 text-white" />
                              </div>
                            )}
                            
                            <div className={`relative px-4 py-3 rounded-2xl shadow-lg backdrop-blur-md ${
                              isMyMessage
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-br-md'
                                : 'bg-white/90 border border-white/20 text-gray-900 rounded-bl-md'
                            }`}>
                              <p className="text-sm break-words leading-relaxed">{message.content}</p>
                              
                              <div className={`flex items-center justify-end mt-2 space-x-1 ${
                                isMyMessage ? 'text-white/80' : 'text-gray-500'
                              }`}>
                                <span className="text-xs">
                                  {formatMessageTime(message.createdAt || message.created_at)}
                                </span>
                                {isMyMessage && (
                                  <div className="flex">
                                    {message.status === 'sending' ? (
                                      <div className="w-3 h-3 border border-white/50 border-t-transparent rounded-full animate-spin"></div>
                                    ) : message.status === 'failed' ? (
                                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
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
                        <div className="flex items-end space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <div className="bg-white/90 border border-white/20 px-4 py-3 rounded-2xl rounded-bl-md shadow-lg backdrop-blur-md">
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

                {/* Message Input - Always visible at bottom */}
                <div className="sticky bottom-0 p-6 bg-black/20 backdrop-blur-xl border-t border-white/10">
                  <div className="flex items-end space-x-3">
                    <button
                      onClick={handleAttachment}
                      className="p-3 text-white/70 hover:bg-white/10 rounded-xl transition-all duration-200 active:scale-95"
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>
                    
                    <div className="flex-1 relative">
                      <textarea
                        ref={textareaRef}
                        value={newMessage}
                        onChange={handleTyping}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        rows={1}
                        className="w-full px-4 py-3 pr-12 bg-white/90 border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-transparent resize-none transition-all duration-200 placeholder-gray-500 text-gray-900 backdrop-blur-md"
                        style={{ maxHeight: '120px' }}
                        disabled={isSending}
                      />
                      <button 
                        onClick={handleEmoji}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-500 hover:bg-gray-200 rounded-lg transition-all duration-200 active:scale-95"
                      >
                        <Smile className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || isSending}
                      className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed rounded-xl p-0 flex items-center justify-center transition-all duration-200 active:scale-95 shadow-lg"
                    >
                      <Send className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-8">
                    <MessageCircle className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-4">Welcome to Chat</h3>
                  <p className="text-white/70 max-w-md leading-relaxed">
                    Select a conversation from the sidebar to start messaging with task providers and clients.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Emoji Modal */}
        <Modal
          isOpen={showEmojiModal}
          onClose={() => setShowEmojiModal(false)}
          title="Choose an Emoji"
        >
          <div className="grid grid-cols-8 gap-3 p-4">
            {[
              '😊', '😂', '❤️', '👍', '👎', '😢', '😮', '😡', 
              '🎉', '🔥', '💯', '✨', '🚀', '💪', '👏', '🙌',
              '😍', '🤔', '😎', '🤗', '😴', '🤤', '🤯', '🥳',
              '😇', '🤠', '🤡', '🥺', '😈', '👻', '💀', '🤖'
            ].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleEmojiSelect(emoji)}
                className="p-3 hover:bg-gray-100 rounded-lg transition-colors text-2xl active:scale-95 hover:scale-110"
              >
                {emoji}
              </button>
            ))}
          </div>
        </Modal>

        {/* Attachment Modal */}
        <Modal
          isOpen={showAttachmentModal}
          onClose={() => setShowAttachmentModal(false)}
          title="Send Attachment"
        >
          <div className="grid grid-cols-2 gap-4 p-4">
            <button
              onClick={() => handleFileSelect('image')}
              className="flex flex-col items-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 active:scale-95"
            >
              <Image className="w-8 h-8 text-blue-500 mb-2" />
              <span className="text-sm font-medium text-gray-700">Photos</span>
            </button>
            
            <button
              onClick={() => handleFileSelect('document')}
              className="flex flex-col items-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200 active:scale-95"
            >
              <File className="w-8 h-8 text-green-500 mb-2" />
              <span className="text-sm font-medium text-gray-700">Documents</span>
            </button>
            
            <button
              onClick={() => handleFileSelect('camera')}
              className="flex flex-col items-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 active:scale-95"
            >
              <Camera className="w-8 h-8 text-purple-500 mb-2" />
              <span className="text-sm font-medium text-gray-700">Camera</span>
            </button>
            
            <button
              onClick={() => handleFileSelect('audio')}
              className="flex flex-col items-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all duration-200 active:scale-95"
            >
              <Mic className="w-8 h-8 text-red-500 mb-2" />
              <span className="text-sm font-medium text-gray-700">Audio</span>
            </button>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};