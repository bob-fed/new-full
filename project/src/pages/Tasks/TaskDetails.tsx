import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { MapPin, Clock, DollarSign, User, Calendar, ArrowLeft, MessageCircle } from 'lucide-react';
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

  React.useEffect(() => {
    if (id) {
      loadTask();
    }
  }, [id]);

  // Load applications and check user application status
  React.useEffect(() => {
    if (task && user) {
      if (user.id === task.clientId) {
        // If user is task owner, load all applications
        loadApplications();
      } else if (user.role === 'provider') {
        // If user is a provider, check if they have applied
        checkUserApplication();
      }
    }
  }, [task, user]);

  const loadTask = async () => {
    try {
      const taskData = await taskService.getTask(id!);
      console.log('Loaded task data:', taskData);
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
      
      // If current user is a provider, check if they have applied
      if (user?.role === 'provider') {
        const userApp = applicationsData.find(app => app.providerId === user.id);
        setUserApplication(userApp || null);
      }
    } catch (error) {
      console.error('Failed to load applications:', error);
      // Don't show error for 403 - it's expected for non-owners
      if (error.response?.status !== 403) {
        toast.error('Failed to load applications');
      }
    }
  };

  const checkUserApplication = async () => {
    try {
      // Try to get messages to check if user has applied
      await chatService.getMessages(id!);
      // If successful, user has applied
      setUserApplication({
        id: 'temp-applied',
        taskId: id!,
        providerId: user!.id,
        status: 'pending',
        createdAt: new Date().toISOString()
      } as TaskApplication);
    } catch (error) {
      // User hasn't applied yet or doesn't have permission
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
      
      // Set the user application directly from the response
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

    // Validate that otherUserId is a valid, non-empty string
    if (!otherUserId || typeof otherUserId !== 'string' || otherUserId.trim() === '') {
      toast.error('Invalid user ID. Cannot start chat.');
      return;
    }

    try {
      // Check if user has permission to chat
      const isTaskOwner = user?.id === task?.clientId;
      const hasApplied = userApplication !== null;
      
      if (!isTaskOwner && !hasApplied) {
        toast.error('You need to apply to this task first to start a chat');
        return;
      }

      // Send an initial message to create the conversation
      await chatService.sendMessage({
        taskId: id!,
        receiverId: otherUserId.trim(),
        content: 'Hi! I\'m interested in discussing this task.',
      });

      toast.success('Chat started successfully!');
      navigate('/chat');
    } catch (error: any) {
      console.error('Failed to start chat:', error);
      
      // If we get a 403 error, it might mean the user hasn't applied
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
        return 'bg-green-100 text-green-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!task) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Task not found</h1>
        </div>
      </Layout>
    );
  }

  const canApply = user?.role === 'provider' && task.status === 'open' && task.clientId !== user.id && !userApplication;
  const isOwner = user?.id === task.clientId;
  const hasApplied = userApplication !== null;

  // Debug logging
  console.log('Task client data:', task.client);
  console.log('Task clientId:', task.clientId);
  console.log('Current user:', user);
  console.log('Is owner:', isOwner);
  console.log('Has applied:', hasApplied);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="p-8 mb-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{task.title}</h1>
                <div className="flex items-center space-x-4 text-gray-600">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}
                  >
                    {t(`tasks.statuses.${task.status}`)}
                  </span>
                  <span className="text-sm">
                    Posted {safeFormatDistanceToNow(task.createdAt)}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                {canApply && (
                  <Button onClick={() => setIsApplyModalOpen(true)}>
                    {t('tasks.apply')}
                  </Button>
                )}
                {hasApplied && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-green-600 font-medium">
                      ✓ Applied
                    </span>
                    {userApplication?.status && userApplication.status !== 'temp-applied' && (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          userApplication.status === 'accepted'
                            ? 'bg-green-100 text-green-800'
                            : userApplication.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {userApplication.status}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Task Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <DollarSign className="w-5 h-5 mr-2" />
                  <span className="font-semibold">₪{task.budget.toLocaleString()}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span>{task.location}</span>
                </div>
                {task.deadline && new Date(task.deadline).getTime() && !isNaN(new Date(task.deadline).getTime()) && (
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-5 h-5 mr-2" />
                    <span>{safeFormatDistanceToNow(task.deadline)}</span>
                  </div>
                )}
                {task.category && (
                  <div className="flex items-center text-gray-600">
                    <span className="w-5 h-5 mr-2">📋</span>
                    <span>{getCategoryName(task.category)}</span>
                  </div>
                )}
              </div>

              {/* Client Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Posted by</h3>
                {task.client ? (
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      {task.client.avatarUrl ? (
                        <img
                          src={task.client.avatarUrl}
                          alt={task.client.firstName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-primary-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {task.client.firstName} {task.client.lastName}
                      </div>
                      {task.client.rating > 0 && (
                        <div className="text-sm text-gray-600">
                          ⭐ {task.client.rating.toFixed(1)} ({task.client.totalReviews} reviews)
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-500">
                        User information not available
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Show chat button for providers who have applied or task owners */}
                {isAuthenticated && !isOwner && hasApplied && task.clientId && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 w-full flex items-center justify-center"
                    onClick={() => handleStartChat(task.clientId)}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Start Chat
                  </Button>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
            </div>
          </Card>

          {/* Applications (for task owner) */}
          {isOwner && applications.length > 0 && (
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Applications ({applications.length})
              </h3>
              <div className="space-y-4">
                {applications.map((application) => (
                  <div
                    key={application.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          {application.provider?.avatarUrl ? (
                            <img
                              src={application.provider.avatarUrl}
                              alt={application.provider.firstName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-5 h-5 text-primary-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {application.provider?.firstName} {application.provider?.lastName}
                          </div>
                          {application.provider?.rating && application.provider.rating > 0 && (
                            <div className="text-sm text-gray-600">
                              ⭐ {application.provider.rating.toFixed(1)}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {application.proposedPrice && (
                          <div className="font-semibold text-gray-900">
                            ₪{application.proposedPrice.toLocaleString()}
                          </div>
                        )}
                        <div className="text-sm text-gray-500">
                          {safeFormatDistanceToNow(application.createdAt)}
                        </div>
                      </div>
                    </div>
                    
                    {application.message && (
                      <p className="text-gray-700 mb-3">{application.message}</p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        {application.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
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
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              application.status === 'accepted'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {application.status}
                          </span>
                        )}
                      </div>

                      {/* Chat button for task owner */}
                      {application.providerId && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStartChat(application.providerId)}
                          className="flex items-center"
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          Chat
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </motion.div>

        {/* Apply Modal */}
        <Modal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          title="Apply for Task"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message (optional)
              </label>
              <textarea
                value={applicationMessage}
                onChange={(e) => setApplicationMessage(e.target.value)}
                rows={4}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Tell the client why you're the right person for this task..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proposed Price (₪) - optional
              </label>
              <input
                type="number"
                value={proposedPrice}
                onChange={(e) => setProposedPrice(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter your proposed price"
              />
            </div>
            
            <div className="flex space-x-3 pt-4">
              <Button
                onClick={handleApply}
                isLoading={isSubmitting}
                className="flex-1"
              >
                Send Application
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsApplyModalOpen(false)}
                className="flex-1"
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