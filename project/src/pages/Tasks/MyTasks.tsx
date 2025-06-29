import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Filter } from 'lucide-react';
import { Layout } from '../../components/Layout/Layout';
import { TaskCard } from '../../components/Tasks/TaskCard';
import { Button } from '../../components/UI/Button';
import { useAuth } from '../../contexts/AuthContext';
import { Task } from '../../types';
import { taskService } from '../../services/taskService';

export const MyTasks: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [clientTasks, setClientTasks] = React.useState<Task[]>([]);
  const [providerTasks, setProviderTasks] = React.useState<Task[]>([]);
  const [activeTab, setActiveTab] = React.useState<'posted' | 'applied'>('posted');
  const [isLoading, setIsLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState<string>('all');

  React.useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const [clientTasksData, providerTasksData] = await Promise.all([
        taskService.getMyTasks('client'),
        taskService.getMyTasks('provider'),
      ]);
      setClientTasks(clientTasksData);
      setProviderTasks(providerTasksData);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (task: Task) => {
    navigate(`/tasks/${task.id}`);
  };

  const getFilteredTasks = (tasks: Task[]) => {
    if (statusFilter === 'all') return tasks;
    return tasks.filter(task => task.status === statusFilter);
  };

  const currentTasks = activeTab === 'posted' ? clientTasks : providerTasks;
  const filteredTasks = getFilteredTasks(currentTasks);

  const statusOptions = [
    { value: 'all', label: 'All Tasks' },
    { value: 'open', label: 'Open' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-gray-900">
              {t('navigation.myTasks')}
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your posted tasks and applications
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button
              onClick={() => navigate('/create-task')}
              className="flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              {t('tasks.createTask')}
            </Button>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('posted')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'posted'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Posted Tasks ({clientTasks.length})
            </button>
            <button
              onClick={() => setActiveTab('applied')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'applied'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Applied Tasks ({providerTasks.length})
            </button>
          </nav>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter by status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Tasks Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onViewDetails={handleViewDetails}
                showApplyButton={false}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">
              {activeTab === 'posted' ? '📝' : '🔍'}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {activeTab === 'posted' 
                ? 'No tasks posted yet' 
                : 'No applications yet'
              }
            </h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'posted'
                ? 'Create your first task to get started'
                : 'Browse available tasks and start applying'
              }
            </p>
            <Button 
              onClick={() => navigate(activeTab === 'posted' ? '/create-task' : '/tasks')}
            >
              {activeTab === 'posted' ? 'Create Task' : 'Browse Tasks'}
            </Button>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};