import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Filter, Grid, List, TrendingUp, Clock, CheckCircle, DollarSign, Eye, Users } from 'lucide-react';
import { Layout } from '../../components/Layout/Layout';
import { TaskCard } from '../../components/Tasks/TaskCard';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';
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
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');

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
    { value: 'all', label: 'All Tasks', color: 'from-gray-500 to-slate-500' },
    { value: 'open', label: 'Open', color: 'from-green-500 to-emerald-500' },
    { value: 'assigned', label: 'Assigned', color: 'from-blue-500 to-cyan-500' },
    { value: 'in_progress', label: 'In Progress', color: 'from-yellow-500 to-orange-500' },
    { value: 'completed', label: 'Completed', color: 'from-purple-500 to-pink-500' },
    { value: 'cancelled', label: 'Cancelled', color: 'from-red-500 to-pink-500' },
  ];

  const stats = [
    { 
      label: 'Total Tasks', 
      value: currentTasks.length.toString(), 
      icon: TrendingUp, 
      color: 'from-blue-500 to-cyan-500' 
    },
    { 
      label: 'Active', 
      value: currentTasks.filter(t => ['open', 'assigned', 'in_progress'].includes(t.status)).length.toString(), 
      icon: Clock, 
      color: 'from-yellow-500 to-orange-500' 
    },
    { 
      label: 'Completed', 
      value: currentTasks.filter(t => t.status === 'completed').length.toString(), 
      icon: CheckCircle, 
      color: 'from-green-500 to-emerald-500' 
    },
    { 
      label: 'Total Value', 
      value: `₪${currentTasks.reduce((sum, task) => sum + task.budget, 0).toLocaleString()}`, 
      icon: DollarSign, 
      color: 'from-purple-500 to-pink-500' 
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-black text-white mb-4">
              My <span className="bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">Tasks</span>
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Manage your posted tasks and track your applications
            </p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card variant="glass" className="text-center hover:scale-105 transition-all duration-300">
                  <div className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-2xl font-black text-white mb-2">{stat.value}</div>
                  <div className="text-white/60 font-medium">{stat.label}</div>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Tabs and Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-8"
          >
            <Card variant="glass">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
                {/* Tabs */}
                <div className="flex space-x-2 bg-white/10 rounded-2xl p-2">
                  <button
                    onClick={() => setActiveTab('posted')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      activeTab === 'posted'
                        ? 'bg-gradient-to-r from-pink-500 to-violet-500 text-white shadow-lg'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Posted Tasks ({clientTasks.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('applied')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      activeTab === 'applied'
                        ? 'bg-gradient-to-r from-pink-500 to-violet-500 text-white shadow-lg'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Applied Tasks ({providerTasks.length})
                  </button>
                </div>

                {/* Controls */}
                <div className="flex items-center space-x-4">
                  {/* Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value} className="bg-gray-800">
                        {option.label}
                      </option>
                    ))}
                  </select>

                  {/* View Mode Toggle */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    icon={viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
                  >
                    {viewMode === 'grid' ? 'List' : 'Grid'}
                  </Button>

                  {/* Create Task Button */}
                  <Button
                    onClick={() => navigate('/create-task')}
                    variant="gradient"
                    icon={<Plus className="w-5 h-5" />}
                  >
                    Create Task
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Tasks Grid */}
          {isLoading ? (
            <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 max-w-4xl mx-auto'} gap-8`}>
              {[...Array(6)].map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 animate-pulse"
                >
                  <div className="h-6 bg-white/20 rounded-2xl mb-4"></div>
                  <div className="h-4 bg-white/20 rounded-xl mb-2"></div>
                  <div className="h-4 bg-white/20 rounded-xl mb-6"></div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-white/20 rounded-xl w-20"></div>
                    <div className="h-4 bg-white/20 rounded-xl w-16"></div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : filteredTasks.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 max-w-4xl mx-auto'} gap-8`}
            >
              {filteredTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <TaskCard
                    task={task}
                    onViewDetails={handleViewDetails}
                    showApplyButton={false}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center py-20"
            >
              <div className="w-32 h-32 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                <span className="text-6xl">
                  {activeTab === 'posted' ? '📝' : '🔍'}
                </span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">
                {activeTab === 'posted' 
                  ? 'No tasks posted yet' 
                  : 'No applications yet'
                }
              </h3>
              <p className="text-white/70 mb-8 max-w-md mx-auto leading-relaxed">
                {activeTab === 'posted'
                  ? 'Create your first task to get started and connect with skilled professionals'
                  : 'Browse available tasks and start applying to find great opportunities'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => navigate(activeTab === 'posted' ? '/create-task' : '/tasks')}
                  variant="gradient"
                  size="lg"
                  icon={activeTab === 'posted' ? <Plus className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                >
                  {activeTab === 'posted' ? 'Create Your First Task' : 'Browse Available Tasks'}
                </Button>
                {activeTab === 'posted' && (
                  <Button 
                    onClick={() => navigate('/tasks')}
                    variant="outline"
                    size="lg"
                    icon={<Users className="w-5 h-5" />}
                  >
                    Browse Tasks
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};