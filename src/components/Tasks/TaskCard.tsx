import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { MapPin, Clock, DollarSign, User, Star, Eye, Heart } from 'lucide-react';
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
  const [isLiked, setIsLiked] = React.useState(false);

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

  const getUrgencyLevel = () => {
    if (!task.deadline) return 'low';
    const now = new Date();
    const deadline = new Date(task.deadline);
    const hoursUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilDeadline < 24) return 'high';
    if (hoursUntilDeadline < 72) return 'medium';
    return 'low';
  };

  const urgencyLevel = getUrgencyLevel();
  const urgencyColors = {
    high: 'from-red-500 to-pink-500',
    medium: 'from-yellow-500 to-orange-500',
    low: 'from-green-500 to-emerald-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -8 }}
      className="group"
    >
      <Card 
        hover 
        onClick={() => onViewDetails(task)} 
        className="relative overflow-hidden cursor-pointer h-full"
        variant="glass"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
        </div>

        {/* Status Badge */}
        <div className="absolute top-4 right-4 z-10">
          <div className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getStatusColor(task.status)} shadow-lg`}>
            {t(`tasks.statuses.${task.status}`)}
          </div>
        </div>

        {/* Urgency Indicator */}
        {task.deadline && urgencyLevel !== 'low' && (
          <div className="absolute top-4 left-4 z-10">
            <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${urgencyColors[urgencyLevel]} animate-pulse shadow-lg`}></div>
          </div>
        )}

        {/* Like Button */}
        <motion.button
          className="absolute top-16 right-4 z-10 p-2 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all duration-300"
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'text-red-400 fill-current' : 'text-white/60'}`} />
        </motion.button>

        <div className="relative z-10">
          {/* Header */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-pink-300 transition-colors duration-300">
              {task.title}
            </h3>
            <p className="text-white/70 text-sm line-clamp-3 leading-relaxed">
              {task.description}
            </p>
          </div>

          {/* Budget - Prominent Display */}
          <div className="mb-4">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl border border-green-500/30">
              <DollarSign className="w-5 h-5 text-green-400 mr-2" />
              <span className="text-2xl font-black text-white">₪{task.budget.toLocaleString()}</span>
            </div>
          </div>

          {/* Task Details */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center text-white/60 text-sm">
              <MapPin className="w-4 h-4 mr-2 text-blue-400" />
              <span className="font-medium">{task.location}</span>
            </div>
            
            {task.deadline && new Date(task.deadline).getTime() && !isNaN(new Date(task.deadline).getTime()) && (
              <div className="flex items-center text-white/60 text-sm">
                <Clock className="w-4 h-4 mr-2 text-orange-400" />
                <span className="font-medium">{safeFormatDistanceToNow(task.deadline)}</span>
              </div>
            )}
            
            {task.category && (
              <div className="flex items-center text-white/60 text-sm">
                <span className="w-4 h-4 mr-2 text-purple-400">📋</span>
                <span className="font-medium">{getCategoryName(task.category)}</span>
              </div>
            )}
          </div>

          {/* Client Info */}
          <div className="flex items-center justify-between mb-6 p-3 bg-white/5 rounded-2xl border border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full flex items-center justify-center shadow-lg">
                {task.client?.avatarUrl ? (
                  <img
                    src={task.client.avatarUrl}
                    alt={task.client.firstName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <div className="font-semibold text-white text-sm">
                  {task.client?.firstName} {task.client?.lastName}
                </div>
                {task.client?.rating && task.client.rating > 0 && (
                  <div className="flex items-center text-xs text-yellow-400">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    <span>{task.client.rating.toFixed(1)}</span>
                    <span className="text-white/50 ml-1">({task.client.totalReviews})</span>
                  </div>
                )}
              </div>
            </div>
            
            {task.applicationsCount !== undefined && (
              <div className="text-right">
                <div className="text-white/60 text-xs">Applications</div>
                <div className="text-white font-bold">{task.applicationsCount}</div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(task);
              }}
              className="flex-1 group-hover:border-pink-400 group-hover:text-pink-300"
              icon={<Eye className="w-4 h-4" />}
            >
              {t('tasks.viewDetails')}
            </Button>
            
            {showApplyButton && onApply && task.status === 'open' && (
              <Button
                variant="gradient"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onApply(task);
                }}
                className="flex-1"
              >
                {t('tasks.apply')}
              </Button>
            )}
          </div>
        </div>

        {/* Hover Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-pink-500/0 to-indigo-500/0 group-hover:from-purple-500/10 group-hover:via-pink-500/10 group-hover:to-indigo-500/10 transition-all duration-500 rounded-3xl"></div>
      </Card>
    </motion.div>
  );
};