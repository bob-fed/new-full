import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, MapPin, DollarSign, Calendar, Tag, Sliders } from 'lucide-react';
import { TaskFilters as TaskFiltersType, Category } from '../../types';
import { Input } from '../UI/Input';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';

interface TaskFiltersProps {
  filters: TaskFiltersType;
  onFiltersChange: (filters: TaskFiltersType) => void;
  categories: Category[];
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  filters,
  onFiltersChange,
  categories,
}) => {
  const { t, i18n } = useTranslation();
  const [isExpanded, setIsExpanded] = React.useState(false);

  const getCategoryName = (category: Category) => {
    switch (i18n.language) {
      case 'he':
        return category.name_he || category.nameHe || 'Unknown Category';
      case 'ru':
        return category.name_ru || category.nameRu || 'Unknown Category';
      default:
        return category.name_en || category.nameEn || 'Unknown Category';
    }
  };

  const handleFilterChange = (key: keyof TaskFiltersType, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '' && value !== null
  );

  const activeFilterCount = Object.values(filters).filter(value => 
    value !== undefined && value !== '' && value !== null
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card variant="glass" className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500"></div>
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Sliders className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Filter Tasks</h3>
                <p className="text-white/60 text-sm">Find exactly what you're looking for</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {hasActiveFilters && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center space-x-2"
                >
                  <div className="px-3 py-1 bg-pink-500/20 rounded-full border border-pink-500/30">
                    <span className="text-pink-300 text-sm font-semibold">
                      {activeFilterCount} active
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    icon={<X className="w-4 h-4" />}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    Clear All
                  </Button>
                </motion.div>
              )}

              <Button
                variant={isExpanded ? "gradient" : "outline"}
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                icon={<Filter className="w-4 h-4" />}
              >
                {isExpanded ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </div>
          </div>

          {/* Quick Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
              <input
                type="text"
                placeholder="Search tasks, skills, or keywords..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300"
              />
            </div>
          </div>

          {/* Expanded Filters */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-6 border-t border-white/10">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Category Filter */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                    >
                      <label className="block text-sm font-semibold text-white mb-3">
                        <Tag className="w-4 h-4 inline mr-2 text-purple-400" />
                        {t('tasks.category')}
                      </label>
                      <select
                        value={filters.category || ''}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="block w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                      >
                        <option value="" className="bg-gray-800">All Categories</option>
                        {categories && categories.length > 0 ? (
                          categories.map((category) => (
                            <option key={category.id} value={category.id} className="bg-gray-800">
                              {getCategoryName(category)}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled className="bg-gray-800">No categories available</option>
                        )}
                      </select>
                    </motion.div>

                    {/* Location Filter */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                    >
                      <label className="block text-sm font-semibold text-white mb-3">
                        <MapPin className="w-4 h-4 inline mr-2 text-blue-400" />
                        {t('tasks.location')}
                      </label>
                      <input
                        type="text"
                        value={filters.location || ''}
                        onChange={(e) => handleFilterChange('location', e.target.value)}
                        placeholder="Enter city or area"
                        className="block w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      />
                    </motion.div>

                    {/* Budget Range */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                    >
                      <label className="block text-sm font-semibold text-white mb-3">
                        <DollarSign className="w-4 h-4 inline mr-2 text-green-400" />
                        Min Budget (₪)
                      </label>
                      <input
                        type="number"
                        value={filters.minBudget || ''}
                        onChange={(e) => handleFilterChange('minBudget', e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="0"
                        min="0"
                        className="block w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.4 }}
                    >
                      <label className="block text-sm font-semibold text-white mb-3">
                        <DollarSign className="w-4 h-4 inline mr-2 text-green-400" />
                        Max Budget (₪)
                      </label>
                      <input
                        type="number"
                        value={filters.maxBudget || ''}
                        onChange={(e) => handleFilterChange('maxBudget', e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="10000"
                        min="0"
                        className="block w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                      />
                    </motion.div>
                  </div>

                  {/* Quick Filter Tags */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                    className="mt-6"
                  >
                    <label className="block text-sm font-semibold text-white mb-3">
                      Quick Filters
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { label: 'Urgent Tasks', key: 'urgent', icon: '🔥' },
                        { label: 'High Budget', key: 'highBudget', icon: '💰' },
                        { label: 'Remote Work', key: 'remote', icon: '🏠' },
                        { label: 'New Clients', key: 'newClients', icon: '⭐' },
                      ].map((tag) => (
                        <motion.button
                          key={tag.key}
                          onClick={() => {
                            // Handle quick filter logic here
                            if (tag.key === 'highBudget') {
                              handleFilterChange('minBudget', 500);
                            }
                          }}
                          className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white/80 hover:bg-white/20 hover:text-white transition-all duration-300"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <span>{tag.icon}</span>
                          <span className="text-sm font-medium">{tag.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 pt-6 border-t border-white/10"
            >
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-sm font-semibold text-white">Active Filters:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(filters).map(([key, value]) => {
                  if (!value) return null;
                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-pink-500/20 to-violet-500/20 border border-pink-500/30 rounded-full"
                    >
                      <span className="text-sm text-pink-300 font-medium">
                        {key}: {value.toString()}
                      </span>
                      <button
                        onClick={() => handleFilterChange(key as keyof TaskFiltersType, undefined)}
                        className="text-pink-300 hover:text-white transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};