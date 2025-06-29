import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { MapPin, Clock, DollarSign, User } from 'lucide-react';
import { Task } from '../../types';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { formatDistanceToNow } from 'date-fns';

// Helper function to safely format dates
const safeFormatDistanceToNow = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  return formatDistanceToNow(date, { addSuffix: true });
};

interface TaskCardProps {
  task: Task;
  onViewDetails: (task: Task) => void;
  onApply?: (task: Task) => void;
  showApplyButton?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onViewDetails,
  onApply,
  showApplyButton = false,
}) => {
  const { t, i18n } = useTranslation();

  const getCategoryName = (category: any) => {
    if (!category) return '';
    switch (i18n.language) {
      case 'he':
        return category.nameHe;
      case 'ru':
        return category.nameRu;
      default:
        return category.nameEn;
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card hover onClick={() => onViewDetails(task)} className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {task.title}
            </h3>
            <p className="text-gray-600 text-sm line-clamp-3 mb-3">
              {task.description}
            </p>
          </div>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}
          >
            {t(`tasks.statuses.${task.status}`)}
          </span>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            {task.location}
          </div>
          <div className="flex items-center">
            <DollarSign className="w-4 h-4 mr-1" />
            ₪{task.budget.toLocaleString()}
          </div>
          {task.deadline && new Date(task.deadline).getTime() && !isNaN(new Date(task.deadline).getTime()) && (
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {safeFormatDistanceToNow(task.deadline)}
            </div>
          )}
          {task.category && (
            <div className="flex items-center">
              <span className="w-4 h-4 mr-1">📋</span>
              {getCategoryName(task.category)}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center text-sm text-gray-500">
            <User className="w-4 h-4 mr-1" />
            {task.client?.firstName} {task.client?.lastName}
            {task.client?.rating && (
              <span className="ml-2">
                ⭐ {task.client.rating.toFixed(1)}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {task.applicationsCount !== undefined && (
              <span className="text-sm text-gray-500">
                {task.applicationsCount} {t('tasks.applications')}
              </span>
            )}
            {showApplyButton && onApply && task.status === 'open' && (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onApply(task);
                }}
              >
                {t('tasks.apply')}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};