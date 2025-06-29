import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Filter, Search, Grid, List, Sparkles } from 'lucide-react';
import { Layout } from '../../components/Layout/Layout';
import { TaskCard } from '../../components/Tasks/TaskCard';
import { TaskFilters } from '../../components/Tasks/TaskFilters';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
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
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = React.useState('');

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, search: searchQuery });
    setPage(1);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        {/* Hero Section */}
        <section className="pt-32 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h1 className="text-5xl md:text-7xl font-black text-white mb-6">
                Find Your Perfect
                <span className="block bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
                  Task Match
                </span>
              </h1>
              <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
                Discover amazing opportunities and connect with skilled professionals. 
                Your next great project starts here!
              </p>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-2xl mx-auto mb-8"
            >
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder="Search for tasks, services, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  variant="glass"
                  className="pr-16 text-lg py-5"
                  icon={<Search className="w-5 h-5" />}
                />
                <Button
                  type="submit"
                  variant="gradient"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6"
                >
                  <Sparkles className="w-5 h-5" />
                </Button>
              </form>
            </motion.div>

            {/* Action Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8"
            >
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  icon={viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
                >
                  {viewMode === 'grid' ? 'List View' : 'Grid View'}
                </Button>
                
                <div className="text-white/60 text-sm">
                  {tasks.length} tasks found
                </div>
              </div>

              {isAuthenticated && (
                <Button
                  onClick={() => navigate('/create-task')}
                  variant="gradient"
                  icon={<Plus className="w-5 h-5" />}
                >
                  {t('tasks.createTask')}
                </Button>
              )}
            </motion.div>
          </div>
        </section>

        {/* Filters */}
        <section className="pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <TaskFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              categories={categories}
            />
          </div>
        </section>

        {/* Tasks Grid */}
        <section className="pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-8`}>
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
            ) : tasks.length > 0 ? (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 max-w-4xl mx-auto'} gap-8 mb-12`}
                >
                  {tasks.map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <TaskCard
                        task={task}
                        onViewDetails={handleViewDetails}
                        onApply={handleApply}
                        showApplyButton={user?.role === 'provider'}
                      />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex justify-center items-center space-x-4"
                  >
                    <Button
                      variant="outline"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      {t('common.previous')}
                    </Button>
                    
                    <div className="flex items-center space-x-2">
                      {[...Array(Math.min(5, totalPages))].map((_, index) => {
                        const pageNum = index + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`w-10 h-10 rounded-full font-semibold transition-all duration-300 ${
                              page === pageNum
                                ? 'bg-gradient-to-r from-pink-500 to-violet-500 text-white shadow-lg'
                                : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                    >
                      {t('common.next')}
                    </Button>
                  </motion.div>
                )}
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center py-20"
              >
                <div className="w-32 h-32 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                  <span className="text-6xl">🔍</span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">
                  No Tasks Found
                </h3>
                <p className="text-white/70 mb-8 max-w-md mx-auto leading-relaxed">
                  Try adjusting your filters or search terms. New opportunities are added daily!
                </p>
                {isAuthenticated && (
                  <Button
                    onClick={() => navigate('/create-task')}
                    variant="gradient"
                    size="lg"
                    icon={<Plus className="w-5 h-5" />}
                  >
                    {t('tasks.createTask')}
                  </Button>
                )}
              </motion.div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
};