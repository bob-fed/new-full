import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Layout } from '../../components/Layout/Layout';
import { TaskCard } from '../../components/Tasks/TaskCard';
import { TaskFilters } from '../../components/Tasks/TaskFilters';
import { Button } from '../../components/UI/Button';
import { useAuth } from '../../contexts/AuthContext';
import { Task, TaskFilters as TaskFiltersType, Category } from '../../types';
import { taskService } from '../../services/taskService';

export const TaskList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [filters, setFilters] = React.useState<TaskFiltersType>({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);

  React.useEffect(() => {
    loadTasks();
    loadCategories();
  }, [filters, page]);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const response = await taskService.getTasks(filters, page, 12);
      setTasks(response.data);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await taskService.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleViewDetails = (task: Task) => {
    navigate(`/tasks/${task.id}`);
  };

  const handleApply = (task: Task) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(`/tasks/${task.id}/apply`);
  };

  const handleFiltersChange = (newFilters: TaskFiltersType) => {
    setFilters(newFilters);
    setPage(1);
  };

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
              {t('tasks.title')}
            </h1>
            <p className="text-gray-600 mt-2">
              Find the perfect task for your skills
            </p>
          </motion.div>

          {isAuthenticated && (
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
          )}
        </div>

        {/* Filters */}
        <TaskFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          categories={categories}
        />

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
        ) : tasks.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onViewDetails={handleViewDetails}
                  onApply={handleApply}
                  showApplyButton={user?.role === 'provider'}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  {t('common.previous')}
                </Button>
                <span className="flex items-center px-4 py-2 text-sm text-gray-700">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  {t('common.next')}
                </Button>
              </div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t('tasks.noTasks')}
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your filters or check back later
            </p>
            {isAuthenticated && (
              <Button onClick={() => navigate('/create-task')}>
                {t('tasks.createTask')}
              </Button>
            )}
          </motion.div>
        )}
      </div>
    </Layout>
  );
};