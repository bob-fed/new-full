import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Filter, X } from 'lucide-react';
import { TaskFilters as TaskFiltersType, Category } from '../../types';
import { Input } from '../UI/Input';
import { Button } from '../UI/Button';

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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          type="text"
          placeholder={t('common.search')}
          value={filters.search || ''}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Toggle */}
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center"
        >
          <Filter className="w-4 h-4 mr-2" />
          {t('common.filter')}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="flex items-center text-red-600 hover:text-red-700"
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('tasks.category')}
            </label>
            <select
              value={filters.category || ''}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Categories</option>
              {categories && categories.length > 0 ? (
                categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {getCategoryName(category)}
                  </option>
                ))
              ) : (
                <option value="" disabled>No categories available</option>
              )}
            </select>
          </div>

          {/* Location */}
          <div>
            <Input
              label={t('tasks.location')}
              type="text"
              value={filters.location || ''}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              placeholder="Enter location"
            />
          </div>

          {/* Budget Range */}
          <div>
            <Input
              label="Min Budget (₪)"
              type="number"
              value={filters.minBudget || ''}
              onChange={(e) => handleFilterChange('minBudget', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="0"
            />
          </div>

          <div>
            <Input
              label="Max Budget (₪)"
              type="number"
              value={filters.maxBudget || ''}
              onChange={(e) => handleFilterChange('maxBudget', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="10000"
            />
          </div>
        </div>
      )}
    </div>
  );
};