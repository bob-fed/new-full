import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  MapPin, Clock, DollarSign, User, Calendar, ArrowLeft, MessageCircle, 
  Star, Shield, Phone, Mail, Eye, Heart, Share2, Flag, Award, CheckCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Layout } from '../../components/Layout/Layout';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';
import { Modal } from '../../components/UI/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { Task, TaskApplication } from '../../types';
import { taskService } from '../../services/taskService';
import { chatService } from '../../services/chatService';
import { formatDistanceToNow } from 'date-fns';

// Helper function to safely format dates
const safeFormatDistanceToNow = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  return formatDistanceToNow(date, { addSuffix: true });
};

export const TaskDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [task, setTask] = React.useState<Task | null>(null);
  const [applications, setApplications] = React.useState<TaskApplication[]>([]);
  const [userApplication, setUserApplication] = React.useState<TaskApplication | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isApplyModalOpen, setIsApplyModalOpen] = React.useState(false);
  const [applicationMessage, setApplicationMessage] = React.useState('');
  const [proposedPrice, setProposedPrice] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLiked, setIsLiked] = React.useState(false);

  React.useEffect(() => {
    if (id) {
      loadTask();
    }
  }, [id]);

  React.useEffect(() => {
    if (task && user) {
      if (user.id === task.clientId) {
        loadApplications();
      } else if (user.role === 'provider') {
        checkUserApplication();
      }
    }
  }, [task, user]);

  const loadTask = async () => {
    try {
      const taskData = await taskService.getTask(id!);
      setTask(taskData);
    } catch (error) {
      console.error('Failed to load task:', error);
      toast.error('Failed to load task');
      navigate('/tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const loadApplications = async () => {
    try {
      const applicationsData = await taskService.getTaskApplications(id!);
      setApplications(applicationsData);
      
      if (user?.role === 'provider') {
        const userApp = applicationsData.find(app => app.providerId === user.id);
        setUserApplication(userApp || null);
      }
    } catch (error) {
      console.error('Failed to load applications:', error);
      if (error.response?.status !== 403) {
        toast.error('Failed to load applications');
      }
    }
  };

  const checkUserApplication = async () => {
    try {
      await chatService.getMessages(id!);
      setUserApplication({
        id: 'temp-applied',
        taskId: id!,
        providerId: user!.id,
        status: 'pending',
        createdAt: new Date().toISOString()
      } as TaskApplication);
    } catch (error) {
      setUserApplication(null);
    }
  };

  const handleApply = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    try {
      const newApplication = await taskService.applyToTask(id!, {
        message: applicationMessage,
        proposedPrice: proposedPrice ? Number(proposedPrice) : undefined,
      });
      
      setUserApplication({
        id: newApplication.id || 'temp-id',
        taskId: id!,
        providerId: user!.id,
        message: applicationMessage,
        proposedPrice: proposedPrice ? Number(proposedPrice) : undefined,
        status: 'pending',
        createdAt: new Date().toISOString(),
        provider: {
          id: user!.id,
          firstName: user!.firstName,
          lastName: user!.lastName,
          avatarUrl: user!.avatarUrl,
          rating: user!.rating,
          totalReviews: user!.totalReviews
        }
      });
      
      toast.success('Application sent successfully!');
      setIsApplyModalOpen(false);
      setApplicationMessage('');
      setProposedPrice('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to apply');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplicationStatusUpdate = async (applicationId: string, status: 'accepted' | 'rejected') => {
    try {
      await taskService.updateApplicationStatus(id!, applicationId, status);
      toast.success(`Application ${status} successfully`);
      loadApplications();
      loadTask();
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${status} application`);
    }
  };

  const handleStartChat = async (otherUserId: string) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!otherUserId || typeof otherUserId !== 'string' || otherUserId.trim() === '') {
      toast.error('Invalid user ID. Cannot start chat.');
      return;
    }

    try {
      const isTaskOwner = user?.id === task?.clientId;
      const hasApplied = userApplication !== null;
      
      if (!isTaskOwner && !hasApplied) {
        toast.error('You need to apply to this task first to start a chat');
        return;
      }

      await chatService.sendMessage({
        taskId: id!,
        receiverId: otherUserId.trim(),
        content: 'Hi! I\'m interested in discussing this task.',
      });

      toast.success('Chat started successfully!');
      navigate('/chat');
    } catch (error: any) {
      console.error('Failed to start chat:', error);
      
      if (error.response?.status === 403) {
        toast.error('You need to apply to this task first to start a chat');
      } else if (error.response?.status === 400) {
        toast.error('Invalid request. Please check the user information and try again.');
      } else {
        toast.error('Failed to start chat. Please try again.');
      }
    }
  };

  const getCategoryName = (category: any) => {
    if (!category) return '';
    switch (i18n.language) {
      case 'he':
        return category.name_he || category.nameHe;
      case 'ru':
        return category.name_ru || category.nameRu;
      default:
        return category.name_en || category.nameEn;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'from-green-500 to-emerald-500';
      case 'assigned':
        return 'from-blue-500 to-cyan-500';
      case 'in_progress':
        return 'from-yellow-500 to-orange-500';
      case 'completed':
        return 'from-gray-500 to-slate-500';
      case 'cancelled':
        return 'from-red-500 to-pink-500';
      default:
        return 'from-gray-500 to-slate-500';
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent"></div>
        </div>
      </Layout>
    );
  }

  if (!task) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">Task not found</h1>
          </div>
        </div>
      </Layout>
    );
  }

  const canApply = user?.role === 'provider' && task.status === 'open' && task.clientId !== user.id && !userApplication;
  const isOwner = user?.id === task.clientId;
  const hasApplied = userApplication !== null;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              icon={<ArrowLeft className="w-5 h-5" />}
            >
              Back
            </Button>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Task Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card variant="glass" className="relative overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500"></div>
                  </div>

                  <div className="relative z-10">
                    {/* Status & Actions */}
                    <div className="flex justify-between items-start mb-6">
                      <div className={`px-4 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-r ${getStatusColor(task.status)} shadow-lg`}>
                        {t(`tasks.statuses.${task.status}`)}
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <motion.button
                          onClick={() => setIsLiked(!isLiked)}
                          className="p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all duration-300"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Heart className={`w-5 h-5 ${isLiked ? 'text-red-400 fill-current' : 'text-white/60'}`} />
                        </motion.button>
                        
                        <motion.button
                          className="p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all duration-300"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Share2 className="w-5 h-5 text-white/60" />
                        </motion.button>
                        
                        <motion.button
                          className="p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all duration-300"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Flag className="w-5 h-5 text-white/60" />
                        </motion.button>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <h1 className="text-4xl font-black text-white mb-4">{task.title}</h1>
                    <p className="text-white/80 text-lg leading-relaxed mb-8">{task.description}</p>

                    {/* Task Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                          <DollarSign className="w-8 h-8 text-white" />
                        </div>
                        <div className="text-2xl font-black text-white">₪{task.budget.toLocaleString()}</div>
                        <div className="text-white/60 text-sm">Budget</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                          <MapPin className="w-8 h-8 text-white" />
                        </div>
                        <div className="text-lg font-bold text-white">{task.location}</div>
                        <div className="text-white/60 text-sm">Location</div>
                      </div>
                      
                      {task.deadline && (
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                            <Clock className="w-8 h-8 text-white" />
                          </div>
                          <div className="text-lg font-bold text-white">{safeFormatDistanceToNow(task.deadline)}</div>
                          <div className="text-white/60 text-sm">Deadline</div>
                        </div>
                      )}
                      
                      {task.category && (
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                            <span className="text-2xl">📋</span>
                          </div>
                          <div className="text-lg font-bold text-white">{getCategoryName(task.category)}</div>
                          <div className="text-white/60 text-sm">Category</div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-4">
                      {canApply && (
                        <Button
                          onClick={() => setIsApplyModalOpen(true)}
                          variant="gradient"
                          size="lg"
                          icon={<CheckCircle className="w-5 h-5" />}
                        >
                          {t('tasks.apply')}
                        </Button>
                      )}
                      
                      {hasApplied && (
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center px-4 py-3 bg-green-500/20 rounded-2xl border border-green-500/30">
                            <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                            <span className="text-green-400 font-semibold">Applied</span>
                          </div>
                          {userApplication?.status && userApplication.status !== 'temp-applied' && (
                            <div className={`px-4 py-2 rounded-full text-sm font-bold text-white ${
                              userApplication.status === 'accepted'
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                : userApplication.status === 'rejected'
                                ? 'bg-gradient-to-r from-red-500 to-pink-500'
                                : 'bg-gradient-to-r from-yellow-500 to-orange-500'
                            }`}>
                              {userApplication.status}
                            </div>
                          )}
                        </div>
                      )}
                      
                      <Button
                        variant="outline"
                        size="lg"
                        icon={<Eye className="w-5 h-5" />}
                      >
                        {applications.length} Applications
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Applications (for task owner) */}
              {isOwner && applications.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <Card variant="glass">
                    <h3 className="text-2xl font-bold text-white mb-6">
                      Applications ({applications.length})
                    </h3>
                    <div className="space-y-6">
                      {applications.map((application) => (
                        <div
                          key={application.id}
                          className="p-6 bg-white/5 rounded-2xl border border-white/10"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center space-x-4">
                              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg">
                                {application.provider?.avatarUrl ? (
                                  <img
                                    src={application.provider.avatarUrl}
                                    alt={application.provider.firstName}
                                    className="w-16 h-16 rounded-2xl object-cover"
                                  />
                                ) : (
                                  <User className="w-8 h-8 text-white" />
                                )}
                              </div>
                              <div>
                                <div className="text-xl font-bold text-white">
                                  {application.provider?.firstName} {application.provider?.lastName}
                                </div>
                                {application.provider?.rating && application.provider.rating > 0 && (
                                  <div className="flex items-center text-yellow-400 mt-1">
                                    <Star className="w-4 h-4 mr-1 fill-current" />
                                    <span className="font-semibold">{application.provider.rating.toFixed(1)}</span>
                                    <span className="text-white/50 ml-1">({application.provider.totalReviews} reviews)</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-right">
                              {application.proposedPrice && (
                                <div className="text-2xl font-black text-white mb-1">
                                  ₪{application.proposedPrice.toLocaleString()}
                                </div>
                              )}
                              <div className="text-white/60 text-sm">
                                {safeFormatDistanceToNow(application.createdAt)}
                              </div>
                            </div>
                          </div>
                          
                          {application.message && (
                            <p className="text-white/80 mb-4 p-4 bg-white/5 rounded-xl border border-white/10">
                              {application.message}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <div className="flex space-x-3">
                              {application.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="gradient"
                                    onClick={() => handleApplicationStatusUpdate(application.id, 'accepted')}
                                  >
                                    Accept
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleApplicationStatusUpdate(application.id, 'rejected')}
                                  >
                                    Reject
                                  </Button>
                                </>
                              )}
                              
                              {application.status !== 'pending' && (
                                <div className={`px-4 py-2 rounded-full text-sm font-bold text-white ${
                                  application.status === 'accepted'
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                    : 'bg-gradient-to-r from-red-500 to-pink-500'
                                }`}>
                                  {application.status}
                                </div>
                              )}
                            </div>

                            {application.providerId && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStartChat(application.providerId)}
                                icon={<MessageCircle className="w-4 h-4" />}
                              >
                                Chat
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Client Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card variant="glass">
                  <h3 className="text-xl font-bold text-white mb-6">Posted by</h3>
                  {task.client ? (
                    <div className="space-y-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg">
                          {task.client.avatarUrl ? (
                            <img
                              src={task.client.avatarUrl}
                              alt={task.client.firstName}
                              className="w-16 h-16 rounded-2xl object-cover"
                            />
                          ) : (
                            <User className="w-8 h-8 text-white" />
                          )}
                        </div>
                        <div>
                          <div className="text-xl font-bold text-white">
                            {task.client.firstName} {task.client.lastName}
                          </div>
                          {task.client.isVerified && (
                            <div className="flex items-center text-green-400 mt-1">
                              <Shield className="w-4 h-4 mr-1" />
                              <span className="text-sm font-semibold">Verified</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {task.client.rating > 0 && (
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                          <div className="flex items-center">
                            <Star className="w-5 h-5 text-yellow-400 fill-current mr-2" />
                            <span className="text-white font-semibold">{task.client.rating.toFixed(1)}</span>
                          </div>
                          <span className="text-white/60 text-sm">{task.client.totalReviews} reviews</span>
                        </div>
                      )}
                      
                      <div className="space-y-3">
                        <div className="flex items-center text-white/60">
                          <Calendar className="w-4 h-4 mr-3" />
                          <span className="text-sm">Joined {safeFormatDistanceToNow(task.client.createdAt)}</span>
                        </div>
                        {task.client.phone && (
                          <div className="flex items-center text-white/60">
                            <Phone className="w-4 h-4 mr-3" />
                            <span className="text-sm">{task.client.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center text-white/60">
                          <Mail className="w-4 h-4 mr-3" />
                          <span className="text-sm">{task.client.email}</span>
                        </div>
                      </div>
                      
                      {isAuthenticated && !isOwner && hasApplied && task.clientId && (
                        <Button
                          variant="gradient"
                          fullWidth
                          onClick={() => handleStartChat(task.clientId)}
                          icon={<MessageCircle className="w-5 h-5" />}
                        >
                          Start Chat
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-white/60">
                      <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>User information not available</p>
                    </div>
                  )}
                </Card>
              </motion.div>

              {/* Task Stats */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card variant="glass">
                  <h3 className="text-xl font-bold text-white mb-6">Task Statistics</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white/60">Applications</span>
                      <span className="text-white font-bold">{applications.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/60">Views</span>
                      <span className="text-white font-bold">127</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/60">Posted</span>
                      <span className="text-white font-bold">{safeFormatDistanceToNow(task.createdAt)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/60">Status</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getStatusColor(task.status)}`}>
                        {t(`tasks.statuses.${task.status}`)}
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Apply Modal */}
        <Modal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          title="Apply for Task"
          size="lg"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cover Message (optional)
              </label>
              <textarea
                value={applicationMessage}
                onChange={(e) => setApplicationMessage(e.target.value)}
                rows={5}
                className="block w-full px-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                placeholder="Tell the client why you're the right person for this task..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Proposed Price (₪) - optional
              </label>
              <input
                type="number"
                value={proposedPrice}
                onChange={(e) => setProposedPrice(e.target.value)}
                className="block w-full px-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                placeholder="Enter your proposed price"
              />
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <h4 className="font-semibold text-blue-900 mb-2">💡 Application Tips:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Be specific about your relevant experience</li>
                <li>• Explain your approach to completing the task</li>
                <li>• Ask clarifying questions if needed</li>
                <li>• Be professional and courteous</li>
              </ul>
            </div>
            
            <div className="flex space-x-4 pt-4">
              <Button
                onClick={handleApply}
                isLoading={isSubmitting}
                variant="gradient"
                fullWidth
                icon={<CheckCircle className="w-5 h-5" />}
              >
                Send Application
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsApplyModalOpen(false)}
                fullWidth
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};